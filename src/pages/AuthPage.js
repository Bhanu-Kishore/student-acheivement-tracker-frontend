import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Users, Loader2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

export const AuthPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Student');
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'Student', sectionCode: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, role: form.role.toUpperCase() };
      const url = isLogin ? `${API_BASE}/users/login` : `${API_BASE}/users/register`;
      console.log('Sending request to:', url);
      console.log('Payload:', payload);
      const res = await axios.post(url, payload);

      if (isLogin) {
        if (res.data.role.toLowerCase() !== selectedRole.toLowerCase()) {
          alert(`Invalid login. This account is a ${res.data.role}, not a ${selectedRole}.`);
          setLoading(false);
          return;
        }
        setUser(res.data);
        navigate('/dashboard');
      } else {
        alert("Registration Successful! Please login.");
        setIsLogin(true);
        setForm({ username: '', password: '', fullName: '', role: 'Student', sectionCode: '' });
      }
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      alert(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md">
        <h2 className="text-5xl font-black mb-6 tracking-tighter">{isLogin ? 'Login' : 'Join'}</h2>
        
        {isLogin && (
          <div className="mb-6">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-3 block">Login As</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('Student')}
                className={`flex-1 p-5 rounded-2xl font-black uppercase tracking-wider transition-all ${
                  selectedRole === 'Student'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <User className="mx-auto mb-2" size={24} />
                Student
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('Teacher')}
                className={`flex-1 p-5 rounded-2xl font-black uppercase tracking-wider transition-all ${
                  selectedRole === 'Teacher'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Users className="mx-auto mb-2" size={24} />
                Teacher
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" className="w-full border-2 p-4 rounded-2xl font-bold focus:border-blue-500 outline-none transition-all" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              <select className="w-full border-2 p-4 rounded-2xl font-bold bg-white" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
              <input type="text" placeholder="Section Code" className="w-full border-2 p-4 rounded-2xl font-bold" required value={form.sectionCode} onChange={e => setForm({ ...form, sectionCode: e.target.value })} />
            </>
          )}
          <input type="text" placeholder="Username" className="w-full border-2 p-4 rounded-2xl font-bold" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          <input type="password" placeholder="Password" className="w-full border-2 p-4 rounded-2xl font-bold" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-colors">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (isLogin ? 'Enter' : 'Create')}
          </button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} className="text-center mt-8 text-slate-400 cursor-pointer font-bold hover:text-blue-600">
          {isLogin ? "New here? Register" : "Have an account? Login"}
        </p>
      </div>
    </div>
  );
};
