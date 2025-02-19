import React from 'react';
import { Link, useNavigate } from 'react-router-dom';  // For navigation
import styled from 'styled-components';

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('username');  // Remove username from localStorage
    navigate('/');  // Redirect to Landing page
  };

  return (
    <NavBar>
      <NavLink to="/home">Home</NavLink>
      <NavLink to="/search">Search</NavLink>
      <NavLink to="/mylog">My Log</NavLink>
      <NavLink to="/profile">Profile</NavLink>
    </NavBar>
  );
};

// Styled components for Navbar
const NavBar = styled.div`
  display: flex;
  justify-content: space-around;
  background-color: #4CAF50;
  padding: 10px;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 18px;

  &:hover {
    text-decoration: underline;
  }
`;

export default Navbar;
