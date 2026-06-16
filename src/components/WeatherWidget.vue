<script setup>
import { ref, onMounted } from 'vue'
import { getLocation, getWeather } from '../services/weatherService.js'

const weather = ref(null);
const loading = ref(true)
const error = ref('')

const cityInput= ref('Glasgow')
const selectedCity = ref('Glasgow')
const citiesFound = ref([])

onMounted( async () => {
    try {
        const results = await getLocation(cityInput.value);
        if (results && results.length > 0) {
            weather.value = await getWeather(results[0].latitude, results[0].longitude)
        }
    }
    catch (err) {
        error.value = 'Unable to load weather'
    } finally {
        loading.value = false;
    }
})

async function searchCities() {
    // Return early if input is empty
    if (!cityInput.value.trim()) return

    loading.value = true;
    error.value = '';

    try {
        const results = await getLocation(cityInput.value);

        if (results && results.length > 0) {
            citiesFound.value = results;
        } else {
           error.value = 'No cities found'; 
        }
    }
    catch(err) {
        error.value = 'Error searching for cities'
    }
    finally {
        loading.value = false;
    }
}

async function searchWeather(city) {
    loading.value = true;
    error.value = '';
    selectedCity.value = city.name

    try {
        weather.value = await getWeather(city.latitude, city.longitude);
    }
    catch (err) {
        error.value = 'Unable to load weather'
    } finally {
        loading.value = false;
        citiesFound.value = []
    }
}

</script>

<template>
    <div class="widget">
        <h3>Weather</h3>
        <input
            v-model="cityInput"
            @keyup.enter="searchCities"
            placeholder="Enter a city"
        />
        <button @click="searchCities">
            Search
        </button>

        <!-- Display cities found if any -->
         <div v-if="citiesFound.length > 0">
            <h4>Choose your city:</h4>
            <ul>
                <li v-for="city in citiesFound" :key="city.id">
                    {{ city.name }}, {{ city.country}}, {{  city.admin1 }} <span v-if="city.admin2">, {{ city.admin2 }}</span>
                    <button @click="searchWeather(city)">
            Select
        </button>
                </li>
            </ul>
         </div>

        <!-- Display loading, error, or weather data -->
        <p v-if="loading">
            Loading weather widget...
        </p>

        <p v-else-if="error">
            {{  error }}
        </p>

        <div v-else>
            <p>{{ selectedCity }}</p>
            <p>Temperature: {{ weather.current.temperature }}°C</p>
            <p>Wind Speed: {{ weather.current.windSpeed }} km/h</p>
            <p>Precipitation: {{ weather.current.precipitation }} mm</p>

            <h4>7 Day Forecast</h4>

<ul>
  <li
    v-for="day in weather.forecast"
    :key="day.date"
  >
    {{ day.date }}

    High/Low: {{ day.maxTemp }}° /
    {{ day.minTemp }}°

    Precipitation:
    {{ day.precipitation }} mm
  </li>
</ul>
        </div>
        <!-- End weather data -->
        
    </div>
</template>

<style scoped>
.widget {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
}
</style>