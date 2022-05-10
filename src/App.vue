<script setup>
import { ref, watch } from "vue";
import Utils from "./utils/utils.js";
import ExpandableComponent from "./components/ExpandableComponent.vue";

import IgnitionUsersForm from "./components/forms/IgnitionUsersForm.vue";
import CreateFileForm from "./components/forms/CreateFileForm.vue";
import ServicesForm from "./components/forms/AddServiceForm.vue";

import Navigation from "./components/sections/NavSection.vue";
import About from "./components/sections/AboutSection.vue";

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

<template>
  <Navigation> </Navigation>

  <router-view></router-view>

  <HomeView></HomeView>

  <About></About>

  <!-- Footer-->
  <footer class="bg-light py-5">
    <div class="container px-4 px-lg-5">
      <div class="small text-center text-muted">
        Copyright &copy; 2021 - built with 💚, Vue, and openSUSE
      </div>
    </div>
  </footer>
</template>
