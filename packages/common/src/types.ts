import { z } from "zod"

export const SignUpSchema = z.object({
    username:z.string().min(2).max(50),
    email:z.string().email(),
    password:z.string().min(6)
})

export const SignInSchema = z.object({
    identifier:z.string().min(2).max(50), 
    password:z.string().min(6)
})

export const CreateRoomSchema = z.object({
    name:z.string().min(2).max(50), 
  
})

