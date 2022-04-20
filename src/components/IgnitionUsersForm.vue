<template>
  <div class="sample-input">
    <FormKit
      :name="'user_name_' + unique"
      label="OS Username"
      placeholder="write your os username here"
      validation="optional"
      validation-behavior="live"
      value="root"
      help="Users can be added to an OS with the passwd.users key. If the user doesn't exist, it will be created."
    />

    <FormKit
      :name="'user_passwd_' + unique"
      label="OS Password"
      placeholder="write the corresponding password here"
      type="password"
      validation="optional"
      validation-behavior="live"
      help="Your password is never sent over the internet, everything is local."
    />
  </div>
</template>

<script>
export default {
  props: ["unique"],
};
</script>
