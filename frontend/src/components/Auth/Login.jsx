import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { Backdrop, CircularProgress, TextField } from "@mui/material";


function Login() {
    const [user, setUser] = useState({
        username: "",
        password: ""
    })
    const [isLoading, setLoading] = useState(false);
    const navigate = useNavigate();
    function handleChange(event) {
        const { name, value } = event.target;
        setUser((prevItem) => {
            return {
                ...prevItem,
                [name]: value
            };
        })
    }
    async function handleClick() {
        if (user.username == "" || user.password == "") {
            alert("Please fill all the credentials.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify(user),
            });
            const result = await response.json();
            if (result.user) {
                const currentTimestamp = new Date();
                const isoString = currentTimestamp.toISOString();
                localStorage.setItem("user", JSON.stringify(result));
                localStorage.setItem("timestamp", JSON.stringify(isoString));
                navigate("/welcome");
                setLoading(false);
            } else {
                setLoading(false);
                setUser({
                    username: "",
                    password: ""
                })
                alert("Invalid Credentials!!");
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <Backdrop
                sx={{ color: "#fff", zIndex: 5 }}
                open={isLoading}
            >
                <CircularProgress color="secondary" />
            </Backdrop>

            <div className="signup-comp">
                <h1>Login to proceed</h1>
                <div className="login-form-box">
                    <TextField required={true} fullWidth margin="normal" label="Email" type="email" onChange={handleChange} className="form-email" name="username" value={user.username} />
                    <TextField required={true} fullWidth margin="normal" label="Password" type="password" onChange={handleChange} className="form-password" name="password" value={user.password} />
                    <button type="submit" onClick={handleClick} className="btn-register">Login</button>
                </div>
            </div>
        </>
    )
}

export default Login;