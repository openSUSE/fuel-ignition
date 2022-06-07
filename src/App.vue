<script setup>
import { ref, watch } from "vue";
import Utils from "./utils/utils.js";
import Navigation from "./components/sections/NavSection.vue";
import About from "./components/sections/AboutSection.vue";
</script>

<template>
  <Navigation> </Navigation>

  <router-view></router-view>

  <About></About>

  <!-- Footer-->
  <footer class="bg-light py-5">
    <div class="container px-4 px-lg-5">
      <div class="small text-center text-muted">
        Copyright &copy; {{ new Date().getFullYear() }} – built with 💚, Vue,
        and openSUSE
      </div>
    </div>
  </footer>
</template>
