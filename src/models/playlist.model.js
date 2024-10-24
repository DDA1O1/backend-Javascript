import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videos: [{
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    }]
    }, {
        timestamps: true
    })

export default mongoose.model("Playlist", playlistSchema)
    
