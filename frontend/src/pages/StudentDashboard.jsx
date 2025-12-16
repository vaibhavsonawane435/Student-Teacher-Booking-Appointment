import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../components/MessageProvider';

export default function StudentDashboard({ user, setUser }) {
  const [tab, setTab] = useState('find'); // 'find' | 'my' | 'history' | 'messages'
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({ date: '', time: '', purpose: '' });
  const [myAppointments, setMyAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState('');
  const navigate = useNavigate();
  const { showMessage } = useMessage();

  useEffect(() => {
    fetchTeachers();
    fetchMyAppointments();
    fetchMessages();
  }, [user._id]);

  const fetchTeachers = async () => {
    const res = await axios.get('http://localhost:5000/api/teachers');
    setTeachers(res.data);
  };

  const fetchMyAppointments = async () => {
    const res = await axios.get(`http://localhost:5000/api/student/appointments/${user._id}`);
    const data = res.data || [];
    setMyAppointments(data.filter(a => a.status === 'pending'));
    setHistory(data.filter(a => a.status !== 'pending'));
  };

  const fetchMessages = async () => {
    const res = await axios.get(`http://localhost:5000/api/messages/${user._id}`);
    setMessages(res.data || []);
  };

  const bookAppointment = async () => {
    if (!selectedTeacher) return showMessage({ type: 'error', text: 'Select a teacher' });
    await axios.post('http://localhost:5000/api/book', {
      studentId: user._id,
      teacherId: selectedTeacher._id,
      ...formData
    });
    showMessage({ type: 'success', text: 'Request Sent!' });
    setFormData({ date: '', time: '', purpose: '' });
    setSelectedTeacher(null);
    fetchMyAppointments();
  };

  const openThread = async (appointmentId, otherUserId) => {
    try {
      let res;
      if (appointmentId) {
        res = await axios.get(`http://localhost:5000/api/messages/thread/${appointmentId}`);
      } else {
        res = await axios.get(`http://localhost:5000/api/messages/thread/users/${user._id}/${otherUserId}`);
      }
      setSelectedThread({ appointmentId, messages: res.data, otherUserId });
    } catch (err) {
      console.error('Error fetching thread', err);
      showMessage({ type: 'error', text: 'Unable to load messages' });
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedThread) return;
    await axios.post('http://localhost:5000/api/messages', {
      senderId: user._id,
      receiverId: selectedThread.otherUserId,
      content: messageText,
      appointmentId: selectedThread.appointmentId
    });
    setMessageText('');
    const res = await axios.get(`http://localhost:5000/api/messages/thread/${selectedThread.appointmentId}`);
    setSelectedThread({ ...selectedThread, messages: res.data });
    fetchMessages();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <div className="space-x-2">
          <button onClick={() => setTab('find')} className={`px-3 py-1 rounded ${tab === 'find' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Find Teacher</button>
          <button onClick={() => setTab('my')} className={`px-3 py-1 rounded ${tab === 'my' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>My Appointments</button>
          <button onClick={() => setTab('history')} className={`px-3 py-1 rounded ${tab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>History</button>
          <button onClick={() => setTab('messages')} className={`px-3 py-1 rounded ${tab === 'messages' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Messages</button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </div>

      {tab === 'find' && (
        <>
          <h3 className="text-lg font-semibold">Find a Teacher</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {teachers.map(t => (
              <div key={t._id} className="bg-white p-4 rounded shadow">
                <p className="font-bold">{t.name}</p>
                <p className="text-sm text-gray-600">{t.department} - {t.subject}</p>
                <button onClick={() => setSelectedTeacher(t)} className="mt-2 bg-green-500 text-white px-3 py-1 rounded">Book</button>
              </div>
            ))}
          </div>

          {selectedTeacher && (
            <div className="mt-6 bg-white p-6 border rounded">
              <h3 className="font-bold">Book with {selectedTeacher.name}</h3>
              <input type="date" className="border p-2 w-full mb-2" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              <input type="time" className="border p-2 w-full mb-2" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
              <textarea placeholder="Purpose/Message" className="border p-2 w-full mb-2" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
              <button onClick={bookAppointment} className="bg-blue-600 text-white px-4 py-2 rounded">Confirm Booking</button>
            </div>
          )}
        </>
      )}

      {tab === 'my' && (
        <div className="space-y-4">
          <h3 className="font-bold">My Appointments</h3>
          {myAppointments.map(app => (
            <div key={app._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-bold">Teacher: {app.teacherId?.name}</p>
                <p>{app.date} at {app.time}</p>
                <p className="italic text-gray-500">"{app.purpose}"</p>
                <p className="text-sm mt-1">Status: <span className={`font-bold text-yellow-600`}>{app.status}</span></p>
              </div>
              <div>
                <button onClick={() => openThread(app._id, app.teacherId._id)} className="bg-gray-300 px-3 py-1 rounded">Message</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          <h3 className="font-bold">Appointment History</h3>
          {history.map(app => (
            <div key={app._id} className="bg-white p-4 rounded shadow">
              <p className="font-bold">Teacher: {app.teacherId?.name}</p>
              <p>{app.date} at {app.time}</p>
              <p className="italic">"{app.purpose}"</p>
              <p className="text-sm mt-1">Status: <span className={`font-bold ${app.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{app.status}</span></p>
              <div className="mt-2">
                <button onClick={() => openThread(app._id, app.teacherId._id)} className="bg-gray-300 px-2 py-1 rounded">View Messages</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'messages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-white p-4 rounded shadow max-h-[60vh] overflow-auto">
            <h3 className="font-bold mb-2">Conversations</h3>
            {messages.map(m => (
              <div key={m._id} className="border-b p-2 cursor-pointer" onClick={() => openThread(m.appointmentId || null, m.senderId?._id === user._id ? m.receiverId?._id : m.senderId?._id)}>
                <p className="font-semibold">{m.senderId?._id === user._id ? `You → ${m.receiverId?.name}` : m.senderId?.name}</p>
                <p className="text-sm text-gray-600 truncate">{m.content}</p>
                <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="md:col-span-2 bg-white p-4 rounded shadow">
            {selectedThread ? (
              <>
                <div className="max-h-[50vh] overflow-auto space-y-2 mb-4">
                  {selectedThread.messages.map(msg => (
                    <div key={msg._id} className={`${msg.senderId._id === user._id ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-2 rounded ${msg.senderId._id === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{msg.content}</div>
                      <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input value={messageText} onChange={e => setMessageText(e.target.value)} className="border p-2 flex-1 mr-2" />
                  <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a conversation to view messages</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}