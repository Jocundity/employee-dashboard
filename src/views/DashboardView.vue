<script setup>
import DashboardHeader from '../components/DashboardHeader.vue'
import ClockWidget from '../components/ClockWidget.vue'
import WeatherWidget from '../components/WeatherWidget.vue'
import CurrencyWidget from '../components/CurrencyWidget.vue'
import NewsWidget from '../components/NewsWidget.vue'
import TaskWidget from '../components/TaskWidget.vue'

</script>

<template>
    <div class="dashboard">
        <DashboardHeader />

        <main>
            <h2>Welcome Back</h2>
            <div class="widget-grid">
                <ClockWidget />
                <WeatherWidget />

                <CurrencyWidget />
                <NewsWidget />

                <TaskWidget />

                
                
            </div>
        </main>
    </div>
</template>

<style scoped>
.dashboard {
    padding: 2rem;
}

main {
    margin-top: 2rem;
}

.widget-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

</style>