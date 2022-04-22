<template>
  <div class="users">
    <FormKit
      :name="'user_name_' + unique"
      label="Username"
      placeholder="write your os username here"
      validation="required"
      validation-behavior="live"
      value="root"
      help="A new user will be created, if it does not exist."
    />

    <FormKit
      :name="'user_passwd_' + unique"
      label="Password"
      placeholder="write the corresponding password here"
      type="password"
      validation="optional"
      validation-behavior="live"
      help="Your password is never sent over the internet, everything is local."
    />

    <FormKit
      :name="'user_ssh_keys_' + unique"
      label="SSH Public Keys"
      placeholder="write the corresponding ssh keys here, separated by commas without a space"
      type="textarea"
      validation="optional"
      validation-behavior="live"
      help="Your keys are never sent over the internet, everything is local."
    />
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";

export default {
  setup: () => {
    const unique = Utils.uid();

    return {
      unique,
    };
  },

  methods: {
    encodeToIgn: function (json, formData) {
      Object.keys(formData)
        .filter((x) => x.includes("user_name"))
        .map((key) => key.replace("user_name_", ""))
        .forEach((id) => {
          json.passwd = "passwd" in json ? json.passwd : { users: [] };

          if (json.passwd.users !== undefined) {
            console.log();
            const publicKeys = formData["user_ssh_keys_" + id];
            const publicKeysArray = (publicKeys !== undefined && publicKeys.includes(',')) ? publicKeys.split(',') : [publicKeys];
            json.passwd.users.push({
              name: formData["user_name_" + id],
              passwordHash: formData["user_passwd_hashed_" + id],
              sshAuthorizedKeys: publicKeys === undefined ? publicKeys : publicKeysArray,
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
          if(passwd === "" || passwd === undefined) {
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
