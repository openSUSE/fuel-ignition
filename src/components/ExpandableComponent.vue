<template>
  <div style="width: 100% !important" class="expandable-comp text-white">
    <h4 v-if="props.title !== undefined">{{ props.title }}</h4>

    <div v-for="n in compCount" :key="n">
      <slot></slot>
      <div class="mb-5" v-if="n < compCount">
        <hr class="divider" />
      </div>
    </div>

    <div class="mt-1">
      <button
        class="btn btn-primary mr-5 mb-5"
        @click="compCount++"
        v-if="
          maxComponents === -1 ||
          (maxComponents !== -1 && maxComponents > compCount)
        "
      >
        <!-- who needs padding, if they can just do nonbreaking spaces? :bigbrain: -->
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
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  displayAtLeastOne: {
    type: Boolean,
    default: true,
  },

  maxComponents: {
    // -1 == infinite, maybe find a more intuitive way
    type: Number,
    default: -1,
  },

  title: String,
});

const compCount = ref(props.displayAtLeastOne ? 1 : 0);
</script>
