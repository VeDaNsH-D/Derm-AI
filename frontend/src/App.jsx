import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './login';
import Analyze from './Analyze';
import Home from './home';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Landing page / home */}
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/analyze" replace />
            ) : (
              <Login onLoginSuccess={() => setIsLoggedIn(true)} />
            )
          }
        />

        <Route
          path="/analyze"
          element={
            isLoggedIn ? <Analyze /> : <Navigate to="/login" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
