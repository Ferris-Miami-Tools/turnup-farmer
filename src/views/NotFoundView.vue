<script setup>
  import router from "../router/index";
</script>

<template>
  <section class="my-12 sm:my-24 flex flex-col items-center rounded-3xl">
    <h2
      class="w-11/12 sm:w-2/3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center font-black leading-7 md:leading-10"
    >
      <span class="text-teal-700 dark:text-teal-200">4</span>
      <span class="text-amber-700 dark:text-amber-200">0</span>
      <span class="text-teal-700 dark:text-teal-200">4</span>
    </h2>
    <p class="py-8 text-lg">Page not found</p>
    <button
      @click="() => router.push('/')"
      class="py-2 sm:py-4 px-4 sm:px-10 bg-teal-800 hover:bg-teal-700 text-sm sm:text-md md:text-lg lg:text-xl text-white font-bold rounded transition duration-150 ease-in-out border border-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800"
    >
      Return to Safety
    </button>
  </section>
</template>
