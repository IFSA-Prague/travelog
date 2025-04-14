import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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

  const handleStorageChange = () => {
    setIsLoggedIn(!!localStorage.getItem("user"));
  };

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Router>
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/mylog" element={<MyLog />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
