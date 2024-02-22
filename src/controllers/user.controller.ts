import asyncHandler from '../utils/handler/asyncHandler';
import ApiError from '../utils/handler/ApiError';
import ApiResponse from '../utils/handler/ApiResponse';
import { COOKIE_OPTIONS, USER_ROLE } from '../constant';
import { Request, Response } from 'express';
import _ from 'lodash';
import {
    forgetPasswordService,
    loginUserService,
    logoutUserService,
    registerUserWithRestaurantService,
} from '../services/user.service';
import { UserRequest } from '../types/express.type';
import { isEmailValid, isPasswordValid, isPhoneValid } from '../utils/helper';

export const registerUserWithRestaurant = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            restaurantName,
            restaurantUsername,
            ownerName,
            ownerEmail,
            ownerPhone,
            ownerPassword,
        } = req.body;

        if (
            !restaurantName ||
            !restaurantUsername ||
            !ownerName ||
            !ownerEmail ||
            !ownerPhone ||
            !ownerPassword
        ) {
            throw new ApiError(400, 'All fields are required');
        }
        if (!isEmailValid(ownerEmail)) {
            throw new ApiError(400, 'Invalid email');
        }
        if (!isPasswordValid(ownerPassword)) {
            throw new ApiError(
                400,
                'Password must be at least 8 characters long and contain at least one letter and one number'
            );
        }
        const registerUser = await registerUserWithRestaurantService(
            {
                name: restaurantName,
                username: restaurantUsername,
            },
            {
                name: ownerName,
                email: ownerEmail,
                phone: ownerPhone,
                role: USER_ROLE.OWNER,
                password: ownerPassword,
            }
        );

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    null,
                    'Restaurant and owner created successfully'
                )
            );
    }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
        throw new ApiError(400, 'Email or phone is required');
    }
    if (!password) {
        throw new ApiError(400, 'Password is required');
    }

    // find user by email or phone

    let response = await loginUserService({ email, phone, password });

    return res
        .status(200)
        .cookie('accessToken', response.accessToken, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        })
        .cookie('refreshToken', response.refreshToken, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        })
        .json(new ApiResponse(200, response, 'Login successful'));
});

export const logoutUser = asyncHandler(
    async (req: UserRequest, res: Response) => {
        res.clearCookie('accessToken', {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        res.clearCookie('refreshToken', {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        await logoutUserService(req.user._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, 'Logout successful'));
    }
);

export const forgetPassowrd  = asyncHandler(async (req: Request, res: Response) => {

    const {email , phone } = req.body;
    if(!email && !phone){
        throw new ApiError(400, 'Email or phone is required');
    }
    if(email && !isEmailValid(email)){
        throw new ApiError(400, 'Invalid email');
    }
    if(phone && !isPhoneValid(phone)){
        throw new ApiError(400, 'Invalid phone number');
    }

    const resetToken = await forgetPasswordService({email,phone});
    // send reset password token to email or phone

    return res.status(200).json(new ApiResponse(200, null, 'Reset password token sent successfully'));
});
