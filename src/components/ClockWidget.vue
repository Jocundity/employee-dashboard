<script setup>
import { ref, onMounted } from 'vue'

const currentTime = ref('');
const currentDate = ref('');

onMounted(() => {
    setInterval(() => {
        const now = new Date()
        currentTime.value = now.toLocaleTimeString()
    }, 1000)

    const date = new Date().toLocaleDateString('en-GB', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'});
    currentDate.value = date;

});

</script>

<template>
    <div class="widget">
        <h3>Clock</h3>
        <p>{{ currentDate }}</p>
        <p>{{ currentTime }}</p>
    </div>
</template>

<style scoped>
.widget {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
}
</style>