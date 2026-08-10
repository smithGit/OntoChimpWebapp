<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <span class="text-accent text-weight-bold" style="font-size: 1.35em">
            OntoChimp
          </span>

          <span class="text-white">
            : Ontology Enhancement using Multiple Large Language Models</span
          >
        </q-toolbar-title>

        <div>Version 0.1 Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Topics </q-item-label>

        <ShowTopics
          v-for="topic in topicsList"
          :key="topic.topic_id"
          v-bind="topic"
          @show-topic="show_left_panel_topic"
        />
      </q-list>
      <q-list>
        <q-item-label header> Helpful Links </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.label"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import ShowTopics from "@/components/ShowTopics.vue";
import EssentialLink from "@/components/EssentialLink.vue";

const router = useRouter();
const topicsList = [
  {
    label: "Overview",
    caption: "System Overview",
    topic_id: "T01_Overview",
  },
  {
    label: "Quick Analysis",
    caption: "Single Document Analysis",
    topic_id: "T03_QuickAnalysis",
  },
];
const linksList = [
  {
    label: "Overview",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    label: "Go to OntoBee",
    caption: "Ontology Lookup Service",
    icon: "school",
    link: "https://ontobee.org/",
  },
  {
    label: "About",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    label: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    label: "GitHub",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "https://github.com/quasarframework",
  },
];

const leftDrawerOpen = ref(false);

function show_left_panel_topic(topicId: string) {
  void router.push({
    name: "show-selected-topic",
    params: { topic_id: topicId },
  });
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
