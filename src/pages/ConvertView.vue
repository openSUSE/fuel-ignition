<template>
  <section class="page-section p-2 bg-dark" id="edit">
    <div class="container mt-5 px-0">
      <div class="row gx-4 gx-lg-5 justify-content-center">
        <div class="col-lg-8 col-xl-6 text-white text-center">
          <h1 class="mt-5">Convert JSON to Ignition-Ready IMG</h1>
          <hr class="divider" />
          <div class="d-grid mb-5">
            <img
              class="text-center mx-auto w-25"
              src="@/assets/template/img/undraw_convert_re_l0y1.svg"
            />
          </div>
        </div>
      </div>
      <div class="row gx-4 gx-lg-5 justify-content-center mb-5">
        <div class="col-lg-6 expandable-comp text-white">
          <FormKit type="group" v-model="formData">
            <div class="form-floating mb-3">
              <FormKit
                name="convert_file"
                label="Either  -  Config.ign / Json File To Convert"
                type="file"
                @change="handleUpload"
              />
              <p></p>
              <FormKit
                name="convert_text"
                label="Or  -  JSON as Text"
                placeholder='e.g. { "ignition": { "version": "3.2.0" } }'
                type="textarea"
                id="convert_text"
                validation-behavior="live"
                @keyup="handleText"
              />
            </div>
          </FormKit>
          <TemplateBlobEditor :ignJson="displayJson()"></TemplateBlobEditor>
        </div>
      </div>
    </div>

    <hr class="divider" />
  </section>

  <section class="page-section p-2" id="export">
    <div class="container mt-5 px-0">
      <div class="row gx-4 gx-lg-5 justify-content-center">
        <div class="col-lg-8 col-xl-6">
          <h1 class="mt-5 text-center">JSON That Will Be Converted</h1>
          <hr class="divider" />
          <div class="d-grid mb-5">
            <pre class="form-data">{{ displayJson() }}</pre>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { shallowRef, ref, watch } from "vue";
import Utils from "@/utils/utils.js";

import TemplateBlobEditor from "../components/TemplateBlobEditorComponent.vue";
const formData = ref({});
const jsonErrorMsg = "The provided json is invalid.";
let uploadedJson = ref({});

function displayJson() {
  return uploadedJson;
}

function clearFile() {
  // formData.value.convert_file = undefined;
  let removeAnchor = document.querySelector(".formkit-remove-files");
  if (removeAnchor !== undefined) {
    removeAnchor.click();
  }
}

async function handleUpload(event) {
  let file = event.target.files[0];

  // parse json from file object
  if (file !== undefined) {
    let json = await Utils.parseJsonFile(file)
      .catch(() => {
        alert(jsonErrorMsg);
        clearFile();
      })
      .then((json) => {
        uploadedJson = json;
        formData.value.convert_text = JSON.stringify(uploadedJson, null, 2);
        return json;
      });
  }
}

const handleText = function (event) {
  if (formData.value.convert_file !== undefined) {
    console.log("convert file defined");
    if (!confirm("You already uploaded a file. Discard?")) {
      formData.value.convert_text = JSON.stringify(uploadedJson, null, 2);
      return;
    }

    clearFile();

    try {
      let json = JSON.parse(formData.value.convert_text);

      uploadedJson = json;
    } catch (error) {
      alert(jsonErrorMsg);
    }
  }
};
</script>

<style>
#convert_text {
  height: 175px;
}

.formkit-remove-files {
  display: block;
}
</style>
