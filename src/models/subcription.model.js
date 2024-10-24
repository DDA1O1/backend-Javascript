import mongoose, { Schema } from "mongoose";

const subcriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User",
        required: true
    },
    subscribedTo: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribed
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model("Subcription", subcriptionSchema)