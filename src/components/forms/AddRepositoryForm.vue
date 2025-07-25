<!-- Adds a line to the combustion bash script to add additional repository -->

<template>
  <FormKit
    :name="formKey('repository_name')"
    label="Name"
    type="text"
    validation="required"
    validation-visibility="live"
    help="Alias name of the repository."
  />

  <FormKit
    :name="formKey('repository_url')"
    label="URL"
    type="text"
    validation="required|url"
    validation-visibility="live"
    help="This will add a 'zypper addrepo --refresh <URL> <Name>' line to the combustion script."
  />
</template>

<script>
import Utils from "@/utils/utils.js";
const formPrefix = "add_repository";

export default {
  setup: () => {
    const uid = Utils.uid();

    return {
      uid,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToInstallation: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      let entries = 0
      const keyPrefix = formPrefix + "_repository_name_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
	  if (entries === 0) {
            json.combustion += "\n# Add repositories\n"
	  }
	  entries++;
	  if (formValue("repository_url", id) && formValue("repository_name", id)) {
            json.combustion += "zypper addrepo --refresh " + formValue("repository_url", id) +
              " \"" + formValue("repository_name", id) + "\"\n"
	  }
        });
    },
    encodeToExport: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_repository_name_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.repository === undefined) {
            json.repository = {};
          }

          if (json.repository.repositories === undefined) {
            json.repository.repositories = [];
          }
	  if (formValue("repository_url", id) && formValue("repository_name", id)) {
 	    let repository = {}
	    repository.name = formValue("repository_name", id)
	    repository.url = formValue("repository_url", id)
            json.repository.repositories.push(repository)
	  }
        }
      );
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_repository_name_";

      if (json.repository == undefined || json.repository.repositories == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(keyPrefix))
          .map((key) => key.replace(keyPrefix, ""))
          .forEach((id) => {
	    let repository = json.repository.repositories.shift();
	    setValue("repository_name", id, repository.name);
	    setValue("repository_url", id, repository.url);
          });
    },
    countImport: function (json) {
      if (json.repository != undefined && json.repository.repositories != undefined) {
        return json.repository.repositories.length;
      } else {
        return 0;
      }
    },
  },
};
</script>
