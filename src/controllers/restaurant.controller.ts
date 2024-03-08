import { Restaurant } from "../models/restaurant.model";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/handler/asyncHandler";
import { User } from "../models/user.model";
import { USER_ROLE } from "../constant";
import ApiResponse from "../utils/handler/ApiResponse";
import mongoose from "mongoose";
import ApiError from "../utils/handler/ApiError";
import { convertSlug, getLimitAndOffset } from "../utils/helper";
import { getAllRestaurantService } from "../services/restaurant.service";
import { UserRequest } from "../types/express.type";
import { uploadImageToS3 } from "../utils/aws/s3.aws";

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

    const searchQuery = req.query?.search;
    console.log(req.query);
    const {limit,offset} = getLimitAndOffset(req.query);
    console.log("I am in getAllRestaurants",searchQuery,limit,offset);
    const condition = {
        name:searchQuery as string,
    }
    const restaurants = await getAllRestaurantService(condition,limit,offset);
    if(restaurants.length === 0){
        throw new ApiError(404, 'No restaurants found');
    }
    return res.status(200).json(new ApiResponse(200, restaurants, 'Restaurants found'));

});

export const updateRestaurantImage = asyncHandler(async (req: UserRequest, res: Response) => {
    const restaurantId = req.user.restaurant;

    const restaurantImage = req?.file;
    if(!restaurantImage){
        throw new ApiError(400, 'Image is required');
    }
    const restaurant = await Restaurant.findById(restaurantId);
    if(!restaurant){
        throw new ApiError(404, 'Restaurant not found');
    }
    const oldImageLink = restaurant.profileImage;

    uploadImageToS3(restaurantImage,oldImageLink).then(async (imageUrl):Promise<void>=> {
        if(!oldImageLink){
            restaurant.profileImage = imageUrl as string;
            await restaurant.save();
        }
    })
    return res.status(200).json(new ApiResponse(200, null, 'Restaurant image updated successfully'));
})

export const updateRestaurant = asyncHandler(async (req: UserRequest, res: Response) => {
    const restaurantId = req.user.restaurant;
    const { restaurantName } = req.body;
    if(!restaurantName){
        throw new ApiError(400, 'Restaurant name is required');
    }
    const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, {name:restaurantName}, {new:true});
    if(!restaurant){
        throw new ApiError(404, 'Restaurant not found');
    }
    return res.status(200).json(new ApiResponse(200, restaurant, 'Restaurant updated successfully'));
})