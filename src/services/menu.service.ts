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
       //const cachedMenuCategory = await redisClient.hGet(`menu:category`,`${restaurantId}:${categoryId}`);
       const cachedMenuCategory = await redisClient.get(`menu:category:${categoryId}`);
        console.log(cachedMenuCategory);

       if(cachedMenuCategory && restaurantId === JSON.parse(cachedMenuCategory).restaurant){
            return true;
        }
        const category = await MenuCategory.findById(categoryId);
        if(!category){
            return false;
        }
        //redisClient.hSet(`menu:category`,`${restaurantId}:${categoryId}`,JSON.stringify(category));
        let cachedResponse = {
            restaurant:category.restaurant,
        }
        console.log("caching the data",cachedResponse);
        redisClient.set(`menu:category:${categoryId}`,JSON.stringify(cachedResponse));
        return true;
    } catch (error) {
        throw error;
    }

}

export const checkMenuItemService = async function (itemId:string,restaurantId:mongoose.Schema.Types.ObjectId):Promise<boolean> {

    try {
        const cachedMenuItem = await redisClient.get(`menu:item:${itemId}`);
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
        const cachedResponse = {
            restaurant:item.restaurant,
            category:item.category
        }
        redisClient.set(`menu:item:${itemId}`,JSON.stringify(cachedResponse));
        return true;
    } catch (error) {
        throw error;
    }

}

export const checkRestaurantSlugService = async function (slug:string):Promise<RestaurantSlugResponse|null> {
    try {
        const cachedRestaurantSlug = await redisClient.get(`restaurant:slug:${slug}`);
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
        //redisClient.hSet(`restaurant:slug`,slug,restaurant._id.toString());
        redisClient.set(`restaurant:slug:${slug}`,restaurant._id.toString());
        
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
        redisClient.del(`menu:public:${category.restaurant}`);
        return category;
    } catch (error) {
        throw error;
    }
       
}

export const getMenuService = async function(restaurant:Schema.Types.ObjectId):Promise<IMenuItem[]> {  

    try {
        const cachedMenu = await redisClient.get(`menu:public:${restaurant}`)
        if(cachedMenu){
            return JSON.parse(cachedMenu);
        }
        const menu= await MenuItem.find({
            restaurant: restaurant,
        },"-__v -restaurant -createdAt -updatedAt").populate({path:'category',select:'name -_id'});
        if(menu.length === 0){
            throw new Error("No Menu Items found");
        }
        redisClient.set(`menu:public:${restaurant}`,JSON.stringify(menu));
        return menu;
    } catch (error) {
        throw error;
    }

}


export const getMenuCategoriesService = async function(restaurant:Schema.Types.ObjectId):Promise<any> {

    try {
        const cachedMenuCategories = await redisClient.get(`menu:categories:${restaurant}`);
        if(cachedMenuCategories){
     
            return JSON.parse(cachedMenuCategories);
        }
        const menuCategories = await MenuCategory.find({
            restaurant: restaurant,
        },"-__v -restaurant -createdAt -updatedAt");

        redisClient.set(`menu:categories:${restaurant}`,JSON.stringify(menuCategories));
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
        //delete the cache
        redisClient.del(`menu:categories:${category.restaurant}`);
        redisClient.del(`menu:public:${category.restaurant}`);
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
        redisClient.del(`menu:categories:${category.restaurant}`);
        redisClient.del(`menu:category:${categoryId}`);
        redisClient.del(`menu:public:${category.restaurant}`);     
        return true;
    }catch(error){
        throw error;
    }

}


export const createMenuItemService = async function (data:IMenuItem):Promise<IMenuItem> {

    try {
        const item = await MenuItem.create(data);
        redisClient.del(`menu:public:${item.restaurant}`);
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
            redisClient.del(`menu:public:${item.restaurant}`);
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







