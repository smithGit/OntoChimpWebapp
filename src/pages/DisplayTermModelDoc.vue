<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">OntoChimp Terms</div>

    <q-btn
      label="Retrieve terms"
      color="primary"
      :loading="loading"
      :disable="loading"
      @click="loadTerms"
    />

    <q-banner
      v-if="errorMessage"
      class="bg-negative text-white q-mt-md"
      rounded
    >
      {{ errorMessage }}
    </q-banner>

    <div v-if="!loading && terms.length > 0" class="q-mt-lg">
      <div class="text-subtitle1 q-mb-sm">
        {{ terms.length }} records retrieved
      </div>

      <q-list bordered separator>
        <q-item
          v-for="term in terms"
          :key="term.id ?? `${term.doc_id}-${term.model_id}-${term.term_id}`"
        >
          <q-item-section>
            <q-item-label>
              {{ term.term_norm }}
            </q-item-label>

            <q-item-label caption>
              Term: {{ term.term_id }} · Model: {{ term.model_id }} · Document:
              {{ term.doc_id }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div
      v-else-if="!loading && requestCompleted && !errorMessage"
      class="q-mt-lg text-grey-7"
    >
      No terms were returned.
    </div>
    <div>
      <q-table
        title="Retrieved Terms"
        :rows="terms"
        :columns="columns"
        row-key="id"
        flat
        bordered
        dense
        :pagination="{ rowsPerPage: 0 }"
      />
    </div>
    <q-btn color="secondary" to="/" label="Go to Index Page" no-caps />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface TermRecord {
  id?: number;
  term_id: string;
  model_id: string;
  doc_id: string;
  term_norm: string;
}

interface TermsResponse {
  count: number;
  terms: TermRecord[];
}

// const API_BASE_URL =
//   'https://YOUR-AZURE-APP-NAME.azurewebsites.net'
const API_BASE_URL = "http://127.0.0.1:8000"; // Local FastAPI server

const terms = ref<TermRecord[]>([]);
const loading = ref(false);
const requestCompleted = ref(false);
const errorMessage = ref("");
// table here
const columns = [
  {
    name: "term_norm",
    label: "Normalized Term",
    field: "term_norm",
    align: "left",
    sortable: true,
  },
  {
    name: "doc_id",
    label: "Document",
    field: "doc_id",
    align: "left",
    sortable: true,
  },
  {
    name: "model_id",
    label: "Model",
    field: "model_id",
    align: "left",
    sortable: true,
  },
  {
    name: "term_id",
    label: "Term ID",
    field: "term_id",
    align: "left",
    sortable: true,
  },
];
// end table

async function loadTerms(): Promise<void> {
  console.log(`Loading terms from ${API_BASE_URL}/select_terms...`);
  loading.value = true;
  requestCompleted.value = false;
  errorMessage.value = "";

  try {
    const response = await fetch(`${API_BASE_URL}/select_terms`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`FastAPI returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as TermsResponse;

    if (!Array.isArray(data.terms)) {
      throw new Error("The server response did not contain a terms list.");
    }

    terms.value = data.terms;
    requestCompleted.value = true;

    console.log(`Retrieved ${data.count} terms`, data.terms);
  } catch (error: unknown) {
    terms.value = [];
    requestCompleted.value = true;

    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = "An unknown error occurred while retrieving terms.";
    }

    console.error("Unable to retrieve terms:", error);
  } finally {
    loading.value = false;
  }
}
</script>
