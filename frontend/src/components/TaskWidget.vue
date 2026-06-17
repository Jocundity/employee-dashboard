<script setup>
import { ref, onMounted } from 'vue'
import { getTasks, createTask } from '../services/taskService.js'

const loading = ref(false)
const error = ref('')

const tasks = ref([])
const newTask = ref({
  title: '',
  completed: false,
  dueDate: '',
  priority: '',
})

onMounted(async () => {
  loading.value = true
  error.value = ''

  try {
    tasks.value = await getTasks()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

async function addTask() {
  error.value = ''

  try {
    // Add task to database
    const createdTask = await createTask(newTask.value)

    // Update tasks list with new task
    tasks.value.push(createdTask)

    // Clear form values
    newTask.value = {
      title: '',
      completed: false,
      dueDate: '',
      priority: '',
    }
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <div class="widget">
    <h3>Tasks</h3>

    <!-- Form to add new task -->
    <form @submit.prevent="addTask">
      <label>Title: </label>
      <input type="text" placeholder="Add a new task" v-model="newTask.title" required />
      <label>Due Date: </label>
      <input type="date" v-model="newTask.dueDate" />

      <label>Priority: </label>
      <select v-model="newTask.priority">
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <button type="submit">Add task</button>
    </form>
    <!-- End form -->

    <!-- Display loading, error, or tasks from database-->
    <p v-if="error">{{ error }}</p>
    <p v-else-if="loading">Loading tasks...</p>

    <ul>
      <li v-for="task in tasks" :key="task.id">
        Title: {{ task.title }}
        <span v-if="task.due_date"> Due Date: {{ task.due_date }}</span>
        <span v-if="task.priority"> Priority: {{ task.priority }}</span>
      </li>
    </ul>
    <!-- End tasks data -->
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
