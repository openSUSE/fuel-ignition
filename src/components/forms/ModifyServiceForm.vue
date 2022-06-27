<template>
  <div class="modifyservice">
    <FormKit
      :name="formKey('name')"
      label="Name of the service that you want to modify (required)"
      validation="required"
      validation-behavior="live"
      value="example.service"
      placeholder="e.g. systemd-journald.service"
      help="The name of the unit. This must be suffixed with a valid unit type (e.g. “thing.service”)."
    />

    <FormKit
      :name="formKey('dropin_name')"
      label="Name of the drop-in file"
      validation="required"
      validation-behavior="live"
      value="debug.conf"
      help="The name of the drop-in. This must be suffixed with “.conf”."
    />

    <FormKit
      :name="formKey('contents')"
      label="Drop-In Unit Content (required)"
      placeholder="e.g. [Service].. | spaces, newlines etc. are preserved"
      type="textarea"
      validation="required"
      validation-behavior="live"
      help="Write the service unit content here, spaces, newlines etc. are preserved."
    />
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";
const formPrefix = "modify_service";

export default {
  setup: () => {
    const uid = Utils.uid();
    return {
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

          // see if this service unit is used already by another component
          let unit = json.systemd.units.find(
            (unit) => unit.name === formValue("name", id)
          );

          let dropin = {
            name: formValue("dropin_name", id),
            contents: formValue("contents", id),
          };

          if (unit !== undefined) {
            if (unit.dropins !== undefined) {
              unit.dropins.push(dropin);
              return;
            }

            unit.dropins = [dropin];
            return;
          }

          json.systemd.units.push({
            name: formValue("name", id),
            dropins: [dropin],
          });
        });
    },
  },
};
</script>
