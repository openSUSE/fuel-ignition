<script setup>
import { ref, watch } from "vue";
import Utils from "@/utils/utils.js";
import ExpandableComponent from "@/components/ExpandableComponent.vue";
import BlobEditorComponent from "@/components/TemplateBlobEditorComponent.vue";

import AddUsersForm from "@/components/forms/AddUsersForm.vue";
import CreateFileForm from "@/components/forms/CreateFileForm.vue";
import StartServiceForm from "@/components/forms/StartServiceForm.vue";
import ModifyServiceForm from "@/components/forms/ModifyServiceForm.vue";

import DebugAddBytesForm from "@/components/forms/DebugAddBytesForm.vue";
import DebugAnalyzeImgForm from "@/components/forms/DebugAnalyzeImgForm.vue";

const formComponents = [
  AddUsersForm,
  CreateFileForm,
  StartServiceForm,
  ModifyServiceForm,

  DebugAddBytesForm,
  DebugAnalyzeImgForm,
];

const formData = ref({ debug: false });

// setup optional Watchers if a FormComponent needs it
formComponents.forEach((comp) =>
  Utils.setupFormComponentWatcher(comp, watch, formData)
);

const downloadConfigIgn = (formData) => {
  console.log("downloading..");
  Utils.saveTemplateAsFile("config.ign", toIgnitionConfig(formData));
};

const copyConfigToClipboard = (formData) => {
  Utils.copy(JSON.stringify(toIgnitionConfig(formData), null, 2));
};

function copyToClipboard(text) {
  window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

const toIgnitionConfig = (formData) => {
  let json = {
    ignition: { version: "3.2.0" },
  };

  formComponents
    .filter((comp) => comp.methods.hasOwnProperty("encodeToIgn"))
    .forEach((comp) => comp.methods.encodeToIgn(json, formData));

  if (formData.debug) {
    json["debug:form"] = formData;
  }

  return json;
};
</script>

<template>
  <section class="page-section p-2 bg-dark" id="edit">
    <div class="container mt-5 px-0">
      <div class="row gx-4 gx-lg-5 justify-content-center">
        <div class="col-lg-8 col-xl-6 text-white text-center">
          <h1 class="mt-5">Ignition Config Generator</h1>
          <hr class="divider" />
          <div class="d-grid mb-5">
            <img
              class="text-center mx-auto w-50"
              src="@/assets/template/img/undraw_programming_re_kg9v.svg"
            />
          </div>
        </div>
      </div>
      <div class="row gx-4 gx-lg-5 justify-content-center mb-5">
        <div class="col-lg-6">
          <div class="form-floating mb-3">
            <FormKit type="group" v-model="formData">
              <ExpandableComponent title="Add Users" :displayAtLeastOne="false">
                <AddUsersForm></AddUsersForm>
              </ExpandableComponent>

              <ExpandableComponent
                title="Create Files"
                :displayAtLeastOne="false"
              >
                <CreateFileForm></CreateFileForm>
              </ExpandableComponent>

              <ExpandableComponent
                title="Start Services"
                :displayAtLeastOne="false"
              >
                <StartServiceForm></StartServiceForm>
              </ExpandableComponent>

              <!-- rename to "Modify Services (Drop-Ins)"? -->
              <ExpandableComponent
                title="Modify Services"
                :displayAtLeastOne="false"
              >
                <ModifyServiceForm></ModifyServiceForm>
              </ExpandableComponent>

              <div v-if="formData.debug">
                <!-- rename to "Modify Services (Drop-Ins)"? -->
                <ExpandableComponent
                  title="DEBUG: Add Bytes"
                  :displayAtLeastOne="false"
                >
                  <DebugAddBytesForm></DebugAddBytesForm>
                </ExpandableComponent>

                <ExpandableComponent
                  title="DEBUG: Analyze File"
                  :displayAtLeastOne="true"
                  :maxComponents=1
                >
                  <DebugAnalyzeImgForm></DebugAnalyzeImgForm>
                </ExpandableComponent>
              </div>

              <!-- I know it's super unnecessary, but I like it, maybe add in the future
                <FormKit
                  name="likes_microOS"
                  label="Opinion"
                  help="How excited are you about MicroOS?"
                  type="radio"
                  value="A lot"
                  :options="['A little', 'A lot']"
                /> -->
            </FormKit>
          </div>
        </div>
      </div>
    </div>

    <hr class="divider" />
  </section>

  <section class="page-section p-2" id="export">
    <div class="container mt-5 px-0">
      <div class="row gx-4 gx-lg-5 justify-content-center">
        <div class="col-lg-8 col-xl-6">
          <h1 class="mt-5 text-center">config.ign</h1>
          <hr class="divider" />
          <div class="d-grid mb-5">
            <pre class="form-data">{{ toIgnitionConfig(formData) }}</pre>

            <div class="double">
              <FormKit
                v-model="formData.debug"
                type="checkbox"
                label="Debug"
                name="debug"
              />

              <button
                class="btn btn-outline-secondary mb-2"
                @click="copyConfigToClipboard(formData)"
              >
                Copy
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-clipboard"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"
                  />
                  <path
                    d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"
                  />
                </svg>
              </button>
            </div>

            <button
              class="btn btn-primary mb-4"
              @click="downloadConfigIgn(formData)"
            >
              Download
            </button>

            <div>
              <h2 class="mt-5">Convert to IMG in the Browser (In Dev)</h2>

              <BlobEditorComponent
                :ignJson="toIgnitionConfig(formData)"
              ></BlobEditorComponent>
            </div>

            <h2 class="mt-5">Convert to ISO FileSystem with mkisofs</h2>

            <pre class="form-data">
# mkisofs -o ignition.iso -V ignition config.ign</pre
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
