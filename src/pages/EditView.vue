<script setup>

import { ref, watch, onUpdated } from "vue";
import Utils from "@/utils/utils.js";
import ExpandableComponent from "@/components/ExpandableComponent.vue";
import BlobEditorComponent from "@/components/TemplateBlobEditorComponent.vue";

import AddUsersForm from "@/components/forms/AddUsersForm.vue";
import CreateFileForm from "@/components/forms/CreateFileForm.vue";
import AddHostnameForm from "@/components/forms/AddHostnameForm.vue";
import AddLanguageForm from "@/components/forms/AddLanguageForm.vue";
import AddNetworkForm from "@/components/forms/AddNetworkForm.vue";
import ChangeStorageForm from "@/components/forms/ChangeStorageForm.vue";
import StartServiceForm from "@/components/forms/StartServiceForm.vue";
import ModifyServiceForm from "@/components/forms/ModifyServiceForm.vue";

import DebugAddBytesForm from "@/components/forms/DebugAddBytesForm.vue";
import DebugAnalyzeImgForm from "@/components/forms/DebugAnalyzeImgForm.vue";
import AddKeyboardForm from "@/components/forms/AddKeyboardForm.vue";
import RegistrationForm from "@/components/forms/RegistrationForm.vue";
import SaltForm from "@/components/forms/SaltForm.vue";
import S390ChannelForm from "@/components/forms/S390ChannelForm.vue";
import InstallPackageForm from "@/components/forms/InstallPackageForm.vue";
import CombAddRawBash from "../components/forms/CombAddRawBash.vue";

const formComponents = [
  AddUsersForm,
  CreateFileForm,
  AddHostnameForm,
  AddLanguageForm,
  ChangeStorageForm,
  AddNetworkForm,
  StartServiceForm,
  ModifyServiceForm,
  AddKeyboardForm,
  RegistrationForm,
  SaltForm,
  S390ChannelForm,
  InstallPackageForm,
  CombAddRawBash,

  DebugAddBytesForm,
  DebugAnalyzeImgForm,
];

const formData = ref({ debug: false, save_to: "fuel-ignition.json" });
const importedData = ref({})

// setup optional Watchers if a FormComponent needs it
formComponents.forEach((comp) =>
  Utils.setupFormComponentWatcher(comp, watch, formData)
);

let componentKey = ref(0);
const forceRerender = () =>{
   componentKey.value += 1;
}

const elementNumber = (section) => {
  if (section.methods.hasOwnProperty("countImport")) {
    return section.methods.countImport(importedData.value);
  } else {
    return 0
  }
}

onUpdated(() => {
  if (Object.keys(importedData.value).length > 0) {
    formComponents
      .filter((comp) => comp.methods.hasOwnProperty("fillImport"))
      .forEach((comp) => comp.methods.fillImport(importedData.value, formData.value));
    importedData.value = {};
  }
});

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
    .filter((comp) => comp.methods.hasOwnProperty("encodeToInstallation"))
    .forEach((comp) => comp.methods.encodeToInstallation(json, formData));

  if (formData.debug) {
    json["debug:form"] = formData;
  }

  json.combustion = undefined;
  json.combustion_prepare = undefined;

  return json;
};

const toCombustionScript = (formData) => {
  let json = { combustion: "", combustion_prepare: "", output: "" };

  formComponents
    .filter((comp) => comp.methods.hasOwnProperty("encodeToInstallation"))
    .forEach((comp) => comp.methods.encodeToInstallation(json, formData));

  if (json.combustion_prepare != "") {
    console.log("prepare: " + json.combustion_prepare);
    if (json.output == "") {
      json.output =
        "#!/bin/bash\n# combustion: network prepare\n# script generated with https://opensuse.github.io/fuel-ignition/\n\n"
    }
    json.output += json.combustion_prepare + "\n"
  }
  if (json.output != "") {
    json.output += "if [ \"${1-}\" = \"--prepare\" ]; then\n" +
      "  exit 0\n" +
      "fi\n"
  } else {
    json.output = "#!/bin/bash\n# combustion: network\n# script generated with https://opensuse.github.io/fuel-ignition/\n"
  }

  json.output +=
    "\n# Redirect output to the console\n" +
    "exec > >(exec tee -a /dev/tty0) 2>&1\n"

  json.combustion = ""
  json.combustion_prepare = ""
  formComponents
    .filter((comp) => comp.methods.hasOwnProperty("encodeToInstallation"))
    .forEach((comp) => comp.methods.encodeToInstallation(json, formData));

  if (json.combustion !== "") {
    console.log(json.combustion);
    json.output += json.combustion
  }

  json.output += '\n# Leave a marker\necho "Configured with combustion" > /etc/issue.d/combustion';

  json.output += '\n\n# Close outputs and wait for tee to finish.\nexec 1>&- 2>&-; wait;';

  return json.output;
};

async function importData(event) {
  let file = event.target.files[0];

  // Load settings form file and
  // parse json from file object.
  importedData.value = await Utils.parseJsonFile(file)
    .catch(() => {
      alert(jsonErrorMsg);
      clearFile();
    });
  formData.value = {debug: formData.value.debug, save_to: formData.value.save_to}
  forceRerender();
}

const exportSettings= (formData) => {
  let json = {};

  formComponents
    .filter((comp) => comp.methods.hasOwnProperty("encodeToExport"))
    .forEach((comp) => comp.methods.encodeToExport(json, formData));

    Utils.saveTemplateAsFile(
      formData.save_to,
      json,
      false // isNotJson parameter
    )
};

</script>

<template>
  <div :key="componentKey">
    <section class="page-section p-2 bg-dark" id="edit">
      <div class="container mt-5 px-0">
        <div class="row gx-4 gx-lg-5 justify-content-center">
          <div class="col-lg-8 col-xl-6 text-white text-center">
            <h1 class="mt-5">Config Generator</h1>
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
                <ExpandableComponent
	        title="Add User"
  	        :displaysAtBegin="elementNumber(AddUsersForm)"
  	      >
                  <AddUsersForm></AddUsersForm>
                </ExpandableComponent>

                <ExpandableComponent
                  title="Set Hostname"
                  :displaysAtBegin="elementNumber(AddHostnameForm)"
		  :maxComponents="1"
                >
                  <AddHostnameForm></AddHostnameForm>
                </ExpandableComponent>

		<hr class="divider-long" />

                <ExpandableComponent
                  title="Set Language"
                  :displaysAtBegin="elementNumber(AddLanguageForm)"
  		:maxComponents="1"
                >
                  <AddLanguageForm></AddLanguageForm>
                </ExpandableComponent>

		<ExpandableComponent
                  title="Set Keyboard"
                  :displaysAtBegin="elementNumber(AddKeyboardForm)"
		  :maxComponents="1"
                >
                  <AddKeyboardForm></AddKeyboardForm>
                </ExpandableComponent>

		<hr class="divider-long" />

                <ExpandableComponent
                  title="Change Storage"
                  :displaysAtBegin="elementNumber(ChangeStorageForm)"
                >
                  <ChangeStorageForm></ChangeStorageForm>
                </ExpandableComponent>

		<hr class="divider-long" />

                <ExpandableComponent
                  title="Add Network Interface"
                  :displaysAtBegin="elementNumber(AddNetworkForm)"
                >
                  <AddNetworkForm></AddNetworkForm>
                </ExpandableComponent>

		<ExpandableComponent
                  title="Register Products"
                  :displaysAtBegin="elementNumber(RegistrationForm)"
                >
                  <RegistrationForm></RegistrationForm>
                </ExpandableComponent>
  
                <ExpandableComponent
                  title="Connect to Salt Master"
                  :maxComponents="1"
                  :displaysAtBegin="elementNumber(SaltForm)"
                >
                  <SaltForm></SaltForm>
                </ExpandableComponent>

                <ExpandableComponent
                  title="Set S390 Channels"
                  :displaysAtBegin="elementNumber(S390ChannelForm)"
                >
                  <S390ChannelForm></S390ChannelForm>
                </ExpandableComponent>

		<hr class="divider-long" />
  
                <ExpandableComponent
                  title="Enable or Create Service"
                  :displaysAtBegin="elementNumber(StartServiceForm)"
                >
                  <StartServiceForm></StartServiceForm>
                </ExpandableComponent>
  
                <ExpandableComponent
                  title="Modify Existing Service"
                  :displaysAtBegin="elementNumber(ModifyServiceForm)"
                >
                  <ModifyServiceForm></ModifyServiceForm>
                </ExpandableComponent>
  
		<hr class="divider-long" />

                <ExpandableComponent
                  title="Install Additional Packages"
                  :displaysAtBegin="elementNumber(InstallPackageForm)"
                >
                  <InstallPackageForm></InstallPackageForm>
                </ExpandableComponent>

                <ExpandableComponent
                  title="Add Files To System"
                  :displaysAtBegin="elementNumber(CreateFileForm)"
                >
                  <CreateFileForm></CreateFileForm>
                </ExpandableComponent>

                <ExpandableComponent
                  title="Add Custom Lines To Combustion Script"
                  :displaysAtBegin="elementNumber(CombAddRawBash)"
                >
                  <CombAddRawBash></CombAddRawBash>
                </ExpandableComponent>

                <div v-if="formData.debug">
                  <!-- rename to "Modify Services (Drop-Ins)"? -->
                  <ExpandableComponent
                    title="DEBUG: Add Bytes"
                    :displaysAtBegin="elementNumber(DebugAddBytesForm)"
                  >
                    <DebugAddBytesForm></DebugAddBytesForm>
                  </ExpandableComponent>
  
                  <ExpandableComponent
                    title="DEBUG: Analyze File"
                    :displaysAtBegin="1"
                    :maxComponents="1"
                  >
                    <DebugAnalyzeImgForm></DebugAnalyzeImgForm>
                  </ExpandableComponent>
                </div>
              </FormKit>
            </div>
          </div>
        </div>
      </div>
    </section>
  
    <section class="page-section p-2" id="export">
      <div class="container mt-5 px-0">
        <div class="row gx-4 gx-lg-5 justify-content-center">
          <div class="col-lg-8 col-xl-6">
            <h1 class="mt-5 text-center">config.ign</h1>
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
		data-testid=download_ignition
              >
                Download
              </button>
  
              <div v-if="toCombustionScript(formData) !== undefined">
                <h1 class="mt-5 text-center">combustion script</h1>
                <hr class="divider" />
                <div class="d-grid mb-5">
                  <pre class="form-data">{{ toCombustionScript(formData) }}</pre>
  
                  <button
                    class="btn btn-primary mb-4"
		    data-testid=download_combustion
                    @click="
                      Utils.saveTemplateAsFile(
                        'script',
                        toCombustionScript(formData),
                        true // isNotJson parameter
                      )
                    "
                  >
                    Download
                  </button>
                </div>
              </div>
  
              <div>
                <hr class="divider" />
                <h2 class="mt-5 text-center">
                  Convert to Ignition-<span
                    v-if="toCombustionScript(formData) !== undefined"
                    >Combustion-</span
                  >Ready Filesystem IMG in the Browser
                </h2>
  
                <BlobEditorComponent
                  :ignJson="toIgnitionConfig(formData)"
                  :combustionScript="toCombustionScript(formData)"
                ></BlobEditorComponent>
              </div>
  
              <div>
                <h2 class="mt-5 text-center">
                  Convert to ISO Filesystem with mkisofs
                </h2>
  
                <pre class="form-data">
  Using ignition file only:
  # mkisofs -full-iso9660-filenames -o ignition.iso -V ignition -root ignition config.ign

  Using ignition and combustion configuration files:
  The files has to be stored under
   - fuel-ignition/combustion/script
   - fuel-ignition/ignition/config.ign
  # mkisofs -full-iso9660-filenames -o ignition.iso -V ignition fuel-ignition </pre>
                <p>
                  How to use the generated data with <a href="https://documentation.suse.com/sle-micro/5.2/html/SLE-Micro-all/cha-images-ignition.html" target="_blank">ignition</a> and <a href="https://documentation.suse.com/sle-micro/5.2/html/SLE-Micro-all/cha-images-combustion.html" target="_blank">combustion</a> .
                </p>
                <hr class="divider" />
	      </div>
  
              <h2 class="mt-5 text-center">Load Settings from</h2>
              <FormKit
                name="load_from"
                type="file"
  	      @change="importData"
              />
  
              <h2 class="mt-5 text-center">Save Settings to</h2>
              <FormKit
                v-model="formData.save_to"
                type="text"
                name="save_to"
              />
  
              <button
                class="btn btn-primary mt-3"
                @click="exportSettings(formData)"
              >
                Save
              </button>
  
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
