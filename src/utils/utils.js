export default {
  GlobalStorage: class {
    static store = { addUsers: { amount: 0 } };
  },
  PasswordHashes: class {
    static hashes = {};
  },
  parseJsonFile: async function (file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        try {
          return resolve(JSON.parse(event.target.result));
        } catch (error) {
          return reject(error);
        }
      };
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsText(file);
    });
  },
  clearFile: function() {
    const removeAnchor = document.querySelector(".formkit-remove-files");
    if (removeAnchor !== undefined) {
      removeAnchor.click();
    }
  },
  saveTemplateAsFile: (filename, dataObjToWrite, isNotJson) => {
    const blob = new Blob(
      isNotJson ? [dataObjToWrite] : [JSON.stringify(dataObjToWrite, null, 2)],
      {
        type: "text/json",
      }
    );
    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(
      ":"
    );

    const evt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(evt);
    link.remove();
  },
  copy: function (text) {
    var input = document.createElement("textarea");
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand("copy");
    document.body.removeChild(input);
    return result;
  },
  setupFormComponentWatcher: (component, watch, formData) => {
    if (
      component !== undefined &&
      "methods" in component &&
      "watchFormData" in component.methods
    ) {
      watch(formData, async (newData, oldData) => {
        component.methods.watchFormData(newData, oldData);
      });
    }
  },
  isNumerical: (value) => {
    // This will just let us parse the entire string to and return true
    // if every part of it is a number. See the full breakdown here:
    //
    // ^ anchor to the start of the string
    // \d+ match any digit 1 - infinate times
    // $ anchor to the end of the string
    return /^\d+$/.test(value);
  },

  uid: () => {
    return (
      performance.now().toString(36) + Math.random().toString(36)
    ).replace(/\./g, "");
  },

  getFormKey: (prefix, key, uid) => {
    return prefix + "_" + key + "_" + uid;
  },

  getFormValue: function (prefix, formData, key, uid) {
    return formData[this.getFormKey(prefix, key, uid)];
  },

  /* normalizeZypperPackages acceps a text representing a list of zypper packages, separated either by comma or by space, and returns a tidy string with all packages separated by a single space */
  normalizeZypperPackages : function(txt) {
    return txt.split(/[ ,]/) // split by space or comma
    .filter(n => n)          // filter empty elements
    .join(" ");              // return string of packages separated by a single space
  },

  setFormValue: function (prefix, formData, key, uid, value) {
    formData[this.getFormKey(prefix, key, uid)] = value;
  },

};
