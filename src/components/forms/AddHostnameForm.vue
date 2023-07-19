<template>
  <FormKit
    :name="formKey('hostname')"
    label="Hostname"
    validation="required"
    validation-behavior="live"
    help="Leaving this empty will create an empty file"
  />
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

          let dataValue = formValue("hostname", id);
          let content =
            "data:," + (dataValue === undefined ? "" : dataValue);

          json.storage.files.push(
              {
                path: "/etc/hostname",
                mode: 420,
                overwrite: true,
                contents: {
                  source: content,
                },
              }
          );
        }
      );
    },
    encodeToExport: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);
      const keyPrefix = formPrefix + "_hostname_";
      
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          let dataValue = formValue("hostname", id);
          json.hostname = dataValue === undefined ? "" : dataValue;
        }
      );
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_hostname_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.hostname != undefined) {
	    setValue("hostname", id, json.hostname);
	    json.hostname = undefined
	  }
        }
      );
    },
    countImport: function (json) {
      if (json.hostname != undefined) {
        return 1;
      } else {
        return 0;
      }
    },
  },
};
</script>
