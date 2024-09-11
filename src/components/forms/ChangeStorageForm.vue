<template>
  <FormKit
    :name="formKey('task')"
    label="Task"
    type="select"
    v-model="task"
    :options="[
      'Grow root partition',
      'Create swap partition if missing',
      'Encrypt disk',
      'Apply custom storage changes'
    ]"
    validation="required"
    validation-visibility="live"
    help="Change/encrypt storage volumes; requires systemd >= 255."
  />

  <div v-if="task === 'Encrypt disk'">
    <FormKit
      :name="formKey('password')"
      type="text"
      label="Password"
      placeholder="Encryption password"
      validation="required"
      validation-visibility="live"
      help=" "
    />

    <FormKit
      :name="formKey('tpm2_enroll')"
      label="Add TPM2 (Trusted Platform Module) support"
      type="checkbox"
      help= "Using secure chip with integrated cryptographic keys. An automatic way to decrypt the storage."
    />

    <FormKit
      :name="formKey('fido2_enroll')"
      label="Add FIDO2 (Fast Identity Online) support"
      type="checkbox"
      help= "Using e.g. external USB FIDO2 security key. An automatic way to decrypt the storage. The key has to be inserted/available during the first boot."
    />
  </div>

  <div v-if="task === 'Grow root partition'">
    <FormKit
      :name="formKey('root_full_size')"
      label="to the full disk size"
      type="checkbox"
      v-model="root_full_size"
      help= " "
    />

    <div v-if="root_full_size === false">
      <div class="row">
      <div class="col-1"></div>
      <div class="col-12">
      <FormKit
        type="number"
        :name="formKey('min_root')"
        validation-behavior="live"
        label="Minimum required disk space (MByte)"
        help=" "
      />
      <FormKit
        type="number"
        :name="formKey('max_root')"
        validation-behavior="live"
        label="Maximum required disk space (MByte)"
        help=" "
      />
      </div>
      </div>
    </div>
  </div>

  <div v-if="task === 'Create swap partition if missing'">
    <FormKit
      :name="formKey('swap_full_size')"
      label="take all available disk space"
      type="checkbox"
      v-model="swap_full_size"
      help= " "      
    />

    <div v-if="swap_full_size === false">
      <div class="row">
      <div class="col-1"></div>
      <div class="col-12">
      <FormKit
        type="number"
        :name="formKey('min_swap')"
        validation-behavior="live"
        label="Minimum required disk space (MByte)"
        help=" "
      />
      <FormKit
        type="number"
        :name="formKey('max_swap')"
        validation-behavior="live"
        label="Maximum required disk space (MByte)"
        help=" "
      />
      </div>
      </div>      
    </div>
  </div>

  <div v-if="task === 'Apply custom storage changes'">
    <FormKit
      :name="formKey('type')"
      label="Type"
      type="select"
      :options="[
        'esp - EFI System Partition',
        'xbootldr - Extended Boot Loader Partition',
        'swap - Swap partition',
        'home - Home (/home/) partition',
        'srv - Server data (/srv/) partition',
        'var - Variable data (/var/) partition',
        'tmp - Temporary data (/var/tmp/) partition',
        'linux-generic - Generic Linux file system partition',
        'root - Root file system partition type appropriate for the local architecture ',
        'root-verity - Verity data for the root file system partition for the local architecture',
        'root-verity-sig - Verity signature data for the root file system partition for the local architecture',
        'root-secondary - Root file system partition of the secondary architecture of the local architecture',
        'root-secondary-verity - Verity data for the root file system partition of the secondary architecture',
        'root-secondary-verity-sig - Verity signature data for the root file system partition of the secondary architecture',
        'root-x86-64 - Root file system partition of the given architecture ',
        'root-ppc - Root file system partition of the given architecture ',
        'root-s390- Root file system partition of the given architecture ',
        'root-s390x - Root file system partition of the given architecture ',
        'root-ia64 - Root file system partition of the given architecture ',
        'root-x86-64-verity - Verity data for the root file system partition of the given architecture',
        'root-ppc-verity - Verity data for the root file system partition of the given architecture',
        'root-s390-verity - Verity data for the root file system partition of the given architecture',
        'root-s390x-verity - Verity data for the root file system partition of the given architecture',
        'root-ia64-verity - Verity data for the root file system partition of the given architecture',
        'root-x86-64-verity-sig - Verity signature data for the root file system partition of the given architecture',
        'root-ppc-verity-sig - Verity signature data for the root file system partition of the given architecture',
        'root-s390-verity-sig - Verity signature data for the root file system partition of the given architecture',
        'root-s390x-verity-sig - Verity signature data for the root file system partition of the given architecture',
        'root-ia64-verity-sig - Verity signature data for the root file system partition of the given architecture',
        'usr - /usr/ file system partition type appropriate for the local architecture',
        'usr-verity - Verity data for the /usr/ file system partition for the local architecture',
        'usr-verity-sig - Verity signature data for the /usr/ file system partition for the local architecture',
        'usr-secondary - /usr/ file system partition of the secondary architecture of the local architecture',
        'usr-secondary-verity - Verity data for the /usr/ file system partition of the secondary architecture',
        'usr-secondary-verity-sid - Verity signature data for the /usr/ file system partition of the secondary architecture',
        'usr-x86-64 - /usr/ file system partition of the given architecture',
        'usr-ppc - /usr/ file system partition of the given architecture',
        'usr-s390 - /usr/ file system partition of the given architecture',
        'usr-s390x - /usr/ file system partition of the given architecture',
        'usr-ia64 - /usr/ file system partition of the given architecture',
        'usr-x86-64-verity - Verity data for the /usr/ file system partition of the given architecture',
        'usr-ppc-verity - Verity data for the /usr/ file system partition of the given architecture',
        'usr-s390-verity - Verity data for the /usr/ file system partition of the given architecture',
        'usr-s390x-verity - Verity data for the /usr/ file system partition of the given architecture',
        'usr-ia64-verity - Verity data for the /usr/ file system partition of the given architecture',
        'usr-x86-64-verity-sig - Verity signature data for the /usr/ file system partition of the given architecture',
        'usr-ppc-verity-sig - Verity signature data for the /usr/ file system partition of the given architecture',
        'usr-s390-verity-sig - Verity signature data for the /usr/ file system partition of the given architecture',
        'usr-s390x-verity-sig - Verity signature data for the /usr/ file system partition of the given architecture',
        'usr-ia64-verity-sig - Verity signature data for the /usr/ file system partition of the given architecture',
      ]"
      validation="required"
      validation-visibility="live"
      help="GPT partition type identifiers"
    />

    <FormKit
      :name="formKey('label')"
      label="Label"
      type="text"
      help= "The textual label to assign to the partition if none is assigned yet."
    />

    <FormKit
      :name="formKey('format')"
      label="Format"
      type="select"
      :options="[
        'none',
        'ext4',
        'btrfs',
        'xfs',
        'vfat',
        'erofs',
        'squashfs',
        'swap'
      ]"
      validation="required"
      validation-visibility="live"
      help="If specified and the partition is newly created it is formatted with the specified file system (or as swap device)."
    />

    <FormKit
      type="number"
      :name="formKey('min_disk_space')"
      label="Minimum required disk space (MByte)"
      help=" "
    />

    <FormKit
      type="number"
      :name="formKey('max_disk_space')"
      label="Maximum required disk space (MByte)"
      help=" "
    />

    <FormKit
      :name="formKey('individuals')"
      label="Individual settings"
      placeholder="e.g.
Priority=5
Weight=100"
      type="textarea"
      validation-behavior="live"
      help="defined in https://www.freedesktop.org/software/systemd/man/latest/repart.d.html"
    />

  </div>

</template>

<script>
import Utils from "../../utils/utils.js";
import { ref } from "vue";
const formPrefix = "change_storage";

export default {
  setup: () => {
    const uid = Utils.uid();
    const task = ref('Grow root partition');
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

      const b64EncodeUnicode = function (str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return window.btoa(
          encodeURIComponent(str).replace(
            /%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
              return String.fromCharCode("0x" + p1);
            }
          )
        );
      };

      const keyPrefix = formPrefix + "_task_";
      let counter = 0;
      let create_repart_dir = true
      let encrypt = false

      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          const task = formValue("task", id)
          if (task === 'Encrypt disk') {	  
             encrypt = true
          }
	  }
	)
	  
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

          let filename = "/etc/repart.d/"
          let content = ""
          const task = formValue("task", id)

          if (task === 'Grow root partition') {
            filename = filename.concat(counter+10, "-root.conf")
            content = content.concat( "[Partition]\n",
              		              "Type=root\n")
            const min = formValue("min_root", id)
	    const max = formValue("max_root", id)
	    const auto = formValue("root_full_size", id)
            if (min && !auto) {
	      content = content.concat("SizeMinBytes=", min, "M\n")
	    }
            if (max && !auto) {
	      content = content.concat("SizeMaxBytes=", max, "M\n")
	    }
          }

          if (task === 'Create swap partition if missing') {
            filename = filename.concat(counter+10, "-swap.conf")
            content = content.concat( "[Partition]\n",
                                      "Type=swap\n")
            const min = formValue("min_swap", id)
            const max = formValue("max_swap", id)
            const auto = formValue("swap_full_size", id)
            if (min && !auto) {
	      content = content.concat("SizeMinBytes=", min, "M\n")
	    }
            if (max && !auto) {
	      content = content.concat("SizeMaxBytes=", max, "M\n")
	    }
	  }

          if (task === 'Apply custom storage changes') {
            filename = filename.concat(counter+10, "-partition.conf")
            content = content.concat("[Partition]\n")

            const type = formValue("type", id)
	    if (type) {
              content = content.concat("Type=", type.split(" ")[0], "\n")
            }

            const label = formValue("label", id)
            if (label) {
              content = content.concat("Label=", label, "\n")
	    }

            const format = formValue("format", id)
            if (format && format !== "none") {
              content = content.concat("Format=", format, "\n")
	    }

            const min = formValue("min_disk_space", id)
	    const max = formValue("max_disk_space", id)
            if (min) {
	      content = content.concat("SizeMinBytes=", min, "M\n")
	    }
            if (max) {
	      content = content.concat("SizeMaxBytes=", max, "M\n")
	    }

            const indi = formValue("individuals", id)
            if (indi) {
	      content = content.concat(indi)
	    }
          }

          if (task === 'Encrypt disk') {
	    // encryption task
	    json.combustion_initrd += "  # We set disk-encryption-tool-dracut.encryption credential to\n" +
	       "  # \"force\".  This will make disk-encryption-tool-dracut force the\n" +
	       "  # encryption, ignoring that Combusion configured the system, and\n" +
	       "  # will skip the permission countdown\n" +
	       "  #\n" +
	       "  # After the encryption the recovery key is registered in the\n" +
	       "  # kernel keyring %user:cryptenroll\n" +
	       "  mkdir -p /run/credstore\n" +
               "  echo \"force\" > /run/credstore/disk-encryption-tool-dracut.encrypt\n"

            const password = formValue("password", id)
            const tpm2_enroll = formValue("tpm2_enroll", id)
            const fido2_enroll = formValue("fido2_enroll", id)

            json.combustion += "\n# Disk Encryption\n#\n" +
	      "# Create a valid machine-id, as this will be required to create later\n" +
	      "# the host secret\n" +
	      "systemd-machine-id-setup\n" +
	      "# We want to persist the host secret key created via systemd-cred\n" +
	      "# (/var/lib/systemd/credential.secret)\n" +
	      "mount /var\n" +
	      "mkdir -p /etc/credstore.encrypted\n" +
	      "credential=\"$(mktemp disk-encryption-tool.XXXXXXXXXX)\"\n" +
	      "# Enroll extra password\n" +
	      "echo \"" + password + "\" > \"$credential\"\n" +
	      "systemd-creds encrypt --name=disk-encryption-tool-enroll.pw \"$credential\" \\\n" +
	      "               /etc/credstore.encrypted/disk-encryption-tool-enroll.pw\n"
	    if (tpm2_enroll) {
	      json.combustion += "# Enroll TPM2\n" +
	        "echo \"1\" > \"$credential\"\n" +
		"systemd-creds encrypt --name=disk-encryption-tool-enroll.tpm2 \"$credential\" \\\n" +
		"             /etc/credstore.encrypted/disk-encryption-tool-enroll.tpm2\n"
	    }
	    if (fido2_enroll) {
	      json.combustion += "# Enroll FIDO2. While firstboot the FIDO key has to be inserted/available.\n" +
	        "echo \"1\" > \"$credential\"\n" +
		"systemd-creds encrypt --name=disk-encryption-tool-enroll.fido2 \"$credential\" \\\n" +
		"	      /etc/credstore.encrypted/disk-encryption-tool-enroll.fido2\n"
	    }
	    json.combustion += "shred -u \"$credential\"\n" +
	      "# Umount back /var to not confuse tukit later\n" +
	      "umount /var\n"
	  } else {
	    // repart tasks
	    if (encrypt) {
	      // repart just before encyption in d-e-t
	      if (create_repart_dir) {
	        create_repart_dir=false
	        json.combustion_initrd += "   mkdir -p /etc/repart.d\n"
	      }
              json.combustion_initrd += "   echo -e \"" + content + "\" >" + filename + "\n"
	    } else {
	      // repart via service systemd-repart
              json.storage.files.push(
                {
                  path: filename,
                  mode: 384,
                  overwrite: true,
                  contents: { 
                    source: "data:text/plain;charset=utf-8;base64," + b64EncodeUnicode(content),
  	  	    human_read: content
                  },
                }
              );
	    }
	  }

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

	  if (task.kind === 'Encrypt disk') {
            task.password = formValue("password", id)
	    task.tpm2_enroll = formValue("tpm2_enroll", id)
	    task.fido2_enroll = formValue("fido2_enroll", id)
	  }

	  if (task.kind === 'Grow root partition') {
            const min = formValue("min_root", id)
	    const max = formValue("max_root", id)
	    const auto = formValue("root_full_size", id)
	    task.auto = auto
            if (min && !auto) {
	      task.min = min
	    }
            if (max && !auto) {
	      task.max = max
	    }	    	     	  
	  }

	  if (task.kind === 'Create swap partition if missing') {
            const min = formValue("min_swap", id)
	    const max = formValue("max_swap", id)
	    const auto = formValue("swap_full_size", id)
	    task.auto = auto
            if (min && !auto) {
	      task.min = min
	    }
            if (max && !auto) {
	      task.max = max
	    }
	  }

          if (task.kind === 'Apply custom storage changes') {
            const type = formValue("type", id)
	    if (type) {
              task.type = type
            }

            const label = formValue("label", id)
            if (label) {
              task.label = label
	    }

            const format = formValue("format", id)
            if (format) {
              task.format = format
	    }

            const min = formValue("min_disk_space", id)
	    const max = formValue("max_disk_space", id)
            if (min) {
	      task.min = min
	    }
            if (max) {
	      task.max = max
	    }

            const indi = formValue("individuals", id)
            if (indi) {
	      task.individuals = indi
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

	  if (task.kind === 'Grow root partition') {
  	    if (task.auto) {
	      setValue("root_full_size", id, true);
	    }
	    if (!task.auto) {
 	      if (task.min) {
                setValue("min_root", id, task.min);
	      }
 	      if (task.min) {
                setValue("max_root", id, task.max);
	      }
	    }
          }

	  if (task.kind === 'Encrypt disk') {
            if (task.password) {
	      setValue("password", id, task.password);
	    }
            if (task.tpm2_enroll) {
	      setValue("tpm2_enroll", id, true);
	    }
            if (task.fido2_enroll) {
	      setValue("fido2_enroll", id, true);
	    }
          }

	  if (task.kind === 'Create swap partition if missing') {
            if (task.auto) {
	      setValue("swap_full_size", id, true);
	    }
            if (!task.auto) {
              if (task.min) {
	        setValue("min_swap", id, task.min);
	      }
              if (task.min) {
	        setValue("max_swap", id, task.max);
	      }
	    }
          }

          if (task.kind === 'Apply custom storage changes') {
            if (task.type) {
	      setValue("type", id, task.type);
	    }
            if (task.label) {
	      setValue("label", id, task.label);
	    }
            if (task.format) {
	      setValue("format", id, task.format);
	    }
            if (task.min) {
	      setValue("min_disk_space", id, task.min);
	    }
            if (task.min) {
	      setValue("max_disk_space", id, task.max);
	    }
            if (task.individuals) {
	      setValue("individuals", id, task.individuals);
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
