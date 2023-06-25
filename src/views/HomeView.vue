<script setup>
  import { useAuthStore } from "../stores/auth";

  import router from "../router/index";

  const auth = useAuthStore();
</script>

<template>
  <section class="my-12 sm:my-24 flex flex-col items-center rounded-3xl">
    <h2
      class="w-11/12 sm:w-2/3 pb-8 lg:pb-16 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center font-black leading-7 md:leading-10"
    >
      Simple attendance for select Farmer School of Business classes at
      <span class="miami-red">Miami University</span>.
    </h2>
    <button
      v-if="!auth.user"
      @click="auth.login"
      :disabled="auth.authenticating"
      class="py-2 sm:py-4 px-4 sm:px-10 bg-teal-800 hover:bg-teal-700 text-sm lg:text-xl text-white font-bold rounded transition duration-150 ease-in-out border border-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800"
    >
      {{ auth.authenticating ? "Authenticating..." : "Log in with Google" }}
    </button>
    <button
      v-else
      @click="() => router.push(auth.user.role)"
      class="py-2 sm:py-4 px-4 sm:px-10 bg-teal-800 hover:bg-teal-700 text-sm sm:text-md md:text-lg lg:text-xl text-white font-bold rounded transition duration-150 ease-in-out border border-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800"
    >
      Enter the Application
    </button>
  </section>
</template>

<style scoped>
  .miami-red {
    color: rgb(180, 43, 54);
  }

  /* EBADB3 */
  @media (prefers-color-scheme: dark) {
    .miami-red {
      color: #ebadb3;
    }
  }
</style>
