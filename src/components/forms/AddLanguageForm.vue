<template>
  <FormKit
    type="select"
    :name="formKey('language_name')"
    label="Language"
    validation="required"
    validation-behavior="live"
    :options="[
          'data',
          'data-vagrant',
          'https',
          'http',
          'tftp',
          's3',
          'gs',
          'omit',
        ]"    
  />
</template>

<script>
import Utils from "../../utils/utils.js";
import { ref } from "vue";
const formPrefix = "add_language";

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

      const keyPrefix = formPrefix + "_language_name_";
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

          let dataValue = formValue("language_name", id);
          let content =
            "data:," + (dataValue === undefined ? "" : dataValue);

          json.storage.files.push(
              {
                path: "/etc/locale.conf",
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
      const keyPrefix = formPrefix + "_language_name_";
      
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          let dataValue = formValue("language_name", id);
          json.language_name = dataValue === undefined ? "" : dataValue;
        }
      );
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_language_name_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.language_name != undefined) {
	    setValue("language_name", id, json.language_name);
	    json.language_name = undefined
	  }
        }
      );
    },
    countImport: function (json) {
      if (json.language_name != undefined) {
        return 1;
      } else {
        return 0;
      }
    },
  },
};
</script>
