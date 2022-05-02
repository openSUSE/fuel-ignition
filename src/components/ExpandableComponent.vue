<template>
  <div>
    <h4 v-if="props.title !== undefined">{{ props.title }}</h4>

    <div v-for="n in compCount" :key="n">
      <slot></slot>
      <div class="mb-5" v-if="n < compCount"></div>
    </div>

    <button class="btn btn-success mb-5 mr-1" @click="compCount++">Add</button>

    <button
      v-if="compCount > 1 || (!props.displayAtLeastOne && compCount > 0)"
      class="btn btn-danger mb-5"
      @click="
        compCount > 1 || !props.displayAtLeastOne ? compCount-- : compCount
      "
    >
      Remove
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  displayAtLeastOne: {
    type: Boolean,
    default: true,
  },

  title: String,
});

const compCount = ref(0);
</script>
