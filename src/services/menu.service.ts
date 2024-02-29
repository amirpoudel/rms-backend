import mongoose, { Schema } from 'mongoose';
import { redisClient } from '../config/redis.config';
import {
    IMenuCategory,
    IMenuItem,
    MenuCategory,
    MenuItem,
} from '../models/menu.model';
import { convertSlug, convertToPlainObject } from '../utils/helper';
import { Restaurant } from '../models/restaurant.model';
import ApiError from '../utils/handler/ApiError';
import { String } from 'aws-sdk/clients/cloudsearch';

interface RestaurantSlugResponse {
    _id: string;
}

export const checkMenuCategoryService = async function (
    categoryId: string,
    restaurantId: mongoose.Schema.Types.ObjectId
): Promise<boolean> {
    try {
        //const cachedMenuCategory = await redisClient.hGet(`menu:category`,`${restaurantId}:${categoryId}`);
        const cachedMenuCategory = await redisClient.get(
            `menu:category:${categoryId}`
        );
        console.log(cachedMenuCategory);

        if (
            cachedMenuCategory &&
            restaurantId === JSON.parse(cachedMenuCategory).restaurant
        ) {
            return true;
        }
        const category = await MenuCategory.findById(categoryId);
        if (!category) {
            return false;
        }
        //redisClient.hSet(`menu:category`,`${restaurantId}:${categoryId}`,JSON.stringify(category));
        let cachedResponse = {
            restaurant: category.restaurant,
        };
        console.log('caching the data', cachedResponse);
        redisClient.set(
            `menu:category:${categoryId}`,
            JSON.stringify(cachedResponse)
        );
        return true;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const checkMenuItemService = async function (
    itemId: string,
    restaurantId: mongoose.Schema.Types.ObjectId
): Promise<boolean> {
    try {
        const cachedMenuItem = await redisClient.get(`menu:item:${itemId}`);
        if (
            cachedMenuItem &&
            restaurantId === JSON.parse(cachedMenuItem).restaurant
        ) {
            return true;
        }
        const item = await MenuItem.findOne({
            _id: itemId,
            restaurant: restaurantId,
        });
        if (!item) {
            return false;
        }
        const cachedResponse = {
            restaurant: item.restaurant,
            category: item.category,
        };
        redisClient.set(`menu:item:${itemId}`, JSON.stringify(cachedResponse));
        return true;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const checkRestaurantSlugService = async function (
    slug: string
): Promise<RestaurantSlugResponse | null> {
    try {
        const cachedRestaurantSlug = await redisClient.get(
            `restaurant:slug:${slug}`
        );
        if (cachedRestaurantSlug) {
            return {
                _id: cachedRestaurantSlug,
            };
        }
        const restaurantName = convertSlug(slug);
        const restaurant = await Restaurant.findOne({
            name: restaurantName,
        });
        if (!restaurant) {
            return null;
        }
        //redisClient.hSet(`restaurant:slug`,slug,restaurant._id.toString());
        redisClient.set(`restaurant:slug:${slug}`, restaurant._id.toString());

        return {
            _id: restaurant._id.toString(),
        };
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const createMenuCategoryService = async function (
    data: IMenuCategory
): Promise<IMenuCategory> {
    try {
        const category = await MenuCategory.create({
            restaurant: data.restaurant,
            name: data.name,
            description: data.description,
        });
        redisClient.del(`menu:public:${category.restaurant}`);
        redisClient.del(`menu:categories:${category.restaurant}`);
        return category;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const getMenuService = async function (
    restaurant: Schema.Types.ObjectId
): Promise<IMenuCategory[]> {
    try {
        const cachedMenu = await redisClient.get(`menu:public:${restaurant}`);
        if (cachedMenu) {
            return JSON.parse(cachedMenu);
        }
        const menu = await MenuCategory.aggregate([
            {
                $match: { restaurant:new mongoose.Types.ObjectId(restaurant.toString()) }, // Filter categories by restaurant
            },
            {
                $lookup: {
                    from: 'menuitems', // Name of the MenuItem collection
                    localField: '_id', // Field from MenuCategory collection
                    foreignField: 'category', // Field from MenuItem collection
                    as: 'items', // Field to populate with matched documents
                },
            },
           {
            $project:{
                name:1,
                description:1,
                imageLink:1,
                itemsCount:1,
                items:{
                    _id:1,
                    name:1,
                    description:1,
                    price:1,
                    imageLink:1,
                    flags:1
                }
            }
        }
        ]);
        redisClient.set(`menu:public:${restaurant}`, JSON.stringify(menu));
        return menu;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const getMenuItemsByCategoryService = async function (
    restaurant:string,category:string
): Promise<IMenuItem[]> {
    try {
        const cachedMenu = await redisClient.get(`menu:${restaurant}:${category}`);
        if (cachedMenu) {
            return JSON.parse(cachedMenu);
        }
        const menu = await MenuItem.find(
            {   
                restaurant: restaurant,
                category: category,
    
            },
            '-__v -restaurant -createdAt -updatedAt'
        )
        redisClient.set(`menu:${restaurant}:${category}`, JSON.stringify(menu));
        return menu;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const getMenuCategoriesService = async function (
    restaurant: Schema.Types.ObjectId
): Promise<any> {
    try {
        const cachedMenuCategories = await redisClient.get(
            `menu:categories:${restaurant}`
        );
        if (cachedMenuCategories) {
            return JSON.parse(cachedMenuCategories);
        }
        const menuCategories = await MenuCategory.find(
            {
                restaurant: restaurant,
            },
            '-__v -restaurant -createdAt -updatedAt'
        );

        redisClient.set(
            `menu:categories:${restaurant}`,
            JSON.stringify(menuCategories)
        );
        return menuCategories;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const updateMenuCategoryService = async function (
    categoryId: string,
    data: IMenuCategory
): Promise<IMenuCategory> {
    try {
        const category = await MenuCategory.findOneAndUpdate(
            {
                _id: categoryId,
                restaurant: data.restaurant,
            },
            {
                name: data.name,
                description: data.description,
            },
            { new: true }
        );
        if (!category) {
            throw new Error('Menu Category not found');
        }
        //delete the cache
        redisClient.del(`menu:categories:${category.restaurant}`);
        redisClient.del(`menu:public:${category.restaurant}`);
        return category;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const deleteMenuCategoryService = async function (
    categoryId: string,
    restaurantId: Schema.Types.ObjectId
): Promise<boolean> {
    try {
        const countItems = await MenuItem.countDocuments({
            category: categoryId,
            restaurant: restaurantId,
        });
        if (countItems > 0) {
            return false;
        }
        const category = await MenuCategory.findOneAndDelete({
            _id: categoryId,
            restaurant: restaurantId,
        });

        if (!category) {
            return false;
        }
        redisClient.del(`menu:categories:${category.restaurant}`);
        redisClient.del(`menu:category:${categoryId}`);
        redisClient.del(`menu:public:${category.restaurant}`);
        return true;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const createMenuItemService = async function (
    data: IMenuItem
): Promise<IMenuItem> {
    try {
        const item = await MenuItem.create(data);
        redisClient.del(`menu:public:${item.restaurant}`);
        return item;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const updateMenuItemService = async function (
    itemId: string,
    data: IMenuItem
): Promise<IMenuItem> {
    try {
        const item = await MenuItem.findOneAndUpdate(
            {
                _id: itemId,
            },
            data,
            { new: true }
        );
        if (!item) {
            throw new Error('Menu Item not found');
        }
        redisClient.del(`menu:public:${item.restaurant}`);
        redisClient.del(`menu:${item.restaurant}:${item.category}`);
        return item;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};

export const updateMenuItemImageService = async function (
    itemId:string,
    imageLink: string
): Promise<IMenuItem> {
    try {
        
        const item = await MenuItem.findByIdAndUpdate(
            {
                _id: itemId,
            },
            {
                imageLink: imageLink,
            },
            { new: true }
        );
        if (!item) {
            throw new Error('Menu Item not found');
        }
        redisClient.del(`menu:public:${item.restaurant}`);
        redisClient.del(`menu:${item.restaurant}:${item.category}`);

        return item;
    } catch (error) {
        throw new ApiError(500, '', error);
    }
};
