import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage";  // Import LandingPage
import SignUp from "./SignUp";
import Login from "./Login";
import HomePage from "./HomePage";  // Import HomePage

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />  {/* Landing page */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />  {/* Home page */}
      </Routes>
    </Router>
  );
};

export default AppRouter;