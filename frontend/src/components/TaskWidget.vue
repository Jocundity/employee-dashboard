<script setup>
import { ref, onMounted, computed } from 'vue'
import { getTasks, createTask, deleteTask, updateTask, editTask } from '../services/taskService.js'
import { generateTaskBreakdown } from '../services/chatbotService.js'

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

const generatedSubtasks = ref([])
const loadingSubtasks = ref(false)
const selectedParentTask = ref(null)

// Sort tasks by due date
const sortedTasks = computed(() => {
  return [...tasks.value]
    .filter((task) => !task.parent_task_id)
    .sort((a, b) => {
      const hasDateA = a.due_date && typeof a.due_date === 'string' && a.due_date.includes('/')

      const hasDateB = b.due_date && typeof b.due_date === 'string' && b.due_date.includes('/')

      // If a task doesn't have a due date, move it to the end
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

// Generate subtasks for a task using AI assistant
async function generateSubtasks(task) {
  selectedParentTask.value = task

  error.value = ''
  loadingSubtasks.value = true

  try {
    generatedSubtasks.value = await generateTaskBreakdown(task.title, task.due_date)
  } catch (err) {
    error.value = err.message
  } finally {
    loadingSubtasks.value = false
  }
}

async function addSubtaskToTasks(subtask) {
  error.value = ''

  try {
    // Convert DD/MM/YYYY from AI into YYYY-MM-DD for database
    let dbDate = ''
    if (subtask.due_date && subtask.due_date.includes('/')) {
      const [day, month, year] = subtask.due_date.split('/')
      dbDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    } else {
      dbDate = subtask.due_date || ''
    }

    const taskObject = {
      title: subtask.title,
      priority: subtask.priority || 'medium',
      completed: false,
      dueDate: dbDate,
      parent_task_id: selectedParentTask.value.id,
    }

    // Add subtask to database
    const createdSubtask = await createTask(taskObject)

    // Add the created subtask to the tasks list
    tasks.value.push(createdSubtask)

    // Remove the subtask from the generatedSubtasks list after adding it to tasks
    setTimeout(() => {
      generatedSubtasks.value = generatedSubtasks.value.filter((s) => s.title !== subtask.title)
    }, 0)
  } catch (err) {
    error.value = err.message
  }
}

async function addAllSubtasks() {
  error.value = ''
  for (const subtask of generatedSubtasks.value) {
    await addSubtaskToTasks(subtask)
  }
  generatedSubtasks.value = [] // Clear the generated subtasks after adding
}

function getSubtasks(parentTaskId) {
  return tasks.value.filter((task) => task.parent_task_id === parentTaskId)
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
          <div v-if="isOverdue(task)" class="overdue">Overdue!</div>
          <div v-if="dueToday(task)" class="due-today">Due today!</div>
          <div class="task-details">
            <span class="checkbox-title">
              <input type="checkbox" :checked="task.completed" @change="toggleTaskStatus(task)" />
              <strong>Title: </strong> {{ task.title }}
            </span>
            <span v-if="task.due_date"><strong>Due Date: </strong> {{ task.due_date }}</span>
            <span v-if="task.priority"
              ><strong>Priority: </strong>
              <span :class="task.priority">{{ task.priority }}</span></span
            >
          </div>
          <div class="task-actions">
            <button @click="startEditing(task)">Edit</button>
            <button @click="generateSubtasks(task)" :disabled="loadingSubtasks">
              Generate Subtasks
            </button>
            <button @click="removeTask(task.id)">Delete</button>
          </div>

          <ul v-if="getSubtasks(task.id).length" class="subtask-list">
            <li v-for="subtask in getSubtasks(task.id)" :key="subtask.id" class="subtask">
              <div v-if="editingTaskId !== subtask.id">
                <div class="task-details">
                  <span class="checkbox-title">
                    <input
                      type="checkbox"
                      :checked="subtask.completed"
                      @change="toggleTaskStatus(subtask)"
                    />
                    <strong>Title:</strong> {{ subtask.title }}
                  </span>

                  <span v-if="subtask.due_date">
                    <strong>Due Date:</strong> {{ subtask.due_date }}
                  </span>

                  <span v-if="subtask.priority">
                    <strong>Priority: </strong>
                    <span :class="subtask.priority">
                      {{ subtask.priority }}
                    </span>
                  </span>
                </div>

                <div class="task-actions">
                  <button @click="startEditing(subtask)">Edit</button>
                  <button @click="removeTask(subtask.id)">Delete</button>
                </div>
              </div>

              <div v-else>
                <div class="edit-inputs">
                  <input type="text" v-model="editingTask.title" />
                  <input type="date" v-model="editingTask.due_date" />

                  <select v-model="editingTask.priority">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div class="task-actions">
                  <button @click="saveTask()">Save</button>
                  <button @click="cancelEdit()">Cancel</button>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div v-else>
          <div class="edit-inputs">
            <input type="text" v-model="editingTask.title" />
            <input type="date" v-model="editingTask.due_date" />
            <select v-model="editingTask.priority">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div class="task-actions">
            <button @click="saveTask()">Save</button>
            <button @click="cancelEdit">Cancel</button>
          </div>
        </div>
      </li>
    </ul>
    <!-- End tasks data -->

    <p v-if="loadingSubtasks">Generating subtasks...</p>
    <div v-if="generatedSubtasks.length > 0">
      <h4>AI Suggested Subtasks:</h4>
      <ul>
        <li v-for="(subtask, index) in generatedSubtasks" :key="index">
          <div class="task-details">
            <span><strong>Title: </strong>{{ subtask.title }}</span>
            <span><strong>Due Date: </strong>{{ subtask.due_date }}</span>
            <span
              ><strong>Priority: </strong
              ><span :class="subtask.priority">{{ subtask.priority }}</span></span
            >
            <button @click="addSubtaskToTasks(subtask)">Add to Task List</button>
          </div>
        </li>
      </ul>
      <div class="add-all">
        <button @click="addAllSubtasks">Add All Subtasks to Task List</button>
      </div>
    </div>
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

.high {
  color: #ef4444;
  font-weight: bold;
}

.medium {
  color: #fbbf24;
  font-weight: bold;
}

.low {
  color: #10b981;
  font-weight: bold;
}

form {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

input {
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

select {
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

ul {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  gap: 0.5rem;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  justify-content: space-between;
}

.task-details {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 0.5rem;
}

.checkbox-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-actions button {
  flex: 1;
  text-align: center;
}

.edit-inputs {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: space-between;
}

.overdue {
  color: #fff;
  background: #ef4444;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.due-today {
  color: #fff;
  background: #ef8344;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.add-all {
  margin-top: 1rem;
  text-align: center;
}

.subtask {
  background: #fffbeb;
  margin: 0.5rem 1rem 0 1rem;
  border: none;
}
</style>
