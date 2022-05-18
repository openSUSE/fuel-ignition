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
</template>

<script setup>
import { ref } from "vue";
const props = defineProps(["ignJson"]);
let loading = ref(false);

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
];

function toHex(str) {
  var result = "";
  for (var i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
}

async function convertAndDownload() {
  console.log("runs!");

  this.loading = true;
  console.log(this.loading);

  let file = await fetch("src/assets/template/ignition.img").then((response) =>
    response.blob()
  );

  console.log(file);
  let hexJson = toHex(JSON.stringify(props.ignJson));

  file.arrayBuffer().then((buffer) => {
    let hex = bufferToHex(buffer);
    console.log(hex.slice(43068, 43068 + 4));
    let cleanedHex = hex
      .replace("6c6f72656d697073756d", hexJson)
      .replaceAt(43068, toHex(new Blob([hexJson]).size)); // replace 'loremipsum' with 'helloworld', same length

    console.log(cleanedHex.slice(43068, 43068 + 4));

    if (cleanedHex.length % 2) {
      alert("Error: cleaned hex string length is odd.");
      return;
    }

    var binary = new Array();
    for (var i = 0; i < cleanedHex.length / 2; i++) {
      var h = cleanedHex.substr(i * 2, 2);
      binary[i] = parseInt(h, 16);
    }

    this.loading = false;

    var byteArray = new Uint8Array(binary);
    var a = window.document.createElement("a");

    a.href = window.URL.createObjectURL(
      new Blob([byteArray], { type: "application/octet-stream" })
    );
    a.download =
      "ignition-" +
      alphabet[Math.floor(Math.random() * alphabet.length)].toLowerCase() +
      ".img";

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
  });
}
</script>
