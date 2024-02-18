import {Request,Response,NextFunction,Errback} from 'express';
import ApiError from './ApiError';
import ApiResponse from './ApiResponse';

export const errorHandler = (err:Errback,req:Request,res:Response,next:NextFunction) => {


    if(err instanceof ApiError){
        console.log("this is api error",err);
        console.log("this is api error status code",err.statusCode);
        console.log("this is api error message",err.message);

        return res.status(err.statusCode).json(
            new ApiResponse(err.statusCode,null,err.message,false)
        );
    }


}