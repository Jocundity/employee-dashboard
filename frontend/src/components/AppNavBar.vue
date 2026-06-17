<template>
  <nav>
    <h2>Employee Dashboard</h2>
    <div class="links">
      <RouterLink to="/">Dashboard</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
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
}

a {
  color: #fffbeb;
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #fcd34d;
}

.router-link-active {
  font-weight: bold;
}
</style>
