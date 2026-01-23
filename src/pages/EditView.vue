<script setup>
import { ref, watch, onUpdated, onMounted, onUnmounted, computed, provide } from "vue";
import Utils from "@/utils/utils.js";
import CollapsibleSection from "@/components/CollapsibleSection.vue";
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
import CombAddRawBash from "@/components/forms/CombAddRawBash.vue";

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
const importedData = ref({});
const showCopyNotification = ref(false);
const skipDeleteConfirm = ref(false);

provide('skipDeleteConfirm', skipDeleteConfirm);

formComponents.forEach((comp) =>
  Utils.setupFormComponentWatcher(comp, watch, formData)
);

let componentKey = ref(0);
const forceRerender = () => {
  componentKey.value += 1;
};

const elementNumber = (section) => {
  if (section.methods.hasOwnProperty("countImport")) {
    return section.methods.countImport(importedData.value);
  } else {
    return 0;
  }
};

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
        "#!/bin/bash\n# combustion: network prepare\n# script generated with https://opensuse.github.io/fuel-ignition/\n\n";
    }

    if (json.combustion_initrd_and_running_system != "") {
      json.output += json.combustion_initrd_and_running_system + "\n";
    }

    json.output += "if [ \"${1-}\" = \"--prepare\" ]; then\n";
    if (json.combustion_initrd != "") {
      json.output += json.combustion_initrd + "\n";
    }

    json.output += "  exit 0\n" + "fi\n";
  } else {
    json.output = "#!/bin/bash\n# combustion: network\n# script generated with https://opensuse.github.io/fuel-ignition/\n";
  }

  json.output +=
    "\n# Redirect output to the console\n" +
    "exec > >(exec tee -a /dev/tty0) 2>&1\n";

  json.combustion = "";
  json.combustion_initrd_and_running_system = "";
  json.combustion_initrd = "";
  formComponents
    .filter((comp) => comp.methods.hasOwnProperty("encodeToInstallation"))
    .forEach((comp) => comp.methods.encodeToInstallation(json, formData));

  if (json.combustion !== "") {
    json.output += json.combustion;
  }

  json.output += '\n# Leave a marker\necho "Configured with combustion" > /etc/issue.d/85-combustion.conf\n';
  json.output += 'echo "Configured with combustion" > /etc/issue.d/85-combustion.issue';

  json.output += '\n\n# Close outputs and wait for tee to finish.\nexec 1>&- 2>&-; wait;';

  return json.output;
};

const combustionScript = computed(() => toCombustionScript(formData.value));

async function importData(event) {
  let file = event.target.files[0];

  importedData.value = await Utils.parseJsonFile(file).catch((jsonErrorMsg) => {
    alert(jsonErrorMsg);
    Utils.clearFile();
  });
  formData.value = { debug: formData.value.debug, save_to: formData.value.save_to };
  forceRerender();
}

const exportSettings = (formData) => {
  let json = {};

  formComponents
    .filter((comp) => comp.methods.hasOwnProperty("encodeToExport"))
    .forEach((comp) => comp.methods.encodeToExport(json, formData));

  Utils.saveTemplateAsFile(formData.save_to, json, false);
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(combustionScript.value);
    showCopyNotification.value = true;
    setTimeout(() => {
      showCopyNotification.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const downloadScript = () => {
  Utils.saveTemplateAsFile('script', combustionScript.value, true);
};

const formsPanel = ref(null);

const scrollToTop = () => {
  // on mobile, window scrolls; on desktop, forms panel scrolls
  if (window.innerWidth <= 1200) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (formsPanel.value) {
    formsPanel.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const scrollToBottom = () => {
  // on mobile, scroll to output panel; on desktop, scroll forms panel to bottom
  if (window.innerWidth <= 1200) {
    const outputPanel = document.querySelector('.output-panel');
    if (outputPanel) {
      outputPanel.scrollIntoView({ behavior: 'smooth' });
    }
  } else if (formsPanel.value) {
    formsPanel.value.scrollTo({ top: formsPanel.value.scrollHeight, behavior: 'smooth' });
  }
};

const handleFormsScroll = (e) => {
  const navbar = document.querySelector('#mainNav');
  if (!navbar) return;

  if (e.target.scrollTop > 0) {
    navbar.classList.add('navbar-shrink');
  } else {
    navbar.classList.remove('navbar-shrink');
  }
};

onMounted(() => {
  if (formsPanel.value) {
    formsPanel.value.addEventListener('scroll', handleFormsScroll);
  }
});

onUnmounted(() => {
  if (formsPanel.value) {
    formsPanel.value.removeEventListener('scroll', handleFormsScroll);
  }
  // reset navbar state when leaving
  const navbar = document.querySelector('#mainNav');
  if (navbar) {
    navbar.classList.remove('navbar-shrink');
  }
});
</script>

<template>
  <div :key="componentKey" class="edit-page">
    <div class="edit-layout">
      <!-- left panel: forms -->
      <div class="forms-panel" ref="formsPanel">
        <div class="panel-header">
          <h1>Config Generator</h1>
          <p class="subtitle">Build your combustion configuration</p>
        </div>

        <FormKit type="group" v-model="formData">
          <!-- system section -->
          <div class="form-category">
            <h3 class="category-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
              System
            </h3>

            <CollapsibleSection
              title="Users"
              singularTitle="User"
              icon="user"
              :displaysAtBegin="elementNumber(AddUsersForm)"
            >
              <template #default="{ index }">
                <AddUsersForm :index="index"></AddUsersForm>
              </template>
            </CollapsibleSection>

            <CollapsibleSection
              title="Hostname"
              singularTitle="Hostname"
              icon="server"
              :displaysAtBegin="elementNumber(AddHostnameForm)"
              :maxComponents="1"
            >
              <AddHostnameForm></AddHostnameForm>
            </CollapsibleSection>
          </div>

          <!-- localization section -->
          <div class="form-category">
            <h3 class="category-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              Localization
            </h3>

            <CollapsibleSection
              title="Language"
              singularTitle="Language"
              icon="globe"
              :displaysAtBegin="elementNumber(AddLanguageForm)"
              :maxComponents="1"
            >
              <AddLanguageForm></AddLanguageForm>
            </CollapsibleSection>

            <CollapsibleSection
              title="Keyboard"
              singularTitle="Keyboard"
              icon="edit"
              :displaysAtBegin="elementNumber(AddKeyboardForm)"
              :maxComponents="1"
            >
              <AddKeyboardForm></AddKeyboardForm>
            </CollapsibleSection>

            <CollapsibleSection
              title="Timezone"
              singularTitle="Timezone"
              icon="globe"
              :displaysAtBegin="elementNumber(AddTimezoneForm)"
              :maxComponents="1"
            >
              <AddTimezoneForm></AddTimezoneForm>
            </CollapsibleSection>
          </div>

          <!-- storage section -->
          <div class="form-category">
            <h3 class="category-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></svg>
              Storage
            </h3>

            <CollapsibleSection
              title="Storage Configuration"
              singularTitle="Storage Task"
              icon="harddrive"
              :displaysAtBegin="elementNumber(ChangeStorageForm)"
            >
              <ChangeStorageForm></ChangeStorageForm>
            </CollapsibleSection>
          </div>

          <!-- network section -->
          <div class="form-category">
            <h3 class="category-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
              Network
            </h3>

            <CollapsibleSection
              title="Network Interfaces"
              singularTitle="Interface"
              icon="wifi"
              :displaysAtBegin="elementNumber(AddNetworkForm)"
            >
              <AddNetworkForm></AddNetworkForm>
            </CollapsibleSection>
          </div>

          <!-- services section -->
          <div class="form-category">
            <h3 class="category-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Services
            </h3>

            <CollapsibleSection
              title="Enable or Create Services"
              singularTitle="Service"
              icon="cog"
              :displaysAtBegin="elementNumber(StartServiceForm)"
            >
              <StartServiceForm></StartServiceForm>
            </CollapsibleSection>

            <CollapsibleSection
              title="Modify Existing Services"
              singularTitle="Service Modification"
              icon="cog"
              :displaysAtBegin="elementNumber(ModifyServiceForm)"
            >
              <ModifyServiceForm></ModifyServiceForm>
            </CollapsibleSection>
          </div>

          <!-- registration section -->
          <div class="form-category">
            <h3 class="category-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              Registration & Integration
            </h3>

            <CollapsibleSection
              title="Product Registration"
              singularTitle="Registration"
              icon="key"
              :displaysAtBegin="elementNumber(RegistrationForm)"
            >
              <RegistrationForm></RegistrationForm>
            </CollapsibleSection>

            <CollapsibleSection
              title="Salt Master Connection"
              singularTitle="Salt Configuration"
              icon="server"
              :displaysAtBegin="elementNumber(SaltForm)"
              :maxComponents="1"
            >
              <SaltForm></SaltForm>
            </CollapsibleSection>

            <CollapsibleSection
              title="S390 Channels"
              singularTitle="S390 Channel"
              icon="server"
              :displaysAtBegin="elementNumber(S390ChannelForm)"
            >
              <S390ChannelForm></S390ChannelForm>
            </CollapsibleSection>
          </div>

          <!-- packages section -->
          <div class="form-category">
            <h3 class="category-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              Packages & Repositories
            </h3>

            <CollapsibleSection
              title="Repositories"
              singularTitle="Repository"
              icon="package"
              :displaysAtBegin="elementNumber(AddRepositoryForm)"
            >
              <AddRepositoryForm></AddRepositoryForm>
            </CollapsibleSection>

            <CollapsibleSection
              title="Additional Packages"
              singularTitle="Package"
              icon="package"
              :displaysAtBegin="elementNumber(InstallPackageForm)"
            >
              <InstallPackageForm></InstallPackageForm>
            </CollapsibleSection>
          </div>

          <!-- advanced section -->
          <div class="form-category">
            <h3 class="category-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
              Advanced
            </h3>

            <CollapsibleSection
              title="Custom Bash Script"
              singularTitle="Script Block"
              icon="terminal"
              :displaysAtBegin="elementNumber(CombAddRawBash)"
            >
              <CombAddRawBash></CombAddRawBash>
            </CollapsibleSection>
          </div>

          <!-- debug section -->
          <div v-if="formData.debug" class="form-category">
            <h3 class="category-title debug-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>
              Debug
            </h3>

            <CollapsibleSection
              title="Add Bytes"
              singularTitle="Bytes"
              icon="edit"
              :displaysAtBegin="elementNumber(DebugAddBytesForm)"
            >
              <DebugAddBytesForm></DebugAddBytesForm>
            </CollapsibleSection>

            <CollapsibleSection
              title="Analyze File"
              singularTitle="File"
              icon="edit"
              :displaysAtBegin="1"
              :maxComponents="1"
            >
              <DebugAnalyzeImgForm></DebugAnalyzeImgForm>
            </CollapsibleSection>
          </div>
        </FormKit>

        <!-- settings footer -->
        <div class="settings-section">
          <h3 class="category-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg>
            Import / Export Settings
          </h3>

          <div class="settings-grid">
            <div class="settings-card">
              <label class="settings-label">Load Settings</label>
              <FormKit
                name="load_from"
                type="file"
                @change="importData"
              />
            </div>

            <div class="settings-card">
              <label class="settings-label">Save Settings As</label>
              <div class="save-row">
                <FormKit
                  v-model="formData.save_to"
                  type="text"
                  name="save_to"
                />
                <button
                  type="button"
                  class="btn-save"
                  @click="exportSettings(formData)"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div class="debug-toggle">
            <label class="toggle-label">
              <input
                type="checkbox"
                v-model="formData.debug"
              />
              <span>Enable Debug Mode</span>
            </label>
            <label class="toggle-label">
              <input
                type="checkbox"
                v-model="skipDeleteConfirm"
              />
              <span>Don't ask when deleting</span>
            </label>
          </div>
        </div>
      </div>

      <!-- right panel: output -->
      <div class="output-panel">
        <div class="output-sticky">
          <div class="output-header">
            <h2>Generated Output</h2>
            </div>

          <div class="output-content">
            <div class="script-actions">
              <button type="button" class="btn-action" @click="copyToClipboard">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Copy
              </button>
              <button type="button" class="btn-action" @click="downloadScript" data-testid="download_combustion">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download
              </button>
              <span title="Generate a ready-to-use .img file that can be written to USB">
                <BlobEditorComponent :combustionScript="combustionScript"></BlobEditorComponent>
              </span>
            </div>
            <pre class="script-preview">{{ combustionScript }}</pre>

            <div class="iso-info">
              <h4>Create ISO with mkisofs</h4>
              <pre class="code-block">mkisofs -full-iso9660-filenames -o combustion.iso -V combustion -root combustion fuel-ignition/combustion/script</pre>
              <p class="help-text">
                Learn more about <a href="https://github.com/openSUSE/combustion" target="_blank" rel="noopener">combustion</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- copy notification -->
    <Transition name="fade">
      <div v-if="showCopyNotification" class="copy-notification">
        Copied to clipboard
      </div>
    </Transition>

    <!-- mobile nav buttons -->
    <div class="mobile-nav">
      <button type="button" class="nav-btn" @click="scrollToTop" title="Go to top">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>
      <button type="button" class="nav-btn" @click="scrollToBottom" title="Go to output">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
  </div>
</template>

<style>
/* navbar styling for v2 */
@media (min-width: 1201px) {
  /* solid dark background */
  body:has(.edit-page) #mainNav {
    background: #1a1d21 !important;
  }

  body:has(.edit-page) #mainNav .navbar-brand {
    color: rgba(255, 255, 255, 0.85) !important;
  }

  body:has(.edit-page) #mainNav .navbar-brand:hover {
    color: #fff !important;
  }

  body:has(.edit-page) #mainNav .nav-link {
    color: rgba(255, 255, 255, 0.6) !important;
  }

  body:has(.edit-page) #mainNav .nav-link:hover {
    color: #fff !important;
  }

  /* after scroll - keep same, no effects */
  body:has(.edit-page) #mainNav.navbar-shrink {
    background: #1a1d21 !important;
    box-shadow: none !important;
  }

  body:has(.edit-page) #mainNav.navbar-shrink .navbar-brand {
    color: rgba(255, 255, 255, 0.9) !important;
  }

  body:has(.edit-page) #mainNav.navbar-shrink .navbar-brand:hover {
    color: #81c13b !important;
  }

  body:has(.edit-page) #mainNav.navbar-shrink .nav-link {
    color: rgba(255, 255, 255, 0.7) !important;
  }

  body:has(.edit-page) #mainNav.navbar-shrink .nav-link:hover {
    color: #81c13b !important;
  }
}
</style>

<style scoped>
.edit-page {
  height: 100vh;
  padding-top: 72px;
  background: #212529;
  overflow: hidden;
  box-sizing: border-box;
}

.edit-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  max-width: 1800px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
}

@media (max-width: 1200px) {
  .edit-page {
    height: auto;
    min-height: 100vh;
    padding-top: 0;
    overflow: visible;
  }

  .edit-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
}

/* forms panel */
.forms-panel {
  padding: 40px 48px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 0;
  box-sizing: border-box;
  overflow-y: auto;
  height: 100%;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.forms-panel::-webkit-scrollbar {
  width: 8px;
}

.forms-panel::-webkit-scrollbar-track {
  background: transparent;
}

.forms-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.forms-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 1200px) {
  .forms-panel {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow-y: visible;
    height: auto;
    padding-top: 100px;
  }
}

@media (max-width: 768px) {
  .forms-panel {
    padding: 100px 24px 24px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .forms-panel {
    padding: 88px 16px 16px;
  }
}

.panel-header {
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .panel-header {
    margin-bottom: 24px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .panel-header {
    margin-bottom: 20px;
  }
}

.panel-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px;
}

@media (max-width: 480px) {
  .panel-header h1 {
    font-size: 1.25rem;
  }
}

.subtitle {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  margin: 0;
}

/* form categories */
.form-category {
  margin-bottom: 24px;
}

.form-category:last-of-type {
  margin-bottom: 0;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
}

.category-title svg {
  width: 14px;
  height: 14px;
  opacity: 0.5;
}

.debug-title {
  color: rgba(239, 68, 68, 0.5);
}

/* settings section */
.settings-section {
  margin-top: 16px;
  padding-top: 0;
}

.settings-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.settings-card {
  flex: 1;
  min-width: 200px;
}

@media (max-width: 480px) {
  .settings-grid {
    flex-direction: column;
    gap: 12px;
  }

  .settings-card {
    width: 100%;
    min-width: 0;
  }
}

.settings-card :deep(.formkit-outer) {
  margin: 0;
}

.settings-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
}

.save-row {
  display: flex;
  gap: 10px;
}

@media (max-width: 480px) {
  .save-row {
    flex-direction: column;
    gap: 8px;
  }
}

.save-row :deep(.formkit-outer) {
  flex: 1;
  margin: 0;
}

.btn-save {
  padding: 10px 20px;
  background: #81c13b;
  border: none;
  border-radius: 6px;
  color: #000;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
}


.debug-toggle {
  margin-top: 12px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.toggle-label input {
  width: 14px;
  height: 14px;
  accent-color: #81c13b;
}

/* output panel */
.output-panel {
  background: #1a1d21;
  min-width: 0;
  box-sizing: border-box;
}

.output-sticky {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 1200px) {
  .output-sticky {
    height: auto;
    min-height: 500px;
  }
}

@media (max-width: 480px) {
  .output-sticky {
    min-height: 400px;
  }
}

.output-header {
  padding: 40px 24px 16px;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .output-header {
    padding: 16px 12px 12px;
  }
}

.output-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 12px;
}

.output-content {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.output-content::-webkit-scrollbar {
  width: 8px;
}

.output-content::-webkit-scrollbar-track {
  background: transparent;
}

.output-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.output-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 480px) {
  .output-content {
    padding: 12px;
  }
}

/* script view */
.script-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.script-preview {
  background: #000;
  border: none;
  border-radius: 6px;
  padding: 16px;
  color: #81c13b;
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  max-height: calc(100vh - 420px);
  scrollbar-width: thin;
  scrollbar-color: rgba(129, 193, 59, 0.3) transparent;
}

.script-preview::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.script-preview::-webkit-scrollbar-track {
  background: transparent;
}

.script-preview::-webkit-scrollbar-thumb {
  background: rgba(129, 193, 59, 0.3);
  border-radius: 3px;
}

.script-preview::-webkit-scrollbar-thumb:hover {
  background: rgba(129, 193, 59, 0.5);
}

@media (max-width: 480px) {
  .script-preview {
    padding: 12px;
    font-size: 11px;
    max-height: 300px;
  }
}

/* blob editor inline */
.script-actions :deep(.btn-primary) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 6px;
  color: #fff !important;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 0 !important;
  width: auto !important;
}

.script-actions :deep(.sk-folding-cube) {
  margin: 0 8px;
  width: 20px;
  height: 20px;
}

.script-actions :deep(.btn-primary) {
  font-size: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.script-actions :deep(.btn-primary)::before {
  content: "";
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cline x1='22' x2='2' y1='12' y2='12'/%3e%3cpath d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'/%3e%3cline x1='6' x2='6.01' y1='16' y2='16'/%3e%3cline x1='10' x2='10.01' y1='16' y2='16'/%3e%3c/svg%3e");
  background-size: contain;
  background-repeat: no-repeat;
}

.script-actions :deep(.btn-primary)::after {
  content: "Download combustion ready .img";
  font-size: 13px;
}

.iso-info {
  margin-top: 20px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.iso-info h4 {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 10px;
}

.code-block {
  background: #000;
  border-radius: 4px;
  padding: 10px 12px;
  color: #81c13b;
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 11px;
  overflow-x: auto;
  margin: 0 0 10px;
}

.help-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.help-text a {
  color: #81c13b;
  text-decoration: none;
}

.help-text a:hover {
  text-decoration: underline;
}

/* copy notification */
.copy-notification {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: #81c13b;
  color: #000;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  z-index: 1000;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* formkit overrides */
:deep(.formkit-outer) {
  margin-bottom: 16px;
}

:deep(.formkit-label) {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

:deep(.formkit-input:not([type="checkbox"])) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 6px !important;
  color: #fff !important;
  padding: 10px 14px !important;
  font-size: 14px !important;
  transition: border-color 0.2s ease !important;
}

:deep(.formkit-input:not([type="checkbox"]):focus) {
  border-color: #81c13b !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.formkit-input:not([type="checkbox"])::placeholder) {
  color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.formkit-help) {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  margin-top: 6px;
}

:deep(.formkit-message) {
  font-size: 13px;
}

:deep(select.formkit-input) {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
  background-position: right 12px center !important;
  background-repeat: no-repeat !important;
  background-size: 16px !important;
  padding-right: 40px !important;
}

:deep([data-type="checkbox"]) {
  margin-bottom: 8px;
}

:deep([data-type="checkbox"] .formkit-wrapper) {
  display: flex;
  align-items: baseline;
}

:deep([data-type="checkbox"] .formkit-input[type="checkbox"]) {
  margin: 0 8px 0 0;
  accent-color: #81c13b;
  cursor: pointer;
  flex-shrink: 0;
  transform: scale(0.85);
}

:deep([data-type="checkbox"] .formkit-label) {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

:deep([data-type="file"] .formkit-input) {
  padding: 8px !important;
}

:deep([data-type="file"] .formkit-input::file-selector-button) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  padding: 6px 12px;
  margin-right: 10px;
  cursor: pointer;
}

/* scroll nav */
.mobile-nav {
  display: flex;
  position: fixed;
  left: calc(50% - 44px);
  bottom: 16px;
  flex-direction: column;
  gap: 4px;
  z-index: 100;
}

@media (max-width: 1200px) {
  .mobile-nav {
    left: auto;
    right: 12px;
    bottom: 24px;
  }
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(33, 37, 41, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn svg {
  width: 14px;
  height: 14px;
}

.nav-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.3);
}

.nav-btn:active {
  background: rgba(129, 193, 59, 0.2);
  border-color: #81c13b;
}

@media (max-width: 1200px) {
  .nav-btn {
    width: 44px;
    height: 44px;
    backdrop-filter: blur(8px);
  }

  .nav-btn svg {
    width: 20px;
    height: 20px;
  }
}
</style>
