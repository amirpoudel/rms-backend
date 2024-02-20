import {Request,Response,NextFunction,Errback} from 'express';
import ApiError from './ApiError';
import ApiResponse from './ApiResponse';
import { logger } from './winston';

export const errorHandler = (err:Errback,req:Request,res:Response,next:NextFunction) => {

    logger.error(err);
    
    if(err instanceof ApiError){
        console.log("this is api error",err);
        console.log("this is api error status code",err.statusCode);
        console.log("this is api error message",err.message);

        return res.status(err.statusCode).json(
            new ApiResponse(err.statusCode,null,err.message,false)
        );
    }


}