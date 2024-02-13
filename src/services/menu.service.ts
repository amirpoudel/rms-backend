import { redisClient } from "../config/redis.config";
import { MenuItem } from "../models/menu.model";

export const getMenuService = async function(restaurant:string) {

    try {
        const cachedMenu = await redisClient.get(`menu:${restaurant}`);
        if(cachedMenu){
            return JSON.parse(cachedMenu);
        }
        const menuCategories = await MenuItem.find({
            restaurant: restaurant,
        },"-__v -restaurant -createdAt -updatedAt").populate({path:'category',select:'name -_id'});


    
        redisClient.set(`menu:${restaurant}`,JSON.stringify(menuCategories));

        return menuCategories;
    } catch (error) {
        throw error;
    }

}



