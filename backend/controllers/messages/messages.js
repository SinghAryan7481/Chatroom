import { User } from "../../models/user.js";
import { Chat } from "../../models/chat.js";
import { Message } from "../../models/message.js";
import asyncHandler from 'express-async-handler';

const getMessages = asyncHandler( async (req, res) => {
    try {
        const messages = await Message.find({chatId:req.params.chatId})
        .populate("sender", "name resizedPicture username")
        .populate("chatId");

        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

const createMessages = asyncHandler( async (req, res) => {
    const {text, chatId} = req.body;
    if(!text || !chatId) {
        res.status(401).json({message: "Invalid data!!"})
    }
    let newMessage = {
        sender: req.userId,
        text: text,
        chatId: chatId
    }
    try {
        let message = await Message.create(newMessage);

        message = await message.populate("sender", "name resizedPicture");
        message = await message.populate("chatId");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic username"
        })

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message,
        })
        res.status(201).json(message);
    } catch (error) {
        res.status(401).json({message: error.message})
    }
})

export {getMessages, createMessages};