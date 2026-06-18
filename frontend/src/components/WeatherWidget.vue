<script setup>
import { ref, onMounted } from 'vue'
import { getLocation, getWeather } from '../services/weatherService.js'

const weather = ref(null)
const loading = ref(true)
const error = ref('')

const cityInput = ref('Glasgow')
const selectedCity = ref('Glasgow')
const citiesFound = ref([])

onMounted(async () => {
  try {
    const results = await getLocation(cityInput.value)
    if (results && results.length > 0) {
      weather.value = await getWeather(results[0].latitude, results[0].longitude)
    }
  } catch (err) {
    error.value = 'Unable to load weather'
  } finally {
    loading.value = false
  }
})

async function searchCities() {
  // Return early if input is empty
  if (!cityInput.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const results = await getLocation(cityInput.value)

    if (results && results.length > 0) {
      citiesFound.value = results
    } else {
      error.value = 'No cities found'
    }
  } catch (err) {
    error.value = 'Error searching for cities'
  } finally {
    loading.value = false
  }
}

async function searchWeather(city) {
  loading.value = true
  error.value = ''
  selectedCity.value = city.name

  try {
    weather.value = await getWeather(city.latitude, city.longitude)
  } catch (err) {
    error.value = 'Unable to load weather'
  } finally {
    loading.value = false
    citiesFound.value = []
  }
}
</script>

<template>
  <div class="widget">
    <h3>Weather</h3>
    <div class="search-bar">
      <input v-model="cityInput" @keyup.enter="searchCities" placeholder="Enter a city" />
      <button @click="searchCities">Search</button>
    </div>

    <!-- Display cities found if any -->
    <div v-if="citiesFound.length > 0">
      <h4>Choose your city:</h4>
      <ul>
        <li v-for="city in citiesFound" :key="city.id">
          {{ city.name }}, {{ city.country }}, {{ city.admin1 }}
          <span v-if="city.admin2"> {{ city.admin2 }}</span>
          <button @click="searchWeather(city)">Select</button>
        </li>
      </ul>
    </div>

    <!-- Display loading, error, or weather data -->
    <p v-if="loading">Loading weather widget...</p>

    <p v-else-if="error" class="error">
      {{ error }}
    </p>

    <div v-else>
      <h2>{{ selectedCity }}</h2>
      <h2>Temperature: {{ weather.current.temperature }}°C</h2>
      <h2>Wind Speed: {{ weather.current.windSpeed }} km/h</h2>
      <h2>Precipitation: {{ weather.current.precipitation }} mm</h2>

      <h4>7 Day Forecast</h4>

      <ul>
        <li v-for="day in weather.forecast" :key="day.date">
          {{ day.date }}

          <span>High/Low: {{ day.maxTemp }}° / {{ day.minTemp }}°</span>
          <span>Precipitation: {{ day.precipitation }} mm</span>
        </li>
      </ul>
    </div>
    <!-- End weather data -->
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

.error {
  color: #ef4444;
  font-weight: bold;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-bar input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #fcd34d;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #fbbf24;
}

ul {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style-type: none;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

h2 {
  text-align: center;
}
</style>
