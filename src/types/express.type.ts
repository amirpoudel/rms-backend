import { Request } from 'express'
import mongoose from 'mongoose'

interface User {
    _id: mongoose.Types.ObjectId,
    restaurant:mongoose.Types.ObjectId,
    email: string, 
    name: string,
    role: string,

}

interface JwtPayload {
    _id: mongoose.Types.ObjectId,
    restaurant:mongoose.Types.ObjectId,
    email: string, 
    name: string,
    role: string,
}

interface UserRequest extends Request {
    file: any

    user:User
}







export type { UserRequest,JwtPayload }