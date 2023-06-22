import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const authenticating = ref(false);
  const user = ref(undefined);

  function login() {
    console.log("Login function.");
  }

  return { authenticating, login, user };
});
