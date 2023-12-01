// src/app.ts
import express, { Request, Response } from 'express'
import { login, signUp } from './controllers/userController'
import { addTask, deleteTask, editTask, getTasks } from './controllers/taskController'

const app = express()
const port = 8080

app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: `Server is running on port ${port}` })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// signup and login
app.post('/signup', signUp)
app.post('/login', login)

// tasks
app.get('/tasks', getTasks)
app.post('/tasks', addTask)
app.put('/tasks/:id', editTask)
app.delete('/tasks/:id', deleteTask)