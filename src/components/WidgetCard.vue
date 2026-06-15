<script setup>
defineProps({
    title: String
})
</script>

<template>
    <div class="widget">
        <h3>{{ title }}</h3>
        <slot></slot>
    </div>
</template>

<style scoped>
.widget {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
}
</style>