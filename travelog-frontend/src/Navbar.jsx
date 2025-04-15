import React from 'react';
import { Link, useNavigate } from 'react-router-dom';  // For navigation
import styled from 'styled-components';

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('username');  // Remove username from localStorage
    window.dispatchEvent(new Event('storage')); //Trigger storage event manually
    navigate('/');  // Redirect to Landing page
  };

  return (
    <NavBar>
      <LogoLink to="/home">
        <LogoImage src="/travelog-logo.png" alt="Travelog" />
      </LogoLink>
      <NavLinks>
        <NavItem to="/home">Home</NavItem>
        <NavItem to="/search">Search</NavItem>
        <NavItem to="/map">Map</NavItem>
        <NavItem to="/mylog">My Log</NavItem>
        <SignOut onClick={handleSignOut}>Sign Out</SignOut>
      </NavLinks>
    </NavBar>
  );
};

// Styled components for Navbar
const NavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  height: 64px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const NavItem = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;

  &:hover {
    color: #3b5bdb;
  }
`;

const SignOut = styled.button`
  background: none;
  border: none;
  color: #e53935;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export default Navbar;
