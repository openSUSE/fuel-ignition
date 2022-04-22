export default {
  saveTemplateAsFile: (filename, dataObjToWrite) => {
    const blob = new Blob([JSON.stringify(dataObjToWrite)], {
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

  setupFormComponentWatcher: (component, watch, formData) => {
    if ("methods" in component && "watchFormData" in component.methods) {
        watch(formData, async (newData, oldData) => {
          component.methods.watchFormData(newData);
        });
      }
  },

  uid: () => {
    return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
  }
};
