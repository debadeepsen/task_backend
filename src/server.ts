// src/app.ts
import express, { Request, Response } from 'express'
import { login, signUp } from './controllers/userController'
import { addTask } from './controllers/taskController'

const app = express()
const port = 8080

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: `Server is running on port ${port}` })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// signup and login
app.post('/signup', signUp)
app.post('/login', login)

// tasks
app.post('/task', addTask)