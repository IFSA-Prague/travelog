import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Hook to navigate after successful login

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username,
        password,
      });
      alert(response.data.message);  // Show success or failure message
      if (response.status === 200) {
        // Store the username in localStorage
        localStorage.setItem('username', username);
        // Redirect to Home page after successful login
        navigate('/home');
      }
    } catch (error) {
      console.error('There was an error!', error);
      alert('Login failed. Please check your username and password.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;