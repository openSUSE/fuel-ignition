<template>
  <FormKit
    type="select"
    :name="formKey('language_name')"
    label="Language"
    validation="required"
    validation-behavior="live"
    :options="languages()"
    help="select primary language"
  />

  <FormKit
    :name="formKey('language_utf8')"
    label="Use UTF-8 Encoding"
    type="checkbox"
    validation-behavior="live"
    :value=true
    help="enable UTF8-Code"
  />
</template>

<script>
import Utils from "../../utils/utils.js";
import Country from "../../utils/country.js";
import { ref } from "vue";
const formPrefix = "add_language";


export default {
  setup: () => {
    const uid = Utils.uid();
    return {
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
      languages: () => Country.availableLanguages(),
    };
  },

  methods: {
    encodeToInstallation: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_language_name_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          const language_utf8 = formValue("language_utf8", id)
	  const lang = formValue("language_name", id)

          if (json.storage === undefined) {
            json.storage = {};
          }

          if (json.storage.files === undefined) {
            json.storage.files = [];
          }

          let code = Country.langCode(lang);
	  if (language_utf8 === true) {
	    code = code + Country.utf8Encoding(lang);
	  } else {
	    code = code + Country.noneUtf8Encoding(lang);
	  }

          let content = "LANG=" + code;
          json.combustion +=
	    "\n# Language\n" +
	    "echo \"" +  content + "\"" + " > /etc/locale.conf\n" +
            "chmod 644 /etc/locale.conf\n";
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
          json.language_name = formValue("language_name", id)
          json.language_utf8 = formValue("language_utf8", id)
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
	  if (json.language_utf8 != undefined) {
	    setValue("language_utf8", id, json.language_utf8);
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
