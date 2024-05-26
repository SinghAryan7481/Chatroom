import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const socket = require("socket.io");
import { register, login } from "./controllers/auth/login.js";
import auth from "./middleware/auth.js";
import { findGroups, createGroups, renameGroups, joinInGroups, addInGroups, removeFromGroups } from "./controllers/chat/group.js";
import { changePicture, getUsers } from "./controllers/user/user.js";
import { accessChats, getChats } from "./controllers/chat/chat.js";
import { getMessages, createMessages } from "./controllers/messages/messages.js";
const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
dotenv.config();

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
.then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('Error connecting to MongoDB:', error);
});

app.post("/auth/register", register);
app.post("/auth/login", login);

app.get("/users", auth, getUsers);

app.get("/chats", auth, getChats);
app.post("/chats", auth, accessChats);

app.get("/groups",auth,findGroups);
app.post("/groups", auth, createGroups);
app.patch("/groups", auth, renameGroups);
app.patch("/groupAdd", auth, joinInGroups);
app.patch("/groupremove", auth, removeFromGroups);
app.patch("/groupadd", auth, addInGroups);

app.get("/messages/:chatId", auth, getMessages);
app.post("/messages", auth, createMessages);

// app.patch("/profile", auth, changePicture);

const server = app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});

const io = socket(server, {
    cors:{
        origin: "http://localhost:3000"
    }
});

io.on("connection", (socket)=>{
    console.log("Connected to socket.io");

    socket.on("join chat", (room)=>{
        socket.join(room);
    })

    socket.on("newMessage", (newMessageReceived)=>{
        let chat = newMessageReceived.chatId._id;
        socket.to(chat).emit("message received", newMessageReceived);
    })
})