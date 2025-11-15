import React, { useState } from "react";
import "./login.css";
import { GoogleLogin } from "@react-oauth/google";
import DermAILogo from "./components/DermAILogo"; // Import logo

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
            onLoginSuccess();
        } else {
            setError("Invalid credentials. Try again!");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                
                {/* Added Logo here */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
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
                        console.log("Google Login Success:", res);
                        onLoginSuccess();
                    }}
                    onError={() => console.log("Google Login Failed")}
                />

            </div>
        </div>
    );
}