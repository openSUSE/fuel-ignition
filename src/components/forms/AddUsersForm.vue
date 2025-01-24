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
      :name="formKey('hash_type')"
      label="Password Hash Type"
      placeholder="bcrypt"
      type="select"
      validation="optional"
      validation-behavior="live"
      value="bcrypt"
      :options="['bcrypt', 'Hash Yourself']"
      help="The way you want your password to be hashed."
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

      const keyPrefix = formPrefix + "_name_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          json.passwd = "passwd" in json ? json.passwd : { users: [] };
          if (formValue("name", id) !== "root") {
            Utils.GlobalStorage.store.addUsers.onlyUsernameRoot = false;
          }

          // append config for mounting /home, since otherwise users not named root will cause an ignition emergency mode
          if (formValue("runs_on_suse", id) === true) {
            if (json.storage === undefined) {
              json.storage = {};
            }

            if (json.storage.filesystems === undefined) {
              json.storage.filesystems = [];
            }

            json.storage.filesystems.push({
              device: "/dev/disk/by-label/ROOT",
              format: "btrfs",
              mountOptions: ["subvol=/@/home"],
              path: "/home",
              wipeFilesystem: false,
            });
          }

          if (formValue("totp_enabled", id)) {
            if (json.storage === undefined) {
              json.storage = {};
            }

            if (json.storage.files === undefined) {
              json.storage.files = [];
            }

            const totpContents = encodeURIComponent("HOTP/T30/6 " + formValue("name", id) + " - " + formValue("totp_secret", id))
            let totpPath;
            if (formValue("name", id) === "root") {
              totpPath = "/root/.pam_oath_usersfile"
            } else {
              totpPath = "/home/" + formValue("name", id) + "/.pam_oath_usersfile"
            }
            json.storage.files.push({
              overwrite: true,
              path: totpPath,
              contents: {
                "source": "data:," + totpContents
              },
              user: {
                "name": formValue("name", id)
              },
              group: {
                "name": formValue("name", id)
              },
              mode: 384,
            })
          }

          if (json.passwd.users !== undefined) {
            const publicKeys = formValue("ssh_keys", id);

            const publicKeysArray =
              publicKeys !== undefined && publicKeys.includes(",")
                ? publicKeys.replaceAll(" ", "").split(",") // base64 ssh keys can't contain spaces
                : [publicKeys];

            const userPasswdIsEmpty =
              formValue("passwd", id) === "" ||
              formValue("passwd", id) === undefined;

            json.passwd.users.push({
              name: formValue("name", id),
              passwordHash: userPasswdIsEmpty
                ? undefined
                : Utils.PasswordHashes.hashes[id],
              sshAuthorizedKeys:
                publicKeys === undefined || publicKeys === ""
                  ? undefined
                  : publicKeysArray,
            });
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
          const hashType = formValue("hash_type", id);

          const passwordIsEmpty = password === "" || password === undefined;

          const passwordHasNotChanged =
            newData["user_passwd_" + id] === oldData["user_passwd_" + id];

          if (passwordIsEmpty || passwordHasNotChanged) {
            return;
          }

          hashMessage(password, hashType).then(
            (hash) => (Utils.PasswordHashes.hashes[id] = hash)
          );
        });
    },
    encodeToExport: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_name_";
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
          user.hash_type  = formValue("hash_type", id)
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
      const keyPrefix = formPrefix + "_name_";

      if (json.login == undefined || json.login.users == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(keyPrefix))
          .map((key) => key.replace(keyPrefix, ""))
          .forEach((id) => {
            let user = json.login.users.shift();
            setValue("name", id, user.name)
            setValue("hash_type", id, user.hash_type)
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

async function hashMessage(message, hashType) {
  if (hashType === "Hash Yourself") return message;

  // TODO: implement other hash types in the future

  var salt = await Bcrypt.genSalt(10).then();
  return Bcrypt.hash(message, salt);

  // relic from the way I used to hash

  // // encode as UTF-8
  // const msgBuffer = new TextEncoder().encode(message);

  // // hash the message, hashType can be SHA-256, SHA-384, SHA-512
  // const hashBuffer = await crypto.subtle.digest(hashType, msgBuffer);

  // // convert ArrayBuffer to Array
  // const hashArray = Array.from(new Uint8Array(hashBuffer));

  // // convert bytes to hex string
  // const hashHex = hashArray
  //   .map((b) => b.toString(16).padStart(2, "0"))
  //   .join("");
  // return hashHex;
}
</script>
