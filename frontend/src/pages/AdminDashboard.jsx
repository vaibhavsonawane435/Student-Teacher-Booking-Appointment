import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../components/MessageProvider';

export default function AdminDashboard({ user, setUser }) {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', subject: '' });
  const [appointments, setAppointments] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', department: '', subject: '' });
  const navigate = useNavigate();
  const { showMessage, showConfirm } = useMessage();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Load Data on Component Mount
  useEffect(() => {
    fetchTeachers();
    fetchPendingStudents();
    fetchAppointments();
  }, []);

  const fetchTeachers = async () => {
    const res = await axios.get('http://localhost:5000/api/teachers');
    setTeachers(res.data);
  };

  const fetchPendingStudents = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/pending-students');
    setStudents(res.data);
  };

  const fetchAppointments = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/appointments');
    setAppointments(res.data);
  };

  // --- ACTIONS ---

  const handleAddTeacher = async () => {
    if (!form.name || !form.email || !form.password) {
      showMessage({ type: 'error', text: 'Fill all fields' });
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/admin/add-teacher', form);
      showMessage({ type: 'success', text: 'Teacher Added!' });
      setForm({ name: '', email: '', password: '', department: '', subject: '' }); // Reset form
      fetchTeachers(); // Refresh list
    } catch (err) {
      showMessage({ type: 'error', text: 'Error adding teacher' });
    }
  }; 

  const handleDeleteTeacher = async (id) => {
    const ok = await showConfirm('Are you sure you want to delete this teacher?');
    if (!ok) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/teacher/${id}`);
      fetchTeachers(); // Refresh list
    } catch (err) {
      showMessage({ type: 'error', text: 'Error deleting teacher' });
    }
  };

  const startEditTeacher = (teacher) => {
    setEditingTeacher(teacher._id);
    setEditForm({ name: teacher.name || '', department: teacher.department || '', subject: teacher.subject || '' });
  };

  const cancelEdit = () => {
    setEditingTeacher(null);
    setEditForm({ name: '', department: '', subject: '' });
  };

  const saveEditTeacher = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/teacher/${id}`, editForm);
      fetchTeachers();
      setEditingTeacher(null);
    } catch (err) {
      showMessage({ type: 'error', text: 'Error updating teacher' });
    }
  };

  const handleApproveStudent = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/approve-student/${id}`);
      showMessage({ type: 'success', text: 'Student Approved!' });
      fetchPendingStudents(); // Refresh list
    } catch (err) {
      showMessage({ type: 'error', text: 'Error approving student' });
    }
  }; 

  const handleDeleteAppointment = async (id) => {
    const ok = await showConfirm('Delete appointment?');
    if (!ok) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/appointment/${id}`);
      fetchAppointments();
    } catch (err) {
      showMessage({ type: 'error', text: 'Error deleting appointment' });
    }
  };

  

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>

      {/* --- SECTION 1: ADD TEACHER --- */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Teacher</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input className="border p-2 rounded" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <input className="border p-2 rounded" placeholder="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
          <input className="border p-2 rounded" placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
          <button onClick={handleAddTeacher} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Teacher</button>
        </div>
      </div>

      {/* --- SECTION 2: MANAGE TEACHERS --- */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Manage Teachers</h2>
        {teachers.length === 0 ? <p className="text-gray-500">No teachers found.</p> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-2">Name</th>
                <th className="p-2">Department</th>
                <th className="p-2">Subject</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t._id} className="border-b">
                  <td className="p-2">
                    {editingTeacher === t._id ? (
                      <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border p-1 rounded w-full" />
                    ) : t.name}
                  </td>
                  <td className="p-2">
                    {editingTeacher === t._id ? (
                      <input value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} className="border p-1 rounded w-full" />
                    ) : t.department}
                  </td>
                  <td className="p-2">
                    {editingTeacher === t._id ? (
                      <input value={editForm.subject} onChange={e => setEditForm({...editForm, subject: e.target.value})} className="border p-1 rounded w-full" />
                    ) : t.subject}
                  </td>
                  <td className="p-2">
                    {editingTeacher === t._id ? (
                      <>
                        <button onClick={() => saveEditTeacher(t._id)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
                        <button onClick={() => cancelEdit()} className="bg-gray-300 px-2 py-1 rounded">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditTeacher(t)} className="text-blue-500 hover:text-blue-700 font-bold mr-4">Edit</button>
                        <button onClick={() => handleDeleteTeacher(t._id)} className="text-red-500 hover:text-red-700 font-bold">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- SECTION 3: PENDING STUDENTS --- */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Pending Student Approvals</h2>
        {students.length === 0 ? <p className="text-green-600">No pending approvals.</p> : (
          <div className="space-y-2">
            {students.map(s => (
              <div key={s._id} className="flex justify-between items-center border p-3 rounded bg-gray-50">
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-sm text-gray-600">{s.email}</p>
                </div>
                <button 
                  onClick={() => handleApproveStudent(s._id)} 
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SECTION 4: ALL APPOINTMENTS --- */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">All Appointments</h2>
        {appointments.length === 0 ? <p className="text-gray-500">No appointments found.</p> : (
          <div className="space-y-4">
            {appointments.map(app => (
              <div key={app._id} className="flex justify-between items-center border p-3 rounded bg-gray-50">
                <div>
                  <p className="font-bold">Student: {app.studentId?.name} ({app.studentId?.email})</p>
                  <p className="text-sm">Teacher: {app.teacherId?.name} - {app.teacherId?.department} / {app.teacherId?.subject}</p>
                  <p>{app.date} at {app.time}</p>
                  <p className="italic">"{app.purpose}"</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded ${app.status === 'approved' ? 'bg-green-100 text-green-800' : app.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{app.status}</span>
                  <button onClick={() => handleDeleteAppointment(app._id)} className="text-red-500 hover:text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}