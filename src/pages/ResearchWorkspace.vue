<template>
  <q-page class="q-pa-md">
    <div class="quick-analysis-page q-mx-auto">
      <!-- Page heading -->
      <div class="text-h4 text-primary text-weight-bold">
        Research Workspace (New or Existing)
      </div>

      <div class="text-subtitle1 q-mt-sm q-mb-lg">
        ** Revise to ask if create new or open existing project. To be completed
        later. the ref Doc is now a list of documents, each of which is
        automatically assigned a refeenc document Id (R plus 5 digits...). If
        create new project, then the user is prompted to enter a domain and
        select one or more LLMs, but recall: we can have multiple studies /
        tasks within the same project!. If open existing project, then the user
        is prompted to select a project from a list of...&nbsp; Consider: a
        dialogue to enter domain (sub-domain), llm's, ontos.
      </div>

      <!-- Input form -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 text-primary">**Query for new or existing**</div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="between" class="q-pa-md">
          <q-btn
            flat
            color="primary"
            icon="arrow_back"
            label="Back"
            :disable="isProcessing"
            to="/"
          />

          <div class="q-gutter-sm">
            <q-btn
              outline
              color="primary"
              icon="restart_alt"
              label="Reset"
              :disable="isProcessing"
              @click="resetInput"
            />

            <q-btn
              unelevated
              color="primary"
              icon="send"
              label="Submit"
              :loading="isProcessing"
              :disable="!formIsReady"
              @click="submitPrompt"
            />
          </div>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuasar, type QTableColumn } from "quasar";

interface ModelProgressRow {
  model: string;
  keyTermCount: number | null;
  status: "Pending" | "Processing" | "Complete" | "Failed";
}

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

const $q = useQuasar();

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

/* ---------------------------------------------------------
   Input values
--------------------------------------------------------- */

const txtDomain = ref("");
const selectedFile = ref<File | null>(null);

const selectedModels = ref<string[]>([]);

const llmOptions = [
  { label: "GPT", value: "GPT" },
  { label: "Gemini", value: "GEMINI" },
  { label: "Claude", value: "CLAUDE" },
];

const targetOntology = ref("");
const relatedOntologies = ref("");

const txtPromptPrefix = ref("");

const defaultPromptPrefix = computed(() => {
  const domain = txtDomain.value.trim() || "[domain of interest]";

  return (
    "Please analyze the indicated document for key concepts " +
    "and important terms relevant to the domain of " +
    `${domain}.`
  );
});

/*
  Update the default prompt when the user changes the domain,
  but do not overwrite a substantially edited custom prompt.
*/
watch(
  txtDomain,
  (newDomain, oldDomain) => {
    const oldDefault =
      "Please analyze the indicated document for key concepts " +
      "and important terms relevant to the domain of " +
      `${oldDomain?.trim() || "[domain of interest]"}.`;

    if (!txtPromptPrefix.value || txtPromptPrefix.value === oldDefault) {
      txtPromptPrefix.value =
        "Please analyze the indicated document for key concepts " +
        "and important terms relevant to the domain of " +
        `${newDomain.trim() || "[domain of interest]"}.`;
    }
  },
  { immediate: true },
);

/* ---------------------------------------------------------
   File validation
--------------------------------------------------------- */

const fileIsValid = ref(false);
const fileValidationMessage = ref("");

async function onFileSelected(file: File | null): Promise<void> {
  fileIsValid.value = false;
  fileValidationMessage.value = "";

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const validationResult = validateRefDocText(text);

    if (validationResult === "ok") {
      fileIsValid.value = true;
      fileValidationMessage.value = `${file.name} passed document validation.`;
    } else {
      fileValidationMessage.value = validationResult;
    }
  } catch (error: unknown) {
    fileValidationMessage.value =
      error instanceof Error
        ? error.message
        : "Unable to read the selected document.";
  }
}

/*
  Replace or expand this function with your existing
  validation rules.
*/
function validateRefDocText(text: string): string {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return "The selected document is empty.";
  }

  if (trimmedText.length < 100) {
    return "The selected document is too short for analysis.";
  }

  return "ok";
}

function onFileRejected(): void {
  fileIsValid.value = false;
  fileValidationMessage.value = "Please select one plain-text (.txt) file.";
}

/* ---------------------------------------------------------
   Form validation
--------------------------------------------------------- */

const formIsReady = computed(() => {
  return (
    txtDomain.value.trim().length > 0 &&
    selectedFile.value !== null &&
    fileIsValid.value &&
    selectedModels.value.length > 0 &&
    targetOntology.value.trim().length > 0 &&
    txtPromptPrefix.value.trim().length > 0 &&
    !isProcessing.value
  );
});

/* ---------------------------------------------------------
   Progress display
--------------------------------------------------------- */

const isProcessing = ref(false);
const processingStarted = ref(false);
const processingComplete = ref(false);

const modelProgress = ref<ModelProgressRow[]>([]);

const progressColumns: QTableColumn[] = [
  {
    name: "model",
    label: "Model",
    field: "model",
    align: "left",
    sortable: true,
  },
  {
    name: "keyTermCount",
    label: "Number of Key Terms",
    field: "keyTermCount",
    align: "right",
    sortable: true,
    format: (value: number | null) => (value === null ? "—" : String(value)),
  },
  {
    name: "status",
    label: "Status",
    field: "status",
    align: "center",
  },
];

const totalTerms = computed(() =>
  modelProgress.value.reduce(
    (total, row) => total + (row.keyTermCount ?? 0),
    0,
  ),
);

/*
  This must eventually be calculated from the actual combined
  term results, not simply the individual model counts.
*/
const totalUniqueTerms = ref(0);

function statusColor(status: ModelProgressRow["status"]): string {
  switch (status) {
    case "Complete":
      return "positive";

    case "Processing":
      return "primary";

    case "Failed":
      return "negative";

    default:
      return "grey-4";
  }
}

/* ---------------------------------------------------------
   Submit and reset
--------------------------------------------------------- */

async function submitPrompt(): Promise<void> {
  if (!formIsReady.value || !selectedFile.value) {
    $q.notify({
      type: "warning",
      message: "Please complete all required inputs before submitting.",
    });

    return;
  }

  isProcessing.value = true;
  processingStarted.value = true;
  processingComplete.value = false;
  showResults.value = false;

  modelProgress.value = selectedModels.value.map((model) => ({
    model,
    keyTermCount: null,
    status: "Pending",
  }));

  try {
    /*
      Later, this section will:
        1. Create FormData.
        2. Include the document and form inputs.
        3. POST the request to FastAPI.
        4. Receive per-model progress through polling,
           Server-Sent Events, WebSockets, or separate requests.
        5. Update each modelProgress row as it completes.
    */

    await runPrototypeProcessing();

    processingComplete.value = true;

    $q.notify({
      type: "positive",
      message: "Quick Analysis processing completed.",
    });
  } catch (error: unknown) {
    console.error("Quick Analysis failed:", error);

    $q.notify({
      type: "negative",
      message:
        error instanceof Error ? error.message : "Quick Analysis failed.",
    });
  } finally {
    isProcessing.value = false;
  }
}

/*
  Temporary simulation so the progress interface can be tested
  before the LLM endpoint exists.
*/
async function runPrototypeProcessing(): Promise<void> {
  for (const row of modelProgress.value) {
    row.status = "Processing";

    await delay(900);

    /*
      Temporary sample count.
      Replace this with the number returned by FastAPI.
    */
    row.keyTermCount = Math.floor(Math.random() * 12) + 8;

    row.status = "Complete";
  }

  /*
    Temporary prototype value.
    Later calculate this from normalized returned terms.
  */
  totalUniqueTerms.value = Math.max(
    0,
    totalTerms.value - Math.floor(totalTerms.value * 0.25),
  );
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function resetInput(): void {
  txtDomain.value = "";
  selectedFile.value = null;
  selectedModels.value = [];
  targetOntology.value = "";
  relatedOntologies.value = "";

  txtPromptPrefix.value =
    "Please analyze the indicated document for key concepts " +
    "and important terms relevant to the domain of " +
    "[domain of interest].";

  fileIsValid.value = false;
  fileValidationMessage.value = "";

  modelProgress.value = [];
  totalUniqueTerms.value = 0;

  isProcessing.value = false;
  processingStarted.value = false;
  processingComplete.value = false;

  showResults.value = false;
  termResults.value = [];
}

/* ---------------------------------------------------------
   Prototype result display
--------------------------------------------------------- */

const showResults = ref(false);
const resultsLoading = ref(false);
const termResults = ref<TermRecord[]>([]);

const resultColumns: QTableColumn[] = [
  {
    name: "term_norm",
    label: "Normalized Term",
    field: "term_norm",
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
  {
    name: "model_id",
    label: "Model",
    field: "model_id",
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
];

async function displayResults(): Promise<void> {
  showResults.value = true;
  resultsLoading.value = true;

  try {
    const response = await fetch(`${API_BASE_URL}/select_terms`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`FastAPI returned HTTP ${response.status}.`);
    }

    const data = (await response.json()) as TermsResponse;

    if (!Array.isArray(data.terms)) {
      throw new Error("The server response did not contain a terms array.");
    }

    termResults.value = data.terms;
  } catch (error: unknown) {
    console.error("Unable to retrieve results:", error);

    $q.notify({
      type: "negative",
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve the term results.",
    });
  } finally {
    resultsLoading.value = false;
  }
}
</script>

<style scoped>
.quick-analysis-page {
  width: 100%;
  max-width: 1050px;
}
</style>
