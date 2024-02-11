import { Restaurant } from "../models/restaurant.model";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { USER_ROLE } from "../constant";
import ApiResponse from "../utils/ApiResponse";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError";


export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantName, ownerName, ownerEmail, ownerPhone, ownerPassword } = req.body;

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

});
