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
const props = defineProps(["ignJson", "combustionScript"]);
var loading = ref(false);

const blobEditor = new BlobEditor();

const convertAndDownload = async function () {
  toggleLoading();
  let image = await blobEditor.convertToImage(
    props.ignJson,
    props.combustionScript
  );
  blobEditor.downloadImageFile(image);
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

  images = {
    zero: { ignFatDirEntry: 0xf060 }, // 0xf07c
    combustion: { ignFatDirEntry: 0xf0c0, combFatDirEntry: 0xf8c0 },
  };

  async fetchImage(imageName) {
    return fetch("templates/ignition-" + imageName + "-template.img").then(
      (response) => response.blob()
    );
  }

  applyPaddingAndLittleEndianIfNecessary(jsonLength, jsonLengthInHex) {
    // pad length with a 0 if it's not even, so we can split more easily for big endian little endian conversion
    if (jsonLengthInHex.length % 2 !== 0) {
      jsonLengthInHex = "0" + jsonLengthInHex;
    }

    console.log("bigEndian :>>", jsonLengthInHex);

    if (jsonLength > 255) {
      // split every 2 characters into array, then reverse that array ("32 16 5F" => "5F 16 32")
      jsonLengthInHex = jsonLengthInHex.match(/.{2}/g).reverse().join("");
      console.log("littleEndian :>> ", jsonLengthInHex);
    }

    return jsonLengthInHex + new Array(9 - jsonLengthInHex.length).join("0"); // pad to 8 bytes, to override existing file size at offset
  }

  async convertToImage(json, combustionScript) {
    let jsonStr = JSON.stringify(json);
    let jsonStrHex = jsonStr.hexEncode();
    let jsonLength = jsonStr.length * 2; // in bytes
    let jsonLengthInHex = jsonLength.toString(16);
    let imgTemplateName =
      combustionScript === undefined ? "zero" : "combustion"; // TODO: rename zero template to ignition-only
    let hasCombustion = combustionScript !== undefined;

    console.log(
      "images[" + imgTemplateName + "] :>> ",
      this.images[imgTemplateName]
    );

    jsonLengthInHex = this.applyPaddingAndLittleEndianIfNecessary(
      jsonLength,
      jsonLengthInHex
    );

    let file = await this.fetchImage(imgTemplateName);

    console.log(file);

    console.log("jsonSize(dec): " + jsonStr.length * 2);
    console.log("jsonSize(hex): " + jsonLengthInHex);

    // https://de.wikipedia.org/wiki/File_Allocation_Table

    let dirEntry = this.images[imgTemplateName].ignFatDirEntry;
    console.log("dirEntry :>> ", dirEntry);
    let fileSizeOffset = (dirEntry + 0x1c) * 2; // 4 Bytes of size

    console.log(
      "images[" + imgTemplateName + "] :>> ",
      this.images[imgTemplateName]
    );

    if (jsonLength > 15730099 || (hasCombustion && jsonLength > 7865049)) {
      // number found through testing, although since the template config.ign file is about 15.3 MB it makes sense
      alert(
        "Warning!\n\nThe output img file system will most likely be corrupt, since the supplied JSON config is larger than 15.7 MB." +
          "\n\nThis is a specific limitation of this config generator. Proceed at your own risk."
      );
    }

    const buffer = await file.arrayBuffer().then();
    let imgHexStr = this.bufferToHex(buffer);

    console.log(
      "fileSize slice:" + imgHexStr.slice(fileSizeOffset, fileSizeOffset + 8)
    );

    console.log("--- ignJsonHex ---");
    console.log(jsonStrHex);
    console.log("---");

    imgHexStr = imgHexStr
      .replace("6c6f72656d697073756d", jsonStrHex) // replace 'loremipsum' with our generated content
      .replaceAt(fileSizeOffset, jsonLengthInHex); // set the properly formatted length at the FAT-Filesize offset

    if (hasCombustion && true) {
      console.log("-- working on combustion hex --");
      let combDirEntry = this.images[imgTemplateName].combFatDirEntry;
      let combFileSizeOffset = (combDirEntry + 0x1c) * 2; // 4 Bytes of size

      // let combScriptHex = this.strToHex(combustionScript);
      let combScriptHex = combustionScript.hexEncode();
      console.log("combustionScript :>> ", combustionScript);
      console.log("--- cmbScriptHex ---");
      console.log(combScriptHex);
      console.log("---");
      let combScriptLength = combustionScript.length * 2; // in bytes
      let combScriptLengthInHex = combScriptLength.toString(16);

      combScriptLengthInHex = this.applyPaddingAndLittleEndianIfNecessary(
        combScriptLength,
        combScriptLengthInHex
      );

      console.log("combScriptLengthInHex :>> ", combScriptLengthInHex);

      imgHexStr = imgHexStr
        .replace(
          "646f6c6f72736974616d" +
            new Array(combScriptLength * 2 - 19).join("0"),
          combScriptHex
        ) // replace 'dolorsitam' with combustion script content
        .replaceAt(combFileSizeOffset, combScriptLengthInHex); // set the properly formatted length at the FAT-Filesize offset
    }

    console.log(
      "fileSize slice:" + imgHexStr.slice(fileSizeOffset, fileSizeOffset + 8)
    );

    if (imgHexStr.length % 2) {
      alert(
        "Error: Cleaned hex string length is odd. Kindly open an issue on GitHub if the error persists."
      );
      return;
    }

    var binary = new Array();
    for (var i = 0; i < imgHexStr.length / 2; i++) {
      var h = imgHexStr.substr(i * 2, 2);
      binary[i] = parseInt(h, 16);
    }

    var byteArray = new Uint8Array(binary);

    return new Blob([byteArray], {
      type: "application/octet-stream",
    });
  }

  downloadImageFile(file) {
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(file);
    a.download =
      "ignition-" +
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
    "Whisky", // shoutout an nico
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
