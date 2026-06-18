<script setup>
import { ref, onMounted, computed } from 'vue'
import { getTasks, createTask, deleteTask, updateTask, editTask } from '../services/taskService.js'

const loading = ref(false)
const error = ref('')

const tasks = ref([])
const newTask = ref({
  title: '',
  completed: false,
  dueDate: '',
  priority: '',
})
const editingTaskId = ref(null)
const editingTask = ref(null)

// Sort tasks by due date
const sortedTasks = computed(() => {
  return [...tasks.value].sort((a, b) => {
    const hasDateA = a.due_date && typeof a.due_date === 'string' && a.due_date.includes('/')
    const hasDateB = b.due_date && typeof b.due_date === 'string' && b.due_date.includes('/')

    // If a task doesn't have a due date, move it to the end of the list
    if (!hasDateA && hasDateB) return 1
    if (hasDateA && !hasDateB) return -1
    if (!hasDateA && !hasDateB) return 0

    const [dayA, monthA, yearA] = a.due_date.split('/')
    const dateA = new Date(`${yearA}-${monthA}-${dayA}`)

    const [dayB, monthB, yearB] = b.due_date.split('/')
    const dateB = new Date(`${yearB}-${monthB}-${dayB}`)

    return dateA - dateB
  })
})

// Overdue and Due Today reminders
function isOverdue(task) {
  if (!task.due_date || task.completed) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to midnight for accurate comparison

  const [day, month, year] = task.due_date.split('/')
  const taskDueDate = new Date(`${year}-${month}-${day}`)
  taskDueDate.setHours(0, 0, 0, 0)

  return new Date(taskDueDate) < today
}

function dueToday(task) {
  if (!task.due_date || task.completed) return false

  const today = new Date()

  // Format today's date to match 'DD/MM/YYYY'
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()

  const todayString = `${day}/${month}/${year}`

  return task.due_date === todayString
}

// Crud operations
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

async function removeTask(taskId) {
  error.value = ''

  try {
    await deleteTask(taskId)
    tasks.value = tasks.value.filter((task) => task.id !== taskId)
  } catch (err) {
    error.value = err.message
  }
}

async function toggleTaskStatus(task) {
  error.value = ''

  try {
    // Update task completion status in database
    const updatedTask = await updateTask(task.id, !task.completed)

    // Update task completion status in tasks list
    const index = tasks.value.findIndex((task) => task.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index].completed = updatedTask.completed
    }
  } catch (err) {
    error.value = err.message
  }
}

function startEditing(task) {
  editingTaskId.value = task.id

  // Convert DD/MM/YYYY from database into YYYY-MM-DD for the HTML date input
  let htmlFriendlyDate = ''
  if (task.due_date && task.due_date.includes('/')) {
    const [day, month, year] = task.due_date.split('/')
    htmlFriendlyDate = `${year}-${month}-${day}`
  } else {
    htmlFriendlyDate = task.due_date || ''
  }

  editingTask.value = {
    ...task,
    due_date: htmlFriendlyDate,
  }
}

function cancelEdit() {
  editingTaskId.value = null
  editingTask.value = null
}

async function saveTask() {
  error.value = ''

  try {
    // Update task in database
    const updatedTask = await editTask(editingTask.value)

    // Update task in tasks list
    const index = tasks.value.findIndex((task) => task.id === updatedTask.id)

    if (index !== -1) {
      tasks.value[index] = updatedTask
    }

    // Reset editing state
    editingTaskId.value = null
    editingTask.value = null
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
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading">Loading tasks...</p>

    <ul>
      <li v-for="task in sortedTasks" :key="task.id">
        <div v-if="editingTaskId !== task.id">
          <span v-if="isOverdue(task)" class="overdue">Overdue!</span>
          <span v-if="dueToday(task)" class="due-today">Due today!</span>
          <input type="checkbox" :checked="task.completed" @change="toggleTaskStatus(task)" />
          Title: {{ task.title }}
          <span v-if="task.due_date"> Due Date: {{ task.due_date }}</span>
          <span v-if="task.priority"> Priority: {{ task.priority }}</span>
          <button @click="startEditing(task)">Edit</button>
          <button @click="removeTask(task.id)">Delete</button>
        </div>

        <div v-else>
          <input type="text" v-model="editingTask.title" />
          <input type="date" v-model="editingTask.due_date" />
          <select v-model="editingTask.priority">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button @click="saveTask()">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>
      </li>
    </ul>
    <!-- End tasks data -->
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

li {
  list-style: none;
  margin-bottom: 1.25rem;
}

.overdue {
  color: #fff;
  background: #ef4444;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 4px;
}

.due-today {
  color: #fff;
  background: #ef8344;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
