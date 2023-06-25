import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useToast } from "vue-toastification";

export const useAuthStore = defineStore("auth", () => {
  const loadingSession = ref(true);
  const authenticating = ref(false);
  const user = ref(undefined);

  const auth = getAuth();
  const toast = useToast();

  async function login() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: "miamioh.edu",
      prompt: "select_account",
    });
    authenticating.value = true;

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error?.code === "auth/popup-blocked") {
        toast.error(
          "Your browser blocked the popup. Please check your browser settings and try again."
        );
        console.error(
          "Your browser blocked the popup. Please check your browser settings and try again.",
          error
        );
      } else if (error?.code === "auth/popup-closed-by-user") {
        toast.error(
          "Please complete the sign-in process and don't close the window prematurely."
        );
        console.error(
          "Please complete the sign-in process and don't close the window prematurely.",
          error
        );
      } else if (error?.code === "auth/cancelled-popup-request") {
        // No need to display error to the user.
        console.info("User generated multiple popups. No action required.");
      } else {
        toast.error(
          "Sorry, we were unable to sign you in. Please try again. If you continue to experience issues, please contact your instructor."
        );
        console.error(
          "Sorry, we were unable to sign you in. Please try again. If you continue to experience issues, please contact your instructor.",
          error
        );
      }
    } finally {
      authenticating.value = false;
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return {
    auth,
    authenticating,
    loadingSession,
    login,
    logout,
    user,
  };
});
