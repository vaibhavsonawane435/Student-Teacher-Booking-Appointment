import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../components/MessageProvider';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { showMessage } = useMessage();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/api/register', { name, email, password });
      showMessage({ type: 'success', text: 'Registration successful! Please wait for Admin approval.' });
      navigate('/'); // Redirect to Login page
    } catch (err) {
      showMessage({ type: 'error', text: err.response?.data?.error || 'Registration failed' });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Student Register</h2>
        
        <label className="block mb-2 font-medium">Name</label>
        <input 
          className="border p-2 w-full mb-4 rounded" 
          placeholder="Enter your name" 
          onChange={e => setName(e.target.value)} 
        />

        <label className="block mb-2 font-medium">Email</label>
        <input 
          className="border p-2 w-full mb-4 rounded" 
          placeholder="Enter your email" 
          onChange={e => setEmail(e.target.value)} 
        />

        <label className="block mb-2 font-medium">Password</label>
        <input 
          type="password"
          className="border p-2 w-full mb-6 rounded" 
          placeholder="Enter password" 
          onChange={e => setPassword(e.target.value)} 
        />

        <button 
          onClick={handleRegister} 
          className="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700 transition"
        >
          Register
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account? <a href="/" className="text-blue-500 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
}

