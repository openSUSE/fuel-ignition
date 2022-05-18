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
          console.log(enabledVal);
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

<style>
.formkit-input[type="checkbox"] {
  border-radius: 0.25em;
  width: 1em;
  height: 1em;
  margin-top: 0.25em;
  vertical-align: top;
  background-color: #fff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  border: 1px solid rgba(0, 0, 0, 0.25);
  appearance: none;
  color-adjust: exact;
}

.formkit-input:checked {
  background-color: #81c13b;
  border-color: #81c13b;
}

.formkit-input:checked[type="checkbox"] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10l3 3l6-6'/%3e%3c/svg%3e");
}
</style>
