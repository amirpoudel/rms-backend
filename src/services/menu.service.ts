import mongoose, {Schema} from "mongoose";
import { redisClient } from "../config/redis.config";
import { IMenuCategory, MenuCategory, MenuItem } from "../models/menu.model";
import { convertSlug } from "../utils/helper";

interface RestaurantSlugResponse {
    _id: string;
}


//can be optimize
export const checkMenuCategoryService = async function (categoryId:string,restaurantId:mongoose.Schema.Types.ObjectId):Promise<boolean> {

    try {
        const cachedMenuCategory = await redisClient.get(`menuCategory:${restaurantId}:${categoryId}`);
        if(cachedMenuCategory){
            return true;
        }
        const category = await MenuItem.findOne({
            category: categoryId,
            restaurant: restaurantId
        });
        if(!category){
            return false;
        }
        redisClient.set(`menuCategory:${restaurantId}:${categoryId}`,'true');
        return true;
    } catch (error) {
        throw error;
    }

}

export const checkMenuItemService = async function (itemId:string,restaurantId:mongoose.Schema.Types.ObjectId):Promise<boolean> {

    try {
        const cachedMenuItem = await redisClient.get(`menuItem:${restaurantId}:${itemId}`);
        if(cachedMenuItem){
            return true;
        }
        const item = await MenuItem.findOne({
            _id: itemId,
            restaurant: restaurantId
        });
        if(!item){
            return false;
        }
        redisClient.set(`menuItem:${restaurantId}:${itemId}`,'true');
        return true;
    } catch (error) {
        throw error;
    }

}

export const checkRestaurantSlugService = async function (slug:string):Promise<RestaurantSlugResponse|null> {
    try {
        const cachedRestaurantSlug = await redisClient.get(`restaurantSlug:${slug}`);
        if(cachedRestaurantSlug){
            return {
                _id:cachedRestaurantSlug
            
            };
        }
        const restaurantName = convertSlug(slug);
        const restaurant = await MenuItem.findOne({
            name: restaurantName
        })
        if(!restaurant){
            return null;
        }
        redisClient.set(`restaurantSlug:${slug}`,`${restaurant._id}`);
        return {
            _id:restaurant._id.toString()
        }
    } catch (error) {
        throw error;
    }

}


export const createMenuCategoryService = async function (data:IMenuCategory):Promise<IMenuCategory> {
    try {
        const category = await MenuCategory.create({
            restaurant: data.restaurant,
            name:data.name,
            description:data.description,
        });

        return category;
    } catch (error) {
        throw error;
        
 }
}

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


export const getMenuCategoriesService = async function(restaurant:Schema.Types.ObjectId):Promise<IMenuCategory[]> {

    try {
        const cachedMenuCategories = await redisClient.get(`menu:category:${restaurant}`);
        if(cachedMenuCategories){
            return JSON.parse(cachedMenuCategories);
        }
        const menuCategories = await MenuCategory.find({
            restaurant: restaurant,
        },"-__v -restaurant -createdAt -updatedAt");
        redisClient.set(`menu:category:${restaurant}`,JSON.stringify(menuCategories));
        return menuCategories;
    } catch (error) {
        throw error;
    }

}


export const updateMenuCategoryService = async function (categoryId:string,data:IMenuCategory):Promise<IMenuCategory> {

    try {
        const category = await MenuCategory.findOneAndUpdate({
            _id: categoryId,
            restaurant: data.restaurant
        },{
            name:data.name,
            description:data.description,
        },{new:true});
        if(!category){
            throw new Error("Menu Category not found");
        }
        //remove from redis 
        redisClient.del(`menu:caategory:${data.restaurant}`);

        return category;
    } catch (error) {
        throw error;
    }
   
}


export const deleteMenuCategoryService = async function (categoryId:string,restaurantId:Schema.Types.ObjectId):Promise<boolean> {

    try{
        const countItems = await MenuItem.countDocuments({
            category:categoryId,
            restaurant:restaurantId
        })
        if(countItems>0){
            return false;
        }
        const category = await MenuCategory.findOneAndDelete({
            _id:categoryId,
            restaurant:restaurantId
        });

        if(!category){
            return false;
        }
        //remove from redis
        redisClient.del(`menu:category:${restaurantId}`);
        return true;
    }catch(error){
        throw error;
    }

}
