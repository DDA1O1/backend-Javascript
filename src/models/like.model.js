import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
    
}, {
    timestamps: true
})

export default mongoose.model("Like", likeSchema)