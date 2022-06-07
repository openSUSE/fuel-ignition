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
      help="A new user will be created, if it does not exist. &emsp; NOTE for MicroOS: If you want to edit a user which is not named root, you need to mount /home."
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

    <!-- {"ignition":{"version":"3.1.0"},"passwd":{"users":[{"name":"root"}]},"storage":{"filesystems":[{"device":"/dev/disk/by-label/ROOT","format":"btrfs","mountOptions":["subvol=/@/home"],"path":"/home","wipeFilesystem":false}]}} -->

    <!-- Add option to append above json if microos checkbox is selected -->
  </div>
</template>

<style>
.formkit-input {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  appearance: none;
  padding: 1rem 0.75rem;
  height: calc(3.5rem + 2px);
  line-height: 1.25;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.formkit-help {
  height: 100%;
  padding: 1rem 0.75rem;
  pointer-events: none;
  border: 1px solid transparent;
  transform-origin: 0 0;
  transition: opacity 0.1s ease-in-out, transform 0.1s ease-in-out;
}
</style>

<script>
import Utils from "../../utils/utils.js";
import Bcrypt from "bcryptjs";
const formPrefix = "user";

export default {
  setup: () => {
    const uid = Utils.uid();
    return {
      uid,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToIgn: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_name_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          json.passwd = "passwd" in json ? json.passwd : { users: [] };

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
