import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';

const accessTokenSecrect:string|undefined = process.env.ACCESS_TOKEN_SECRECT;
const refreshTokenSecrect:string|undefined = process.env.REFRESH_TOKEN_SECRECT;
const accessTokenExpiry:string|undefined = process.env.ACCESS_TOKEN_EXPIRY;
const refreshTokenExpiry:string|undefined = process.env.REFRESH_TOKEN_EXPIRY;

interface IUser {
    restaurant:mongoose.Schema.Types.ObjectId,
    name:string,
    email:string,
    phone:string,
    profileImage:string,
    role:string,
    password:string,
    refreshToken:string,
    comparePassword:(password:string)=>boolean,
    generateAccessToken:()=>string,
    generateRefreshToken:()=>string
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

const User = mongoose.model<IUser>("User",userSchema);

export {User}
