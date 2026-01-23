<template>
  <button
    class="btn btn-primary mb-4"
    style="width: 100%"
    @click="convertAndDownload()"
  >
    Convert and Download
  </button>

  <div v-if="loading" class="sk-folding-cube">
    <div class="sk-cube1 sk-cube"></div>
    <div class="sk-cube2 sk-cube"></div>
    <div class="sk-cube4 sk-cube"></div>
    <div class="sk-cube3 sk-cube"></div>
  </div>

  <!-- workaround for a vite build production bug, where the scope changes and 'this' becomes undefined -->
  <button id="loadingToggle" hidden @click="loading = !loading"></button>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps(["combustionScript"]);
var loading = ref(false);

const blobEditor = new BlobEditor();

const convertAndDownload = async function () {
  toggleLoading();
  try {
    let image = await blobEditor.convertToImage(
      props.combustionScript
    );
    blobEditor.downloadImageFile(image);
  } catch(err) {
    alert(err);
  }
  toggleLoading();
};

const toggleLoading = function () {
  // hacky workaround to access ref from three or four closures deep, which works on the dev server but not in a production build for some reason
  document.querySelector("#loadingToggle").click();
};
</script>

<script>
export class BlobEditor {
  constructor() {
    String.prototype.replaceAt = function (index, replacement) {
      return (
        this.substring(0, index) +
        replacement +
        this.substring(index + replacement.length)
      );
    };

    String.prototype.hexEncode = function () {
      var hex, i;

      var result = "";
      for (i = 0; i < this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000" + hex).slice(-4);
      }

      return result;
    };
  }

  bufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  strToHex(str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }

  // Properties of the generated file system image
  images = {
    combustion: { ignFatDirEntry: 0xf0c0, combFatDirEntry: 0xf8c0, ignFileOffset: 0xf10800, combFileOffset: 0x318000 },
  };

  async fetchImage(imageName) {
    return fetch(import.meta.env.BASE_URL + "templates/ignition-" + imageName + "-template.img").then(
      (response) => response.arrayBuffer()
    );
  }

  async convertToImage(combustionScript) {
    let jsonStr = "{\n  \"ignition\": {\n    \"version\": \"3.2.0\"\n  }\n}" // empty ignition
    let imgTemplateName = "combustion";

    console.log(
      "images[" + imgTemplateName + "] :>> ",
      this.images[imgTemplateName]
    );

    let image = await this.fetchImage(imgTemplateName);
    let imageView = new DataView(image);

    let dirEntry = this.images[imgTemplateName].ignFatDirEntry;
    let fileSizeView = new DataView(image, dirEntry + 0x1c, 4);
    let encoder = new TextEncoder();
    let jsonBin = encoder.encode(jsonStr);
    let origIgnLength = fileSizeView.getInt32(0, true);
    fileSizeView.setInt32(0, jsonBin.length, true);

    if (jsonBin.length >= origIgnLength) {
      throw new Error(
        "Warning!\n\nIgnition configuration is too large.\n\n" +
          "The maximum file size for the Ignition configuration is currently set to " + origIgnLength + "B."
      );
    }

    for (let i = 0; i < jsonBin.length; i++) {
      imageView.setInt8(this.images[imgTemplateName].ignFileOffset + i, jsonBin[i]);
    }

    console.log("jsonSize(string): " + jsonStr.length);
    console.log("jsonSize(bin): " + jsonBin.length);
    console.log("dirEntry :>> ", dirEntry);
    console.log(
      "images[" + imgTemplateName + "] :>> ",
      this.images[imgTemplateName]
    );

    let combDirEntry = this.images[imgTemplateName].combFatDirEntry;
    fileSizeView = new DataView(image, combDirEntry + 0x1c, 4);
    let combBin = encoder.encode(combustionScript);
    let origCombLength = fileSizeView.getInt32(0, true);
    fileSizeView.setInt32(0, combBin.length, true);

    if (combBin.length >= origCombLength) {
      throw new Error(
        "Warning!\n\nCombustion configuration is too large.\n\n" +
          "The maximum file size for the Combustion configuration is currently set to " + origCombLength + "B."
      );
    }

    for (let i = 0; i < combBin.length; i++) {
      imageView.setInt8(this.images[imgTemplateName].combFileOffset + i, combBin[i]);
    }

    var byteArray = new Uint8Array(image);

    return new Blob([byteArray], {
      type: "application/octet-stream",
    });
  }

  downloadImageFile(file) {
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(file);
    a.download =
      "combustion-" +
      this.alphabet[
        Math.floor(Math.random() * this.alphabet.length) // add random word, so there are more diverse file names for debugging
      ].toLowerCase() +
      ".img";

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
  }

  alphabet = [
    "Alfa",
    "Bravo",
    "Charlie",
    "Delta",
    "Echo",
    "Foxtrot",
    "Golf",
    "Hotel",
    "India",
    "Juliett",
    "Kilo",
    "Lima",
    "Mike",
    "November",
    "Oscar",
    "Papa",
    "Quebec",
    "Romeo",
    "Sierra",
    "Tango",
    "Uniform",
    "Victor",
    "Whisky",
    "X-ray",
    "Yankee",
    "Zulu",
    "Nico",
    "Ignaz",
    "Robert",
    "Moritz",
  ];
}
</script>
