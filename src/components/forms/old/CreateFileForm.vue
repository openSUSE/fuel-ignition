<template>
  <div class="createfiles">
    <FormKit
      :name="'create_file_path_' + unique"
      label="File Path (required)"
      placeholder="path on the root filesystem"
      validation="required"
      validation-behavior="live"
      value="/etc/someconfig"
      help="the absolute path to the file"
    />

    <FormKit
      :name="'create_file_overwrite_' + unique"
      label="Overwrite"
      placeholder="path on the root filesystem"
      validation="required"
      type="checkbox"
      validation-behavior="live"
      help="whether to delete preexisting nodes at the path"
    />

    <FormKit
      :name="'create_file_mode_' + unique"
      label="File Mode (required)"
      placeholder="write the corresponding password here"
      type="number"
      value="420"
      validation="required"
      validation-behavior="live"
      help="the file's permission mode. Note that the mode must be properly specified as a decimal value (i.e. 0644 -> 420)."
    />

    <div class="source">
      <FormKit
        type="select"
        :name="'create_file_source_type_' + unique"
        label="Scheme for file contents url (use data, if plain text)"
        help="When using http, it is advisable to use the verification option to ensure the contents haven't been modified. If source is omitted and a regular file already exists at the path, Ignition will do nothing. If source is omitted and no file exists, an empty file will be created."
        :options="['data', 'https', 'http', 'tftp', 's3', 'gs']"
      />
    </div>

    <div v-if="true" class="data">
      <FormKit
        :name="'create_file_content_' + unique"
        label="File Content Data (required)"
        placeholder="write the file content here, spaces, newlines etc. are preserved"
        type="textarea"
        validation="required"
        validation-behavior="live"
        help="leaving this empty will create an empty file, options for https, etc. will be implemented soon"
      />
    </div>
  </div>
</template>


<script>
import Utils from "../../utils/utils.js";

export default {
	setup: () => {
		const unique = Utils.uid();

		return {
			unique,
		};
	},

	methods: {
		encodeToIgn: function(json, formData) {
			Object.keys(formData)
				.filter((x) => x.includes("create_file_path_"))
				.map((key) => key.replace("create_file_path_", ""))
				.forEach((id) => {
					json.storage = "storage" in json ? json.storage : {
						files: []
					};

					const path = formData["create_file_path_" + id];

					const mode = formData["create_file_mode_" + id];

					const content =
						"data:text/plain;charset=utf-8;," +
						encodeURIComponent(formData["create_file_content_" + id]);

					json.storage.files.push({
						path: path,
						mode: mode,
						contents: {
							source: content
						},
					});
				});
		},
	},
};
</script>