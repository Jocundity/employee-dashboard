<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppNavBar from './components/AppNavBar.vue'
</script>

<template>
  <AppNavBar />
  <RouterView />
</template>

<style>
body {
  background: #f1f5f9;
  color: #334155;
  font-family: Helvetica, Arial, sans-serif;
  margin: 0;
}
</style>
