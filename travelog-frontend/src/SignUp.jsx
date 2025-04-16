import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import styled from 'styled-components';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');  // Add password state
  const navigate = useNavigate();  // Hook to navigate after successful registration

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5050/signup', {
        username,
        email,
        password,  // Send password to the backend
      });
      alert(response.data.message);  // Alert the user upon success
      if (response.status === 201) {
        // Immediately log the user in after successful signup
        const loginRes = await axios.post('http://localhost:5050/login', {
          username,
          password,
        });

        const user = loginRes.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage')); // update Navbar state
        navigate('/home');
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <PageContainer>
      <h1>Sign Up</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}  // Capture password
          required
        />
        <Button type="submit">Sign Up</Button>
      </Form>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 100px 20px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 12px;
  background-color: #3b5bdb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #2f4ac0;
  }
`;

export default SignUp;