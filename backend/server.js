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
      parent_task_id,
      title,
      completed,
      priority,
      TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date
      FROM tasks
      ORDER BY due_date ASC;
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
  const { title, dueDate: due_date, priority, parent_task_id } = req.body

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
      INSERT INTO tasks (title, due_date, priority, parent_task_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, parent_task_id, title, completed, priority, TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date;
      `,
      [
        title,
        due_date === '' ? null : due_date,
        priority === '' ? null : priority,
        parent_task_id === '' ? null : parent_task_id,
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

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id])

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

app.patch('/api/tasks/:id', async (req, res) => {
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
      WHERE id = $4
      RETURNING id, title, completed, priority, TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date;
      `,
      [title, due_date === '' ? null : due_date, priority === '' ? null : priority, id],
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

app.patch('/api/tasks/:id/completed', async (req, res) => {
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
      WHERE id = $2
      RETURNING id, title, completed, priority, TO_CHAR(due_date, 'DD/MM/YYYY') AS due_date;
      `,
      [completed, id],
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
