import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import SignUp from './SignUp';
import Login from './Login';
import HomePage from './HomePage';
import Search from './Search';
import MyLog from './MyLog';
import Profile from './Profile';
import Navbar from './Navbar';

const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on initial render
  useEffect(() => {
    if (localStorage.getItem('username')) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Landing Page (no navbar) */}
        <Route path="/" element={<LandingPage />} />

        {/* Redirect to HomePage if already logged in */}
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <SignUp />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />

        {/* Pages with Navbar that are accessible only after logging in */}
        {isAuthenticated && (
          <>
            <Route path="/home" element={<><Navbar /><HomePage /></>} />
            <Route path="/search" element={<><Navbar /><Search /></>} />
            <Route path="/mylog" element={<><Navbar /><MyLog /></>} />
            <Route path="/profile" element={<><Navbar /><Profile /></>} />
          </>
        )}

        {/* If user is not authenticated, redirect to Landing Page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
