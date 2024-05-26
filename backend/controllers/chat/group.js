import { User } from "../../models/user.js";
import { Chat } from "../../models/chat.js";

async function findGroups(req, res) {
    const keyword = req.query.search
        ? {
            $and: [
                { name: { $regex: req.query.search, $options: "i" } },
            ]
        }
        : {};
    const chats = await Chat.find(keyword).find({ isGroup: true });
    res.send(chats);
}

async function createGroups(req, res) {
    if (!req.body.name || !req.body.userIds || req.body.userIds.length == 0) {
        res.status(400).json("Incomplete Information.");
    }
    else {
        let users = req.body.userIds;
        users.push(req.userId);
        try {
            const groupChat = await Chat.create({
                name: req.body.name,
                isGroup: true,
                admin: req.userId,
                users: users,
            })

            const newGroupChat = await Chat.findOne({ _id: groupChat._id })
                .populate("users", "-password")
                .populate("admin", "-password");

            res.status(201).json(newGroupChat);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}

async function joinInGroups(req, res) {
    if (!req.body.id) res.status(400).json("No groupId");
    let groups = await Chat.find({
        isGroup: true,
        _id: req.body.id,
        $and: [
            { users: { $elemMatch: { $eq: req.userId } } }
        ]
    });
    if (groups.length > 0) {
        res.status(200).json([]);
    }
    else {
        try {
            const group = await Chat.findByIdAndUpdate(req.body.id, { $push: { users: req.userId } }, { new: true })
                .populate("users", "-password")
                .populate("admin", "-password")
                .populate("lastMessage");

            group = await User.populate(group, {
                path: "lastMessage.sender",
                select: "name username",
            });

            res.status(201).json(group);

        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}

// ...........Unused........... //

async function renameGroups(req, res) {
    try {
        const group = await Chat.find({_id:req.body.chatId, admin: req.userId})
        if(!group) return res.status(401).json({'message': 'Only admins can change group name!'})
        const newGroup = await Chat.findByIdAndUpdate(req.body.chatId, { $set: { name: req.body.name } }, { new: true })
            .populate("users", "-password")
            .populate("admin", "-password");
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}

async function addInGroups(req, res) {
    try {
        const group = await Chat.find({_id:req.body.chatId, admin: req.userId})
        if(!group) return res.status(401).json({'message': 'Only admins can add in group!'})
        const newGroup = await Chat.findByIdAndUpdate(req.body.chatId, { $push: { users: req.body.userId } }, { new: true })
            .populate("users", "-password")
            .populate("admin", "-password");
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}

async function removeFromGroups(req, res) {
    try {
        const group = await Chat.find({_id:req.body.chatId, admin: req.userId})
        if(!group) return res.status(401).json({'message': 'Only admins can remove from group!'})
        const newGroup = await Chat.findByIdAndUpdate(req.body.chatId, { $pull: { users: req.body.userId } }, { new: true })
            .populate("users", "-password")
            .populate("admin", "-password");
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}


export { findGroups, createGroups, renameGroups, joinInGroups, addInGroups, removeFromGroups };