<!-- Adds a line to the combustion bash script to set keyboard -->

<template>

  <FormKit
    type="select"
    :name="formKey('keyboard')"
    label="Keyboard"
    validation="required"
    validation-behavior="live"
    :options="keyboards()"
    help="select keyboard"
  />

</template>

<script>
import Utils from "@/utils/utils.js";
import Country from "@/utils/country.js";
const formPrefix = "comb_keyboard";

export default {
  setup: () => {
    const uid = Utils.uid();

    return {
      uid,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
      keyboards: () => Country.availableKeyboards(), 
    };
  },

  methods: {
    encodeToInstallation: function (json, formData) {
      Object.keys(formData)
        .filter((x) => x.includes(formPrefix))
        .forEach((key) => {
          json.combustion +=
	    "\n# Keyboard\n" +
            "systemd-firstboot --force --keymap=" + Country.keyboardCode(formData[key]) + "\n";
        });
    },
    encodeToExport: function (json, formData) {
      Object.keys(formData)
        .filter((x) => x.includes(formPrefix))
        .forEach((key) => {
	  json.keyboard = formData[key]
        }); 
    },
    fillImport: function (json, formData) {
      if (json.keyboard == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(formPrefix) )
          .forEach((key) => {
	    formData[key] = json.keyboard;
          });
    },
    countImport: function (json) {
      if (json.keyboard != undefined) {
        return 1;
      } else {
        return 0;
      }
    },
  },
};
</script>
