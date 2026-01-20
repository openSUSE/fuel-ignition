<script setup>

import { ref, watch, onUpdated } from "vue";
import Utils from "@/utils/utils.js";
import ExpandableComponent from "@/components/ExpandableComponent.vue";
import BlobEditorComponent from "@/components/TemplateBlobEditorComponent.vue";

import AddUsersForm from "@/components/forms/AddUsersForm.vue";
import AddHostnameForm from "@/components/forms/AddHostnameForm.vue";
import AddLanguageForm from "@/components/forms/AddLanguageForm.vue";
import AddNetworkForm from "@/components/forms/AddNetworkForm.vue";
import ChangeStorageForm from "@/components/forms/ChangeStorageForm.vue";
import StartServiceForm from "@/components/forms/StartServiceForm.vue";
import ModifyServiceForm from "@/components/forms/ModifyServiceForm.vue";

import DebugAddBytesForm from "@/components/forms/DebugAddBytesForm.vue";
import DebugAnalyzeImgForm from "@/components/forms/DebugAnalyzeImgForm.vue";
import AddKeyboardForm from "@/components/forms/AddKeyboardForm.vue";
import AddTimezoneForm from "@/components/forms/AddTimezoneForm.vue";
import RegistrationForm from "@/components/forms/RegistrationForm.vue";
import SaltForm from "@/components/forms/SaltForm.vue";
import S390ChannelForm from "@/components/forms/S390ChannelForm.vue";
import InstallPackageForm from "@/components/forms/InstallPackageForm.vue";
import AddRepositoryForm from "@/components/forms/AddRepositoryForm.vue";
import CombAddRawBash from "../components/forms/CombAddRawBash.vue";

const formComponents = [
  AddUsersForm,
  AddHostnameForm,
  AddLanguageForm,
  ChangeStorageForm,
  AddNetworkForm,
  StartServiceForm,
  ModifyServiceForm,
  AddKeyboardForm,
  AddTimezoneForm,
  RegistrationForm,
  SaltForm,
  S390ChannelForm,
  AddRepositoryForm,
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

const toCombustionScript = (formData) => {
  let json = { combustion: "", combustion_initrd: "", combustion_initrd_and_running_system: "", output: "" };

  formComponents
    .filter((comp) => comp.methods.hasOwnProperty("encodeToInstallation"))
    .forEach((comp) => comp.methods.encodeToInstallation(json, formData));

  if (json.combustion_initrd_and_running_system != "" || json.combustion_initrd != "") {
    if (json.output == "") {
      json.output =
        "#!/bin/bash\n# combustion: network prepare\n# script generated with https://opensuse.github.io/fuel-ignition/\n\n"
    }

    if (json.combustion_initrd_and_running_system != "") {
      console.log("initrd and running system: " + json.combustion_initrd_and_running_system);
      json.output += json.combustion_initrd_and_running_system + "\n"
    }

    json.output += "if [ \"${1-}\" = \"--prepare\" ]; then\n"
    if (json.combustion_initrd != "") {
      console.log("initrd: " + json.combustion_initrd);
      json.output += json.combustion_initrd + "\n"
    }

    json.output += "  exit 0\n" +
      "fi\n"
  } else {
    json.output = "#!/bin/bash\n# combustion: network\n# script generated with https://opensuse.github.io/fuel-ignition/\n"
  }

  json.output +=
    "\n# Redirect output to the console\n" +
    "exec > >(exec tee -a /dev/tty0) 2>&1\n"

  json.combustion = ""
  json.combustion_initrd_and_running_system = ""
  json.combustion_initrd = ""
  formComponents
    .filter((comp) => comp.methods.hasOwnProperty("encodeToInstallation"))
    .forEach((comp) => comp.methods.encodeToInstallation(json, formData));

  if (json.combustion !== "") {
    console.log(json.combustion);
    json.output += json.combustion
  }

  json.output += '\n# Leave a marker\necho "Configured with combustion" > /etc/issue.d/85-combustion.conf\n';
  json.output += 'echo "Configured with combustion" > /etc/issue.d/85-combustion.issue';

  json.output += '\n\n# Close outputs and wait for tee to finish.\nexec 1>&- 2>&-; wait;';

  return json.output;
};

async function importData(event) {
  let file = event.target.files[0];

  // Load settings form file and
  // parse json from file object.
  importedData.value = await Utils.parseJsonFile(file)
    .catch((jsonErrorMsg) => {
      alert(jsonErrorMsg);
      Utils.clearFile();
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
                  <template #default="{index}">
                    <AddUsersForm :index="index"></AddUsersForm>
                  </template>
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

		<ExpandableComponent
                  title="Set Timezone"
                  :displaysAtBegin="elementNumber(AddTimezoneForm)"
		  :maxComponents="1"
                >
                  <AddTimezoneForm></AddTimezoneForm>
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
                  title="Adding Repository"
                  :displaysAtBegin="elementNumber(AddRepositoryForm)"
                >
                  <AddRepositoryForm></AddRepositoryForm>
                </ExpandableComponent>

                <ExpandableComponent
                  title="Install Additional Packages"
                  :displaysAtBegin="elementNumber(InstallPackageForm)"
                >
                  <InstallPackageForm></InstallPackageForm>
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
            <div class="d-grid mb-5">
              <div v-if="toCombustionScript(formData) !== undefined">
                <h1 class="mt-5 text-center">combustion script</h1>
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
                  Convert to Combustion-Ready Filesystem IMG in the Browser
                </h2>
  
                <BlobEditorComponent
                  :combustionScript="toCombustionScript(formData)"
                ></BlobEditorComponent>
              </div>
  
              <div>
                <h2 class="mt-5 text-center">
                  Convert to ISO Filesystem with mkisofs
                </h2>
  
                <pre class="form-data">
  Using combustion file only:
  # mkisofs -full-iso9660-filenames -o combustion.iso -V combustion -root combustion fuel-ignition/combustion/script
                </pre>
                <p>
                  How to use the generated data with <a href="https://github.com/openSUSE/combustion" target="_blank">combustion</a> .
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
