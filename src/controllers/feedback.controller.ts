import { Feedback } from "../models/feedback.model";
import { UserRequest } from "../types/express.type";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";

export const createFeedback = asyncHandler(async (req:Request, res: Response) => {

    const resutarantId = req.body.restaurant;
    const {feedback,rating} = req.body;
    if(!resutarantId || !feedback){
        return res.status(400).json({message:"All fields are required"});
    }

    const feedbackResponse = await Feedback.create({
        restaurant:resutarantId,
        feedback,
        rating
    })

    return res.status(201).json(new ApiResponse(201,feedbackResponse,"Feedback created successfully"));
})


export const getFeedbacks = asyncHandler(async (req:UserRequest, res: Response) => {
    const restaurantId = req.user.restaurant;
    const feedbacks = await Feedback.find({restaurant:restaurantId});
    return res.status(200).json(new ApiResponse(200,feedbacks,"Feedbacks fetched successfully"));
})





