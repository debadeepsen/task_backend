import express, { Request, Response } from 'express'
import { pool } from '../pool'
import { RowDataPacket } from 'mysql2'

export const getTasks = async (req: Request, res: Response) => {
  try {
    const [tasks] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tasks WHERE deleted = 0 AND email = ?',
      [req.query?.email]
    )

    res.status(200).json(tasks)
  } catch (error) {
    console.error('Error retrieving tasks:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const addTask = async (req: Request, res: Response) => {
  const { email, title } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (email, title, completed) VALUES (?, ?, ?)',
      [email, title, false]
    )

    const insertResult = result as {
      insertId: number
    }

    console.log(result)

    const taskId = insertResult.insertId

    if (taskId !== undefined) {
      res.status(201).json({ id: taskId, message: 'Task added successfully' })
    } else {
      res.status(500).json({ error: 'Failed to retrieve task ID' })
    }
  } catch (error) {
    console.error('Error adding task:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const editTask = async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id, 10)
  const { title, description, completed } = req.body

  if (isNaN(taskId) || !title) {
    return res.status(400).json({ error: 'Invalid task ID or missing title' })
  }

  try {
    const [existingTasks] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    )

    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
      [title, description, completed || false, taskId]
    )

    res.status(200).json({ id: taskId, message: 'Task updated successfully' })
  } catch (error) {
    console.error('Error editing task:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id, 10)

  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task ID' })
  }

  try {
    const [existingTasks] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    )

    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    await pool.query('UPDATE tasks SET deleted = 1 WHERE id = ?', [taskId])

    res
      .status(200)
      .json({ id: taskId, message: 'Task soft deleted successfully' })
  } catch (error) {
    console.error('Error soft deleting task:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
