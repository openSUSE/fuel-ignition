<template>
  <div style="width: 100% !important" class="text-white">
    <h4 class="" v-if="props.title !== undefined">{{ props.title }}</h4>

    <div v-for="n in compCount" :key="n">
      <slot></slot>
      <div class="mb-5" v-if="n < compCount">
        <hr class="divider" />
      </div>
    </div>
    <button class="btn btn-primary mr-5 mb-5" @click="compCount++">
      <!-- who wants padding, if they can just do nonbreaking spaces? :bigbrain: -->
      &nbsp;&nbsp;&nbsp;Add&nbsp;&nbsp;&nbsp;
    </button>

    <button
      v-if="compCount > 1 || (!props.displayAtLeastOne && compCount > 0)"
      class="btn btn-danger ml-5 mr-5 mb-5"
      @click="
        compCount > 1 || !props.displayAtLeastOne ? compCount-- : compCount
      "
    >
      Remove
    </button>
  </div>
</template>

<style scoped>
hr {
  border: none;
  max-height: 0.1px;
}
</style>

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
