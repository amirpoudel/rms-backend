import mongoose from "mongoose";

export interface IFeedback {
    restaurant:mongoose.Schema.Types.ObjectId,
    feedback:string,
    rating:number,
}

const feedbackSchema = new mongoose.Schema<IFeedback>({
    restaurant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Restaurant",
        required:true
    },
    feedback:{
        type:String,
        required:true,
    },
    rating:{
        type:Number,
    }
})

export const Feedback = mongoose.model("Feedback",feedbackSchema);


