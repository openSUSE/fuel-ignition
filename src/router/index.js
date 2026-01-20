import { createRouter, createWebHistory } from "vue-router";

const base = "/fuel-ignition/";

import HomeView from "../pages/HomeView.vue";
import EditView from "../pages/EditView.vue";
import ImportView from "@/pages/ImportView.vue";
import TestView from "@/pages/TestView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/edit",
    name: "Edit",
    component: EditView,
  },
  {
    path: "/import",
    name: "Import",
    component: ImportView,
  },
  {
    path: "/test",
    name: "Test",
    component: TestView,
  },
  // {
  //   path: '/edit',
  //   name: 'Edit',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
];

const router = createRouter({
  history: createWebHistory(base),
  routes,
});

export default router;

export { base };
