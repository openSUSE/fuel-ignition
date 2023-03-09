<template>
  <div class="addhostname">

    <FormKit
      :name="formKey('hostname')"
      label="Hostname"
      validation="required"
      validation-behavior="live"
      help="Leaving this empty will create an empty file"
    />

  </div>
</template>

<script>
import Utils from "../../utils/utils.js";
import { ref } from "vue";
const formPrefix = "add_hostname";

export default {
  setup: () => {
    const uid = Utils.uid();
    return {
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToIgn: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_hostname_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.storage === undefined) {
            json.storage = {};
          }

          if (json.storage.files === undefined) {
            json.storage.files = [];
          }

          let fileObject = {};
          let dataValue = formValue("hostname", id);

          let content =
            "data:," + (dataValue === undefined ? "" : dataValue);

          // merging the two objects, in case verification was written to fileObject
          json.storage.files.push(
            Object.assign(
              {
                path: "/etc/hostname",
                mode: 420,
                overwrite: true,
                contents: {
                  source: content,
                },
              },
              fileObject
            )
          );
        });
    },
  },
};
</script>
