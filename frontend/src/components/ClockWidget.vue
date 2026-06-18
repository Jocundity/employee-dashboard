<script setup>
import { ref, onMounted } from 'vue'

const currentTime = ref('')
const currentDate = ref('')

onMounted(() => {
  setInterval(() => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString()
  }, 1000)

  const date = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  currentDate.value = date
})
</script>

<template>
  <div class="widget">
    <h3>Clock</h3>
    <h2>{{ currentTime }}</h2>
    <p>{{ currentDate }}</p>
  </div>
</template>

<style scoped>
.widget {
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  border-bottom: 5px dotted #fcd34d;
  padding-bottom: 0.5rem;
}
</style>
