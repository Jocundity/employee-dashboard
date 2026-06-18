<script setup>
defineProps({
  title: String,
})
</script>

<template>
  <div class="widget">
    <h3>{{ title }}</h3>
    <slot></slot>
  </div>
</template>

<style scoped></style>
