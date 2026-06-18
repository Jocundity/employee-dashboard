const TASKS_API_URL = 'http://localhost:3000/api/tasks'

export async function getTasks() {
  const token = localStorage.getItem('token')

  const response = await fetch(TASKS_API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch tasks')
  }

  const data = await response.json()

  return data
}

export async function createTask(task) {
  const token = localStorage.getItem('token')

  const response = await fetch(TASKS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create task')
  }

  const data = await response.json()

  return data
}

export async function deleteTask(taskId) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to delete task')
  }
}

export async function updateTask(taskId, completed) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${TASKS_API_URL}/${taskId}/completed`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ completed }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update task')
  }

  const data = await response.json()

  return data
}

export async function editTask(task) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${TASKS_API_URL}/${task.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: task.title,
      dueDate: task.due_date,
      priority: task.priority,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update task')
  }

  const data = await response.json()

  return data
}
