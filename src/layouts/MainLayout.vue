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
        <q-item-label header> Find Out More Ess..Links </q-item-label>

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

<script setup>
import { ref } from "vue";
import EssentialLink from "@/components/EssentialLink.vue";

const linksList = [
  {
    label: "Overview",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    label: "Quick Analysis",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    label: "Research Workspace",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
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

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
