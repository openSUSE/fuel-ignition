<template>
  <div class="services">
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

        });
    },
  },
};
</script>
