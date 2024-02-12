import { Request, Response ,NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { UserRequest } from '../types/express.type';
import { MenuCategory, MenuItem } from '../models/menu.model';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { uploadImageToS3 } from '../utils/aws/s3.aws';
import _ from 'lodash';
import { convertSlug } from '../utils/helper';
import { Restaurant } from '../models/restaurant.model';


export const checkMenuCategory = asyncHandler(async (req: UserRequest, res: Response,next:NextFunction) => {
    const categoryId = req.params.categoryId;
    if(!categoryId){
        return res.status(400).json(new ApiError(400, 'Category Id is required'));
    }
    const category = await MenuCategory.findById(categoryId);

    if(!category){
        return res.status(404).json(new ApiError(404, 'Category not found'));
    }
    next();
});

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


export const createMenuCategory = asyncHandler(
    async (req: UserRequest, res: Response) => {
        const { categoryName, categoryDescription } = req.body;
        const restaurantId = req.user.restaurant;
        console.log('this is restaurantId', restaurantId);
        console.log('this is categoryName', categoryName);
        console.log('this is categoryDescription', categoryDescription);
        const category = await MenuCategory.create({
            restaurant: restaurantId,
            name:categoryName,
            description:categoryDescription,
        });
        let response = _.omit(category, ['__v', 'restaurant']);

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    response,
                    'Menu Category created successfully'
                )
            );
    }
);

export const getMenuCategories = asyncHandler(
    async (req: UserRequest, res: Response) => {
        const restaurantId = req.user.restaurant;
        console.log(restaurantId)
        const categories = await MenuCategory.find({
            restaurant: restaurantId,
        },"-__v -restaurant -createdAt -updatedAt");
        const response = await MenuCategory.find();
        console.log(response)

        console.log('this is categories', categories);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    categories,
                    'Menu Categories fetched successfully'
                )
            );
    }
);

export const updateMenuCategory = asyncHandler(async (req: UserRequest, res: Response) => {
        const { categoryId } = req.params;
        const { categoryName, categoryDescription } = req.body;
        const restaurantId = req.user.restaurant;

        if (!categoryName || !categoryDescription) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'Category name and description are required'
                    )
                );
        }

        const updateCategory = await MenuCategory.findOneAndUpdate(
            { _id: categoryId, restaurant: restaurantId },
            { categoryName, categoryDescription },
            { new: true }
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updateCategory,
                    'Menu Category updated successfully'
                )
            );
    }
);

export const createMenuItem = asyncHandler(async (req: UserRequest, res: Response) => {
    const restaurantId = req.user.restaurant;
    const categoryId = req.params.categoryId;
    const {
        itemName,
        itemDescription,
        itemPrice,
        isVeg,
        containsEggs,
    } = req.body;

    const localImage = req?.file;

    if(!categoryId || !itemName || !itemPrice) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    'Category, Item name and price are required'
                )
            );
    }

    const itemResponse = await MenuItem.create({
        restaurant: restaurantId,
        category: categoryId,
        name: itemName,
        description: itemDescription,
        price: itemPrice,
        flags: {
            isVeg: isVeg || false,
            containsEggs: containsEggs || false,
        },
    });

    if(itemResponse && localImage) {
            uploadImageToS3(localImage).then(async (imageUrl):Promise<void>=> {
                itemResponse.imageLink = imageUrl as string;
                console.log("Image uploaded successfully", imageUrl);
                await itemResponse.save();
                console.log("Item saved successfully", itemResponse);
            });
        }

        return res
            .status(201)
            .json(
            new ApiResponse(
                201,
                itemResponse,
                'Menu Item created successfully'
            )
        );
})

export const getMenuItemsPrivate = asyncHandler(async (req: UserRequest, res: Response) => {
    
})

export const getMenuItemsPublic = asyncHandler(async (req: Request, res: Response) => {
    console.log("I am Here Brooooo")
    const restaurant = req.body?.restaurant;
    
    if(!restaurant){
        return res.status(400).json(new ApiError(400, 'Restaurant Id is required'));
    }
    const items = await MenuItem.find({
        restaurant: restaurant,
    },"-__v -restaurant -createdAt -updatedAt").populate({path:'category',select:'name -_id'});
    console.log('this is items', items);
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                items,
                'Menu Items fetched successfully'
            )
        );

})


