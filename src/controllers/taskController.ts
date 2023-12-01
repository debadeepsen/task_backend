import express, { Request, Response } from 'express'
import { pool } from '../pool'
import { Task } from '../types/types'
import { RowDataPacket } from 'mysql2'

export const addTask = async (req: Request, res: Response) => {
  const { title, description, completed } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  try {
    const [result] = await pool.query<RowDataPacket[]>(
      'INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)',
      [title, description, completed || false]
    )

    const taskId = Array.isArray(result) ? result[0].insertId : undefined

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
