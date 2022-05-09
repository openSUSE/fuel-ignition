<template>
  <div class="users">
    <FormKit
      :name="formKey('name')"
      label="Username (required)"
      placeholder="write your os username here"
      validation="required"
      validation-behavior="live"
      value="root"
      help="A new user will be created, if it does not exist."
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
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";
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
            const publicKeys = formValue('ssh_keys', id);

            const publicKeysArray =
              publicKeys !== undefined && publicKeys.includes(",")
                ? publicKeys.replaceAll(" ", "").split(",") // base64 ssh keys can't contain spaces
                : [publicKeys];

            const userPasswdIsEmpty =
              formValue('passwd', id) === "" ||
              formValue('passwd', id) === undefined;

            json.passwd.users.push({
              name: formValue('name', id),
              passwordHash: userPasswdIsEmpty
                ? undefined
                : formValue('passwd_hashed', id),
              sshAuthorizedKeys:
                publicKeys === undefined || publicKeys === ""
                  ? undefined
                  : publicKeysArray,
            });
          }
        });
    },

    // asynchronously hash the passwd, since the sha256 method is async as well,
    // replace with a single call later, instead of watching the entire form
    watchFormData: function async(newData) {
      Object.keys(newData)
        .filter((x) => x.includes("user_passwd") && !x.includes("hashed"))
        .map((key) => key.replace("user_passwd_", ""))
        .forEach((id) => {
          const passwd = newData["user_passwd_" + id];
          if (passwd === "" || passwd === undefined) {
            return;
          }
          sha256(passwd).then(
            (hash) => (newData["user_passwd_hashed_" + id] = hash)
          );
        });
    },
  },
};

async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
</script>
