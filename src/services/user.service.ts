
import mongoose, { Schema, mongo } from "mongoose";
import { IRestaurant, Restaurant } from "../models/restaurant.model";
import { IUser, User } from "../models/user.model";
import ApiError from "../utils/handler/ApiError";




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
    _id:string,
    restaurant:string,
    name:string,
    email:string,
    phone:string,
    role:string,
    accessToken:string,
    refreshToken:string,

}

export const registerUserWithRestaurantService = async function (
    restaurant: RestaurantRegister,
    user: UserRegister
): Promise<{
    restaurant: IRestaurant | null,
    owner: IUser | null
}> {
   

    try {
       const  restaurantResponse = await Restaurant.create(
            {
                name: restaurant.name,
                username: restaurant.username,
            }
           
        );
        console.log("I am in registerUserWithRestaurantService",restaurantResponse)
        if(!restaurantResponse){
            return {restaurant:null,owner:null}
        }

        const owner = await User.create(
            {
                restaurant: restaurantResponse?._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                password: user.password
            }
        );
        console.log("I am in registerUserWithRestaurantService",owner)
        if(!owner){
            //delete restaurant if user is not created 
            await Restaurant.findByIdAndDelete(restaurantResponse._id);
            return {restaurant:null,owner:null}
        }
        console.log("I am in registerUserWithRestaurantService",owner)
        return { restaurant: restaurantResponse, owner: owner };
    } catch (error) {
        throw new ApiError(400,"",error);
        
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
            _id:user._id.toString(),
            restaurant: user.restaurant.toString(),
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role,
            accessToken,
            refreshToken,
        }

   } catch (error) {
    throw new ApiError(500, '', error);
   }
}

export const logoutUserService = async function (userId:mongoose.Schema.Types.ObjectId):Promise<boolean>{
    try {
        const user = await User.findById(userId);
        if(!user) {
            throw new ApiError(404, "User not found");
        }
        user.refreshToken = "";
        await user.save();
        return true;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
}

export const forgetPasswordService = async function (data:{email?:string,phone?:string}):Promise<string>{
    const {email,phone} = data;

    try {
        const user = await User.findOne({$or: [{email}, {phone}]});
        if(!user) {
            throw new ApiError(404, "User not found");
        }
        // generate token
        const resetToken = user.generatePasswordResetToken();
        await user.save();
        return resetToken;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
}
