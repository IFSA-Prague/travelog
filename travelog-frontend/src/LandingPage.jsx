import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Check if user is logged in, if so, redirect to HomePage
  useEffect(() => {
    if (localStorage.getItem('username')) {
      navigate('/home');
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/users');
        setUsers(response.data);  // Set the users data in the state
      } catch (error) {
        console.error('Error fetching users', error);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Welcome to Travelog</h1>
      <p>
        <Link to="/signup">Sign Up here</Link>
        <br />
        <Link to="/login">Login here</Link>
      </p>

      <h2>List of Users:</h2>
      {users.length > 0 ? (
        <ul>
          {users.map((user, index) => (
            <li key={index}>
              {user.username} - {user.email}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found</p>
      )}
    </div>
  );
};

export default LandingPage;
