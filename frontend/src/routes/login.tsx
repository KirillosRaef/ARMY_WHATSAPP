import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});


function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:5173/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
          
          
      const data = await res.json();
      console.log('Response status:', res.status);
      console.log('Response body:', data);
      if (!res.ok) {
        throw new Error(`Login failed: ${data.error || res.statusText}`);
      }

      console.log('Login successful');

      //TODO: Store authentication state (e.g., in context or localStorage)
      //TODO: rediect to appropriate page based on role
      //TODO: inquire about session and account management and how to handle it in the frontend
      if (data.role === 'admin') {
        navigate({ to: '/admin_page' });
      } else if (data.role === 'user') {
        navigate({ to: '/user_page' });
      }
    } catch (err) {
      console.log('Login failed:', err);
    }
  }

  return <div>
    <div className='p-2 flex flex-col gap-2'>
      <input
        type='email'
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='p-2 border rounded'
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='p-2 border rounded'
      />
      <button type='submit' className='p-2 bg-blue-500 text-white rounded' onClick={handleSubmit}>
        Login
      </button>
    </div> 
  </div>;
}
