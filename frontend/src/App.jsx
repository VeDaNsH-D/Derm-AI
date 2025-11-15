// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Analyze from "./Analyze";
import Home from "./home";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/analyze" replace />
            ) : (
              <Login
                onLoginSuccess={(userData) => {
                  setUser(userData);
                  setIsLoggedIn(true);
                }}
              />
            )
          }
        />

        <Route
          path="/analyze"
          element={
            isLoggedIn ? (
              <Analyze
                user={user}
                onLogout={() => {
                  setUser(null);
                  setIsLoggedIn(false);
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
