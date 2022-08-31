<template>
  <div class="combustionraw">
    <FormKit
      :name="formKey('script_content')"
      label="Lines to add"
      type="textarea"
      validation="required"
      validation-behavior="live"
      :value="`echo &quot;hello combustion&quot;`"
      help="You can find examples of a combustion script here: https://en.opensuse.org/Portal:MicroOS/Combustion#Simple_example"
    />
  </div>
</template>

<script>
import Utils from "@/utils/utils.js";
const formPrefix = "comb_raw";

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
          json.combustion += "\n" + formData[key];
        });
    },
  },
};
</script>
