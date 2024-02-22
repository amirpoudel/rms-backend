import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import crypto from 'crypto';

const accessTokenSecrect:string|undefined = process.env.ACCESS_TOKEN_SECRECT;
const refreshTokenSecrect:string|undefined = process.env.REFRESH_TOKEN_SECRECT;
const accessTokenExpiry:string|undefined = process.env.ACCESS_TOKEN_EXPIRY;
const refreshTokenExpiry:string|undefined = process.env.REFRESH_TOKEN_EXPIRY;

interface IUserPasswordReset{
    token:string | null,
    expiry:Date | null,
}

interface IUser {
    restaurant:mongoose.Schema.Types.ObjectId,
    name:string,
    email:string,
    phone:string,
    profileImage:string,
    role:string,
    password:string,
    passwordChangeAt:Date,
    passwordReset: IUserPasswordReset,
    refreshToken:string,
    comparePassword:(password:string)=>boolean
    generateAccessToken:()=>string,
    generateRefreshToken:()=>string,
    generatePasswordResetToken:()=>string,
}


const userSchema = new mongoose.Schema<IUser>({
    restaurant:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"Restaurant",
       required:true,
    },
    name:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
    },
    email:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
        unique:true,
        index:true,
    },
    phone:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
        index:true,
    },
    profileImage:{
        type:String,
    },
    role:{
        type:String,
        required:true,   
    },
    password:{
        type:String,
        required:true,
    },
    refreshToken:{
        type:String,
    },
    passwordReset : {
        token:String,
        expiry:Date
    }

})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (password:string) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
        _id: this._id,
        restaurant:this.restaurant,
        email: this.email, 
        name: this.name,
        role:this.role
        },
        accessTokenSecrect as Secret,
        { expiresIn: accessTokenExpiry }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, refreshTokenSecrect as Secret, {
        expiresIn: refreshTokenExpiry,
    });
};

userSchema.methods.generatePasswordResetToken = function ():string{

    const resetToken = crypto.randomBytes(3).toString('hex');
    this.passwordReset.token = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordReset.expiry = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
}

export const User = mongoose.model<IUser>("User",userSchema);


