<!-- Adds SALT minion settings to combustion bash script -->

<template>
  <div class="saltminion">
    <FormKit
      :name="formKey('master')"
      label="Salt master"
      type="text"
      validation="required"      
      help="Host name or IP address of the configuration management server."
    />
    <FormKit
      :name="formKey('minion_pem_key')"
      label="Minion pem key"
      placeholder="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"
      type="textarea"
      validation-behavior="live"
      help="Private key for communitcation with the master."
    />
    <FormKit
      :name="formKey('minion_pub_key')"
      label="Minion pub key"
      placeholder="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"
      type="textarea"
      validation-behavior="live"
      help="Public key for communitcation with the master."
    />
    <FormKit
      :name="formKey('enableservice')"
      label="Enable and start Salt Minion Service"
      type="checkbox"
      :value=true
      validation-behavior="live"
      help="Whether the service will be enabled and started."
    />    
  </div>
</template>

<script>
import Utils from "@/utils/utils.js";
const formPrefix = "comb_salt";

export default {
  setup: () => {
    const uid = Utils.uid();

    return {
      uid,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToIgn: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_master_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          json.combustion += "\n# Salt Menion\n" +
            "if ! which salt-minion > /dev/null 2>&1; then\n" +
            "    zypper --non-interactive install salt-minion\n" +
            "fi\n"
	  if ( formValue("master", id) ) {
	    json.combustion += "echo \"master: " +
              formValue("master", id) + "\" \\\n >" +
	      "/etc/salt/minion.d/fuel-ignition.conf\n"
	  }
          if ( formValue("minion_pem_key", id) ) {
	    json.combustion += "echo \"" +
              formValue("minion_pem_key", id) + "\" \\\n >" +
	      "/etc/salt/pki/minion/minion.pem\n"
	  }
          if ( formValue("minion_pub_key", id) ) {
	    json.combustion += "echo \"" +
              formValue("minion_pub_key", id) + "\" \\ \n >" +
	      "/etc/salt/pki/minion/minion.pub\n"
	  }
	  if ( formValue("enableservice", id) ) {
            json.combustion += "systemctl enable salt-minion.service\n" +
	      "systemctl start salt-minion.service\n"
	  }
        });
    },
  },
};
</script>
