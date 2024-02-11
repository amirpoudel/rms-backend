
import mongoose from "mongoose";
//import { deleteFromCloudinary, deleteMultipleFromCloudinary } from "../../utils/cloudinary.js";

interface IMenuCategory {
    restaurant:mongoose.Schema.Types.ObjectId,
    name:string,
    description:string,
    imageLink: string[],
}

interface IMenuItem{
    restaurant:mongoose.Schema.Types.ObjectId,
    category:mongoose.Schema.Types.ObjectId,
    name:string,
    price:number,
    discountPercentage:number,
    description:string,
    flags:{
        isVeg:boolean,
        containsEggs:boolean,
        isSpecial:boolean,
        isRecommended:boolean,
        isAvailable:boolean,
    },
    imageLink: string,
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

    flags:{
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
    },
    imageLink: {
        type: String,

    },

},{
    timestamps:true
})




// middleware



// menuCategorySchema.post("remove",async function (doc,next){
//     // need to complete this logic
//     try {
//         console.log("This is Menu Category FROM MIDDLEWARE",doc)
//         console.log("Deleting menu items of category",doc._id);
//         await mongoose.model("MenuItem").deleteMany({categoryId:doc._id,restaurantId:doc.restaurantId});
//         next();
//     } catch (error) {
//         next(error)
//     }
//     if(doc.imageLink){
//         console.log("Deleting from Cloudinary",doc.imageLink)
//         deleteMultipleFromCloudinary(doc.imageLink);
//     }
// })

// menuItemSchema.post("remove",async function (doc,next){
//     if(doc.imageLink){
//         console.log("Deleting from Cloudinary",doc.imageLink)
//         deleteFromCloudinary(doc.imageLink);
//     }
// })





const MenuCategory = mongoose.model<IMenuCategory>("MenuCategory",menuCategorySchema);
const MenuItem = mongoose.model<IMenuItem>("MenuItem",menuItemSchema);


export {MenuCategory,MenuItem}
