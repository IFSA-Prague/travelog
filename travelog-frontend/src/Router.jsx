import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingPage from "./LandingPage";
import SignUp from "./SignUp";
import Login from "./Login";
import HomePage from "./HomePage";
import Navbar from "./Navbar";
import Search from "./Search";
import MyLog from "./MyLog";

const AppRouter = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"));
  const [showNavbar, setShowNavbar] = useState(false);

  const handleStorageChange = () => {
    setIsLoggedIn(!!localStorage.getItem("user"));
  };

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Determine whether to show navbar
  const location = useLocation();
  useEffect(() => {
    const publicRoutes = ["/", "/signup", "/login"];
    setShowNavbar(isLoggedIn && !publicRoutes.includes(location.pathname));
  }, [location, isLoggedIn]);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/mylog" element={<MyLog />} />
      </Routes>
    </>
  );
};

// This wrapper is needed to use `useLocation` outside of Routes
const RouterWrapper = () => (
  <Router>
    <AppRouter />
  </Router>
);

export default RouterWrapper;
