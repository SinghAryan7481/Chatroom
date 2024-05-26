import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    }],
    picture: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
    resizedPicture: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
}, {timestamps:true})


const User = mongoose.model("User", userSchema);

export { User };