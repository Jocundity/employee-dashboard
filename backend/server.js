import express from 'express'
import cors from 'cors'
import pool from './db/connection.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Employee Dashboard API')
})

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
       title,
       completed,
       priority,
       TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date
      FROM tasks
      ORDER BY id;
      `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Failed to fetch tasks from the database',
    })
  }
})

app.post('/api/tasks', async (req, res) => {
  const { title, dueDate: due_date, priority } = req.body

  // Validate the input data
  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' })
  }

  const validPriorities = ['low', 'medium', 'high']
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority value' })
  }

  // Insert the new task into the database
  try {
    const result = await pool.query(
      `
      INSERT INTO tasks (title, due_date, priority)
      VALUES ($1, $2, $3)
      RETURNING id, title, completed, priority, TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date;
      `,
      [title, due_date === '' ? null : due_date, priority === '' ? null : priority],
    )

    res.status(201).json(result.rows[0]) // Return the task
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: 'Failed to create a new task in the database',
    })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
