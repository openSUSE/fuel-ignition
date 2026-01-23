<template>
  <div class="collapsible-section" :class="{ 'is-expanded': isExpanded, 'has-content': compCount > 0 }">
    <button
      type="button"
      class="section-header"
      @click="toggleExpanded"
      :aria-expanded="isExpanded"
    >
      <div class="header-content">
        <span class="section-icon">
          <svg v-if="icon === 'user'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <svg v-else-if="icon === 'server'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
          <svg v-else-if="icon === 'globe'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <svg v-else-if="icon === 'harddrive'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></svg>
          <svg v-else-if="icon === 'wifi'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
          <svg v-else-if="icon === 'cog'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg v-else-if="icon === 'package'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          <svg v-else-if="icon === 'terminal'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
          <svg v-else-if="icon === 'key'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
        </span>
        <span class="section-title">{{ title }}</span>
        <span v-if="compCount > 0" class="badge">{{ compCount }}</span>
      </div>
      <div class="header-actions">
        <button
          v-if="canAdd"
          type="button"
          class="btn-add-inline"
          @click.stop="addInstance"
          title="Add"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
        <button
          v-if="maxComponents === 1 && compCount > 0"
          type="button"
          class="btn-remove-inline"
          @click.stop="confirmRemove(0)"
          title="Remove"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <svg
          class="chevron"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </button>

    <div v-show="isExpanded" class="section-content">
      <div class="instances-grid" :class="{ 'has-multiple': compCount > 1 }">
        <div v-for="n in compCount" :key="n" class="form-instance" :class="{ 'is-collapsed': !expandedInstances[n], 'no-header': maxComponents === 1 }">
          <div v-if="maxComponents !== 1" class="instance-header" @click="toggleInstance(n)">
            <span class="instance-title">{{ singularTitle || title }} {{ compCount > 1 ? '#' + n : '' }}</span>
            <div class="instance-actions">
              <button
                type="button"
                class="btn-remove-instance"
                @click.stop="confirmRemove(n - 1)"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <svg
                class="instance-chevron"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
          <div v-show="maxComponents === 1 || expandedInstances[n]" class="instance-content">
            <slot :index="n"></slot>
          </div>
        </div>
      </div>

      <div class="section-actions">
        <button
          v-if="canAdd"
          type="button"
          class="btn-add"
          @click="addInstance"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          {{ compCount > 0 ? 'Add another' : 'Add' }} {{ singularTitle || title }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, inject } from "vue";

const props = defineProps({
  displaysAtBegin: {
    type: Number,
    default: 0,
  },
  maxComponents: {
    type: Number,
    default: -1,
  },
  title: String,
  singularTitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'edit'
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  }
});

const compCount = ref(props.displaysAtBegin);
const isExpanded = ref(props.defaultExpanded || props.displaysAtBegin > 0);
const expandedInstances = reactive({});
const skipDeleteConfirm = inject('skipDeleteConfirm', ref(false));

// initialize expanded state for existing instances
for (let i = 1; i <= props.displaysAtBegin; i++) {
  expandedInstances[i] = true;
}

const canAdd = computed(() => {
  return props.maxComponents === -1 || props.maxComponents > compCount.value;
});

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const toggleInstance = (n) => {
  expandedInstances[n] = !expandedInstances[n];
};

const addInstance = () => {
  compCount.value++;
  expandedInstances[compCount.value] = true;
  if (!isExpanded.value) {
    isExpanded.value = true;
  }
};

const confirmRemove = (index) => {
  if (skipDeleteConfirm.value || confirm('Remove this item?\n\n(You can disable these prompts at the bottom of the page)')) {
    removeAt(index);
  }
};

const removeAt = (index) => {
  if (compCount.value > 0) {
    compCount.value--;
  }
};
</script>

<style scoped>
.collapsible-section {
  margin-bottom: 4px;
}

.collapsible-section.has-content .section-header {
  color: #81c13b;
}

.section-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: color 0.2s ease;
}


.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.6;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #81c13b;
  color: #000;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #81c13b;
  cursor: pointer;
}

.btn-add-inline svg {
  width: 18px;
  height: 18px;
}

.btn-remove-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #ef4444;
  cursor: pointer;
  opacity: 0.8;
}

.chevron {
  color: rgba(255, 255, 255, 0.3);
  transition: transform 0.2s ease;
}

.is-expanded .chevron {
  transform: rotate(180deg);
}

.section-content {
  padding: 12px 0 16px;
}

.instances-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.instances-grid.has-multiple {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  align-items: start;
}

@media (max-width: 480px) {
  .instances-grid.has-multiple {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.form-instance {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.form-instance.no-header {
  border: none;
}

.form-instance.no-header .instance-content {
  padding: 0;
}


.instance-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: background 0.2s ease;
}


.is-collapsed .instance-header {
  border-bottom: none;
}

.instance-title {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.instance-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-remove-instance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #ef4444;
  cursor: pointer;
  opacity: 0.8;
}


.instance-chevron {
  color: rgba(255, 255, 255, 0.3);
  transition: transform 0.2s ease;
}

.is-collapsed .instance-chevron {
  transform: rotate(-90deg);
}

.instance-content {
  padding: 12px;
}


.section-actions {
  margin-top: 16px;
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 14px 16px;
  background: transparent;
  border: 1px dashed rgba(129, 193, 59, 0.4);
  border-radius: 6px;
  color: #81c13b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

</style>
