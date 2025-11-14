import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Analyze from "./Analyze";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>

        {/* Landing page → Login */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Navigate to="/analyze" replace />
              : <Login onLoginSuccess={() => setIsLoggedIn(true)} />
          }
        />

        {/* Protected Analyze page */}
        <Route
          path="/analyze"
          element={
            isLoggedIn
              ? <Analyze />
              : <Navigate to="/" replace />
          }
        />

      </Routes>
    </Router>
  );
}
