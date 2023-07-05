<script setup>
  defineProps({
    type: {
      type: String,
      default: "submit",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="w-full mt-2 py-2 px-4 font-bold hover:enabled:bg-teal-50 dark:enabled:hover:bg-teal-800 border border-teal-800 dark:border-teal-600 disabled:cursor-not-allowed rounded-xl transition duration-150 ease-in-out"
  >
    <slot />
  </button>
</template>
