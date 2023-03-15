<!-- Adds product registrations to combustion bash script -->

<template>
  <FormKit
    :name="formKey('registrationserver')"
    label="Registration server"
    type="text"
    value="https://scc.suse.com"
    help="URL of the registration server"
  />
  <FormKit
    :name="formKey('product')"
    label="Product name"
    type="text"
    value="Base Product"
    help="Product or extension name"
  />
  <FormKit
    :name="formKey('regcode')"
    label="Registration code"
    type="text"
    value=""
    help="Subscription registration code for the product to be registered."
  />
  <FormKit
    :name="formKey('email')"
    label="Email"
    type="email"
    validation="required|email"
    validation-visibility="live"
    help="Email address for which the registration will be done."
  />
</template>

<script>
import Utils from "@/utils/utils.js";
const formPrefix = "comb_registration";

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

      let entries = 0
      const keyPrefix = formPrefix + "_registrationserver_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
	  if (entries === 0) {
            json.combustion += "\n# Registration\n" + 
	      "if ! which SUSEConnect > /dev/null 2>&1; then\n" +
	      "    zypper --non-interactive install suseconnect-ng\n" +
              "fi\n"
	  }
	  entries++;
	  json.combustion += "SUSEConnect "
	  if (formValue("product", id) !== "Base Product") {
            json.combustion += "--product " + formValue("product", id) + " "
	  }
          if (formValue("email", id) ) {
            json.combustion += "--email " + formValue("email", id) + " "
	  }
	  json.combustion += "--url " + formValue("registrationserver", id) +
	    " --regcode " + formValue("regcode", id) + "\n"
        });
    },
  },
};
</script>
