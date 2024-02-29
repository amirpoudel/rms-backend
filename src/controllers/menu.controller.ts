import { Request, Response ,NextFunction } from 'express';
import asyncHandler from '../utils/handler/asyncHandler';
import { UserRequest } from '../types/express.type';
import { MenuCategory, MenuItem } from '../models/menu.model';
import ApiResponse from '../utils/handler/ApiResponse';
import ApiError from '../utils/handler/ApiError';
import { deleteImageFromS3, uploadImageToS3 } from '../utils/aws/s3.aws';
import _ from 'lodash';
import { checkMenuCategoryService, checkMenuItemService, checkRestaurantSlugService, createMenuCategoryService, createMenuItemService, deleteMenuCategoryService, getMenuCategoriesService, getMenuItemsByCategoryService, getMenuService, updateMenuCategoryService, updateMenuItemImageService, updateMenuItemService } from '../services/menu.service';
import { Schema } from 'mongoose';




export const checkMenuCategory = asyncHandler(async (req: UserRequest, res: Response,next:NextFunction) => {
    // this for private request for every authenticate route have resutarant id
    const categoryId = req.params.categoryId;
    const restaurant = req.user.restaurant ;
    if(!categoryId){
        throw new ApiError(400, 'Category Id is required');
    }
    const category = await checkMenuCategoryService(categoryId, restaurant);
    
    if(category===false){
        throw new ApiError(404, 'Category not found');
    }
    
    next();
});

export const checkMenuItem = asyncHandler(async (req: UserRequest, res: Response,next:NextFunction) => {
    const itemId = req.params.itemId;
    const restaurantId = req.user.restaurant;
    if(!itemId){
        throw new ApiError(400, 'Item Id is required');
    }
    const item = await checkMenuItemService(itemId,restaurantId);
    if(item===false){
        throw new ApiError(404, 'Item not found');
    }
    next();
})

export const checkRestaurantSlug = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
    const restaurantSlug = req.params.restaurantSlug;
    if(!restaurantSlug){
        throw new ApiError(400, 'Restaurant Slug is required');
    }
    const restaurant = await checkRestaurantSlugService(restaurantSlug);
    console.log(restaurant);

    if(!restaurant){
       throw new ApiError(404, 'Restaurant not found');
    }
    
    req.body.restaurant = restaurant._id;

    next();
})


export const createMenuCategory = asyncHandler(
    async (req: UserRequest, res: Response) => {
        const { name, description } = req.body;
        const restaurantId = req.user.restaurant;

        const category = await createMenuCategoryService({
            restaurant: restaurantId,
            name: name as string,
            description: description as string,
           
        })
        let response = _.omit(category, ['__v', 'restaurant']);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
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
        const categories = await getMenuCategoriesService(restaurantId);
        console.log(categories);
        if(categories.length===0){
            throw new ApiError(404,'No Menu Categories found');
        }
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
        const { name, description } = req.body;
        const restaurantId = req.user.restaurant;
        if(!categoryId){
            throw new ApiError(400, 'Category Id is required');
        }

        if (!name && !description) {
            throw new ApiError(400, 'Category Name Or Description are required');
        }

        const updateCategory = await updateMenuCategoryService(categoryId,{
            restaurant: restaurantId,
            name: name,
            description: description,

        })

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
export const deleteMenuCategory = asyncHandler(async (req: UserRequest, res: Response) => {
    // for delete category we need to delete all items in this category by user manually
    // check if category is empty then only delete it 
    const { categoryId } = req.params;
    const restaurantId = req.user.restaurant;
    if(!categoryId){
        throw new ApiError(400, 'Category Id is required');
    }
    
    const isDeleted = await deleteMenuCategoryService(categoryId,restaurantId);
    if(isDeleted===false){
        throw new ApiError(400,'Category is not empty');
    }
    return res.status(200).json(new ApiResponse(200,true,'Menu Category deleted successfully'))
})

export const createMenuItem = asyncHandler(async (req: UserRequest, res: Response) => {
    const restaurantId = req.user.restaurant;
    const categoryId = req.params.categoryId;
    const {
        name,
        description,
        price,
        isAvailable
       
    } = req.body;

    const localImage = req?.file;

    if(!categoryId || !name || !price) {
        throw new ApiError(400, 'Category Id, Name and Price are required');
    }
    //convert this into .then and .catch
    

    const itemResponse = await createMenuItemService({
        restaurant: restaurantId,
        category: categoryId as unknown as Schema.Types.ObjectId,
        name: name,
        description: description,
        price: price,
        isAvailable: isAvailable || true,
        imageLink:null
    });
    if(itemResponse && itemResponse._id && localImage){
        uploadImageToS3(localImage).then(async (imageUrl):Promise<void> => {
            await updateMenuItemImageService(itemResponse._id as unknown as string,imageUrl as string);
        })
    }

    return res.status(200).json(new ApiResponse(
                200,
                itemResponse,
                'Menu Item created successfully'
            )
        );
})

export const updateMenuItem = asyncHandler(async (req:UserRequest,res:Response) => {
    const {itemId } = req.params;
    const {
        name,
        description,
        price,
        isAvailable,
        
    } = req.body;

    if(!itemId){
        throw new ApiError(400, 'Item Id is required');
    }
    
    const updatedItem = await updateMenuItemService(itemId,{
        name: name,
        description: description,
        price: price,
        isAvailable: Boolean(isAvailable) || true
    })

    return res.status(200).json(new ApiResponse(200,updatedItem,'Menu Item updated successfully'))
})


export const updateMenuItemImage = asyncHandler(async (req:UserRequest,res:Response) => {
    const { itemId } = req.params;
    const localImage = req?.file;
    if(!localImage){
        throw new ApiError(400,'Image is required');
    }
    const item = await MenuItem.findById(itemId,"-__v -restaurant -createdAt -updatedAt");
    const oldImageLink = item?.imageLink;
    if(!item){
        throw new ApiError(404,'Item not found');
    }
    uploadImageToS3(localImage,oldImageLink).then(async (imageUrl):Promise<void>=> {
        if(!oldImageLink){
           await updateMenuItemImageService(item._id.toString(),imageUrl as string);
        }
    })
    let response = item.toJSON();
    return res.status(200).json(new ApiResponse(200,response,'Menu Item image updated successfully'))
})

export const deleteMenuItem = asyncHandler(async (req:UserRequest,res:Response)=>{
    const { itemId } = req.params;
    
    const item = await MenuItem.findByIdAndDelete(itemId);

    if(item?.imageLink){
        deleteImageFromS3(item.imageLink);
    }
    return res.status(200).json(new ApiResponse(200,true,'Menu Item deleted successfully'))
})

export const getMenuItems = asyncHandler(async (req: UserRequest, res: Response) => {
    const restaurant = req.user.restaurant;

    const response = await getMenuService(restaurant);
    if(response.length===0){
        throw new ApiError(404,'No Menu Items found');
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response,
                'Menu Items fetched successfully'
            )
        );
})

export const getMenuItemsByCategory = asyncHandler(async (req: UserRequest, res: Response) => {
    const restaurant = req.user.restaurant;
    const category = req.params.categoryId;
    const response = await getMenuItemsByCategoryService(restaurant.toString(),category as string);
    if(response.length===0){
        throw new ApiError(404,'No Menu Items found');
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response,
                'Menu Items fetched successfully'
            )
        );
})



export const getMenuItemsPublic = asyncHandler(async (req: Request, res: Response) => {
    
    const restaurant = req.body?.restaurant;
    
    if(!restaurant){
       throw new ApiError(400, 'Restaurant Id is required');
    }

    const response = await getMenuService(restaurant);

    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response,
                'Menu Items fetched successfully'
            )
        );

})







