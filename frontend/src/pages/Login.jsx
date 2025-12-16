import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../components/MessageProvider';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { showMessage } = useMessage();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      navigate(`/${res.data.role}-dashboard`);
    } catch (err) {
      showMessage({ type: 'error', text: err.response?.data?.error || 'Login failed' });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input className="border p-2 w-full mb-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 w-full mb-2" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2 w-full rounded">Login</button>
      <p className="mt-2 text-sm">Don't have an account? <a href="/register" className="text-blue-500">Register (Student)</a></p>
    </div>
  );
}