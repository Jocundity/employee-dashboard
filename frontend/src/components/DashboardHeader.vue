<script setup>
import { ref, onMounted } from 'vue'

const user = ref(null)

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})
</script>

<template>
  <header>
    <h1 v-if="user">Hello, {{ user.name }}!</h1>
  </header>
</template>
