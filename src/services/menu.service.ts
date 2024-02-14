import mongoose, {Schema} from "mongoose";
import { redisClient } from "../config/redis.config";
import { IMenuCategory, IMenuItem, MenuCategory, MenuItem } from "../models/menu.model";
import { convertSlug, convertToPlainObject } from "../utils/helper";
import { Restaurant } from "../models/restaurant.model";

interface RestaurantSlugResponse {
    _id: string;
}


export const checkMenuCategoryService = async function (categoryId:string,restaurantId:mongoose.Schema.Types.ObjectId):Promise<boolean> {

    try {
       const cachedMenuCategory = await redisClient.hGet(`menu:category`,`${restaurantId}:${categoryId}`);
       if(cachedMenuCategory){
            return true;
        }
        const category = await MenuCategory.findById(categoryId);
        if(!category){
            return false;
        }
        redisClient.hSet(`menu:category`,`${restaurantId}:${categoryId}`,JSON.stringify(category));
        return true;
    } catch (error) {
        throw error;
    }

}

export const checkMenuItemService = async function (itemId:string,restaurantId:mongoose.Schema.Types.ObjectId):Promise<boolean> {

    try {
        const cachedMenuItem = await redisClient.hGet(`menu:item`,`${restaurantId}:${itemId}`);
        if(cachedMenuItem && restaurantId === JSON.parse(cachedMenuItem).restaurant){
            return true;
        }
        const item = await MenuItem.findOne({
            _id: itemId,
            restaurant: restaurantId
        });
        if(!item){
            return false;
        }
        redisClient.hSet(`menu:item`,`${restaurantId}:${itemId}`,JSON.stringify(item));
        return true;
    } catch (error) {
        throw error;
    }

}

export const checkRestaurantSlugService = async function (slug:string):Promise<RestaurantSlugResponse|null> {
    try {
        const cachedRestaurantSlug = await redisClient.hGet(`slug`,slug);
        if(cachedRestaurantSlug){
            return {
                _id:cachedRestaurantSlug
            
            };
        }
        const restaurantName = convertSlug(slug);
        const restaurant = await Restaurant.findOne({
            name:restaurantName
        })
        if(!restaurant){
            return null;
        }
        redisClient.hSet(`restaurant:slug`,slug,restaurant._id.toString());
        
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
            name: data.name,
            description: data.description,
        });      
        redisClient.hSet(`menu:category`,`${category.restaurant}:${category._id}`,JSON.stringify(category));
        return category;
    } catch (error) {
        throw error;
    }
       
}

export const getMenuService = async function(restaurant:Schema.Types.ObjectId):Promise<IMenuItem[]> {  

    try {
        const cachedMenu = await redisClient.hGet(`menu:public`,`${restaurant}`);
        if(cachedMenu){
            return JSON.parse(cachedMenu);
        }
        const menu= await MenuItem.find({
            restaurant: restaurant,
        },"-__v -restaurant -createdAt -updatedAt").populate({path:'category',select:'name -_id'});

        redisClient.hSet(`menu:public`,`${restaurant}`,JSON.stringify(menu));
        return menu;
    } catch (error) {
        throw error;
    }

}


export const getMenuCategoriesService = async function(restaurant:Schema.Types.ObjectId):Promise<any> {

    try {
        const cachedMenuCategories = await redisClient.hGet(`menu:categories`,`${restaurant}`);
        if(cachedMenuCategories){
     
            return JSON.parse(cachedMenuCategories);
        }
        const menuCategories = await MenuCategory.find({
            restaurant: restaurant,
        },"-__v -restaurant -createdAt -updatedAt");

        redisClient.hSet(`menu:categories`,`${restaurant}`,JSON.stringify(menuCategories));
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
        //update from redis
        redisClient.hSet(`menu:category`,`${category.restaurant}:${category._id}`,JSON.stringify(category)); 
        redisClient.hDel(`menu:public`,`${category.restaurant}`);
        redisClient.hDel(`menu:categories`,`${category.restaurant}`);
        return category
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
        redisClient.hDel('menu:category',`${restaurantId}:${categoryId}`);
        redisClient.hDel(`menu:public`,`${category.restaurant}`);
        redisClient.hDel(`menu:public`,`${category.restaurant}`);
     
        return true;
    }catch(error){
        throw error;
    }

}


export const createMenuItemService = async function (data:IMenuItem):Promise<IMenuItem> {

    try {
        const item = await MenuItem.create(data);
        redisClient.hSet(`menu:item`,`${data.restaurant}:${data.category}`,JSON.stringify(item));
        redisClient.hDel(`menu:public`,`${data.restaurant}`);
        return item;
    } catch (error) {
        throw error;
    }
}


export const updateMenuItemService = async function (itemId:string,data:IMenuItem):Promise<IMenuItem> {
    
        try {
            const item = await MenuItem.findOneAndUpdate({
                _id:itemId,
            },data,{new:true});
            if(!item){
                throw new Error("Menu Item not found");
            }
            redisClient.hSet(`menu:item`,`${item.restaurant}:${item.category}`,JSON.stringify(item));
            redisClient.hDel(`menu:public`,`${item.restaurant}`);
            return item 
        } catch (error) {
            throw error;
        }
}

export const updateMenuItemImageService = async function (itemId:Schema.Types.ObjectId,imageLink:string):Promise<IMenuItem>{
    try {
        const item = await MenuItem.findByIdAndUpdate({
            _id:itemId
        },{
            imageLink:imageLink
        },{new:true});
        if(!item){
            throw new Error("Menu Item not found");
        }

        return item 
    } catch (error) {
        throw error;
    }
}







