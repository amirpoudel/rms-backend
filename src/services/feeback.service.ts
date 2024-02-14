
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


export const getFeedbacksService = async function(restaurantId:string):Promise<IFeedback[]> {

    try {
        const feedbacksCache = await redisClient.hGet("feedbacks",restaurantId);
        if(feedbacksCache){
            return JSON.parse(feedbacksCache);
        }
        const feedbacks = await Feedback.find({restaurant:restaurantId});
        redisClient.hSet("feedbacks",restaurantId,JSON.stringify(feedbacks));
        return feedbacks;
    } catch (error) {
        throw error;
    }

}


