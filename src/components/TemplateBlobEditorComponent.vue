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
const props = defineProps(["ignJson"]);
var loading = ref(false);

function toggleLoading() {
  // hacky workaround to access ref from three closures deep, which works on the dev server but not in a production build for some reason
  document.querySelector("#loadingToggle").click();
}

let convertAndDownload = async function () {
  toggleLoading();

  let hexJson = strToHex(JSON.stringify(props.ignJson));
  let jsonByteSize = JSON.stringify(props.ignJson).length;

  console.log(jsonByteSize.toString(16));

  console.log("flipped tuple: " + (jsonByteSize > 255));

  let hexJsonByteSize = jsonByteSize.toString(16);

  // pad size with a 0 if it's not even, so we can split in the middle
  if (hexJsonByteSize.length % 2 !== 0) {
    hexJsonByteSize = "0" + hexJsonByteSize;
  }

  // change size to little endian

  if (jsonByteSize > 255) {
    console.log(hexJsonByteSize);

    let middle = hexJsonByteSize.length / 2;
    hexJsonByteSize =
      hexJsonByteSize.substring(middle) + hexJsonByteSize.substring(0, middle);
  }

  console.log(hexJsonByteSize);

  let file = await fetch("templates/ignition-base-template.img").then(
    (response) => response.blob()
  );

  console.log(file);

  console.log("jsonSize(dec): " + JSON.stringify(props.ignJson).length);
  console.log("jsonSize(hex): " + hexJsonByteSize);

  let decimalOffset = 61564 * 2; // 1 byte = 8 bit = 2^8 = 256 = 0xFF

  let buffer = await file.arrayBuffer().then();

  let hex = bufferToHex(buffer);
  console.log(new Blob([hex]).size);
  console.log(hex.slice(decimalOffset, decimalOffset + 4));

  let cleanedHex = hex
    .replace("6c6f72656d697073756d", hexJson) // replace 'loremipsum' with our generated content
    .replaceAt(decimalOffset, hexJsonByteSize); // set file size in bytes at offset so the filesystem is not corrupt

  console.log(cleanedHex.slice(decimalOffset, decimalOffset + 4));

  if (cleanedHex.length % 2) {
    alert("Error: cleaned hex string length is odd.");
    return;
  }

  if (JSON.stringify(props.ignJson).length > 2048) {
    // check for 2048
    alert(
      "Warning. The resulting image is most likely corrupt, since this config is quite large.\n\n" +
        "If you have problems, kindly try again with a smaller config. We are actively working on fixing this limitation." +
        "\nFuel-Ignition is still in active development."
    );
  }

  var binary = new Array();
  for (var i = 0; i < cleanedHex.length / 2; i++) {
    var h = cleanedHex.substr(i * 2, 2);
    binary[i] = parseInt(h, 16);
  }

  var byteArray = new Uint8Array(binary);
  var a = window.document.createElement("a");

  a.href = window.URL.createObjectURL(
    new Blob([byteArray], { type: "application/octet-stream" })
  );
  a.download =
    "ignition-" +
    alphabet[Math.floor(Math.random() * alphabet.length)].toLowerCase() + // add random word, so there are more diverse file names for debugging
    ".img";

  // Append anchor to body.
  document.body.appendChild(a);
  a.click();

  // Remove anchor from body
  document.body.removeChild(a);

  toggleLoading();
};

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substring(0, index) +
    replacement +
    this.substring(index + replacement.length)
  );
};

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function strToHex(str) {
  var result = "";
  for (var i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
}

let alphabet = [
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
  "Whiskey",
  "X-ray",
  "Yankee",
  "Zulu",
  "Nico",
  "Ignaz",
];
</script>
