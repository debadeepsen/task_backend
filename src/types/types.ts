export type User = {
  id: number
  username: string
  email: string
  password: string
}

export type Task = {
  id: number
  title: string
  description: string | null
  completed: boolean
  deleted: boolean
}
