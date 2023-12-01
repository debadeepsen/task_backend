// src/app.ts
import express, { Request, Response } from 'express'
import { signUp } from './controllers/userController'

const app = express()
const port = 8080

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: `Server is running on port ${port}` })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

app.post('/signup', signUp)
