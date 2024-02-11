import { Request, Response ,NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { UserRequest } from '../types/express.type';
import { MenuCategory, MenuItem } from '../models/menu.model';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { uploadImageToS3 } from '../utils/aws/s3.aws';
import _ from 'lodash';

export const checkMenuCategory = asyncHandler(async (req: UserRequest, res: Response,next:NextFunction) => {
    const categoryId = req.params.categoryId;
    
    const category = await MenuCategory.findById(categoryId);

    if(!category){
        return res.status(404).json(new ApiError(404, 'Category not found'));
    }
    next();
});

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
        const categories = await MenuCategory.find({
            restaurant: restaurantId,
            exclude: ['__v', 'restaurant', 'createdAt', 'updatedAt'],
        });

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
        imageLink: null,
        flags: {
            isVeg: isVeg || false,
            containsEggs: containsEggs || false,
        },
    });

    if(itemResponse && localImage) {
        uploadImageToS3(localImage)
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


