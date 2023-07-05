import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/student",
      name: "student",
      component: () => import("../views/StudentView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notfound",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (to.path === "/") {
    next();
  } else if (auth.user && to.name === auth.user.role) {
    next();
  } else if (auth.user) {
    next(auth.user.role);
  } else {
    next("/");
  }
});

export default router;
