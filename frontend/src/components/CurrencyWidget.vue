<script setup>
import { ref, onMounted } from 'vue'
import { getExchangeRate } from '../services/currencyService.js'

const amount = ref(100)
const fromCurrency = ref('GBP')
const toCurrency = ref('USD')

const currencies = ref([
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'BGN', name: 'Bulgarian Lev' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'ILS', name: 'Israeli New Shekel' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'ISK', name: 'Icelandic Króna' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'USD', name: 'United States Dollar' },
  { code: 'ZAR', name: 'South African Rand' },
])

const conversion = ref(null)
const loading = ref(false)
const error = ref('')

async function convertCurrency() {
  conversion.value = null
  loading.value = true
  error.value = ''

  try {
    conversion.value = await getExchangeRate(fromCurrency.value, toCurrency.value, amount.value)
  } catch (err) {
    error.value = 'Error converting currency'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="widget">
    <h3>Currency</h3>

    <div class="converter">
      <label for="amount">Amount:</label>
      <input type="number" min="0" v-model.number="amount" />

      <label for="fromCurrency">From:</label>
      <select v-model="fromCurrency">
        <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
          {{ currency.code }} - {{ currency.name }}
        </option>
      </select>

      <label for="toCurrency">To:</label>
      <select v-model="toCurrency">
        <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
          {{ currency.code }} - {{ currency.name }}
        </option>
      </select>
      <button @click="convertCurrency">Convert</button>
    </div>

    <!-- Display loading, error, or currency data -->
    <p v-if="loading">Loading currency widget...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="conversion">
      <h4>Conversion Result:</h4>
      <div class="result">
        <h2>
          {{ conversion.amount }} {{ conversion.fromCurrency }} = {{ conversion.result }}
          {{ conversion.toCurrency }}
        </h2>
        <h2>Exchange Rate: {{ conversion.exchangeRate }}</h2>
      </div>
    </div>

    <!-- End currency data -->
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

.converter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

input {
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

select {
  margin: 0.5rem 0;
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

.result {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
