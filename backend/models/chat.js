import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    name: String,
    isGroup: {
        type: Boolean,
        default: false
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    picturePath: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
}, {timestamps:true})


const Chat = mongoose.model("Chat", chatSchema);

export { Chat };