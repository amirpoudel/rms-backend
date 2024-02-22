import { Restaurant } from "../models/restaurant.model";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/handler/asyncHandler";
import { User } from "../models/user.model";
import { USER_ROLE } from "../constant";
import ApiResponse from "../utils/handler/ApiResponse";
import mongoose from "mongoose";
import ApiError from "../utils/handler/ApiError";
import { convertSlug } from "../utils/helper";

export const checkRestaurantSlug = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
    const restaurantSlug = req.params.restaurantSlug;
    if(!restaurantSlug){
        return res.status(400).json(new ApiError(400, 'Restaurant Slug is required'));
    }
    const restaurantName = convertSlug(restaurantSlug);
    const restaurant = await Restaurant.findOne({name:restaurantName});
   
    if(!restaurant){
        return res.status(404).json(new ApiError(404, 'Restaurant not found'));
    }
    req.body.restaurant = restaurant._id;
    next();
})

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

export const getAllRestaurants = asyncHandler(async (req: Request, res: Response) => {

    

});
