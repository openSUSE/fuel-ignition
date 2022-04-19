<script>
import { ref, watch } from "vue";

export default {
  setup() {
    const formData = ref({});

    watch(formData, async (newData, oldData) => {
      if (newData.user_passwd !== undefined) {
        sha256(newData.user_passwd).then(
          (hash) => (newData.user_passwd_hashed = hash)
        );
      }
    });

    const saveTemplateAsFile = (filename, dataObjToWrite) => {
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
    };

    const downloadConfigIgn = () => {
      saveTemplateAsFile("config.ign", toIgnitionConfig(formData));
    };

    const toIgnitionConfig = (formData) => {
      return {
        ignition: { version: "3.2.0" },
        passwd: {
          users: [
            {
              name: formData.user_name,
              password: formData.user_passwd_hashed,
            },
          ],
        },

        "debug:form": formData,
      };
    };

    return {
      formData,
      toIgnitionConfig,
      downloadConfigIgn,
    };
  },
};

async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
</script>

<template>
  <div class="container">
    <div class="sample-input">
      <h1>Ignition Config Generator</h1>
      <FormKit type="group" v-model="formData">
        <FormKit
          name="user_name"
          label="OS Username"
          placeholder="write your os username here"
          validation="required"
          validation-behavior="live"
          help="Users can be added to an OS with the passwd.users key."
        />
        <FormKit
          name="user_passwd"
          label="OS Password"
          placeholder="write the corresponding password here"
          type="password"
          validation="required"
          validation-behavior="live"
          help="Your password is never sent over the internet, everything is local."
        />
        <FormKit
          name="likes_microOS"
          label="Opinion"
          help="How excited are you about MicroOS?"
          type="radio"
          value="A lot"
          :options="['A little', 'A lot']"
        />
      </FormKit>

      <h2>config.ign</h2>
      <pre class="form-data">{{ toIgnitionConfig(formData) }}</pre>

      <button @click="downloadConfigIgn">Download</button>

      <h2>Turn to ISO</h2>
      <pre class="form-data">
# mkisofs -o ignition.iso -V ignition config.ign</pre
      >
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

.container {
  margin: auto;
  display: flex;
  justify-content: center;
}

.side-by-side {
  display: flex;
  align-items: flex-start;
}

pre.range-output {
  background: #eee;
  border-radius: 0.5em;
  text-align: center;
  margin-left: 1em;
  margin-top: 1.5em;
  font-weight: bold;
  padding: 0.5em;
  line-height: 1;
  width: 1.5em;
}

pre.form-data {
  box-sizing: border-box;
  background: #eee;
  border: 1px solid #ccc;
  width: 100%;
  padding: 1em;
  border-radius: 0.5em;
}
</style>
