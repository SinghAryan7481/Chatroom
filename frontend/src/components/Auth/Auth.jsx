import Login from "./Login";
import Register from "./Register";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link, Paper, useMediaQuery } from "@mui/material";


function Auth() {
    const [login, setLogin] = useState(false);
    const isMobile = useMediaQuery("(max-width: 700px)");
    const navigate = useNavigate();
    
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("user"));
        const timestamp = JSON.parse(localStorage.getItem("timestamp"));
        if (userInfo && timestamp){
            const originalTimestamp = new Date(timestamp);
            const currentTimestamp = new Date();
            const timeDifference = currentTimestamp-originalTimestamp;
            const hoursDifference = timeDifference/(1000*60*60);
            if (hoursDifference >= 12) {
                localStorage.removeItem("user");
                localStorage.removeItem("timestamp");
                navigate("/");
            } else {
                navigate("/welcome");
            }
        }
    }, []);
    return (
        <div className={`${isMobile ? "auth-page-mobile" : "auth-page"}`}>
            {!isMobile && <div className="auth-image"></div>}
            <Paper className={`${isMobile ? "auth-sidebar-mobile" : "auth-sidebar"}`}>
                <div className="auth-container">
                    {!login ? <Register /> : <Login />}
                    {login ?
                        <p className="auth-toggle-paragraph">Don't have an account? <Link className="auth-toggle-link" onClick={() => setLogin(false)}>SignUp</Link></p>
                        :
                        <p className="auth-toggle-paragraph">Already have an account? <Link className="auth-toggle-link" onClick={() => setLogin(true)}>Login</Link></p>
                    }
                </div>
            </Paper>
        </div>
    )
}

export default Auth;