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
    value="Base_Product"
    help="Product or extension name"
  />
  <FormKit
    :name="formKey('usb_regcode')"
    label="Reading registration code from mounted USB medium"
    type="checkbox"
    validation-behavior="live"
    v-model="usb_regcode"
  />
  <div v-if="usb_regcode === false">
    <FormKit
      :name="formKey('regcode')"
      label="Registration code"
      type="text"
      value=""
      help="Subscription registration code for the product to be registered."
    />
  </div>
  <FormKit
    :name="formKey('email')"
    label="Email"
    type="email"
    validation="email"
    validation-visibility="live"
    help="Email address for which the registration will be done (optional)."
  />
</template>

<script>
import Utils from "@/utils/utils.js";
import { ref } from "vue";
const formPrefix = "comb_registration";

export default {
  setup: () => {
    const uid = Utils.uid();
    const usb_regcode = ref(false);

    return {
      uid,
      usb_regcode,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToInstallation: function (json, formData) {
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

          json.combustion += "product=\"" + formValue("product", id) + "\"\n"

	  if (formValue("usb_regcode", id) === true) {
	      json.combustion += "for I in `fdisk -l | grep '^/dev' | awk '{print $1}'`\n" +
                 "do\n" +
	         "  if ! findmnt $I > /dev/null; then\n" +
	         "    if mount $I /mnt; then\n" +
		 "      if  [ -f /mnt/regcode.xml ]; then\n" +
		 "        regcode=`cat /mnt/regcode.xml|sed '2 s/xmlns=\".*\"//g'|xmllint --xpath \"//addon[name='$product']/reg_code/text()\" -`\n" +
		 "        umount /mnt\n" +
		 "        break\n" +
		 "      fi\n" +
		 "      if  [ -f /mnt/regcode.txt ]; then\n" +
		 "        regcode=$(grep $product /mnt/regcode.txt|awk '{print $2}')\n" +
		 "        umount /mnt\n" +
		 "        break\n" +
	         "      fi\n" +
		 "      umount /mnt\n" +
                 "    fi\n" +
                 "  fi\n" +
                 "done\n"
	  } else {
	      json.combustion += "regcode=\"" + formValue("regcode", id) + "\"\n"
          }

	  if (formValue("product", id) && formValue("product", id)!== "Base_Product") {
              json.combustion += "architecture=`arch`\n"
	      json.combustion += "version=`xmllint --xpath \"//version/text()\" /etc/products.d/baseproduct`\n"
	      json.combustion += "SUSEConnect " + "--product $product/$version/$architecture "
	  } else {
              json.combustion += "SUSEConnect "
          }

          if (formValue("email", id) ) {
            json.combustion += "--email " + formValue("email", id) + " "
	  }
	  json.combustion += "--url " + formValue("registrationserver", id) +
	    " --regcode $regcode" + "\n"
        });
    },
    encodeToExport: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_registrationserver_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.registration === undefined) {
            json.registration = {};
          }

          if (json.registration.registrations === undefined) {
            json.registration.registrations = [];
          }

	  let registration = {}
	  registration.registrationserver = formValue("registrationserver", id)
	  registration.regcode = formValue("regcode", id)
	  registration.product = formValue("product", id)
	  registration.email = formValue("email", id)
	  registration.usb_regcode = formValue("usb_regcode", id)
          json.registration.registrations.push(registration)
        }
      );
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_registrationserver_";

      if (json.registration == undefined || json.registration.registrations == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(keyPrefix))
          .map((key) => key.replace(keyPrefix, ""))
          .forEach((id) => {
	    let registration = json.registration.registrations.shift();
	    setValue("registrationserver", id, registration.registrationserver);
	    setValue("usb_regcode", id, registration.usb_regcode);
	    setValue("regcode", id, registration.regcode);
	    setValue("product", id, registration.product);
	    setValue("email", id, registration.email);
          });
    },
    countImport: function (json) {
      if (json.registration != undefined && json.registration.registrations != undefined) {
        return json.registration.registrations.length;
      } else {
        return 0;
      }
    },
  },
};
</script>
