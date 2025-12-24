import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminRegister from './pages/AdminRegister.jsx';
import { useState } from 'react';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <Routes>
          <Route path="/" element={!user ? <Login setUser={setUser} /> : <Navigate to={`/${user.role}-dashboard`} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-register" element={<AdminRegister />} /> 
          <Route path="/admin-dashboard" element={user?.role === 'admin' ? <AdminDashboard user={user} setUser={setUser}/> : <Navigate to="/" />} />
          <Route path="/teacher-dashboard" element={user?.role === 'teacher' ? <TeacherDashboard user={user} setUser={setUser}/> : <Navigate to="/" />} />
          <Route path="/student-dashboard" element={user?.role === 'student' ? <StudentDashboard user={user} setUser={setUser}/> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;