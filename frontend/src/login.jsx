import React, { useState } from "react";
import "./login.css";

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
            </div>
        </div>
    );
}
