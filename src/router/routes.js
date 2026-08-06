const routes = [
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("@/pages/IndexPage.vue") },
      {
        path: "ontochimpweb",
        component: () => import("@/pages/OntoChimpWeb.vue"),
      },
      {
        path: "quick-analysis",
        component: () => import("@/pages/QuickAnalysis.vue"),
      },
      {
        path: "research-workspace",
        component: () => import("@/pages/ResearchWorkspace.vue"),
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
