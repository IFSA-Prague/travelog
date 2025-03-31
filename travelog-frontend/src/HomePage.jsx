import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const username = localStorage.getItem('username');  // Get the username from localStorage
  const navigate = useNavigate();  // Hook to navigate to other pages

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

  // Sign out handler
  const handleSignOut = () => {
    localStorage.removeItem('username');  // Remove the username from localStorage
    navigate('/');  // Redirect to the Landing Page
  };

  return (
    <div>
      <h1>Home Page</h1>
      {/* Personalized greeting */}
      {username && <h2>Hi, {username}!</h2>}  {/* Show Hi <username> */}
    </div>
  );
};

export default HomePage;