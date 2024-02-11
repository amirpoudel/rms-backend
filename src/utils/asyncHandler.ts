import { Request,Response,NextFunction } from "express";
const asyncHandler = function (requestHandler: Function){
    return async (req:Request, res:Response, next:NextFunction) => {
        try {
            await Promise.resolve(requestHandler(req, res, next));
        } catch (error) {
            next(error);
        }
    }
};


export default asyncHandler;
