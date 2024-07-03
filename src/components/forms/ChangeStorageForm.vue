<template>
  <FormKit
    :name="formKey('task')"
    label="Task"
    type="select"
    v-model="task"
    :options="[
      'Growing the root partition',
      'Creating a swap partition, if missed',
      'Indiviual storage changes'
    ]"
    validation="required"
    validation-visibility="live"
    help="Changing already created storage."
  />

  <div v-if="task === 'Growing the root partition'">
    <FormKit
      :name="formKey('root_full_size')"
      label="to the full disk size"
      type="checkbox"
      v-model="root_full_size"
      help= " "
    />

    <div v-if="root_full_size === false">
      <div class="container-fluid">
      <div class="row">
      <div class="col-1"></div>
      <div class="col-12">
      <FormKit
        type="number"
        :name="formKey('min_root')"
        value=0
        validation="required"	
        validation-behavior="live"
        label="Minimum required disk space (MByte)"
        help="Keep it 0 if it is not required."
      />
      <FormKit
        type="number"
        :name="formKey('max_root')"
        value=0
        validation="required"
        validation-behavior="live"
        label="Maximum required disk space (MByte)"
        help="Keep it 0 if it is not required."
      />
      </div>
      </div>
      </div>
    </div>
  </div>

  <div v-if="task === 'Creating a swap partition, if missed'">
    <FormKit
      :name="formKey('swap_full_size')"
      label="take all available disk space"
      type="checkbox"
      v-model="swap_full_size"
      help= " "      
    />

    <div v-if="swap_full_size === false">
      <div class="container-fluid">
      <div class="row">
      <div class="col-1"></div>
      <div class="col-12">
      <FormKit
        type="number"
        :name="formKey('min_swap')"
        value=0
        validation="required"	
        validation-behavior="live"
        label="Minimum required disk space (MByte)"
        help="Keep it 0 if it is not required."
      />
      <FormKit
        type="number"
        :name="formKey('max_swap')"
        value=0
        validation="required"
        validation-behavior="live"
        label="Maximum required disk space (MByte)"
        help="Keep it 0 if it is not required."
      />
      </div>
      </div>
      </div>      
    </div>
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";
import { ref } from "vue";
const formPrefix = "change_storage";

export default {
  setup: () => {
    const uid = Utils.uid();
    const task = ref('Growing the root partition');
    const root_full_size = ref(true);
    const swap_full_size = ref(true);

    return {
      task,
      root_full_size,
      swap_full_size,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToInstallation: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);


      const keyPrefix = formPrefix + "_task_";
      let counter = 0;
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.storage === undefined) {
            json.storage = {};
          }

          if (json.storage.files === undefined) {
            json.storage.files = [];
          }

          let filename = "/usr/lib/repart.d/"
          let content = "data:,"
          const task = formValue("task", id)
          if (task === 'Growing the root partition') {
            filename = filename.concat(counter+10, "-root.conf")
            content = content.concat( "[Partition]\n",
              		              "Type=root\n")
            const min = formValue("min_root", id)
	    const max = formValue("max_root", id)
	    const auto = formValue("root_full_size", id)
            if (min > 0 && !auto) {
	      content = content.concat("SizeMinBytes=", min, "M\n")
	    }
            if (max > 0 && !auto) {
	      content = content.concat("SizeMaxBytes=", max, "M\n")
	    }
          }

          json.storage.files.push(
            {
              path: filename,
              mode: 384,
              overwrite: true,
              contents: { 
                source: content
              },
            }
          );

	  counter++
        }
      );
    },
    encodeToExport: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const keyPrefix = formPrefix + "_task_";
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {

          if (json.storage === undefined) {
            json.storage = {};
          }

          if (json.storage.tasks === undefined) {
            json.storage.tasks = [];
          }

          const task = {}
	  task.kind = formValue("task", id)
	  if (task.kind === 'Growing the root partition') {
            const min = formValue("min_root", id)
	    const max = formValue("max_root", id)
	    const auto = formValue("root_full_size", id)
	    task.auto = auto
            if (min > 0 && !auto) {
	      task.min = min
	    }
            if (max > 0 && !auto) {
	      task.max = max
	    }	    	     	  
	  }
          json.storage.tasks.push(task)
        }
      );
    },

    fillImport: function (json, formData) {
      const setValue = (key, uid, value) =>
        Utils.setFormValue(formPrefix, formData, key, uid, value);
      const keyPrefix = formPrefix + "_task_";

      if (json.storage == undefined || json.storage.tasks == undefined) return;
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
	  let task = json.storage.tasks.shift();
	  if (task.kind != undefined) {
	    setValue("task", id, task.kind);
	  }
	  if (task.kind === 'Growing the root partition') {	  
  	    if (task.auto != undefined) {
	      setValue("root_full_size", id, task.auto);
	    }
	    if (!task.auto) {
 	      if (task.min != undefined) {
	        setValue("min_root", id, task.min);
	      }
 	      if (task.min != undefined) {
	        setValue("max_root", id, task.max);
	      }
	    }
          }
        });
    },
    countImport: function (json) {
      if (json.storage != undefined && json.storage.tasks != undefined) {
        return json.storage.tasks.length;
      } else {
        return 0;
      }
    },
  },
};
</script>
