
import mongoose, { mongo } from "mongoose";
import { Restaurant } from "../models/restaurant.model";
import { User } from "../models/user.model";
import ApiError from "../utils/ApiError";



interface RestaurantRegister {
    name:string,
    username:string,
}
interface UserRegister  {
    name:string,
    email:string,
    phone:string,
    role:string,
    password:string,
}

interface UserLogin{
    phone?:string,
    email?:string,
    password:string,
}

interface UserLoginResponse{
    _id:mongoose.Types.ObjectId,
    restaurant: mongoose.Schema.Types.ObjectId,
    name:string,
    email:string,
    phone:string,
    role:string,
    accessToken:string,
    refreshToken:string,

}

export const registerUserWithRestaurantService = async function (restaurant: RestaurantRegister, user: UserRegister):Promise<boolean> {
    const session = await Restaurant.startSession();

    try {
        await session.withTransaction(async () => {
            const restaurantResponse = await Restaurant.create(
                [{
                    name: restaurant.name,
                    username: restaurant.username,
                }],
                { session }
            );
            
            const owner = await User.create(
                [{
                    restaurant: restaurantResponse[0]?._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    password: user.password
                }],
                { session }
            );
        
        });

        
        await session.commitTransaction();
       
        await session.endSession();
        return true

    } catch (error) {
        console.error("Something went wrong with the transaction", error);
        session.endSession();
        throw error;
    }
}


export const loginUserService = async function (data:UserLogin):Promise<UserLoginResponse>{
    const {email, phone, password} = data;
   try {
     const user = await User.findOne({$or: [{email}, {phone}]});
     if(!user) {
         throw new ApiError(404, "User not found");
     }
 
     // check password
     const isPasswordMatch = await user.comparePassword(password);
     if(!isPasswordMatch) {
         throw new ApiError(400, "Password is incorrect");
     }
 
     const accessToken:string = user.generateAccessToken();
     const refreshToken:string = user.generateRefreshToken();
     //save refresh token in db
     user.refreshToken = refreshToken;
     await user.save();
     
    return {
            _id:user._id,
            restaurant: user.restaurant,
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role,
            accessToken,
            refreshToken,
        }

   } catch (error) {
    throw error;
   }
}

export const logoutUserService = async function (userId:mongoose.Types.ObjectId):Promise<boolean>{
    try {
        const user = await User.findById(userId);
        if(!user) {
            throw new ApiError(404, "User not found");
        }
        user.refreshToken = "";
        await user.save();
        return true;
    } catch (error) {
        throw error;
    }
}


