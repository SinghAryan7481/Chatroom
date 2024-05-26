import { User } from "../../models/user.js";
import { Chat } from "../../models/chat.js";
import asyncHandler from 'express-async-handler';


const getChats = asyncHandler(async (req, res) => {
    try {
        let chats = await Chat.find({ users: { $elemMatch: { $eq: req.userId } } })
            .populate("users", "-password")
            .populate("admin", "-password")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });
        chats = await User.populate(chats, {
            path: "lastMessage.sender",
            select: "name username",
        });
        res.send(chats);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})


const accessChats = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) res.status(400).json("No userId");


    let chats = await Chat.find({
        isGroup: false,
        $and: [
            { users: { $elemMatch: { $eq: userId } } },
            { users: { $elemMatch: { $eq: req.userId } } }
        ]
    }).populate("users", "-password").populate("lastMessage");
    chats = await User.populate(chats, {
        path: "lastMessage.sender",
        select: "name username",
    });
    if (chats.length > 0) {
        res.status(200).json([]);
    }
    else {
        const receiver = await User.find({ _id: userId });
        const sender = await User.find({ _id: req.userId });
        const chatName = sender[0].name + "+" + receiver[0].name;
        const picturePath = sender[0].resizedPicture + "+" + receiver[0].resizedPicture;
        const newChat = {
            name: chatName,
            isGroup: false,
            users: [userId, req.userId],
            picture: picturePath
        };
        try {
            const createdChat = await Chat.create(newChat);
            const updatedReceiver = await User.findByIdAndUpdate(userId, { $push: { chats: createdChat._id } });
            const updatedSender = await User.findByIdAndUpdate(req.userId, { $push: { chats: createdChat._id } });
            const result = await Chat.find({ _id: createdChat._id }).populate("users", "-password");
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
})


export { accessChats, getChats };