import { Request,Response,NextFunction  } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import jwt, { Secret } from "jsonwebtoken";
import { JwtPayload, UserRequest } from "../types/express.type";
export const authenticateUser = asyncHandler( async (req:UserRequest, res:Response, next:NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer",""); // header for mobile
        if (!token) {
            throw new ApiError(401, 'Unauthorized request');
        }

        const accessTokenSecrect:( Secret | undefined) = process.env.ACCESS_TOKEN_SECRECT;
        
        if (!accessTokenSecrect) {
            throw new ApiError(500, "Access token secrect not found");
        }

        const decode = await jwt.verify(token, accessTokenSecrect as Secret) as JwtPayload;

        // can find user form db and attach to req.user
        req.user = {
            _id: decode._id,
            restaurant: decode.restaurant ,
            email: decode.email,
            name: decode.name,
            role: decode.role,
        };
        console.log("this is decode ", decode);
        next();
    } catch (error) {
        throw new ApiError(401, (error as Error).message || "Invalid access Token");
    }

    
})


