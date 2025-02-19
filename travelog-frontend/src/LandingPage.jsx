import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom

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
    <div>
      <h1>Welcome to Travelog</h1>

      <p>
        {/* Link to the Sign Up and Login pages */}
        <Link to="/signup">Sign Up here</Link>
        <br />
        <Link to="/login">Login here</Link>
      </p>

      <h2>Registered Users:</h2>
      {/* Display the list of users */}
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