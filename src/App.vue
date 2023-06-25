<script setup>
  import { onAuthStateChanged } from "firebase/auth";
  import { doc, getDoc, getFirestore } from "firebase/firestore";
  import { onBeforeUnmount } from "vue";
  import { RouterLink, RouterView } from "vue-router";
  import { useToast } from "vue-toastification";

  import { useAuthStore } from "./stores/auth";

  import LoadingSessionView from "./views/LoadingSessionView.vue";

  const auth = useAuthStore();
  const toast = useToast();

  const unsubscribe = onAuthStateChanged(auth.auth, async updatedUser => {
    let newUserData;
    try {
      if (!updatedUser) {
        auth.user = null;
        return;
      }
      const db = getFirestore();
      const userDocRef = doc(db, "users", updatedUser.email);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw new Error("No matching user record.");
      }
      newUserData = {
        uid: updatedUser.uid,
        email: updatedUser.email,
        ...userDocSnap.data(),
      };
    } catch (error) {
      toast.error("Could not retrieve user data. Please try again shortly.");
      console.error("Could not retireve user data.", error);
      newUserData = null;
      await auth.logout();
    } finally {
      auth.user = newUserData;
      auth.loadingSession = false;
    }
  });

  onBeforeUnmount(() => {
    unsubscribe();
  });
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-slate-200 text-teal-950 dark:bg-slate-800 dark:text-teal-100"
  >
    <header class="p-2 flex flex-row justify-between">
      <RouterLink to="/" class="w-fit flex flex-row align-middle gap-2">
        <img src="/favicon.ico" alt="favicon" class="w-8 h-8" />
        <h1 class="text-2xl">Turnup Farmer</h1>
      </RouterLink>
      <button
        v-if="auth.user"
        class="px-4 border border-teal-950 dark:border-teal-100 rounded-full hover:bg-slate-300 dark:hover:bg-slate-900"
      >
        Log out
      </button>
    </header>
    <main class="px-2 py-4 mx-auto container flex-grow">
      <loading-session-view v-if="auth.loadingSession" />
      <RouterView v-else />
    </main>
    <footer class="p-2 text-center">Made with 💚 by Joshua Ferris</footer>
  </div>
</template>
