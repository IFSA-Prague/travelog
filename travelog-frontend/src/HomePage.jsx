import { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Link } from 'react-router-dom';  // For navigation

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const username = localStorage.getItem('username');  // Get the username from localStorage

  // Fetch users from the backend on component mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/users');
        setUsers(response.data);  // Set the users data in the state
      } catch (error) {
        console.error('Error fetching users', error);
      }
    }
    fetchUsers();  // Fetch users when the component mounts
  }, []);

  return (
    <>
      <NavBar>
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/search">Search</NavLink>
          <NavLink to="/mylog">My Log</NavLink>
          <NavLink to="/profile">Profile</NavLink>
      </NavBar>
      <Container>
        <Heading>Home Page</Heading>
        {username && <Greeting>Hi, {username}!</Greeting>}
        <UserList>
          {users.length > 0 ? (
            users.map((user, index) => (
              <UserListItem key={index}>
                {user.username} - {user.email}
              </UserListItem>
            ))
          ) : (
            <p>No users found</p>
          )}
        </UserList>
      </Container>
    </>
  );
};

// Styled components for page content
const Container = styled.div`
  margin-left: 50px;
  padding-top: 100px;
`;

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

const Heading = styled.h1`
  font-size: 36px;
`;

const Greeting = styled.h2`
  color: rgb(154, 154, 154);
  font-size: 24px;
  margin-top: 20px;
`;

const UserList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const UserListItem = styled.li`
  font-size: 18px;
  color: #555;
  margin: 10px 0;
`;

export default HomePage;
