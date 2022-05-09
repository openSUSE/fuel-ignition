<template>
  <div class="container-fluid">
    <div class="justify-content-center mx-auto center">
      <h1>Ignition Config Generator</h1>

      <FormKit type="group" v-model="formData">
        <ExpandableComponent title="OS Users" :displayAtLeastOne="false">
          <IgnitionUsersForm></IgnitionUsersForm>
        </ExpandableComponent>

        <ExpandableComponent
          title="Create Files on the Root Filesystem"
          :displayAtLeastOne="false"
        >
          <CreateFileForm></CreateFileForm>
        </ExpandableComponent>


        <FormKit
          name="likes_microOS"
          label="Opinion"
          help="How excited are you about MicroOS?"
          type="radio"
          value="A lot"
          :options="['A little', 'A lot']"
        />
      </FormKit>

      <section>
        <h2>config.ign</h2>
        <pre class="form-data">{{ toIgnitionConfig(formData) }}</pre>

        <button class="btn btn-primary mb-4" @click="downloadConfigIgn">
          Download
        </button>

        <FormKit
          v-model="formData.debug"
          type="checkbox"
          label="Debug"
          name="debug"
        />
      </section>

      <h2 class="mt-4">Convert to ISO</h2>

      <pre class="form-data">
# mkisofs -o ignition.iso -V ignition config.ign</pre
      >
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import Utils from "./utils/utils.js";
import ExpandableComponent from "./components/ExpandableComponent.vue";
import IgnitionUsersForm from "./components/forms/IgnitionUsersForm.vue";
import CreateFileForm from "./components/forms/CreateFileForm.vue";
import ServicesForm from "./components/forms/AddServiceForm.vue";

const formComponents = [IgnitionUsersForm, CreateFileForm, ServicesForm];

const formData = ref({ debug: true });

// setup optional Watchers if a FormComponent needs it
formComponents.forEach((comp) =>
  Utils.setupFormComponentWatcher(comp, watch, formData)
);

const downloadConfigIgn = () => {
  Utils.saveTemplateAsFile("config.ign", toIgnitionConfig(formData));
};

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
