<!-- Adds a line to the combustion bash script to set timezone -->

<template>

  <FormKit
    type="select"
    :name="formKey('timezone')"
    label="Timezone"
    validation="required"
    validation-behavior="live"
    :options="timezones()"
    help="select timezone"
  />

</template>

<script>
import Utils from "@/utils/utils.js";
import Timezone from "@/utils/timezone.js";
const formPrefix = "comb_timezone";

export default {
  setup: () => {
    const uid = Utils.uid();

    return {
      uid,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
      timezones: () => Timezone.availableTimezones(),
    };
  },

  methods: {
    encodeToInstallation: function (json, formData) {
      Object.keys(formData)
        .filter((x) => x.includes(formPrefix))
        .forEach((key) => {
          json.combustion +=
	    "\n# Timezone\n" +
            "systemd-firstboot --force --timezone=" + formData[key] + "\n";
        });
    },
    encodeToExport: function (json, formData) {
      Object.keys(formData)
        .filter((x) => x.includes(formPrefix))
        .forEach((key) => {
	  json.timezone = formData[key]
        }); 
    },
    fillImport: function (json, formData) {
      if (json.timezone == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(formPrefix) )
          .forEach((key) => {
	    formData[key] = json.timezone;
          });
    },
    countImport: function (json) {
      if (json.timezone != undefined) {
        return 1;
      } else {
        return 0;
      }
    },
  },
};
</script>
