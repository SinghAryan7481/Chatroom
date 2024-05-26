import { Avatar } from '@chakra-ui/react';
import "./ChatsBox.css";
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { useEffect, useState } from 'react';
import { useChat } from '../../../context/ChatContext';


function ChatsBox() {
    const navigate = useNavigate();
    const darkTheme = useSelector((state) => state.darkMode);
    const { chats, setSelectedChat } = useChat();

    function getChatPicture(chat) {
        const userInfo = JSON.parse(localStorage.getItem("user"));
        if (userInfo.user._id == chat.users[0]._id) return chat.users[1].resizedPicture;
        else return chat.users[0].resizedPicture;
    }

    function getChatName(chat) {
        const userInfo = JSON.parse(localStorage.getItem("user"));
        if (userInfo.user._id == chat.users[0]._id) return chat.users[1].name;
        else return chat.users[0].name;
    }

    return (
        <div className={"panel-chats-container" + (darkTheme ? " dark-theme-font" : "")}>
            <div className="panel-chats-box">

                {chats.map((chat) => {
                    return (
                        <div key={chat._id} className={"chat-box" + (darkTheme ? " dark-chat-box" : "")} onClick={() => {
                            setSelectedChat(chat);
                            navigate("/chat");
                        }}>
                            <div className="chat-avatar">
                                <Avatar src={chat.isGroup ? chat.picturePath : getChatPicture(chat)} name={chat.isGroup ? chat.name : getChatName(chat)} />
                            </div>
                            <div className="chat-name-and-desc">
                                <h3>{chat.isGroup ? chat.name : getChatName(chat)}</h3>
                                <div className='last-message'>
                                    {chat.lastMessage ? <p>{chat.isGroup ? chat.lastMessage.sender.name.split(" ")[0].slice(0,15) + " : " : null} {chat.lastMessage.text.slice(0,20)}</p> : <p>No new message.</p>}
                                    {chat.lastMessage ? <span>{chat.lastMessage.createdAt.split("T")[1].split(".")[0].slice(0, 5)}</span> : <span>Today</span>}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ChatsBox;