<!-- Adds a line to the combustion bash script to install a single package -->

<template>
  <div class="combustioninstall">
    <FormKit
      :name="formKey('package_name')"
      label="Name of the package you want to install"
      type="text"
      validation="required"
      validation-behavior="live"
      value="vim-small"
      help="This will add the line 'zypper --non-interactive install {package name}' to the combustion script."
    />
  </div>
</template>

<script>
import Utils from "@/utils/utils.js";
const formPrefix = "comb_install";

export default {
  setup: () => {
    const uid = Utils.uid();

    return {
      uid,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    // thinking about creating a new encodeToCombustion method, but it doesn't seem necessary, just more logical to separate the two
    encodeToIgn: function (json, formData) {
      Object.keys(formData)
        .filter((x) => x.includes(formPrefix))
        .forEach((key) => {
          json.combustion +=
            "\nzypper --non-interactive install " + formData[key];
        });
    },
  },
};
</script>
