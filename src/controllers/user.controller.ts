import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { COOKIE_OPTIONS, USER_ROLE } from "../constant";
import { Restaurant } from "../models/restaurant.model";
import { Request, Response } from "express";
import _ from "lodash";
import { loginUserService, logoutUserService, registerUserWithRestaurantService } from "../services/user.service";
import { UserRequest } from "../types/express.type";

export const registerUserWithRestaurant = asyncHandler( async (req:Request, res:Response) => {
    const { restaurantName,restaurantUsername, ownerName, ownerEmail, ownerPhone, ownerPassword } = req.body

    if(!restaurantName ||!restaurantUsername || !ownerName || !ownerEmail || !ownerPhone || !ownerPassword) {
        throw new ApiError(400, "All fields are required");
    }
   
    const registerUser = await registerUserWithRestaurantService({
        name:restaurantName,
        username:restaurantUsername
    },{
        name:ownerName,
        email:ownerEmail,
        phone:ownerPhone,
        role:USER_ROLE.OWNER,
        password:ownerPassword
    })
    
    
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

    let response = await loginUserService({email,phone,password});

    return res.status(200).cookie("accessToken",{ path: "/", httpOnly: true, secure: true, sameSite: "none" })
                        .cookie("refreshToken",{ path: "/", httpOnly: true, secure: true, sameSite: "none" })
                        .json(new ApiResponse(200,response,"Login successful"))

})

export const logoutUser = asyncHandler( async (req:UserRequest, res:Response) => {
    res.clearCookie("accessToken", { path: "/", httpOnly: true, secure: true, sameSite: "none" });
    res.clearCookie("refreshToken", { path: "/", httpOnly: true, secure: true, sameSite: "none" });
    await logoutUserService(req.user._id);
    return res.status(200).json(new ApiResponse(200,null,"Logout successful"));
})


