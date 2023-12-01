// signupController.ts
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2/promise'
import { pool } from '../pool'
import { genSalt } from 'bcrypt'
import md5 from 'md5'

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
    const hashedPassword = md5(password + salt)

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
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = rows[0]
    const hashedPassword = user.hashed_password
    const salt = user.salt

    const passwordMatch = md5(password + salt) === hashedPassword

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    res.status(200).json({ message: 'Login successful' })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
