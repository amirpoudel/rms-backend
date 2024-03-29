import asyncHandler from '../utils/handler/asyncHandler';
import ApiError from '../utils/handler/ApiError';
import ApiResponse from '../utils/handler/ApiResponse';
import { COOKIE_OPTIONS, USER_ROLE } from '../constant';
import { Request, Response } from 'express';
import _ from 'lodash';
import {
    changePasswordService,
    forgetPasswordService,
    loginUserService,
    logoutUserService,
    refreshTokenService,
    registerUserWithRestaurantService,
    resetPasswordService,
    updateProfileService,
} from '../services/user.service';
import { UserRequest } from '../types/express.type';
import { isEmailValid, isPasswordValid, isPhoneValid, isValidString } from '../utils/helper';
import { uploadImageToS3 } from '../utils/aws/s3.aws';
import { updateRestaurantService } from '../services/restaurant.service';
import { sendEmail } from '../utils/queues/producer.queue';


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
    if (!response) {
        throw new ApiError(400, 'Invalid email or phone');
    }
   

    return res
        .status(200)
        .cookie('accessToken',response.accessToken, {
            path: '/',
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 4),
        })
        .cookie('refreshToken', response.refreshToken,{
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 4),
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
        const message = `Your reset password token is ${resetToken}`;
        if(email){
            sendEmail({
                to:email,
                subject:"Reset Password Token",
                body:message
            });
        }
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

export const resetPassowrd = asyncHandler((req:Request, res:Response) => {

    const {email,token,password} = req.body;
    if(!token || !email || !password){
        throw new ApiError(400,'Bad Request All fields are required');
    }

    if(!isPasswordValid(password)){
        throw new ApiError(400,'Password must be at least 8 characters long and contain at least one letter and one number');
    }

    // reset password
    const isResetSuccess = resetPasswordService({
        email,
        token,
        password,
    });
    if(!isResetSuccess){
        throw new ApiError(500,'Error resetting password');
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                'Password reset successfully'
            )
        );

});

export const changePassword = asyncHandler((req:UserRequest,res:Response)=>{
    const {oldPassword,newPassword} = req.body;
    const userId = req.user._id;
    if(!oldPassword || !newPassword){
        throw new ApiError(400,'All fields are required');
    }
    if(!isPasswordValid(newPassword)){
        throw new ApiError(400,'Password must be at least 8 characters long and contain at least one letter and one number');
    }
    
    // change password 
    const isChanged = changePasswordService(userId.toString(),{
        oldPassword,
        newPassword
    })
    if(!isChanged){
        throw new ApiError(500,'Error changing password');
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                'Password reset successfully'
            )
        );
})


export const updateProfile = asyncHandler((req:UserRequest,res:Response)=>{
    const {name,phone} = req.body;
    const userId = req.user._id;

    if(!name && !phone){
        throw new ApiError(400,'All fields are required');
    }

    if(name && !isValidString(name)){
        throw new ApiError(400,'Only alphabets and spaces are allowed');
    }
    if(phone && !isPhoneValid(phone)){
        throw new ApiError(400,'Invalid phone number');
    }

    // update profile 
    const isUpdated = updateProfileService(userId.toString(),{
        name: name as string,
        phone: phone as string
    })
    if(!isUpdated){
        throw new ApiError(500,'Error updating profile');
    }
    return res.status(200).json(new ApiResponse(200,null,'Profile updated successfully'));

})

export const updateProfileImage = asyncHandler((req:UserRequest,res:Response)=>{
    const userId = req.user._id;
    const profileImage = req.file;
    if(!profileImage){
        throw new ApiError(400,'Profile image is required');
    }

    // upload image to s3
    uploadImageToS3(profileImage).then(
        async (url): Promise<void> => {
           
        }
    );

    return res.status(200).json(new ApiResponse(200,null,'Profile image updated successfully'));
});

export const refreshToken = asyncHandler((req:UserRequest,res:Response)=>{
    const refreshToken = req.cookies.refreshToken;
    const userId = req.user._id;
    if(!refreshToken){
        throw new ApiError(400,'Refresh token is required');
    }
    // verify refresh token
    const newRrefreshToken = refreshTokenService(userId.toString(),refreshToken);
    if(!newRrefreshToken){
        throw new ApiError(400,'Invalid refresh token');
    }
    return res
        .status(200)
        .cookie('accessToken',newRrefreshToken, {
            path: '/',
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 4),
        })
        .json(new ApiResponse(200, newRrefreshToken, 'Token refreshed successfully'));
})



