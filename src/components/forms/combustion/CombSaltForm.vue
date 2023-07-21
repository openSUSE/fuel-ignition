<!-- Adds SALT minion settings to combustion bash script -->

<template>
  <FormKit
    :name="formKey('master')"
    label="Salt master"
    type="text"
    validation="required"
    help="Host name or IP address of the configuration management server."
  />

  <FormKit
    type="select"
    :name="formKey('preseed_key_via')"
    v-model="preseedKeyVia"
    label="Preseed salt minion with accepted key"
    help="Select how the keys are given."
    :options="[
      'defining keys manually',
      'downloading keys from a ftp/http server',
    ]"
  />

  <div v-if="preseedKeyVia === 'defining keys manually'">
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
  </div>

  <div v-if="preseedKeyVia === 'downloading keys from a ftp/http server'">
    <FormKit
      :name="formKey('key_name')"
      label="Minion ID"
      type="text"
      validation="required"
      validation-behavior="live"
      help="Minion-ID which is the name of the key too. (<Minion ID>.pem, <Minion ID>.pub)"
    />
    <FormKit
      :name="formKey('key_url')"
      label="Key download URL"
      type="text"
      placeholder="http://<download_server>/<directory>"
      validation="required"
      validation-behavior="live"
      help="Path to a HTTP/FTP (and other curl formats) server which contains the files <Minion ID>.pem and <Minion ID>.pub"
    />
    <FormKit
      :name="formKey('url_login_name')"
      label="Login name of the download server"
      type="text"
      validation-behavior="live"
      help="optional"
    />
    <FormKit
      :name="formKey('url_login_password')"
      label="Login password of the download server"
      type="text"
      validation-behavior="live"
      help="optional"
    />
  </div>

  <FormKit
    :name="formKey('enableservice')"
    label="Enable Salt Minion Service"
    type="checkbox"
    :value=true
    validation-behavior="live"
    help="Whether the service will be enabled."
  />
</template>

<script>
import Utils from "@/utils/utils.js";
import { ref } from "vue";
const formPrefix = "comb_salt";

export default {
  setup: () => {
    const uid = Utils.uid();
    const preseedKeyVia = ref("defining keys manually");

    return {
      preseedKeyVia,
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
          json.combustion += "\n# Salt Minion\n" +
            "if ! which salt-minion > /dev/null 2>&1; then\n" +
            "    zypper --non-interactive install salt-minion\n" +
            "fi\n"
	  if (formValue("master", id)) {
	    json.combustion += "echo \"master: " +
              formValue("master", id) + "\" \\\n >" +
	      "/etc/salt/minion.d/fuel-ignition.conf\n"
	  }

          if (formValue("preseed_key_via", id) == 'defining keys manually') {
            if ( formValue("minion_pem_key", id) ) {
              json.combustion += "echo \"" +
                formValue("minion_pem_key", id) + "\" \\\n >" +
                "/etc/salt/pki/minion/minion.pem\n"
            }
            if ( formValue("minion_pub_key", id) ) {
              json.combustion += "echo \"" +
                formValue("minion_pub_key", id) + "\" \\\n >" +
                "/etc/salt/pki/minion/minion.pub\n"
            }
	  }

          if (formValue("preseed_key_via", id) == 'downloading keys from a ftp/http server') {
            json.combustion += "if ! which curl > /dev/null 2>&1; then\n" +
              "    zypper --non-interactive install curl\n" +
              "fi\n"

	    json.combustion += "curl "
	    if (formValue("url_login_name", id) && formValue("url_login_password", id)) {
	      json.combustion += " --user=" + formValue("url_login_name", id) +
	        ":" + formValue("url_login_password", id) + " "
	    }
            json.combustion += "-o /etc/salt/pki/minion/minion.pub " + formValue("key_url", id) + "/" +
	      formValue("key_name", id) + ".pub\n"

	    json.combustion += "curl "
	    if (formValue("url_login_name", id) && formValue("url_login_password", id)) {
	      json.combustion += " --user=" + formValue("url_login_name", id) +
	        ":" + formValue("url_login_password", id) + " "
	    }
            json.combustion += "-o /etc/salt/pki/minion/minion.pem " + formValue("key_url", id) + "/" +
	      formValue("key_name", id) + ".pem\n"
	  }

	  if (formValue("enableservice", id)) {
            json.combustion += "systemctl enable salt-minion.service\n"
	  }
        });
    },
    encodeToExport: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_master_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.salt === undefined) {
            json.salt = {};
          }
	  json.salt.master= formValue("master", id)
	  json.salt.preseed_key_via = formValue("preseed_key_via", id)
	  json.salt.minion_pem_key = formValue("minion_pem_key", id)
	  json.salt.minion_pub_key = formValue("minion_pub_key", id)
	  json.salt.url_login_name = formValue("url_login_name", id)
	  json.salt.url_login_password = formValue("url_login_password", id)
	  json.salt.key_url = formValue("key_url", id)
	  json.salt.key_name = formValue("key_name", id)
	  json.salt.enableservice = formValue("enableservice", id)
        }
      );
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_master_";

      if (json.salt == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(keyPrefix))
          .map((key) => key.replace(keyPrefix, ""))
          .forEach((id) => {
	    setValue("master", id, json.salt.master);
	    setValue("preseed_key_via", id, json.salt.preseed_key_via);
	    setValue("minion_pem_key", id, json.salt.minion_pem_key);
	    setValue("minion_pub_key", id, json.salt.minion_pub_key);
	    setValue("url_login_name", id, json.salt.url_login_name);
	    setValue("url_login_password", id, json.salt.url_login_password);
	    setValue("key_url", id, json.salt.key_url);
	    setValue("key_name", id, json.salt.key_name);
	    setValue("enableservice", id, json.salt.enableservice);
          });
    },
    countImport: function (json) {
      if (json.salt != undefined) {
        return 1;
      } else {
        return 0;
      }
    },
  },
};
</script>
