
import { createFeedbackService, getFeedbacksService } from "../services/feeback.service";
import { UserRequest } from "../types/express.type";
import ApiError from "../utils/handler/ApiError";
import ApiResponse from "../utils/handler/ApiResponse";
import asyncHandler from "../utils/handler/asyncHandler";
import { Request, Response } from "express";

export const createFeedback = asyncHandler(async (req:Request, res: Response) => {

    const resutarantId = req.body.restaurant;
    const {feedback,rating} = req.body;
    if(!resutarantId || !feedback){
        return res.status(400).json({message:"All fields are required"});
    }

    const feedbackResponse = await createFeedbackService({
        restaurant:resutarantId,
        feedback,
        rating
    })

    return res.status(200).json(new ApiResponse(200,feedbackResponse,"Feedback created successfully"));
})


export const getFeedbacks = asyncHandler(async (req:UserRequest, res: Response) => {
    const restaurantId = req.user.restaurant; // Convert ObjectId to string
    const feedbacks = await getFeedbacksService(restaurantId);
    if(feedbacks.length===0){
        throw new ApiError(204,"No feedbacks found")
    }

    return res.status(200).json(new ApiResponse(200,feedbacks,"Feedbacks fetched successfully"));
})






