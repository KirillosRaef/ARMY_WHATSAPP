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
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error('Login failed');
      }

      


      navigate({ to: '/' });
    } catch (err) {
      console.log('Login failed:', err);
    } 
    navigate({ to: '/' });
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
