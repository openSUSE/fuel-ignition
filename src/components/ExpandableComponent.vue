<template>
  <div>
    <div v-for="n in compCount" :key="n">
      <slot></slot>
    </div>

    <button class="btn btn-success mb-5" @click="compCount++">
      Add another component
    </button>

    <button
      v-if="compCount > 1"
      class="btn btn-danger mb-5"
      @click="compCount > 1 ? compCount-- : compCount"
    >
      Remove last component
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const compCount = ref(1);
</script>
