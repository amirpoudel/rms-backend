
import { Schema } from 'mongoose';
import { redisClient } from '../config/redis.config';
import {Feedback,IFeedback} from '../models/feedback.model';


export const createFeedbackService = async function(data:IFeedback):Promise<IFeedback> {

    try {
        const feedbackResponse = await Feedback.create(data);
        
        return feedbackResponse;
    } catch (error) {
        throw error;
    }

}


export const getFeedbacksService = async function(restaurantId:Schema.Types.ObjectId):Promise<IFeedback[]> {

    try {
        const feedbacksCache = await redisClient.get(`restaurant:feedbacks${restaurantId}`);
        if (feedbacksCache) {
            return JSON.parse(feedbacksCache);
        }
        const feedbacks = await Feedback.find({ restaurant: restaurantId });
        if (!feedbacks) {
            return [];
        }
        redisClient.set(
            `restaurant:feedbacks:${restaurantId}`,
            JSON.stringify(feedbacks),
            { EX: 8 * 60 * 60 } // Fix: Pass options object as the first argument
        );
        return feedbacks;
    } catch (error) {
        throw error;
    }

}


