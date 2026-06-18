<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  router.push('/')
}
</script>

<template>
  <nav>
    <h2><RouterLink to="/dashboard">Employee Dashboard</RouterLink></h2>
    <div class="links">
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
      <button @click="logout">Log out</button>
    </div>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 10px solid #fcd34d;
  color: #fcd34d;
  background: #334155;
}

.links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

a {
  color: #fffbeb;
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #fcd34d;
}

h2 a {
  color: #fcd34d;
}

.router-link-active {
  font-weight: bold;
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
