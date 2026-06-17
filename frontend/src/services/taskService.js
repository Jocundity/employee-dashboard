const TASKS_API_URL = 'http://localhost:3000/api/tasks'

export async function getTasks() {
  const response = await fetch(TASKS_API_URL)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch tasks')
  }

  const data = await response.json()

  return data
}

export async function createTask(task) {
  const response = await fetch(TASKS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
