<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppNavBar from './components/AppNavBar.vue'
</script>

<template>
  <AppNavBar />

  <RouterView v-slot="{ Component }">
    <Transition name="slide" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
body {
  background: #f1f5f9;
  color: #334155;
  font-family: Helvetica, Arial, sans-serif;
  margin: 0;
}

/* Sliding Page Transition */
.slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}
</style>
