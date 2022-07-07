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
  saveTemplateAsFile: (filename, dataObjToWrite) => {
    const blob = new Blob([JSON.stringify(dataObjToWrite, null, 2)], {
      type: "text/json",
    });
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
};
