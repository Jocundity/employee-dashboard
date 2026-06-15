<script setup>
import { ref } from 'vue'

const count = ref(0)

function increaseCount() {
    count.value++
}

</script>

<template>
    <div class="widget">
        <h3>Counter</h3>
        <p>Current Count: {{ count }}</p>
        <button @click="increaseCount">Add 1</button>
    </div>
</template>