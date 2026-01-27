<script setup>
import { ref, watch } from "vue";
import Utils from "./utils/utils.js";
import Navigation from "./components/sections/NavSection.vue";
</script>

<template>
  <Navigation> </Navigation>

  <router-view></router-view>

  <!-- Footer-->
  <footer class="bg-primary py-5">
    <div class="container px-5 px-lg-1">
      <div class="small text-left text-muted">
        Copyright &copy; {{ new Date().getFullYear() }} – built with 💚, Vue,
        and openSUSE
      </div>
    </div>
  </footer>
</template>
