<template>
    <nav>
        <h2>Employee Dashbaord</h2>
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
    border-bottom: 1px solid #ccc;
}

.links {
    display: flex;
    gap: 1rem;
}

.router-link-active {
    font-weight: bold;
}

</style>