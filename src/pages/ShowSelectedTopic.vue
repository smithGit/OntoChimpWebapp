<template>
  <q-page class="topic-page q-pa-md">
    <div class="topic-container q-mx-auto">
      <!-- Topic header -->
      <div class="topic-header">
        <div class="topic-system-title">
          OntoChimp Ontology Enhancement System
        </div>

        <img src="/images/chimp1.png" alt="OntoChimp" class="topic-logo" />
      </div>

      <!-- Topic content -->
      <div class="topic-content">
        <div class="text-h4 text-primary text-weight-medium q-mb-lg">
          Sub-header goes here; put title in page header...
        </div>

        <div v-html="insertedText"></div>

        <!-- Standard Back button -->
        <div class="q-mt-xl">
          <q-btn
            flat
            dense
            color="primary"
            icon="arrow_back"
            label="Back"
            to="/"
          />
        </div>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ props.label }}
            </q-item-label>

            <q-item-label caption>
              {{ props.caption }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { get_topic_md_to_html } from "/utils/get_topic_md_to_html";

// removed label: and caption:
interface ShowTopicProps {
  topic_id: string;
}

const props = defineProps<ShowTopicProps>();
const insertedText = ref("");

watch(
  () => props.topic_id,
  () => {
    void loadTopicContent();
  },
  { immediate: true },
);

async function loadTopicContent() {
  try {
    // const htmlContent = await get_topic_md_to_html(props.topic_id);
    const htmlContent = await get_topic_md_to_html(props.topic_id);
    insertedText.value = htmlContent;
  } catch (error) {
    console.error("Error fetching topic content:", error);
  }
}
</script>

<style scoped>
.topic-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.topic-container {
  width: 100%;
  max-width: 900px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.topic-header {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: #00274c; /* UM dark blue; Quasar: #1976d2; */
  color: white;
  box-sizing: border-box;
}

.topic-system-title {
  font-size: 1.5rem;
  font-weight: 500;
  text-align: left;
}

.topic-logo {
  height: 80px;
  width: auto;
  object-fit: contain;
}

.topic-content {
  padding: 28px 36px 36px;
  color: #333;
  line-height: 1.6;
}

.topic-description {
  font-size: 1rem;
}

.topic-steps {
  padding-left: 28px;
  margin-bottom: 0;
}

.topic-steps li {
  margin-bottom: 12px;
  padding-left: 5px;
}

@media (max-width: 600px) {
  .topic-header {
    height: 85px;
    padding: 0 16px;
  }

  .topic-system-title {
    font-size: 1.15rem;
  }

  .topic-logo {
    height: 65px;
  }

  .topic-content {
    padding: 22px 20px 28px;
  }
}
</style>
