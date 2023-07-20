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

    <div v-if="Utils.GlobalStorage.store.addUsers.amount == 0">
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
const formPrefix = "user";

export default {
  setup: () => {
    const uid = Utils.uid();

    return {
      uid,
      Utils,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToIgn: function (json, formData) {
      Utils.GlobalStorage.store.addUsers.amount = 0;

      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_name_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          json.passwd = "passwd" in json ? json.passwd : { users: [] };
          Utils.GlobalStorage.store.addUsers.amount++;

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

          json.login.users.push(user)
        }
      );
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_name_";

      if (json.login.users == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(keyPrefix))
          .map((key) => key.replace(keyPrefix, ""))
          .forEach((id) => {
  	    let user = json.login.users.shift();
	    setValue("name", id, user.name)
	    setValue("hash_type", id, user.hash_type)
	    setValue("passwd", id, user.passwd)
            Utils.PasswordHashes.hashes[id] = Bcrypt.hashSync( user.passwd, 8);
	    setValue("ssh_keys", id, user.ssh_keys)
	    setValue("runs_on_suse", id, user.runs_on_suse)
          });
    },
    countImport: function (json) {
      if (json.login != undefined && json.login.users != undefined) {
        return json.login.users.length;
      } else {
        return 0;
      }
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
