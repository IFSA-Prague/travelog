import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const username = user?.username;

  // Fetch users from the backend on component mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get('http://localhost:5050/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    }
    fetchUsers();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <PageContainer>
      <h1>Hi, {username}!</h1>

      <div className="following">
        <h2>Following feed</h2>
      </div>

      <div className="bookmarked">
        <h2>Bookmarked Cities</h2>
      </div>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 100px 20px 20px;
  min-height: 100vh;
`;

export default HomePage;
