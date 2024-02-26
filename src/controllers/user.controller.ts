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
import { isEmailValid, isPasswordValid, isPhoneValid, isValidString } from '../utils/helper';
import { uploadImageToS3 } from '../utils/aws/s3.aws';
import { updateRestaurantService } from '../services/restaurant.service';

export const registerUserWithRestaurant = asyncHandler(
    async (req: Request, res: Response) => { 
        const {
            restaurantName,
            restaurantUserName,
            ownerName,
            ownerEmail,
            ownerPhone,
            password,
        } = req.body;
        console.log(req.body);

        if (
            !restaurantName ||
            !restaurantUserName ||
            !ownerName ||
            !ownerEmail ||
            !ownerPhone ||
            !password
        ) {
            throw new ApiError(400, 'All fields are required');
        }
        if(!isValidString(restaurantName) || !isValidString(ownerName)){
            throw new ApiError(400, 'Only alphabets and spaces are allowed');
        }
        if (!isEmailValid(ownerEmail)) {
            throw new ApiError(400, 'Invalid email');
        }
        if (!isPasswordValid(password)) {
            throw new ApiError(
                400,
                'Password must be at least 8 characters long and contain at least one letter and one number'
            );
        }
        const restaurantImage = req?.file

        const { restaurant, owner } = await registerUserWithRestaurantService(
            {
                name: restaurantName,
                username: restaurantUserName,
            },
            {
                name: ownerName,
                email: ownerEmail,
                phone: ownerPhone,
                role: USER_ROLE.OWNER,
                password: password,
            }
        );
        if (!restaurant || !owner) {
            throw new ApiError(500, 'Error creating restaurant and owner');
        }
        if (restaurantImage) {
            // upload image to s3
            uploadImageToS3(restaurantImage).then(
                async (url): Promise<void> => {
                    console.log('This is Url ', url);
                    if (url) {
                        console.log(url);
                        if (restaurant._id) {
                            console.log('I am updating restaurant image');
                            updateRestaurantService(restaurant._id.toString(), {
                                profileImage: url,
                            });
                        }
                    }
                }
            );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
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
        .cookie('accessToken',response.accessToken, {
            path: '/',
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
        })
        .cookie('refreshToken', response.refreshToken,{
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        } )
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

export const forgetPassowrd = asyncHandler(
    async (req: Request, res: Response) => {
        const { email, phone } = req.body;
        if (!email && !phone) {
            throw new ApiError(400, 'Email or phone is required');
        }
        if (email && !isEmailValid(email)) {
            throw new ApiError(400, 'Invalid email');
        }
        if (phone && !isPhoneValid(phone)) {
            throw new ApiError(400, 'Invalid phone number');
        }

        const resetToken = await forgetPasswordService({ email, phone });
        // send reset password token to email or phone

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    'Reset password token sent successfully'
                )
            );
    }
);
