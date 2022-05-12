<script setup>
import { ref, watch } from "vue";
import Utils from "@/utils/utils.js";
import ExpandableComponent from "@/components/ExpandableComponent.vue";

import IgnitionUsersForm from "@/components/forms/IgnitionUsersForm.vue";
import CreateFileForm from "@/components/forms/CreateFileForm.vue";
import StartServiceForm from "@/components/forms/StartServiceForm.vue";

const formComponents = [IgnitionUsersForm, CreateFileForm, StartServiceForm];

const formData = ref({ debug: false });

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

<template>
  <section class="page-section p-2 bg-dark" id="contact">
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
                <IgnitionUsersForm></IgnitionUsersForm>
              </ExpandableComponent>

              <ExpandableComponent
                title="Create Files on the Root Filesystem"
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

            <FormKit
              v-model="formData.debug"
              type="checkbox"
              label="Debug"
              name="debug"
            />

            <button class="btn btn-primary mb-4" @click="downloadConfigIgn">
              Download
            </button>

            <h2 class="mt-5">Convert to ISO</h2>

            <pre class="form-data">
# mkisofs -o ignition.iso -V ignition config.ign</pre
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
