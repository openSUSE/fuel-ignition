<template>
  <div class="startservices">
    <FormKit
      :name="formKey('name')"
      label="Service Name (required)"
      validation="required"
      validation-behavior="live"
      value="example.service"
      help="Every unit must have a unique name. This must be suffixed with a valid unit type (e.g. “thing.service”)."
    />

    <FormKit
      :name="formKey('enabled')"
      label="enabled"
      value="yes"
      validation="optional"
      type="select"
      validation-behavior="live"
      help="Whether or not the service shall be enabled. When true, the service is enabled. When false, the service is disabled. When omitted, the service is unmodified."
      :options="['yes', 'no', 'omit']"
    />

    <FormKit
      :name="formKey('contents')"
      label="Service Unit Content (optional)"
      placeholder="write the service unit content here, spaces, newlines etc. are preserved"
      type="textarea"
      validation="optional"
      validation-behavior="live"
      help="The contents of the unit."
    />
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";
import { ref } from "vue";
const formPrefix = "start_service";

export default {
  setup: () => {
    const uid = Utils.uid();
    const sourceType = ref("data");
    return {
      sourceType,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToIgn: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_name_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          json.systemd =
            "systemd" in json
              ? json.systemd
              : {
                  units: [],
                };

          let enabledVal = formValue("enabled", id);
          let omitted = enabledVal === "omit";
          json.systemd.units.push({
            name: formValue("name", id),
            enabled: omitted ? undefined : enabledVal === "yes",
            contents: formValue("contents", id),
          });
        });
    },
  },
};
</script>
