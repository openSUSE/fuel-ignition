<template>
  <div class="analyze">
    <FormKit
      :name="formKey('file')"
      label="File To Analyze (Console Log)"
      type="file"
      validation="required"
      validation-behavior="live"
      help="This is a debug form."
    />
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";

import { BlobEditor } from "@/components/TemplateBlobEditorComponent.vue";
const formPrefix = "debug_analyze";

export default {
  setup: () => {
    const uid = Utils.uid();

    let editor = new BlobEditor();

    console.log(editor);

    return {
      uid,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToIgn: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_file_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          console.log("--- debug analyze file ---");

          let file;

          try {
            file = Object.assign({}, formData["debug_analyze_file_" + id][0]);
          } catch (error) {}

          console.log(file);
          console.log("-----");
        });
    },
  },
};
</script>
