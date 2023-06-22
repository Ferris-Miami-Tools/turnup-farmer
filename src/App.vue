<script setup>
  import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header class="w-full bg-slate-400">
    <h1>Turnup Farmer</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>
