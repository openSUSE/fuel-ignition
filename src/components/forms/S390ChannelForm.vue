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
	  if (formValue("read_channel", id) != undefined &&
	      formValue("write_channel", id) != undefined &&
	      formValue("data_channel", id)) {
            json.combustion_initrd_and_running_system +=
              "# S390 Channels Setup\n" +
              "chzdev qeth " + formValue("read_channel", id) + "," + formValue("write_channel", id) +
	      "," + formValue("data_channel", id) + " -e\n"
	  }
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
	  if (formValue("read_channel", id) != undefined &&
	      formValue("write_channel", id) != undefined &&
	      formValue("data_channel", id)) {
            if (json.s390 === undefined) {
              json.s390 = {};
            }
            if (json.s390.channels === undefined) {
              json.s390.channels = [];
            }
	    let channel = {}
	    channel.read = formValue("read_channel", id)
	    channel.write = formValue("write_channel", id)
	    channel.data = formValue("data_channel", id)
	    json.s390.channels.push(channel)
	  }
	});
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_read_channel_";

      if (json.s390 == undefined || json.s390.channels == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(keyPrefix))
          .map((key) => key.replace(keyPrefix, ""))
          .forEach((id) => {
	    let channel = json.s390.channels.shift();
	    console.log("test");
	    setValue("read_channel", id, channel.read);
	    setValue("write_channel", id, channel.write);
	    setValue("data_channel", id, channel.data);
          });
    },
    countImport: function (json) {
      if (json.s390 != undefined && json.s390.channels != undefined) {
        return json.s390.channels.length;
      } else {
        return 0;
      }
    },
  },
};
</script>
