import React, { useState } from "react";
import "./login.css";
import { GoogleLogin } from "@react-oauth/google";
import DermAILogo from "./components/DermAILogo";
import { jwtDecode } from "jwt-decode";


export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        if (email === "admin@derm.ai" && password === "admin") {
            onLoginSuccess({ name: "Admin", email: "admin@derm.ai" });
        } else {
            setError("Invalid credentials. Try again!");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
                    <DermAILogo size={80} />
                </div>

                <h1 className="brand">Derm-AI</h1>
                <p className="subtitle">Smart Dermatology Assistant</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="error">{error}</p>}

                    <button type="submit" className="login-btn">
                        Sign In
                    </button>
                </form>

                <p className="or-line">OR</p>

                <GoogleLogin
                    onSuccess={(res) => {
                        console.log("GOOGLE LOGIN RAW RESPONSE:", res);

                        const decoded = jwtDecode(res.credential);
                        console.log("DECODED GOOGLE DATA:", decoded);

                        const userData = {
                            name: decoded.name,
                            email: decoded.email,
                            picture: decoded.picture,
                        };

                        console.log("CALLING onLoginSuccess WITH:", userData);

                        onLoginSuccess(userData);
                    }}

                />

            </div>
        </div>
    );
}
