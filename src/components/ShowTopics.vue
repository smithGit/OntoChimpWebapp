<template>
  <q-item clickable @click="showTopic">
    <q-item-section>
      <q-item-label>
        {{ props.label }}
      </q-item-label>

      <q-item-label caption>
        {{ props.caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
interface ShowTopicProps {
  label: string;
  caption: string;
  topic_id: string;
}

const props = defineProps<ShowTopicProps>();

const emit = defineEmits<{
  (event: "show-topic", topicId: string): void;
}>();

function showTopic(): void {
  emit("show-topic", props.topic_id);
}
</script>

<style scoped></style>
