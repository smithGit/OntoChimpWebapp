<template>
  <q-page class="q-pa-sm">
    <div class="column items-center">
      <div class="row justify-center q-mb-sm">
        <img
          src="/images/UM_ChatGPT_sys_image2_20260806.png"
          alt="OntoChimp System Image"
          style="max-width: 100%; width: 80%"
        />
      </div>

      <div class="text-h5 text-center q-my-md">
        Choose how you would like to begin
      </div>

      <div class="row justify-center q-col-gutter-xl q-mt-md">
        <!-- Quick Analysis ---------------------------------------->

        <div class="col-12 col-md-5">
          <q-card bordered flat class="q-pa-md">
            <q-card-section>
              <div class="text-h5 text-primary text-weight-bold">
                Quick Analysis
              </div>

              <div class="text-subtitle1 q-mt-md">
                Analyze one document without creating a project.
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="center">
              <q-btn
                color="primary"
                label="Start"
                icon="description"
                unelevated
                @click="startQuickAnalysis"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Research Workspace ----------------------------------->

        <div class="col-12 col-md-5">
          <q-card bordered flat class="q-pa-md">
            <q-card-section>
              <div class="text-h5 text-primary text-weight-bold">
                Research Workspace
              </div>

              <div class="text-subtitle1 q-mt-md">
                Create or continue an ontology project.
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="center">
              <q-btn
                color="secondary"
                text-color="black"
                label="Enter"
                icon="folder"
                unelevated
                @click="enterWorkspace"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
//
import { useRouter } from "vue-router";
const router = useRouter();

function startQuickAnalysis() {
  // Navigate to the quick analysis page
  alert("quick analysis!!");
  router.push("/quick-analysis");
}

function enterWorkspace() {
  // Navigate to the research workspace page
  alert("The RESEARCH WORKSPACE will be implemented later.");
  router.push("/research-workspace");
}
</script>
