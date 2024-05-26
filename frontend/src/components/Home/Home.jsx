import React, { useEffect, useRef, useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import Chat from "../Chat/Chat";
import InputChat from "../Input/Input";
import Header from "../Header/Header";
import ScrollableFeed from "react-scrollable-feed";
import "./Home.css";
import { useChat } from "../../context/ChatContext";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:8080";
let socket, selectedChatCompare;

function Home() {
  const [chats, setChats] = useState([]);
  const [mode, setMode] = useState("Online");
  const { selectedChat, setSelectedChat } = useChat();
  const [socketConnected, setSocketConnected] = useState(false);
  const scrollableDivRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.on("connect", ()=>setSocketConnected(true));
  }, [])

  async function getChats() {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (!selectedChat) return;
    try {
      const response = await fetch(`http://localhost:8080/messages/${selectedChat._id}`, {
        method: "GET",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      });
      const result = await response.json();
      setChats(result);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    socket.on("message received", (newMessageReceived)=>{
      if(!selectedChatCompare || selectedChatCompare._id != newMessageReceived.chatId._id){
        // notifications...
      }else {
        setChats([...chats, newMessageReceived]);
      }
    })
  });

  useEffect(() => {
    getChats();
    selectedChatCompare=selectedChat;
  }, [selectedChat])

  async function sendMessage(newChat) {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    const data = {
      text: newChat,
      chatId: selectedChat._id
    }
    try {
      const response = await fetch("http://localhost:8080/messages", {
        method: "POST",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      socket.emit("newMessage", result);
      setChats([...chats, result]);
    } catch (error) {
      console.log(error);
    }
  }

  return (
      <Grid templateRows="1.5fr 8fr 1.5fr" height="90vh" gap="10px">
        <GridItem
        >
          <Header />
          {mode == "Offline" && <p style={{ "color": "red", "textAlign": "center", "backgroundColor": "#ffd400", "padding": "6px", "margin": "-10px -20px" }}>You are offline!! Go online to view new chats.</p>}
        </GridItem>
        <GridItem
          className="chatBox"
          ref={scrollableDivRef}
        >
          <ScrollableFeed>
            {
              [...chats].map((chat) => {
                return (
                  <Chat key={chat._id} data={chat} />
                )
              })
            }
          </ScrollableFeed>
        </GridItem>
        <GridItem
        >
          <InputChat onSubmit={sendMessage} />
        </GridItem>
      </Grid>
  );
}

export default Home;
