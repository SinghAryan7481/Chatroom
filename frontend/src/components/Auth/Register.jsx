import React, { useState } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { Backdrop, CircularProgress, TextField } from "@mui/material";


function Register() {
    const [user, setUser] = useState({
        name: "",
        username: "",
        password: ""
    })
    const [picture, setPic] = useState("");
    const [resizedPicture, setResizedPic] = useState("");
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

    const resizeImage = async (pic) => {
        setLoading(true);
        if (!pic) {
            setLoading(false);
            return;
        }
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 144,
            useWebWorker: true
        }
        try {
            const result = await imageCompression(pic, options);
            const newPic = new File([result], `compressed-${pic.name}`, { lastModified: result.lastModified });
            PostDetails(pic, newPic, 0);
            
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const PostDetails = (pic, newPic, num) => {
        const data = new FormData();
        data.append("file", pic);
        data.append("upload_preset", "Coride Chat");
        data.append("cloud_name", "dfj3rhjvl");
        fetch("https://api.cloudinary.com/v1_1/dfj3rhjvl/image/upload", {
            method: "POST",
            body: data,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data.url.toString());
                if (num === 0) {
                    setPic(data.url.toString());
                    PostDetails(newPic, newPic, 1);
                }
                else {
                    setResizedPic(data.url.toString());
                    setLoading(false);
                }
            }).catch(error => {
                console.log(error);
            })
    }

    async function handleClick() {
        if (user.name == "" || user.username == "" || user.password == "" || picture == "") {
            alert("Please fill all the fields!!");
            return;
        }
        setLoading(true);
        const newUser = {
            name: user.name,
            username: user.username,
            password: user.password,
            picture: picture,
            resizedPicture: resizedPicture
        }
        try {
            const response = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify(newUser),
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
                    name: "",
                    username: "",
                    password: ""
                })
                alert("Username already exists!!");
            }
        } catch (error) {
            console.error(error);
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
                <h1>Sign Up to Proceed</h1>
                <div className="register-form-box">
                    <TextField required={true} fullWidth margin="normal" label="Name" type="name" onChange={handleChange} className="form-email" name="name" value={user.name} />
                    <TextField required={true} fullWidth margin="normal" label="Email" type="email" onChange={handleChange} className="form-email" name="username" value={user.username} />
                    <TextField required={true} fullWidth margin="normal" label="Password" type="password" onChange={handleChange} className="form-password" name="password" value={user.password} />
                    <div className="picture-input-container">
                        <label >Picture:</label>
                        <div className="picture-input-div">
                            <input type="file" accept="image/*" onChange={(e) => resizeImage(e.target.files[0])} id="form-picture" />
                        </div>
                    </div>
                    <button type="submit" onClick={handleClick} className="btn-register">SignUp</button>
                </div>
            </div>
        </>
    )
}

export default Register;
