<template>
  <div class="users">
    <FormKit
      :name="formKey('size')"
      label="Bytes To Add"
      type="number"
      validation="required"
      validation-behavior="live"
      value="2048"
      help="This is a debug form."
    />
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";
const formPrefix = "debug_bytes";

export default {
  setup: () => {
    const uid = Utils.uid();

    return {
      uid,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToInstallation: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_size_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          var str = new Array(parseInt(formValue("size", id) - 128) + 1).join(
            "B"
          );
          json.debugBytes =
            json.debugBytes !== undefined ? json.debugBytes : [];
          json.debugBytes.push(str);
        });
    },
  },
};
</script>
