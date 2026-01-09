<template>
  <div class="users">
    <FormKit
      class="form-control"
      :name="formKey('name')"
      label="Username (required)"
      placeholder="write your os username here"
      validation="required"
      validation-behavior="live"
      value="root"
      help="A new user will be created, if it does not exist."
      v-model="name"
    />

    <FormKit
      :name="formKey('passwd')"
      label="Password"
      placeholder="write the corresponding password here"
      type="password"
      validation="optional"
      validation-behavior="live"
      help="Your password is never sent over the internet, everything is local."
    />

    <FormKit
      :name="formKey('ssh_keys')"
      label="SSH Public Keys"
      placeholder="write the corresponding ssh keys here, separated by commas, spaces are ignored"
      type="textarea"
      validation="optional"
      validation-behavior="live"
      help="Your keys are never sent over the internet, everything is local."
    />

    <FormKit
      :name="formKey('totp_enabled')"
      label="Generate Time-based one-time password (TOTP) Secret"
      type="checkbox"
      validation="required"
      validation-behavior="live "
      help="Enabling Two-Factor Authentication (2FA) via an app based authenticator. This is for use with Cockpit on SUSE related systems. Please note Cockpit disallows root login by default."
      v-model="totpEnabled"
    />

    <div v-if="totpEnabled === true">
      <FormKit
        :name="formKey('totp_secret')"
        type="text"
        label="Time-based one-time password (TOTP) Secret"
        :help="`Your secret (written to file /${(name === 'root' ? '' : 'home/') + name}/.pam_oath_usersfile) is never sent over the internet. The following QR-Code defines how the app generates the code:`"
        v-model="secret"
      />

      <canvas :id="formKey('qrcode')"/>

      <p>{{ readableTOTPSecret(secret) }}</p>
    </div>

    <div v-if="index === 1">
      <FormKit
        :name="formKey('runs_on_suse')"
        label="Mount /home"
        validation="required"
        type="checkbox"
        validation-behavior="live"
        help="Required on SUSE related systems for creating users not named root. Otherwise, applying the Ignition config will fail"
      />
    </div>
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";
import Bcrypt from "bcryptjs";
import { ref } from "vue";
import QRCode from "qrcode";
import base32Encode from "base32-encode";

const formPrefix = "user";
const keyPrefix = formPrefix + "_name_";

export default {
  props: ['index'],
  setup: () => {
    const uid = Utils.uid();
    const totpEnabled = ref(false);
    const name = ref('root');

    const secret = ref(Utils.generateTOTPSecret());

    return {
      uid,
      totpEnabled,
      name,
      secret,

      Utils,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },
  methods: {
    encodeToInstallation: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {

          const publicKeys = formValue("ssh_keys", id);
	  const name = formValue("name", id);
          const userPasswdIsEmpty =
            formValue("passwd", id) === "" ||
            formValue("passwd", id) === undefined;

          // append config for mounting /home
          if (formValue("runs_on_suse", id) === true) {
	    json.combustion += "# Configuring /home...\n\n"+
	       "DEVICE=\"/dev/disk/by-label/ROOT\"\n" +
	       "MOUNT_POINT=\"/home\"\n" +
	       "SUBVOL_PATH=\"/@/home\"\n\n" +
	       "# Check if the device exists\n" +
               "if [ ! -e \"$DEVICE\" ]; then\n" +
               "  echo \"Error: Device $DEVICE not found. Cannot proceed with storage setup.\"\n" +
               "  exit 1\n" +
               "fi\n\n" +
               "# Temporary mount to check/create Btrfs subvolume\n" +
               "TEMP_MNT=$(mktemp -d)\n" +
               "mount -t btrfs \"$DEVICE\" \"$TEMP_MNT\"\n\n" +
               "# Ensure the parent directory (like /@) exists inside the Btrfs root\n" +
               "SUBVOL_PARENT=$(dirname \"$SUBVOL_PATH\")\n" +
               "if [ ! -d \"$TEMP_MNT$SUBVOL_PARENT\" ]; then\n" +
               "  mkdir -p \"$TEMP_MNT$SUBVOL_PARENT\"\n" +
               "fi\n\n" +
               "# Create subvolume if it doesn't exist\n" +
               "if ! btrfs subvolume list \"$TEMP_MNT\" | grep -q \"${SUBVOL_PATH#*/}\"; then\n" +
               "  echo \"Creating Btrfs subvolume $SUBVOL_PATH...\"\n" +
               "  btrfs subvolume create \"$TEMP_MNT$SUBVOL_PATH\"\n" +
               "else\n" +
               "  echo \"Subvolume $SUBVOL_PATH already exists.\"\n" +
               "fi\n\n" +
               "umount \"$TEMP_MNT\"\n" +
               "rmdir \"$TEMP_MNT\"\n\n" +
               "# Mount the subvolume to /home\n" +
               "mkdir -p \"$MOUNT_POINT\"\n" +
               "if ! mountpoint -q \"$MOUNT_POINT\"; then\n" +
               "  echo \"Mounting $DEVICE ($SUBVOL_PATH) to $MOUNT_POINT...\"\n" +
               "  mount -t btrfs -o \"subvol=$SUBVOL_PATH\" \"$DEVICE\" \"$MOUNT_POINT\"\n" +
               "fi\n\n" +
               "# Ensure persistence in /etc/fstab\n" +
               "if ! grep -q \"$MOUNT_POINT\" /etc/fstab; then\n" +
               "  echo \"$DEVICE $MOUNT_POINT btrfs subvol=$SUBVOL_PATH 0 0\" >> /etc/fstab\n" +
               "fi\n\n"
          }

          let homePath;
          json.combustion += "# Configuring user: " + name + " ...\n";
          if (name !== "root") {
	    json.combustion += "useradd -m -s /bin/bash " + name + "\n";
	  }
	  if (!userPasswdIsEmpty) {
            json.combustion +=
	      "echo \'" + name + ":" + Utils.PasswordHashes.hashes[id]+ "\' | chpasswd -e\n\n";
	  }	  

	  if (publicKeys !== undefined && publicKeys !== "") {
            const publicKeysArray =
              publicKeys !== undefined && publicKeys.includes(",")
                ? publicKeys.replaceAll(" ", "").split(",") // base64 ssh keys can't contain spaces
                : [publicKeys];

	    json.combustion +=
	      "\n# Configure SSH keys for " + name + "\n" +
              "mkdir -p \"~" + name + "/.ssh\"\n" +
              "{\n";
	    for (const key of publicKeysArray) {
  	      json.combustion +=
                "  echo \"" + key + "\"\n";
	    }
 	    json.combustion +=
              "} > \"~" + name + "/.ssh/authorized_keys\"\n" +
              "# Set correct ownership and permissions\n" +
              "chown -R " + name + ":" + name + " \"~" + name + "/.ssh\"\n" +
              "chmod 700 \"~" + name + "/.ssh\"\n" +
              "chmod 600 \"~" + name + "/.ssh/authorized_keys\"\n\n";
	  }

          if (formValue("totp_enabled", id)) {
            const totpContents = "HOTP/T30/6 " + formValue("name", id) + " - " + formValue("totp_secret", id)
	    const name = formValue("name", id);
	    
            let totpPath;
            if (formValue("name", id) === "root") {
              totpPath = "/root/.pam_oath_usersfile"
            } else {
              totpPath = "/home/" + formValue("name", id) + "/.pam_oath_usersfile"
            }

 	    json.combustion +=
	      "# Set Time-based one-time password\n" +
              "FILE_PATH=\"" + totpPath + "\"\n" +
              "CONTENT=\"" + totpContents + "\"\n" +
	      "mkdir -p \"$(dirname \"$FILE_PATH\")\"\n" +
	      "echo \"$CONTENT\" > \"$FILE_PATH\"\n" +
	      "chown " + name + ":" + name + " \"$FILE_PATH\"\n" +
	      "chmod 600 \"$FILE_PATH\"\n";
          }
        });
    },

    // asynchronously hash the passwd, since the hashMessage method is async as well,
    // replace with a single call later, instead of watching the entire form
    watchFormData: async function (newData, oldData) {
      const formValue = (key, uid) =>
        newData[Utils.getFormKey(formPrefix, key, uid)];

      Object.keys(newData)
        .filter((x) => x.includes("totp_enabled"))
        .map((key) => key.replace("user_totp_enabled_", ""))
        .forEach(async (id) => {
          const username = formValue("name", id);
          const canvas = document.getElementById("user_qrcode_" + id);
          const secret = formValue("totp_secret", id);
          if (username && canvas && secret) {
            this.renderQRCode(secret, username, canvas);
          }
        });

      Object.keys(newData)
        .filter((x) => x.includes("user_passwd") && !x.includes("hashed"))
        .map((key) => key.replace("user_passwd_", ""))
        .forEach(async (id) => {
          const password = formValue("passwd", id);
          const passwordIsEmpty = password === "" || password === undefined;

          const passwordHasNotChanged =
            newData["user_passwd_" + id] === oldData["user_passwd_" + id];

          if (passwordIsEmpty || passwordHasNotChanged) {
            return;
          }

          hashMessage(password).then(
            (hash) => (Utils.PasswordHashes.hashes[id] = hash)
          );
        });
    },
    encodeToExport: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.login === undefined) {
            json.login = {};
          }

          if (json.login.users === undefined) {
            json.login.users = [];
          }
          let user = {}
          user.name = formValue("name", id)
          user.passwd = formValue("passwd", id)
          user.ssh_keys = formValue("ssh_keys", id)
          user.runs_on_suse = formValue("runs_on_suse", id)
          user.totp_enabled = formValue("totp_enabled", id)
          if (formValue("totp_enabled", id)) {
            user.totp_secret = formValue("totp_secret", id)
          }
          json.login.users.push(user)
        }
      );
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);

      if (json.login == undefined || json.login.users == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(keyPrefix))
          .map((key) => key.replace(keyPrefix, ""))
          .forEach((id) => {
            let user = json.login.users.shift();
            setValue("name", id, user.name)
            if (user.passwd) {
              setValue("passwd", id, user.passwd)
              Utils.PasswordHashes.hashes[id] = Bcrypt.hashSync(user.passwd, 8);
            }
            setValue("ssh_keys", id, user.ssh_keys)
            setValue("runs_on_suse", id, user.runs_on_suse)
            setValue("totp_enabled", id, user.totp_enabled)
            setValue("totp_secret", id, user.totp_secret)
          });
    },
    countImport: function (json) {
      if (json.login != undefined && json.login.users != undefined) {
        return json.login.users.length;
      } else {
        return 0;
      }
    },
    totpSecretToBase32: function (secret) {
      const secretDecoded = Utils.hexToUint8Array(secret);
      return base32Encode(secretDecoded, 'RFC4648', { padding: false });
    },
    readableTOTPSecret: function (secret) {
      const secretDecoded = this.totpSecretToBase32(secret);
      return (secretDecoded.match(/.{1,4}/g) || []).join(" ");
    },
    renderQRCode: function (secret, username, canvas) {
      const secretDecoded = this.totpSecretToBase32(secret);
      QRCode.toCanvas(canvas, "otpauth://totp/" + username + "?secret=" + secretDecoded + "&issuer=Fuel%20Ignition", function (error) {
        if (error) alert(error);
      })
    },
  },
};

async function hashMessage(message) {

  var salt = await Bcrypt.genSalt(10).then();
  return Bcrypt.hash(message, salt);
}
</script>
