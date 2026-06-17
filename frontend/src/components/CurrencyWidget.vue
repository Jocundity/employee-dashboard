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

    <div>
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
    <p v-if="error">{{ error }}</p>

    <div v-if="conversion">
      <h4>Conversion Result:</h4>
      <p>
        {{ conversion.amount }} {{ conversion.fromCurrency }} = {{ conversion.result }}
        {{ conversion.toCurrency }}
      </p>
      <p>Exchange Rate: {{ conversion.exchangeRate }}</p>
    </div>

    <!-- End currency data -->
  </div>
</template>

<style scoped>
.widget {
  border: 5px solid #fcd34d;
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
}
</style>
