<script setup>
import { ref } from 'vue'

const name = ref('')
name.value = 'Jocelyn'
</script>

<template>
  <header>
    <h1>Hello, {{ name }}!</h1>
  </header>
</template>
