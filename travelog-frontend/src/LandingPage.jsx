import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const LandingPage = () => {
  const [users, setUsers] = useState([]);

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
  }, []);  // Empty dependency array to run only once when the component mounts

  return (
    <PageContainer>
      <Content>
        <LogoContainer>
          <Logo src="/travelog-logo.png" alt="Travelog" />
        </LogoContainer>
        <Links>
          <StyledLink to="/signup">Sign Up Here</StyledLink>
          <StyledLink to="/login">Login Here</StyledLink>
        </Links>

        <UsersSection>
          <h2>Registered Users:</h2>
          {/* Display the list of users */}
          {users.length > 0 ? (
            <UsersList>
              {users.map((user, index) => (
                <UserItem key={index}>
                  {user.username} - {user.email}
                </UserItem>
              ))}
            </UsersList>
          ) : (
            <NoUsers>No users found</NoUsers>
          )}
        </UsersSection>
      </Content>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 100px 20px 20px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
`;

const Content = styled.div`
  max-width: 800px;
  width: 100%;
  text-align: center;
`;

const LogoContainer = styled.div`
  margin-bottom: 30px;
`;

const Logo = styled.img`
  max-width: 400px;
  height: auto;
`;

const Links = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 40px;
`;

const StyledLink = styled(Link)`
  padding: 12px 24px;
  background-color: #3b5bdb;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2f4ac0;
  }
`;

const UsersSection = styled.div`
  margin-top: 40px;
  text-align: left;
`;

const UsersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
  padding: 12px;
  border-bottom: 1px solid #eee;
  color: #333;
`;

const NoUsers = styled.p`
  color: #666;
  font-style: italic;
`;

export default LandingPage;