const routes = [
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("@/pages/IndexPage.vue") },
      {
        path: "display-tmd-results",
        component: () => import("@/pages/DisplayTermModelDoc.vue"),
      },
      {
        path: "quick-analysis",
        component: () => import("@/pages/QuickAnalysis.vue"),
      },
      {
        path: "research-workspace",
        component: () => import("@/pages/ResearchWorkspace.vue"),
      },
      {
        path: "topic/:topic_id",
        name: "show-selected-topic",
        component: () => import("@/pages/ShowSelectedTopic.vue"),
        props: true,
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/pages/ErrorNotFound.vue"),
  },
];

export default routes;
