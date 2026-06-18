const AUTH_API_URL = 'http://localhost:3000/api/auth'

export async function registerUser(userData) {
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to register user')
  }

  const data = await response.json()

  return data
}

export async function loginUser(credentials) {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to log in user')
  }

  const data = await response.json()

  return data
}
