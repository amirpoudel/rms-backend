import {Request,Response,NextFunction,Errback} from 'express';
import ApiError from './ApiError';
import ApiResponse from './ApiResponse';
import { logger } from '../logs/winston';
import { MongooseError } from 'mongoose';
import fs from 'fs';
import { MulterError } from 'multer';


export const errorHandler = (err: Errback, req: Request, res: Response, next: NextFunction) => {
    logger.info(err);
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

    if( err instanceof MulterError){
        
        if(err.code === 'LIMIT_FILE_SIZE'){
            return res.status(400).json(new ApiResponse(400,null,'Please Upload Less than 1mb',false));
        }
        if(err.code === 'LIMIT_UNEXPECTED_FILE'){
            return res.status(400).json(new ApiResponse(400,null,'Too many files uploaded',false));
        }

    }
 
   
    return res.status(500).json(new ApiResponse(500, null, 'Internal server error', false));
    

   
    // Handle other types of errors if needed
};
