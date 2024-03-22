<!-- Adds a line to the combustion bash script to install a single package -->

<template>
  <FormKit
    :name="formKey('read_channel')"
    label="Read I/O Subchannel"
    type="text"
    :validation="[['required'],['matches', /^([0-9a-fA-F]{1,4}\.){2}([0-9a-fA-F]{1,4})$/]]"
    :validation-messages="{
           matches: 'Channel number must be in the format ____.____.____',
    }"
    validation-visibility="live"
    placeholder="e.g. 0.0.800"
    help="S390 subchannel definition"
  />
  <FormKit
    :name="formKey('write_channel')"
    label="Write I/O Subchannel"
    type="text"
    :validation="[['required'],['matches', /^([0-9a-fA-F]{1,4}\.){2}([0-9a-fA-F]{1,4})$/]]"
    :validation-messages="{
           matches: 'Channel number must be in the format ____.____.____',
    }"
    validation-visibility="live"    
    placeholder="e.g. 0.0.801"
    help="S390 subchannel definition"
  />
  <FormKit
    :name="formKey('data_channel')"
    label="Data I/O Subchannel"
    type="text"
    :validation="[['required'],['matches', /^([0-9a-fA-F]{1,4}\.){2}([0-9a-fA-F]{1,4})$/]]"
    :validation-messages="{
           matches: 'Channel number must be in the format ____.____.____',
    }"
    validation-visibility="live"
    placeholder="e.g. 0.0.802"    
    help="S390 subchannel definition"
  />  
</template>

<script>
import Utils from "@/utils/utils.js";
const formPrefix = "s390_channel";

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

      const keyPrefix = formPrefix + "_read_channel_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
        json.combustion_prepare +=
            "chzdev qeth " + formValue("read_channel", id) + "," + formValue("write_channel", id) +
	    "," + formValue("data_channel", id) + "\n"
	});
    },
    encodeToExport: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_read_channel_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.s390_channels === undefined) {
            json.s390_channels = {};
          }
	  json.s390_channels.read = formValue("read_channel", id)
	  json.s390_channels.write = formValue("write_channel", id)
	  json.s390_channels.data = formValue("data_channel", id)
	});
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_read_channel_";

      if (json.s390_channels == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(keyPrefix))
          .map((key) => key.replace(keyPrefix, ""))
          .forEach((id) => {
	    setValue("read_channel", id, json.s390_channels.read);
	    setValue("write_channel", id, json.s390_channels.write);
	    setValue("data_channel", id, json.s390_channels.data);
          });
    },
    countImport: function (json) {
      if (json.s390_channels != undefined) {
        return 1;
      } else {
        return 0;
      }
    },
  },
};
</script>
