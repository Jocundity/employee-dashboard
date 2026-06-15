<script setup>
import { ref } from 'vue'

const tasks = ref([
    {
        title: 'Learn Vue',
        completed: false,
        dueDate: '06/16/2026',
        priority: 'high'
    },
    {
        title: 'Connect APIs',
        completed: true,
        dueDate: '06/17/2026',
        priority: 'medium'
    },
    {
        title: 'Learn Express',
        completed: false,
        dueDate: '06/18/2026',
        priority: 'low'
    }
]);
const newTask = ref({
    title: '',
    completed: false,
    dueDate: '',
    priority: ''
});

function addTask() {
    if (
        newTask.value.title.trim() !== '' &&
        newTask.value.dueDate !== '' &&
        newTask.value.priority !== ''
    ) {
        tasks.value.push(newTask.value);
        newTask.value = {
        title: '',
        completed: false,
        dueDate: '',
        priority: ''
        };
    }

}

</script>

<template>
    <div class="widget">
        <h3>Tasks</h3>
        <label>Title: </label>
        <input type="text" 
        placeholder="Add a new task"
        v-model="newTask.title"
        required
        />
        <label>Due Date: </label>
        <input type="date" 
        v-model="newTask.dueDate"
        required
        />
        <label>Priority: </label>
        <select v-model="newTask.priority" required>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
        </select>
        <button @click="addTask">Add task</button>
        <ul>
            <li 
            v-for="task in tasks"
            :key="task.title"
            >
                Title: {{  task.title }}
                Due Date: {{  task.dueDate }}
                Priority: {{  task.priority }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
.widget {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
}
</style>