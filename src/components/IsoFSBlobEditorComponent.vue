<template>
  <input type="file" @change="previewFile()" />
</template>

<script setup>
import { ref } from "vue";
const blobFile = {};

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function previewFile() {
  console.log("runs!");
  var file = document.querySelector("input[type=file]").files[0];

  console.log(file);
  console.log(file instanceof Blob);
  console.log(file.arrayBuffer());
  console.log(bufferToHex(file.arrayBuffer()));

  file.arrayBuffer().then((buffer) => {
    let hex = bufferToHex(buffer);
    hex.replace("6c6f72656d697073756d", "68656c6c6f776f726c64"); // replace 'loremipsum' with 'helloworld', same length

    var byteArray = new Uint8Array(hex.length / 2);
    for (var x = 0; x < byteArray.length; x++) {
      byteArray[x] = parseInt(hex.substr(x * 2, 2), 16);
    }


// lastModified: 1652443065991
// lastModifiedDate: Fri May 13 2022 13:57:45 GMT+0200 (Central European Summer Time) {}
// name: "ignition-blob.iso"
// size: 358400
// type: "application/x-cd-image
    var newFile = new File(byteArray, file.name, {lastModified: file.lastModified, lastModifiedDate: file.lastModifiedDate, type: file.type});

    console.log(newFile);

    const link = document.createElement("a");
    const url = URL.createObjectURL(newFile);

    link.href = url;
    link.download = newFile.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  });
}
</script>
