import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, GraduationCap, Trash2, Plus, X, Search, Users, LayoutDashboard, User, Trophy, UserX, Medal, Loader2, Download, BarChart3, Calendar, Award, Star } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

export default function App() {
  const [page, setPage] = useState('home');
  const [activeTab, setActiveTab] = useState('achievements');
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'Student', sectionCode: '' });
  const [newAch, setNewAch] = useState({ title: '', category: '', studentUsername: '', description: '', date: '' });
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedRole, setSelectedRole] = useState('Student');

  const categories = ['All', 'Academic', 'Sports', 'Leadership', 'Arts', 'Community Service', 'Technology', 'Cultural'];

  useEffect(() => {
    if (user) loadData(user);
  }, [user]);

  const loadData = async (currentUser) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [stuRes, achRes] = await Promise.all([
        axios.get(`${API_BASE}/users/section/${currentUser.sectionCode}`),
        axios.get(`${API_BASE}/achievements/section/${currentUser.sectionCode}`)
      ]);

      const enriched = achRes.data.map(ach => ({
        ...ach,
        userName: ach.user?.fullName || "Student",
        userHandle: ach.user?.username || "user"
      }));
      
      setAchievements(enriched);
      setStudents(stuRes.data);
    } catch (err) {
      console.error("Load error:", err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, role: form.role.toUpperCase() };
      const url = isLogin ? `${API_BASE}/users/login` : `${API_BASE}/users/register`;
      const res = await axios.post(url, payload);

      if (isLogin) {
        if (res.data.role.toLowerCase() !== selectedRole.toLowerCase()) {
          alert(`Invalid login. This account is a ${res.data.role}, not a ${selectedRole}.`);
          setLoading(false);
          return;
        }
        setUser(res.data);
        setPage('dashboard');
      } else {
        alert("Registration Successful! Please login.");
        setIsLogin(true);
        setForm({ username: '', password: '', fullName: '', role: 'Student', sectionCode: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    if (!newAch.studentUsername) {
      alert("Please select a student!");
      return;
    }
    try {
      await axios.post(`${API_BASE}/achievements/${newAch.studentUsername}/add`, {
        title: newAch.title,
        category: newAch.category,
        description: newAch.description || "No description",
        dateEarned: newAch.date || new Date().toISOString().split('T')[0]
      });
      setShowModal(false);
      setNewAch({ title: '', category: '', studentUsername: '', description: '', date: '' });
      loadData(user);
      alert("Achievement added successfully!");
    } catch (err) {
      alert("Error adding achievement: " + (err.response?.data?.message || "Check backend"));
    }
  };

  const handleDeleteAch = async (id) => {
    if (window.confirm("Delete this achievement?")) {
      try {
        await axios.delete(`${API_BASE}/achievements/${id}`);
        loadData(user);
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAchievements([]);
    setStudents([]);
    setPage('home');
    setActiveTab('achievements');
    setSearchTerm('');
    setFilterCategory('All');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure? This will delete all your data.")) {
      try {
        await axios.delete(`${API_BASE}/users/${user.username}`);
        handleLogout();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const filteredAchievements = achievements.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesUser = user.role.toLowerCase() === 'teacher' || item.userHandle === user.username;
    return matchesSearch && matchesCategory && matchesUser;
  });

  const userAchievements = achievements.filter(a => a.userHandle === user?.username);
  const allStudentsWithCounts = students.map(s => ({
    ...s,
    achievementCount: achievements.filter(a => a.userHandle === s.username).length
  }));
  const studentAchievementCounts = allStudentsWithCounts.filter(s => s.username !== user?.username);
  const sortedForRank = [...allStudentsWithCounts].sort((a, b) => b.achievementCount - a.achievementCount);
  const userRank = user && user.role.toLowerCase() === 'student' ? sortedForRank.findIndex(s => s.username === user.username) + 1 : 0;

  if (page === 'home') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <GraduationCap size={120} className="text-blue-600 mb-6" />
      <h1 className="text-7xl font-black text-slate-900 mb-4 text-center leading-tight">STUDENT ACHIEVEMENT <br/> TRACKER</h1>
      <p className="text-slate-500 font-bold mb-8 text-center max-w-md">Track and celebrate student achievements in extracurricular activities</p>
      <button onClick={() => setPage('auth')} className="bg-slate-900 text-white px-14 py-6 rounded-2xl font-black text-xl hover:bg-blue-600 transition-all shadow-xl">GET STARTED</button>
    </div>
  );

  if (page === 'auth') return (
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-80 bg-slate-900 text-white flex flex-col p-8 h-screen sticky top-0">
        <div className="flex items-center text-blue-400 font-black text-3xl mb-16 italic tracking-tighter"><Medal className="mr-3 text-white" /> TRACKER</div>
        <nav className="flex-1 space-y-4">
          <button onClick={() => setActiveTab('achievements')} className={`w-full flex items-center p-5 rounded-3xl font-black transition-all ${activeTab === 'achievements' ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-white'}`}>
            <LayoutDashboard className="mr-4" /> DASHBOARD
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center p-5 rounded-3xl font-black transition-all ${activeTab === 'profile' ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-white'}`}>
            {user.role.toLowerCase() === 'teacher' ? <Users className="mr-4" /> : <User className="mr-4" />}
            {user.role.toLowerCase() === 'teacher' ? 'MY CLASS' : 'MY STATS'}
          </button>
        </nav>
        <button onClick={handleDeleteAccount} className="flex items-center p-4 text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase mb-2 transition-colors"><UserX className="mr-4" size={16} /> Delete Account</button>
        <button onClick={handleLogout} className="flex items-center p-5 bg-slate-800 rounded-3xl font-black hover:bg-red-600 transition-colors"><LogOut className="mr-4" /> LOGOUT</button>
      </aside>

      <div className="flex-1">
        <header className="bg-white p-6 px-12 flex justify-between items-center border-b sticky top-0 z-10">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-5 top-4 text-slate-300" size={20} />
            <input type="text" placeholder="Search achievements..." className="w-full pl-14 pr-6 py-4 bg-slate-100 rounded-2xl font-bold focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-black text-slate-900 leading-tight">{user.fullName}</p>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user.role}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/40">{user.fullName.charAt(0)}</div>
          </div>
        </header>

        <main className="p-12">
          {activeTab === 'achievements' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                  {user.role.toLowerCase() === 'teacher' ? 'Awards Feed' : 'My Achievements'}
                </h1>
                {user.role.toLowerCase() === 'teacher' && (
                  <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-900 transition-all shadow-lg shadow-blue-500/20">
                    <Plus /> ADD AWARD
                  </button>
                )}
              </div>

              <div className="mb-8 flex gap-3 flex-wrap">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-6 py-2 rounded-2xl font-black text-sm transition-all ${filterCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                    <tr>
                      <th className="p-8">Achievement</th>
                      <th className="p-8">Category</th>
                      {user.role.toLowerCase() === 'teacher' && <th className="p-8">Student</th>}
                      <th className="p-8">Date</th>
                      {user.role.toLowerCase() === 'teacher' && <th className="p-8 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAchievements.length === 0 ? (
                      <tr>
                        <td colSpan={user.role.toLowerCase() === 'teacher' ? 5 : 3} className="p-12 text-center text-slate-400 font-bold">
                          {user.role.toLowerCase() === 'teacher' ? 'No achievements found' : 'No achievements yet. Keep working hard!'}
                        </td>
                      </tr>
                    ) : (
                      filteredAchievements.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="p-8">
                            <div className="font-black text-slate-800">{item.title}</div>
                            <div className="text-sm text-slate-500 font-medium mt-1">{item.description}</div>
                          </td>
                          <td className="p-8">
                            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text[10px] font-black border border-blue-100 uppercase">
                              {item.category}
                            </span>
                          </td>
                          {user.role.toLowerCase() === 'teacher' && (
                            <td className="p-8 font-bold text-slate-500">
                              <span>{item.userName}</span>
                              <small className="block text-slate-400">@{item.userHandle}</small>
                            </td>
                          )}
                          <td className="p-8 font-bold text-slate-500">
                            <Calendar className="inline mr-2" size={16} />
                            {item.dateEarned ? new Date(item.dateEarned).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </td>
                          {user.role.toLowerCase() === 'teacher' && (
                            <td className="p-8 text-right">
                              <button onClick={() => handleDeleteAch(item.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                                <Trash2 size={20}/>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {user.role.toLowerCase() === 'student' && (
                  <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-500/40">
                    <Trophy className="absolute -right-4 -bottom-4 opacity-20" size={120} />
                    <p className="uppercase text-[10px] font-black mb-2 opacity-70 tracking-widest">My Achievements</p>
                    <p className="text-6xl font-black">{userAchievements.length}</p>
                  </div>
                )}
                
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                  <p className="uppercase text-[10px] font-black mb-2 text-slate-400 tracking-widest">
                    {user.role.toLowerCase() === 'teacher' ? 'Total Students' : 'My Rank'}
                  </p>
                  <p className="text-6xl font-black text-slate-900">
                    {user.role.toLowerCase() === 'teacher' ? studentAchievementCounts.length : `#${userRank}`}
                  </p>
                </div>
                
                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center items-center">
                  <p className="uppercase text-[10px] font-black mb-2 text-slate-500 tracking-widest">Section Code</p>
                  <p className="text-6xl font-black text-blue-400 tracking-tighter">{user.sectionCode}</p>
                </div>
              </div>

              {user.role.toLowerCase() === 'teacher' && (
                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
                  <div className="p-8 border-b bg-slate-50/50">
                    <h2 className="text-2xl font-black text-slate-900">Student Progress</h2>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                      <tr>
                        <th className="p-8">Rank</th>
                        <th className="p-8">Student Name</th>
                        <th className="p-8">Username</th>
                        <th className="p-8 text-center">Awards Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...studentAchievementCounts].sort((a, b) => b.achievementCount - a.achievementCount).map((s, index) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-8">
                            <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-600">
                              {index + 1}
                            </div>
                          </td>
                          <td className="p-8 font-black text-slate-800">{s.fullName}</td>
                          <td className="p-8 font-bold text-slate-500">@{s.username}</td>
                          <td className="p-8 text-center">
                            <span className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-black">
                              {s.achievementCount || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {user.role.toLowerCase() === 'student' && (
                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100 p-10">
                  <h2 className="text-3xl font-black text-slate-900 mb-8">My Achievement Showcase</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userAchievements.map(ach => (
                      <div key={ach.id} className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-3xl border-2 border-blue-100">
                        <div className="flex items-start justify-between mb-4">
                          <Award className="text-blue-600" size={32} />
                          <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">
                            {ach.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{ach.title}</h3>
                        <p className="text-sm text-slate-600 font-medium mb-3">{ach.description}</p>
                        <p className="text-xs text-slate-400 font-bold flex items-center">
                          <Calendar size={14} className="mr-2" />
                          {ach.dateEarned ? new Date(ach.dateEarned).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    ))}
                    {userAchievements.length === 0 && (
                      <div className="col-span-2 text-center py-12 text-slate-400 font-bold">
                        No achievements yet. Keep working hard!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black tracking-tighter">New Award</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>
            <form onSubmit={handleAddAchievement} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Recipient</label>
                <select className="w-full border-2 p-5 rounded-3xl font-bold bg-slate-50 focus:bg-white outline-none transition-all" required value={newAch.studentUsername} onChange={e => setNewAch({ ...newAch, studentUsername: e.target.value })}>
                  <option value="">Select a student...</option>
                  {studentAchievementCounts.map(s => (
                    <option key={s.id} value={s.username}>{s.fullName} (@{s.username})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Award Title</label>
                <input type="text" placeholder="e.g. Science Fair Winner" className="w-full border-2 p-5 rounded-3xl font-bold bg-slate-50 focus:bg-white outline-none transition-all" required value={newAch.title} onChange={e => setNewAch({ ...newAch, title: e.target.value })} />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Category</label>
                <select className="w-full border-2 p-5 rounded-3xl font-bold bg-slate-50 focus:bg-white outline-none transition-all" required value={newAch.category} onChange={e => setNewAch({ ...newAch, category: e.target.value })}>
                  <option value="">Select category...</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Description</label>
                <textarea placeholder="Brief description of the achievement" className="w-full border-2 p-5 rounded-3xl font-bold bg-slate-50 focus:bg-white outline-none transition-all resize-none h-24" value={newAch.description} onChange={e => setNewAch({ ...newAch, description: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Date</label>
                <input type="date" className="w-full border-2 p-5 rounded-3xl font-bold bg-slate-50 focus:bg-white outline-none transition-all" value={newAch.date} onChange={e => setNewAch({ ...newAch, date: e.target.value })} />
              </div>
              
              <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase shadow-xl hover:bg-slate-900 transition-all mt-4">
                Confirm Award
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
