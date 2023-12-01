// signupController.ts
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2/promise'
import { type User } from '../types/types'
import { pool } from '../pool'
import { genSalt, hash } from 'bcrypt'

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' })
    }

    const salt = await genSalt(10)
    const hashedPassword = await hash(password, salt)

    const result = await pool.query(
      'INSERT INTO users (email, hashed_password, salt) VALUES (?, ?, ?)',
      [email, hashedPassword, salt]
    )

    console.log({ result })

    res.status(201).json({ message: 'User registered successfully', result })
  } catch (error) {
    console.error('Error during sign-up:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Authentication successful
    res.status(200).json({ message: 'Login successful' })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
