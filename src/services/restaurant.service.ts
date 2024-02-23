import { IRestaurant, Restaurant } from '../models/restaurant.model';
import { redisClient } from '../config/redis.config';
import mongoose from 'mongoose';
import ApiError from '../utils/handler/ApiError';

interface RestaurantSearch {
    name?: string | undefined;
    location?: string | undefined;
    cuisine?: string | undefined;
}

export const getAllRestaurantService = async (
    condition: RestaurantSearch,
    limit: number,
    offset: number
) => {
    try {
        const query: { name?: any } = {};
        if (condition.name) {
            query.name = { $regex: condition.name, $options: 'i' };
        }

        const restaurants = await Restaurant.find(query, { 'name':1, 'profileImage':1 , '_id':0 })
            .limit(limit)
            .skip(offset);
        return restaurants;
    } catch (error) {
        throw error
    }
};

//todo expires redis cache
export const updateRestaurantService = async (
    restaurantId: string,
    restaurantData: IRestaurant
):Promise<IRestaurant|null> => {
    try {

        const restaurant = await Restaurant.findByIdAndUpdate(
           { _id:restaurantId},
            restaurantData,
            { new: true }
        );


        return restaurant;
    } catch (error) {
        throw error;
    }
};
