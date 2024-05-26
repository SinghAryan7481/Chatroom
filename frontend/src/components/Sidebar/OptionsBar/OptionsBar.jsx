import "./OptionsBar.css";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Avatar } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { toggleDarkMode } from "../../../Features/darkModeSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useChat } from "../../../context/ChatContext";
import { changePopupImage, togglePopup } from "../../../Features/popupImageSlice";


function OptionsBar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const darkTheme = useSelector((state) => state.darkMode);
    const [name, setName] = useState("");
    const [picture, setPicture] = useState("");
    const [modalPicture, setModalPicture] = useState("");
    const [newUser, setNewUser] = useState("");
    const [users, setUsers] = useState([]);
    const [show, setShow] = useState(false);
    const { setSelectedChat, chats, setChats } = useChat();

    useEffect(() => {
        let user = localStorage.getItem("user");
        user = JSON.parse(user);
        setName(user.user.name);
        setPicture(user.user.resizedPicture);
        setModalPicture(user.user.picture);
    }, []);

    function logout() {
        localStorage.removeItem("user");
        setChats([]);
        setSelectedChat();
        navigate("/");
    }

    const findUser = async (e) => {
        setNewUser(e.target.value);
        const userInfo = JSON.parse(localStorage.getItem("user"));
        try {
            const response = await fetch(`http://localhost:8080/users?search=${e.target.value}`, {
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
            if (result.length > 3) {
                setUsers(result.slice(0, 3));
            }
            else {
                setUsers(result);
            }
            setShow(true);
        } catch (error) {
            console.log(error);
        }
    }

    const handleBlur = () => {
        setTimeout(() => {
            if (!document.activeElement.closest('.search-results')) {
                setShow(false);
            }
        }, 0);
    }

    const handleKeyDown = (e) => {
        if(e.key==='Esc' || e.key==='Escape'){
            setShow(false);
        }
    }

    const startNewChat = async (id) => {
        const data = {
            userId: id
        }
        setNewUser("");
        const userInfo = JSON.parse(localStorage.getItem("user"));
        try {
            const response = await fetch("http://localhost:8080/chats", {
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
            if (result != []) {
                setChats([result[0], ...chats]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const triggerModal = () => {
        const url = modalPicture;
        dispatch(togglePopup());
        dispatch(changePopupImage(url));
    }

    return (
        <div className={"options-container " + (!darkTheme ? "" : "dark-theme-font")}>
            <div className="user-profile">
                <div className="user-image">
                    <Avatar src={picture} onClick={triggerModal} name={name} />
                </div>
                <div className="username">
                    <h2 onClick={() => {
                        setSelectedChat();
                        navigate("/welcome");
                    }}>{name}</h2>
                </div>
            </div>
            <hr />
            <div className="search-bar-and-options">
                <div>
                    <div className="search-bar">
                        <input id="search" type="text" placeholder="Search" value={newUser} onChange={findUser} onKeyDown={handleKeyDown} onBlur={handleBlur} />
                    </div>

                    {show && <div className="search-results">
                        {
                            users.map((el, index) => {
                                return (
                                    <>
                                        <div key={el._id} className="searched-names" onMouseDown={() => startNewChat(el._id)}>
                                            <div className="searched-user-image">
                                                <Avatar src={el.resizedPicture} name={el.name} />
                                            </div>
                                            <div>{el.name}</div>
                                        </div>
                                        {index < 2 && <hr className="search-result-hr" />}
                                    </>
                                )
                            })
                        }
                    </div>}
                </div>

                <div className="options-div">
                    <GroupAddIcon titleAccess="Join Group" onClick={() => navigate("/join")} />
                    <AddCircleOutlineIcon titleAccess="Create Group" onClick={() => navigate("/create")} />
                    <DarkModeIcon titleAccess="Change Theme" onClick={() => {
                        dispatch(toggleDarkMode())
                    }} />
                    <LogoutIcon titleAccess="Log Out" onClick={logout} />
                </div>
            </div>
        </div>
    )
}

export default OptionsBar;