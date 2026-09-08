<template>
  <q-page class="q-pa-sm">
    <div class="text-subtitle1 q-mt-xs q-mb-sm">
      Analyze one document without creating a project. Quick Analysis results
      are not retained as a registered project.
    </div>

    <!-- Input form -->
    <q-card flat bordered>
      <q-card-section class="q-py-sm">
        <div class="text-h6 text-primary">Analysis Inputs</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-sm">
        <!-- A. Domain + B. LLM selection -->
        <div class="row q-col-gutter-md items-start q-mb-sm">
          <div class="col-12 col-md-5">
            <q-input
              v-model="txtDomain"
              outlined
              dense
              label="Domain"
              hint="Enter your term for the domain of interest."
              :disable="isLlmProcessing"
            />
          </div>

          <div class="col-12 col-md-7">
            <div class="text-body1 text-weight-medium q-mb-xs">
              Select one or more LLMs
            </div>

            <q-option-group
              v-model="selectedModels"
              :options="llmOptions"
              type="checkbox"
              inline
              dense
              color="primary"
              :disable="isLlmProcessing"
            />

            <div class="text-caption text-grey-7">
              Select between one and three models.
            </div>
          </div>
        </div>

        <!-- C. Ontology selection -->
        <div class="text-body2 text-grey-8 q-mb-xs">
          Select one Target Ontology and optionally one or more Related
          Reference Ontologies. Enter ontology acronyms found in OntoBee or
          BioPortal. The selected ontologies will be used to indicate where
          identified key terms or similar terms may already exist.
        </div>

        <div class="row q-col-gutter-md q-mb-sm">
          <div class="col-12 col-md-4">
            <q-input
              v-model="targetOntology"
              outlined
              dense
              label="Target Ontology"
              hint="BioPortal acronym"
              :disable="isLlmProcessing"
            />
          </div>

          <div class="col-12 col-md-8">
            <q-input
              v-model="relatedOntologies"
              outlined
              dense
              label="Related Reference Ontologies (optional)"
              hint="Comma-separated BioPortal acronyms"
              :disable="isLlmProcessing"
            />
          </div>
        </div>

        <!-- D. Prompt prefix -->
        <q-input
          v-model="txtPromptPrefix"
          outlined
          dense
          autogrow
          type="textarea"
          label="Query Prompt Prefix"
          hint="Review or edit the text that will precede the document."
          :disable="isLlmProcessing"
          class="q-mb-sm"
        />

        <q-banner dense class="bg-blue-1 text-blue-10 q-mb-sm" rounded>
          <template #avatar>
            <q-icon name="info" color="primary" />
          </template>

          This prompt prefix will be appended before the document text. A suffix
          describing the required JSON output format will also be added. The
          combined prompt will be submitted to each selected Large Language
          Model.
        </q-banner>

        <div class="row q-col-gutter-md items-center">
          <!-- E. Text-file upload -->
          <div class="col-12 col-md-6">
            <q-file
              v-model="selectedFile"
              outlined
              dense
              clearable
              accept=".txt,text/plain"
              label="Select reference document"
              hint="Choose one plain-text (.txt) document."
              max-files="1"
              :disable="isLlmProcessing"
              @update:model-value="onFileSelected"
              @rejected="onFileRejected"
            >
              <template #prepend>
                <q-icon name="upload_file" />
              </template>
            </q-file>
          </div>

          <div class="col-6 col-md-3">
            <div class="text-caption text-grey-7">RefDoc ID</div>
            <div class="text-body1">{{ currentRefDocId }}</div>
          </div>

          <div class="col-6 col-md-3">
            <div class="text-caption text-grey-7">Project ID</div>
            <div class="text-body1">{{ currentProjectId }}</div>
          </div>
        </div>

        <q-banner
          v-if="fileValidationMessage"
          dense
          rounded
          class="q-mt-xs"
          :class="
            fileIsValid ? 'bg-green-1 text-green-9' : 'bg-red-1 text-red-9'
          "
        >
          <template #avatar>
            <q-icon
              :name="fileIsValid ? 'check_circle' : 'error'"
              :color="fileIsValid ? 'positive' : 'negative'"
            />
          </template>

          {{ fileValidationMessage }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="between" class="q-px-sm q-py-xs">
        <q-btn
          flat
          dense
          color="primary"
          icon="arrow_back"
          label="Back"
          :disable="isLlmProcessing"
          to="/"
        />

        <div class="q-gutter-xs">
          <q-btn
            outline
            dense
            color="primary"
            icon="restart_alt"
            label="Reset"
            :disable="isLlmProcessing"
            @click="resetInput"
          />
          <q-btn
            unelevated
            dense
            color="primary"
            icon="send"
            label="Submit"
            :loading="isLlmProcessing"
            :disable="!isFormReady"
            @click="processRun"
          />
        </div>
      </q-card-actions>
    </q-card>
    <!-- Processing progress (an OR condition was removed; what was it? -->
    <q-card
      v-if="isLlmProcessing || isProcessing"
      flat
      bordered
      class="q-mt-lg"
    >
      <q-card-section>
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6 text-primary">Processing Progress</div>

            <div class="text-body2 text-grey-7 q-mt-xs">
              Each selected model is processed separately.
            </div>
          </div>

          <q-spinner v-if="isLlmProcessing" color="primary" size="2.2em" />
        </div>
      </q-card-section>

      <q-linear-progress v-if="isLlmProcessing" indeterminate color="primary" />
      <q-linear-progress indeterminate color="primary" />

      <q-separator />

      <q-card-section>
        <q-table
          flat
          bordered
          dense
          hide-pagination
          row-key="model"
          :rows="modelProgress"
          :columns="progressColumns"
          :pagination="{ rowsPerPage: 0 }"
          no-data-label="No model results have been received yet."
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-chip
                dense
                :color="statusColor(props.row.status)"
                :text-color="props.row.status === 'Pending' ? 'dark' : 'white'"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <!--     <q-card flat bordered class="q-pa-md text-center">
              <div class="text-caption text-grey-7">Total terms identified</div>

              <div class="text-h4 text-primary text-weight-bold">
                {{ totalTerms }}
              </div>
            </q-card>-->
          </div>

          <!--  <div class="col-12 col-sm-6">
            <q-card flat bordered class="q-pa-md text-center">
              <div class="text-caption text-grey-7">Total unique terms</div>

              <div class="text-h4 text-accent text-weight-bold">
                {{ totalUniqueTerms }}
              </div>
            </q-card>
          </div>-->
        </div>
      </q-card-section>
    </q-card>
    <q-card v-if="isProcessRunComplete" flat bordered class="q-mt-lg">
      <q-card-actions align="center" class="q-pa-md">
        <!-- <q-card-actions align="center" class="q-pa-md"> -->
        <q-btn
          unelevated
          color="primary"
          icon="table_view"
          label="Display Results"
          @click="displayResults"
        />
      </q-card-actions>
    </q-card>
    <!-- Results card, hidden until Display Results -->
    <q-card v-show="showResults" flat bordered class="q-mt-lg">
      <q-card-section>
        showResultssubmitProm
        <div class="text-h6 text-primary">Current Term Results</div>

        <div class="text-body2 text-grey-7 q-mt-xs">
          Prototype display using the current
          <code>term_model_doc</code> contents.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          flat
          bordered
          dense
          row-key="id"
          :rows="termResults"
          :columns="resultColumns"
          :loading="resultsLoading"
          :pagination="{ rowsPerPage: 0 }"
          no-data-label="No term records were returned."
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuasar, type QTableColumn } from "quasar";

interface ModelProgressRow {
  refDocId: string;
  model: string;
  numTerms: number | null;
  elapsedSeconds: number | null;
  status: "Pending" | "Processing" | "Complete" | "Failed" | "Compiled";
}

interface TermRecord {
  term_norm: string;
  GPT: number;
  Gemini: number;
  Claude: number;
  head: string | null;
  sub_domain: string | null;
  project_id: string;
}

interface OcRequestRegRun {
  project_id: string;
  domain: string;
  selected_model_id_list: string[];
  text_filename: string;
}

interface OcResponseRegRun {
  ar_key_list: number[];
  project_key: number;
  study_key: number;
  task_key: number;
  refdoc_key: number;

  project_id: string;
  study_id: string;
  task_id: string;
  refdoc_id: string;
}

// 9/5 changed to use ar_key for most data
interface OcRequestLLM {
  ar_key: number;
  domain: string;
  promptPrefix: string;
}

interface OcResponseLLM {
  refdoc_id: string;
  run_mode: string;
  num_distinct_term_norms_refdoc_model: number;
  num_clusters_refdoc_model: number;
  num_clustered_term_norms_refdoc_model: number;
  elapsed_seconds: number;
}

interface OcRequestDB {
  // list of the ar_keys containing model_id, in sequence as the
  // models were processed. Currently GPT, Gemini, Claude.
  analysis_run_keys: number[];
}

interface OcResponseDB {
  // dict of stats
  run_stats: {
    num_tmd_by_model: number[];
    num_terms_new: number;
    num_terms_total: number; // total for the project
  };
}

const $q = useQuasar();

// 8/9/26 Github > Settings > Actions > Secrets > Variables > New repository secret
// was set to the Azure URL for the FastAPI endpoint.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
alert(`API_BASE_URL from local / Actions settings is set to: ${API_BASE_URL}`);
// for ref the Azure value is:

/* ---------------------------------------------------------
   Input values
--------------------------------------------------------- */

const txtDomain = ref("");
const selectedFile = ref<File | null>(null);

const selectedModels = ref<string[]>(["GPT", "Gemini", "Claude"]);

// Ahah: here are the caps!! 8/23 changed from caps
const llmOptions = [
  { label: "GPT", value: "GPT" },
  { label: "Gemini", value: "Gemini" },
  { label: "Claude", value: "Claude" },
];

const targetOntology = ref("");
const relatedOntologies = ref("");

const txtPromptPrefix = ref("");
const currentProjectKey = ref<number | null>(null);
const currentProjectId = ref<string>("");
const currentRefDocId = ref<string>("");
const currentAnalysisRunKeys = ref<number[]>([]);

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

const isFormReady = computed(() => {
  return (
    txtDomain.value.trim().length > 0 &&
    selectedFile.value !== null &&
    fileIsValid.value &&
    selectedModels.value.length > 0 &&
    targetOntology.value.trim().length > 0 &&
    txtPromptPrefix.value.trim().length > 0 &&
    !isLlmProcessing.value
  );
});

/* ---------------------------------------------------------
   State variables for processing sequence
--------------------------------------------------------- */

const processingStarted = ref(false);
const isProcessing = ref(false);

const isLlmProcessing = ref(false);
const isExtractionComplete = ref(false); // after llm_rsults loaded
const isCompiling = ref(false); // during compileTerms() execution
const isProcessRunComplete = computed(() => {
  return (
    !isLlmProcessing.value &&
    !isCompiling.value &&
    !isProcessing.value &&
    processingStarted.value
  );
});
/* ---------------------------------------------------------
   Progress display
--------------------------------------------------------- */

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
async function compileTerms(): Promise<string> {
  // load the llm_result recs for current ar keys to TMD and TT tables
  // returns: ... anyhting?
  console.log("Load ... LLM results to TMD and TT tables...");
  // For test if no LLM extract: currentAnalysisRunKeys.value = [127, 128, 129];

  isCompiling.value = true;
  // call FastAPI endpoint to load the llm_result for the current ar_keys
  loadLLM_to_DB(currentAnalysisRunKeys.value)
    .then((ocResponseDB) => {
      console.log("LLM-to-DB completed. Response:", ocResponseDB);
      isCompiling.value = false;
      isLlmProcessing.value = false;
      $q.notify({
        type: "positive",
        message: "LLM results successfully loaded to the database.",
      });
    })
    .catch((error) => {
      console.error("Error during LLM-to-DB processing:", error);
      isCompiling.value = false;
      $q.notify({
        type: "negative",
        message:
          error instanceof Error
            ? error.message
            : "Unable to complete LLM-to-DB processing.",
      });
    });
  return "LLM-to-DB processing initiated.";
}

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
  Main processing sequence:
  Submit the document for each model and reset - a three-step process:
    Register the refDoc
    For each selected model, extract from LLM and add to llm_reult table
    Upon completing all models, insert all term-model results to the term_model_doc table,
      and compare new terms this run to existing terms for the project,
      inserting new terms to the term_table updating the per-model values for existing terms.

    9/7/26: Implementing a new try / await async sequence
--------------------------------------------------------- */
async function processRun(): Promise<void> {
  processingStarted.value = true;
  isProcessing.value = true;
  isLlmProcessing.value = true;

  try {
    await registerRun();
    console.log("Registered::::: we have registered...");
    await runAllModels(currentAnalysisRunKeys.value);
    isLlmProcessing.value = false;
    console.log("LLM Extracted::: we have run all models...");
    // await loadLLM_to_DB(currentAnalysisRunKeys.value);
    await compileTerms();
    isCompiling.value = false;
    console.log(
      "LOADED to DB:::: LLM-to-DB completed. Check console for details.",
    );

    // Add this only after the first two stages are verified:
    // await compileTerms()
  } catch (error) {
    console.error("New processing sequence failed:", error);
  } finally {
    isProcessing.value = false;
    console.log("processRun() completed. Check console for details.");
  }

  alert("processRun() how to show display results?.");
}

/* ---------------------------------------------------------
   Register this document model-set domain for a project
      by inserting a record for each selected model in analysis_run.
      Currently create a project for quick analysis but later
      for a pre-existing project_id.
NO!! wrong function!!
--------------------------------------------------------- */
async function registerRun(): Promise<void> {
  /*
  Initialize this run: Register the proj-study-task, models, domain and text_filename
  Then loop through the models and for each selected model:
    Execute the LLM extract for each selected model
    Notify user by updating the progress table
    Load the results for this analysis_run - document - model in llm_result
    Enable the Display Results (and later download TermTable.)
  */
  isLlmProcessing.value = true;
  const msg = `isLlmProcessing set to ${isLlmProcessing.value}. Submitting to FastAPI for register_run...`;
  console.log(msg);
  const ocRequestRegRun: OcRequestRegRun = {
    // "qk_analysis" is the code for register_run to create an analysis-run project id
    project_id: "qk_analysis",
    domain: txtDomain.value,
    selected_model_id_list: selectedModels.value,
    text_filename: selectedFile.value.name,
  }; // text_filename shows error but does not seem to matter...
  console.log("Submitting to FastAPI for register_run...");
  console.log(ocRequestRegRun);
  // initialize response object
  let ocResponseRegRun: OcResponseRegRun;
  try {
    const response = await fetch(`${API_BASE_URL}/register_run`, {
      method: "POST",
      body: JSON.stringify(ocRequestRegRun),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `FastAPI for register_refdoc returned HTTP ${response.status}.`,
      );
    }
    ocResponseRegRun = await response.json();
    console.log("ocResponseRegRun: ", ocResponseRegRun);
    currentRefDocId.value = ocResponseRegRun.refdoc_id;
    currentProjectKey.value = ocResponseRegRun.project_key;
    currentProjectId.value = ocResponseRegRun.project_id;
  } catch (error: unknown) {
    console.error(
      "Unable to complete Reg-Run not ?? LLM-to-DB processing:",
      error,
    );

    $q.notify({
      type: "negative",
      message:
        error instanceof Error
          ? error.message
          : "Unable to complete LLM-to-DB processing.",
    });
    throw error;
  } finally {
    isLlmProcessing.value = false;
    isExtractionComplete.value = true;
    resultsLoading.value = false;
    console.log("registerRun() completed. Check console for details.");
  }
  // we need only the lost of ar_keys fro ocResponseRegRun
  currentAnalysisRunKeys.value = ocResponseRegRun.ar_key_list;
  console.log("from RegRun: ar_key_list: ", currentAnalysisRunKeys.value);
}

async function runAllModels(ar_key_list: number[]): Promise<void> {
  // for each model, submit the document and prompt to the FastAPI endpoint
  // ** TODO should we use currentAnalysisRunKeys?
  if (!isFormReady.value || !selectedFile.value) {
    $q.notify({
      type: "warning",
      message:
        "** PROG ERROR should not happen ** Please complete all required inputs before submitting.",
    });
    return;
  }

  console.log("Beginning LLM loop for these models:", ar_key_list);
  // Main result of llm extracts: record the ar_key for each
  // delete: const analysis_run_keys: number[] = [];
  for (const ar_key of ar_key_list) {
    console.log(
      `Submitting document to FastAPI for model with ar_key: ${ar_key}`,
    );
    const ocRequestLLM: OcRequestLLM = {
      ar_key: ar_key,
      domain: txtDomain.value,
      promptPrefix: txtPromptPrefix.value,
    };
    const formData = new FormData();
    formData.append("ocRequestLLM", JSON.stringify(ocRequestLLM));
    formData.append("document", selectedFile.value);
    const ocResponseLLM: OcResponseLLM = await submitModelPrompt(formData);
    // TODO add error case...***
    console.log("LLM extract for model-doc complete. Now load results to DB.");
  }

  /*
  const ocRequestDB: OcRequestDB = {
    analysis_run_keys: llmResult_ar_keys.value,
  };
  console.log(
    `FINISHED Extract for All models for doc. ar_keys: ${llmResult_ar_keys.value}`,
  );
  console.log("starting DB load and from llm_results");
  alert(
    `testing llm_to_db: we have llmResult ar_keys: ${llmResult_ar_keys.value}`,
  );
  const ocResultDB = loadLLM_to_DB(llmResult_ar_keys.value);
  const msg = `resultdb ${ocResultDB}`;
  console.log(msg);.... */
}

// async function submitModelPrompt(formData: FormData): Promise<void> {
async function submitModelPrompt(formData: FormData): Promise<OcResponseLLM> {
  // send formData to FastAPI and get result for data and model
  console.log(`sending formData: ${formData}`);
  try {
    const response = await fetch(`${API_BASE_URL}/extract_key_concepts`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`FastAPI for EXTRACT returned HTTP ${response.status}.`);
    }

    const ocResponseLLM = await response.json();
    console.log("ocResponseLLM: ", ocResponseLLM);
    // console.log(`Doc read:     ${ocResponseLLM["filename"]}`);
    // console.log(`Doc length:   ${ocResponseLLM["document_length"]}`);
    // console.log(`Num non-Utf8: ${ocResponseLLM["bad_count"]}`);
    return ocResponseLLM;
  } catch (error: unknown) {
    console.error("Unable to retrieve EXTRACT results:", error);

    $q.notify({
      type: "negative",
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve the EXTRACT results.",
    });
  } finally {
    resultsLoading.value = false;
  }
}

/* ---------------------------------------------------------
   Post request to load llm_result for doc to DB
--------------------------------------------------------- */
async function loadLLM_to_DB(
  analysis_run_keys: number[],
): Promise<OcResponseDB> {
  // When all models for a document are complete, send post to load to DB.
  // parm is list of analysis_run table keys ar_key
  console.log("beginning loadLLM_to_DB temp........");
  console.log(analysis_run_keys);
  try {
    const response = await fetch(`${API_BASE_URL}/run_llm_to_db`, {
      method: "POST",
      body: JSON.stringify({
        analysis_run_keys: analysis_run_keys,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `FastAPI for LLM-to-DB returned HTTP ${response.status}.`,
      );
    }
    console.log("done DB Fetch...");
    // chat says: await loadLLM_to_DB(llmResult_ar_keys.value);
    const ocResponseDB = await response.json();
    console.log("ocResonseDB: ", ocResponseDB);
    return ocResponseDB;
  } catch (error: unknown) {
    console.error("Unable to complete LLM-to-DB processing:", error);

    $q.notify({
      type: "negative",
      message:
        error instanceof Error
          ? error.message
          : "Unable to complete LLM-to-DB processing.",
    });
    throw error;
  } finally {
    resultsLoading.value = false;
  }
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

  // isLlmProcessing.value = false;
  isLlmProcessing.value = false;
  isCompiling.value = false;

  showResults.value = false;
  termResults.value = [];
}

/* ---------------------------------------------------------
   Prototype result display
--------------------------------------------------------- */

const showResults = ref(false);
const resultsLoading = ref(false); // true awaiting results
const llmResult_ar_keys = ref<number[]>([]); // analysis_run keys for each model for current doc
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
    name: "GPT",
    label: "GPT",
    field: "GPT",
    align: "center",
    sortable: true,
  },
  {
    name: "Gemini",
    label: "Gemini",
    field: "Gemini",
    align: "center",
    sortable: true,
  },
  {
    name: "Claude",
    label: "Claude",
    field: "Claude",
    align: "center",
    sortable: true,
  },
  {
    name: "head",
    label: "Head Token",
    field: "head",
    align: "left",
    sortable: true,
  },
  {
    name: "sub_domain",
    label: "Sub-domain",
    field: "sub_domain",
    align: "left",
    sortable: true,
  },
  {
    name: "project_id",
    label: "Project ID",
    field: "project_id",
    align: "left",
    sortable: true,
  },
];

async function displayResults(): Promise<void> {
  showResults.value = true;
  resultsLoading.value = true;
  let msg = `Fetching term results from FastAPI endpoint...${API_BASE_URL}`;
  alert(msg);
  const pkey = currentProjectKey.value;
  console.log(pkey);
  console.log(`${API_BASE_URL}/select_terms?project_key=${pkey}`);
  try {
    const response = await fetch(
      `${API_BASE_URL}/select_terms?project_key=${pkey}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`FastAPI returned HTTP ${response.status}.`);
    }
    // const data = (await response.json()) as TermsResponse;
    const data = (await response.json()) as TermRecord[];

    if (!Array.isArray(data)) {
      throw new Error("The server response did not contain a terms array.");
    }

    // termResults.value = data.terms; << this is where we had dict!
    termResults.value = data;
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
