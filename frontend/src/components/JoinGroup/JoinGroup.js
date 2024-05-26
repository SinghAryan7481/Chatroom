import { useSelector } from "react-redux";
import { useState } from "react";
import { Avatar } from "@chakra-ui/react";
import "./JoinGroup.css";
import { useChat } from "../../context/ChatContext";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate } from "react-router-dom";

function JoinGroup() {
    const [name, setName] = useState("");
    const navigate = useNavigate();
    const darkTheme = useSelector((state) => state.darkMode);
    const [groups, setGroups] = useState([]);
    const [show, setShow] = useState(false);
    const { chats, setChats, setSelectedChat } = useChat();

    const fetchGroups = async (e) => {
        setName(e.target.value)
        const userInfo = JSON.parse(localStorage.getItem("user"));
        try {
            const response = await fetch(`http://localhost:8080/groups?search=${e.target.value}`, {
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
                setGroups(result.slice(0, 3));
            }
            else {
                setGroups(result);
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

    async function joinGroup(id) {
        const userInfo = JSON.parse(localStorage.getItem("user"));
        const data = {
            id: id
        }
        try {
            const response = await fetch("http://localhost:8080/groupAdd", {
                method: "PATCH",
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
                setChats([...chats, result]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className={"create-group-container join-group-container" + (darkTheme ? " dark-create-div" : "")}>
            <div className="return-arrow-div">
                <KeyboardBackspaceIcon titleAccess="back" className={"return-arrow"+(darkTheme ? " dark-theme-font" : "")} onClick={() => {
                    setSelectedChat();
                    navigate("/welcome");
                }} /> <span className={darkTheme ? " dark-theme-font" : null}>Return</span>
            </div>
            <div className="join-group">
                <div className="join-group-search-bar">
                    <input type="text" placeholder="Enter group name" className="join-group-input" value={name} onChange={fetchGroups} onBlur={handleBlur} />
                </div>
                {show && <div className="searched-groups">
                    {
                        groups.map((el, index) => {
                            return (
                                <>
                                    <div key={index} className="searched-names" onMouseDown={() => joinGroup(el._id)}>
                                        <div className="searched-user-image">
                                            <Avatar src={el.picturePath} name={el.name} />
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

        </div>
    )
}

export default JoinGroup;