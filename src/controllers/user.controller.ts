import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { COOKIE_OPTIONS, USER_ROLE } from "../constant";
import { Restaurant } from "../models/restaurant.model";
import { Request, Response } from "express";
import _ from "lodash";

export const registerUserWithRestaurant = asyncHandler( async (req:Request, res:Response) => {
    const { restaurantName, ownerName, ownerEmail, ownerPhone, ownerPassword } = req.body

    if(!restaurantName || !ownerName || !ownerEmail || !ownerPhone || !ownerPassword) {
        throw new ApiError(400, "All fields are required");
    }
   
        const restaurant = await Restaurant.create(
            {
                name: restaurantName,
            }
        );
        
        const owner = await User.create(
            {
                restaurant: restaurant._id,
                name: ownerName,
                email: ownerEmail,
                phone: ownerPhone,
                role: USER_ROLE.OWNER,
                password: ownerPassword
            },
        );
        return res.status(201).json(
            new ApiResponse(201, null, "Restaurant and owner created successfully")
        );
})


export const loginUser = asyncHandler( async (req:Request, res:Response) => {
    const {email,phone,password} = req.body;

    if(!email && !phone) {
        throw new ApiError(400, "Email or phone is required");
    }
    if(!password) {
        throw new ApiError(400, "Password is required");
    }

    // find user by email or phone

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
    let response = _.omit(user.toJSON(), "password","__v","refreshToken");

    return res.status(200).cookie("accessToken",accessToken,COOKIE_OPTIONS)
                        .cookie("refreshToken",refreshToken,COOKIE_OPTIONS)
                        .json(new ApiResponse(200,response,"Login successful"))

})

export const logoutUser = asyncHandler( async (req:Request, res:Response) => {
    res.clearCookie("accessToken",COOKIE_OPTIONS);
    res.clearCookie("refreshToken",COOKIE_OPTIONS);
    return res.status(200).json(new ApiResponse(200,null,"Logout successful"));
})

