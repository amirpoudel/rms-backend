
import mongoose from "mongoose";
//import { deleteFromCloudinary, deleteMultipleFromCloudinary } from "../../utils/cloudinary.js";

export interface IMenuCategory {
   _id?: mongoose.Schema.Types.ObjectId;
    restaurant:mongoose.Schema.Types.ObjectId,
    name:string,
    description:string,
    imageLink?: string[] | [],
}

export interface IMenuItem{
    _id?: mongoose.Schema.Types.ObjectId;
    restaurant?:mongoose.Schema.Types.ObjectId,
    category?:mongoose.Schema.Types.ObjectId,
    name:string,
    price:number,
    discountPercentage?:number,
    description:string,
    isVeg?:boolean,
    containsEggs?:boolean,
    isSpecial?:boolean,
    isRecommended?:boolean,
    isAvailable?:boolean,
    imageLink?: string|null,
}

const menuCategorySchema = new mongoose.Schema<IMenuCategory>({
    restaurant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Restaurant",
        required:true
    },
    name:{
        type:String,
        required:true,
        
    },
    description:{
        type:String,
        
    },
    imageLink: {
        type: [String],
      }

},{
    timestamps:true
})

// Define a compound unique index
menuCategorySchema.index({ restaurant: 1, name: 1 }, { unique: true });



const menuItemSchema = new mongoose.Schema<IMenuItem>({
    restaurant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Restaurant",
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"MenuCategory",
        required:true
    },
    name:{
        type:String,
        required:true,
        lowercase:true,
        trim: true,   
    },
    price:{
        type:Number,
        required:true
    },
    discountPercentage:{
        type:Number,
        min:[0,"Discount cannot be negative"],
        max:[100,"Discount cannot be greater than 100%"],
        default:0
    },
    description:{
        type:String,
        trim:true,
    },
    isVeg: {
        type: Boolean,
        default: false,
    },
    containsEggs: {
        type: Boolean,
        default: false,
    },
    isSpecial: {
        type: Boolean,
        default: false,
    },
    isRecommended: {
        type: Boolean,
        default: false,
    }, 
    isAvailable: {
        type: Boolean,
        default: true,
    },
    
    imageLink: {
        type: String,

    },

},{
    timestamps:true
})

menuItemSchema.index({ restaurant: 1,name: 1 }, { unique: true });

const MenuCategory = mongoose.model<IMenuCategory>("MenuCategory",menuCategorySchema);
const MenuItem = mongoose.model<IMenuItem>("MenuItem",menuItemSchema);


export {MenuCategory,MenuItem}
