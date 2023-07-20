<template>
  <div class="createfiles">
    <FormKit
      :name="formKey('path')"
      label="File Path (required)"
      placeholder="path on the filesystem"
      validation="required"
      validation-behavior="live"
      value="/etc/someconfig"
      help="The absolute path to the file"
    />

    <FormKit
      :name="formKey('overwrite')"
      label="Overwrite"
      placeholder="path on the filesystem"
      validation="required"
      type="checkbox"
      validation-behavior="live"
      help="Whether to delete preexisting nodes at the path"
    />

    <FormKit
      :name="formKey('mode')"
      label="File Mode (required)"
      type="number"
      value="420"
      validation="required"
      validation-behavior="live"
      help="The file's permission mode. Note that the mode must be properly specified as a decimal value (i.e. 0644 -> 420)."
    />

    <div class="source">
      <FormKit
        type="select"
        :name="formKey('source_type')"
        v-model="sourceType"
        label="Scheme for file contents url (use data for plain text)"
        help="If source is omitted and a regular file already exists at the path, Ignition will do nothing. If source is omitted and no file exists, an empty file will be created."
        :options="[
          'data',
          'data-vagrant',
          'https',
          'http',
          'tftp',
          's3',
          'gs',
          'omit',
        ]"
      />
    </div>

    <div v-if="sourceType === 'data'" class="data">
      <FormKit
        :name="formKey('data_content')"
        label="File Content Data (required)"
        placeholder="write the file content here, spaces, newlines etc. are preserved"
        type="textarea"
        validation="required"
        validation-behavior="live"
        help="Leaving this empty will create an empty file"
      />
    </div>

    <div v-if="sourceType === 'data-vagrant'" class="data-vagrant">
      <FormKit
        :name="formKey('data_vagrant_content')"
        label="File Content Data (required)"
        placeholder="write the file content here, spaces, newlines etc. are preserved"
        type="textarea"
        validation="required"
        validation-behavior="live"
        help="Leaving this empty will create an empty file"
      />
    </div>

    <div v-if="sourceType === 'https'" class="https">
      <FormKit
        :name="formKey('https_content')"
        label="HTTPS Url (required)"
        placeholder="the URL of the file contents"
        type="text"
        validation="required|url"
        validation-behavior="live"
      />
    </div>

    <div v-if="sourceType === 'http'" class="http">
      <FormKit
        :name="formKey('http_content')"
        label="HTTP Url (required)"
        placeholder="the URL of the file contents"
        type="text"
        validation="required|url"
        validation-behavior="live"
      />

      <FormKit
        :name="formKey('http_verification')"
        label="Verification Hash (optional)"
        placeholder="e.g. sha512-012345678.."
        type="text"
        validation="optional"
        validation-behavior="live"
        help="The hash of the contents, in the form <type>-<value> where type is either sha512 or sha256."
      />
    </div>

    <div
      v-if="
        !sourceType.includes('http') &&
        sourceType !== 'data' &&
        sourceType !== 'data-vagrant' &&
        sourceType !== 'omit'
      "
      class="tftp-s3-gs"
    >
      <FormKit
        :name="formKey('tftp_s3_gs_content')"
        :label="sourceType.toUpperCase() + ' Url (required)'"
        placeholder="the URL of the file contents"
        type="text"
        validation="required"
        validation-behavior="live"
      />
    </div>
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";
import { ref } from "vue";
const formPrefix = "create_file";

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

      const b64EncodeUnicode = function (str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return window.btoa(
          encodeURIComponent(str).replace(
            /%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
              return String.fromCharCode("0x" + p1);
            }
          )
        );
      };

      const keyPrefix = formPrefix + "_path_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace("create_file_path_", ""))
        .forEach((id) => {
          if (json.storage === undefined) {
            json.storage = {};
          }

          if (json.storage.files === undefined) {
            json.storage.files = [];
          }

          let content;
          let fileObject = {};

          switch (formValue("source_type", id)) {
            case "data":
              let dataValue = formValue("data_content", id);
              content =
                "data:text/plain;charset=utf-8;base64," +
                b64EncodeUnicode(dataValue === undefined ? "" : dataValue);
              break;

            case "data-vagrant":
              let dataVagrantValue = formValue("data_vagrant_content", id);
              content =
                "data:," +
                encodeURIComponent(
                  dataVagrantValue === undefined ? "" : dataVagrantValue
                );
              break;

            case "https":
              content = formValue("https_content", id);
              break;

            case "http":
              content = formValue("http_content", id);
              let verification = formValue("http_verification", id);
              if (verification)
                fileObject.verification = { hash: verification };
              break;

            case "tftp":
            case "s3":
            case "gs":
              content = formValue("tftp_s3_gs_content", id);
              break;
          }

          // merging the two objects, in case verification was written to fileObject
          json.storage.files.push(
            Object.assign(
              {
                path: formValue("path", id),
                mode: parseInt(formValue("mode", id)),
                overwrite: formValue("overwrite", id),
                contents: {
                  source: content,
                },
              },
              fileObject
            )
          );
        });
    },
    encodeToExport: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_path_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.storage === undefined) {
            json.storage = {};
          }

          if (json.storage.files === undefined) {
            json.storage.files = [];
          }

          let file = {};
	  file.source_type = formValue("source_type", id)
          switch (file.source_type) {
            case "data":
              file.data_content = formValue("data_content", id);
              break;
            case "data-vagrant":
              file.data_vagrant_content = formValue("data_vagrant_content", id);
            case "https":
              file.https_content = formValue("https_content", id);
              break;
            case "http":
              file.http_content = formValue("http_content", id);
              file.http_verification = formValue("http_verification", id);
              break;
            case "tftp":
            case "s3":
            case "gs":
              file.tftp_s3_gs_content = formValue("tftp_s3_gs_content", id);
              break;
          }
          file.path = formValue("path", id)
	  file.mode = formValue("mode", id)
	  file.overwrite = formValue("overwrite", id)
          json.storage.files.push(file)
        }
      );
    },
    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_path_";

      if (json.storage.files == undefined) return;
      Object.keys(formData)
          .filter((x) => x.includes(keyPrefix))
          .map((key) => key.replace(keyPrefix, ""))
          .forEach((id) => {
  	    let file = json.storage.files.shift();
  	    setValue("source_type", id, file.source_type)
            switch (file.source_type) {
              case "data":
                setValue("data_content", id, file.data_content);
                break;
              case "data-vagrant":
                setValue("data_vagrant_content", id, file.data_vagrant_content)
              case "https":
                setValue("https_content", id, file.https_content);
                break;
              case "http":
                setValue("http_content", id, file.http_content);
                setValue("http_verification", id, file.http_verification)
                break;
              case "tftp":
              case "s3":
              case "gs":
                setValue("tftp_s3_gs_content", id, file.tftp_s3_gs_content)
                break;
            }
            setValue("path", id, file.path);
	    setValue("mode", id, file.mode);
	    setValue("overwrite", id, file.overwrite);
          });
    },
    countImport: function (json) {
      if (json.storage != undefined && json.storage.files != undefined) {
        return json.storage.files.length;
      } else {
        return 0;
      }
    },
  },
};
</script>
