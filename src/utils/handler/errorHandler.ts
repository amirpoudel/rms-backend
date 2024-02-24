import {Request,Response,NextFunction,Errback} from 'express';
import ApiError from './ApiError';
import ApiResponse from './ApiResponse';
import { logger } from '../logs/winston';
import { MongooseError } from 'mongoose';
import fs from 'fs';


export const errorHandler = (err: Errback, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    logger.error(err);
    //if req.file then delete it 
    if(req.file){
        if(fs.existsSync(req.file.path)){
            fs.unlink(req.file.path,(err)=>{});
        }
    }
    if (err instanceof ApiError) {
        if(err.error instanceof MongooseError){
            return res.status(400).json(new ApiResponse(400,null,err.error.message,false));
        }
        const apiResponse = new ApiResponse(err.statusCode, null, err.message, false);
        return res.status(err.statusCode).json(apiResponse);
        
    }
    

   
    // Handle other types of errors if needed
};
