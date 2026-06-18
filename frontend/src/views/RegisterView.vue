<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../services/authService'

const router = useRouter()

const error = ref('')
const loading = ref(false)

const name = ref('')
const email = ref('')
const password = ref('')

async function registerUserHandler() {
  error.value = ''
  loading.value = true

  if (!name.value || !email.value || !password.value) {
    error.value = 'Please enter your name, email, and password.'
    loading.value = false
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long.'
    loading.value = false
    return
  }

  try {
    const authData = await registerUser({
      name: name.value,
      email: email.value,
      password: password.value,
    })

    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData.user))

    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=account_box"
  />

  <div class="register-container">
    <div class="register">
      <h1>
        <span class="material-symbols-outlined"> account_box </span>
        <br />
        Register
      </h1>

      <form @submit.prevent="registerUserHandler">
        <input v-model="name" type="text" placeholder="Name" />
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
  font-size: 4rem;
}

.register-container {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}

.register {
  width: 100%;
  max-width: 400px;
  height: 100%;
  margin: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error {
  color: #ef4444;
  font-weight: bold;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

form input {
  flex: 1;
}

h1 {
  text-align: center;
}

input {
  padding: 0.5rem;
  margin: 0.5rem 0;
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
</style>
