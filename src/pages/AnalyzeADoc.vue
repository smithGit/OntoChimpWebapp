<!--
AnalyzeADoc.vue - Module to present dialogue for specifying a single-document
analysis.
This module is used to present a dialogue for specifying a
single-document analysis. It is used in the AnalyzeADoc.vue component, which is
responsible for rendering the dialogue and handling user input.
The module
provides a user interface for selecting a document to analyze, specifying
analysis parameters, and initiating the analysis process. It includes form
elements for inputting the document path, selecting analysis options, and
submitting the analysis request. The module also handles validation of user
input and displays error messages if necessary.
The module is designed to be
reusable and can be integrated into other components or pages as needed. It
follows best practices for Vue.js development, including the use of props,
events, and reactive data binding. The module is also styled using Quasar
Framework components to ensure a consistent look and feel with the rest of the
application.
2026-08-05 SMS first version of this module created.
-->

<template>
  <div class="q-pa-md">
    <q-file
      v-model="selectedFile"
      outlined
      label="Select an OntoChimp document"
      accept=".txt,text/plain"
      max-file-size="5000000"
      @update:model-value="readTextFile"
    >
      <template #prepend>
        <q-icon name="description" />
      </template>
    </q-file>

    <div v-if="selectedFile" class="q-mt-md">
      <div><strong>File:</strong> {{ selectedFile.name }}</div>
      <div><strong>Size:</strong> {{ formattedFileSize }}</div>
    </div>

    <q-input
      v-if="documentText"
      v-model="documentText"
      class="q-mt-md"
      outlined
      type="textarea"
      label="Document contents"
      readonly
      autogrow
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const selectedFile = ref<File | null>(null);
const documentText = ref("");

const formattedFileSize = computed(() => {
  if (!selectedFile.value) {
    return "";
  }

  return `${(selectedFile.value.size / 1024).toFixed(1)} KB`;
});

async function readTextFile(file: File | null) {
  documentText.value = "";

  if (!file) {
    return;
  }

  try {
    documentText.value = await file.text();
  } catch (error) {
    console.error("Unable to read file:", error);
    documentText.value = "The selected file could not be read.";
  }
}
</script>
