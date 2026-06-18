import 'dotenv/config'
import jwt from 'jsonwebtoken'
import express from 'express'
import cors from 'cors'
import pool from './db/connection.js'
import bcrypt from 'bcrypt'
import authenticate from './middleware/authenticate.js'

const app = express()

app.use(cors())
app.use(express.json())

// Auth API Endpoints
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body

  // Validate the input data
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }

  // Save user in database with hashed password
  try {
    // Check if the email already exists
    const existingUser = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email;
      `,
      [name, email, passwordHash],
    )

    const user = result.rows[0]

    // Generate a JWT token for the user
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      },
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: 'Failed to create user',
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  // Validate the input data
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])

    const user = result.rows[0]

    // Check if the user exists and the password is correct
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    // Generate a JWT token for the user
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      },
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: 'Failed to log in',
    })
  }
})

// Tasks API Endpoints
app.get('/api/tasks', authenticate, async (req, res) => {
  const userId = req.user.userId

  try {
    const result = await pool.query(
      `
      SELECT
      id,
      parent_task_id,
      title,
      completed,
      priority,
      TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date
      FROM tasks
      WHERE user_id = $1
      ORDER BY due_date ASC;
      `,
      [userId],
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Failed to fetch tasks from the database',
    })
  }
})

app.post('/api/tasks', authenticate, async (req, res) => {
  const { title, dueDate: due_date, priority, parent_task_id } = req.body
  const userId = req.user.userId

  // Validate the input data
  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' })
  }

  if (due_date && isNaN(Date.parse(due_date))) {
    return res.status(400).json({
      error: 'Invalid due date',
    })
  }

  const validPriorities = ['low', 'medium', 'high']
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority value' })
  }

  // Insert the new task into the database
  try {
    const result = await pool.query(
      `
      INSERT INTO tasks (title, due_date, priority, parent_task_id, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, parent_task_id, title, completed, priority, TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date;
      `,
      [
        title,
        due_date === '' ? null : due_date,
        priority === '' ? null : priority,
        parent_task_id === '' ? null : parent_task_id,
        userId,
      ],
    )

    res.status(201).json(result.rows[0]) // Return the task
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: 'Failed to create a new task in the database',
    })
  }
})

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  const userId = req.user.userId

  const { id } = req.params

  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ])

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Task not found',
      })
    }

    res.status(200).json({
      message: 'Task deleted successfully',
    })
  } catch (err) {
    console.error(err)
  }
})

app.patch('/api/tasks/:id', authenticate, async (req, res) => {
  const userId = req.user.userId

  const { id } = req.params
  const { title, dueDate: due_date, priority } = req.body

  // Validate the input data
  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' })
  }

  if (due_date && isNaN(Date.parse(due_date))) {
    return res.status(400).json({
      error: 'Invalid due date',
    })
  }

  const validPriorities = ['low', 'medium', 'high']
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority value' })
  }

  // Update the task in the database
  try {
    const result = await pool.query(
      `
      UPDATE tasks
      SET title = $1, due_date = $2, priority = $3
      WHERE id = $4 AND user_id = $5
      RETURNING id, title, completed, priority, TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date;
      `,
      [title, due_date === '' ? null : due_date, priority === '' ? null : priority, id, userId],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Task not found',
      })
    }

    res.json(result.rows[0]) // Return the updated task
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: 'Failed to update the task in the database',
    })
  }
})

app.patch('/api/tasks/:id/completed', authenticate, async (req, res) => {
  const userId = req.user.userId

  const { id } = req.params
  const { completed } = req.body

  // Validate the input data
  if (typeof completed !== 'boolean') {
    return res.status(400).json({
      error: 'Invalid completed value',
    })
  }

  // Update the task's completed status in the database
  try {
    const result = await pool.query(
      `
      UPDATE tasks
      SET completed = $1
      WHERE id = $2 AND user_id = $3
      RETURNING id, title, completed, priority, TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date;
      `,
      [completed, id, userId],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Task not found',
      })
    }

    res.json(result.rows[0]) // Return the updated task
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: 'Failed to update the task in the database',
    })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
