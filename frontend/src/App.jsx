import React, { useState } from "react";
import Login from "./login.jsx";
import Analyze from "./Analyze.jsx";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // After login, set this to true
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Use a React Fragment (<>) so it doesn't add an extra div
  return (
    <>
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Analyze />
      )}
    </>
  );
}