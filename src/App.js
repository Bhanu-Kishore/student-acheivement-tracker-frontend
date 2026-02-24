import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Award, LogOut, GraduationCap, Trash2, Plus, X, 
  Search, Users, LayoutDashboard, User, Trophy, 
  Star, UserX, Medal, Loader2
} from 'lucide-react';

const API_BASE = "http://localhost:8080/api";

export default function App() {
  const [page, setPage] = useState('home');
  const [activeTab, setActiveTab] = useState('achievements');
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'Student', sectionCode: '' });
  const [newAch, setNewAch] = useState({ title: '', category: '', studentUsername: '' });

  // --- TRIGGER DATA LOAD ONCE USER IS SET ---
  useEffect(() => {
    if (user) {
      loadData(user);
    }
  }, [user]);

  const loadData = async (currentUser) => {
  if (!currentUser) return;
  setLoading(true);
  
  try {
    const [stuRes, achRes] = await Promise.all([
      axios.get(`${API_BASE}/users/section/${currentUser.sectionCode}`),
      currentUser.role.toLowerCase() === 'teacher' 
        ? axios.get(`${API_BASE}/achievements/section/${currentUser.sectionCode}`)
        : axios.get(`${API_BASE}/achievements/${currentUser.username}`)
    ]);

    const sectionUsers = stuRes.data;
    const rawAchievements = achRes.data;

    // 1. Map names for the main feed
    const enriched = rawAchievements.map(ach => ({
      ...ach,
      userName: ach.user?.fullName || "Student",
      userHandle: ach.user?.username || "user"
    }));
    setData(enriched);

    // 2. Filter for just students
    const studentList = sectionUsers.filter(u => u.role.toLowerCase() === 'student');

    // 3. FIX: Updated counting logic
    if (currentUser.role.toLowerCase() === 'teacher') {
      const studentsWithCounts = studentList.map(student => {
        // We look inside 'a.user.id' because of the backend change we just made
        const count = rawAchievements.filter(a => 
          a.user && String(a.user.id) === String(student.id)
        ).length;
        
        return { ...student, achievementCount: count };
      });
      setStudents(studentsWithCounts);
    } else {
      setStudents(studentList);
    }

  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
};
  
  const handleAuth = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    // Ensure role is Uppercase (STUDENT/TEACHER) to match typical Java Enums/Logic
    const payload = { 
      ...form, 
      role: form.role.toUpperCase() 
    };
    
    // Logic Fix: URL must match @RequestMapping in MainController
    const url = isLogin ? `${API_BASE}/users/login` : `${API_BASE}/users/register`;
    
    const res = await axios.post(url, payload);

    if (isLogin) {
      setUser(res.data);
      setPage('dashboard');
    } else {
      alert("Registration Successful! Please login.");
      setIsLogin(true);
      // Reset form to clear the registration data
      setForm({ username: '', password: '', fullName: '', role: 'STUDENT', sectionCode: '' });
    }
  } catch (err) {
    console.error("Auth Error:", err.response?.data);
    alert(err.response?.data?.message || "Authentication failed: Check username/password");
  } finally {
    setLoading(false);
  }
};

  const handleAddAchievement = async (e) => {
  e.preventDefault();
  
  // Safety check: make sure studentUsername is selected
  if (!newAch.studentUsername) {
    alert("Please select a student first!");
    return;
  }

  try {
    // We send the request using newAch.studentUsername
    // and we build the data object directly inside the post call
    await axios.post(`${API_BASE}/achievements/${newAch.studentUsername}/add`, {
      title: newAch.title,
      category: newAch.category,
      description: newAch.description || "No description provided"
    });

    setShowModal(false);
    
    // Reset the form so it's clean for next time
    setNewAch({ 
      title: '', 
      category: '', 
      description: '', 
      studentUsername: '' 
    });

    // Refresh the dashboard data
    if (user) {
      loadData(user);
    }
    
    alert("Achievement added successfully!");
  } catch (err) {
    console.error("Submission error:", err);
    const errorMsg = err.response?.data?.message || "Check if the backend is running.";
    alert("Error adding achievement: " + errorMsg);
  }
};

  const handleDeleteAch = async (id) => {
    if (window.confirm("Delete this award?")) {
      try {
        await axios.delete(`${API_BASE}/achievements/${id}`);
        loadData(user);
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setData([]);
    setStudents([]);
    setPage('home');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure? This will delete all your data.")) {
      try {
        await axios.delete(`${API_BASE}/users/${user.username}`);
        handleLogout();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const filteredAchievements = data.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (page === 'home') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <GraduationCap size={120} className="text-blue-600 mb-6" />
      <h1 className="text-7xl font-black text-slate-900 mb-4 text-center leading-tight">SUCCESS <br/> TRACK</h1>
      <button onClick={() => setPage('auth')} className="bg-slate-900 text-white px-14 py-6 rounded-2xl font-black text-xl hover:bg-blue-600 transition-all shadow-xl">GET STARTED</button>
    </div>
  );

  if (page === 'auth') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md">
        <h2 className="text-5xl font-black mb-6 tracking-tighter">{isLogin ? 'Login' : 'Join'}</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" className="w-full border-2 p-4 rounded-2xl font-bold focus:border-blue-500 outline-none transition-all" required onChange={e => setForm({ ...form, fullName: e.target.value })} />
              <select className="w-full border-2 p-4 rounded-2xl font-bold bg-white" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
              <input type="text" placeholder="Section Code" className="w-full border-2 p-4 rounded-2xl font-bold" required onChange={e => setForm({ ...form, sectionCode: e.target.value })} />
            </>
          )}
          <input type="text" placeholder="Username" className="w-full border-2 p-4 rounded-2xl font-bold" required onChange={e => setForm({ ...form, username: e.target.value })} />
          <input type="password" placeholder="Password" className="w-full border-2 p-4 rounded-2xl font-bold" required onChange={e => setForm({ ...form, password: e.target.value })} />
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
            {user.role === 'Teacher' ? <Users className="mr-4" /> : <User className="mr-4" />}
            {user.role === 'Teacher' ? 'MY CLASS' : 'MY STATS'}
          </button>
        </nav>
        <button onClick={handleDeleteAccount} className="flex items-center p-4 text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase mb-2 transition-colors"><UserX className="mr-4" size={16} /> Delete Account</button>
        <button onClick={handleLogout} className="flex items-center p-5 bg-slate-800 rounded-3xl font-black hover:bg-red-600 transition-colors"><LogOut className="mr-4" /> LOGOUT</button>
      </aside>

      <div className="flex-1">
        <header className="bg-white p-6 px-12 flex justify-between items-center border-b sticky top-0 z-10">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-5 top-4 text-slate-300" size={20} />
            <input type="text" placeholder="Search awards..." className="w-full pl-14 pr-6 py-4 bg-slate-100 rounded-2xl font-bold focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
  {activeTab === 'achievements' ? (
    <>
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Awards Feed</h1>
        {user.role.toLowerCase() === 'teacher' && (
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-900 transition-all shadow-lg shadow-blue-500/20"><Plus /> ADD AWARD</button>
        )}
      </div>
      <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-400 tracking-widest">
            <tr><th className="p-8">Achievement</th><th className="p-8">Category</th><th className="p-8">Student</th>{user.role.toLowerCase() === 'teacher' && <th className="p-8 text-right">Action</th>}</tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAchievements.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-8 font-black text-slate-800">{item.title}</td>
                <td className="p-8"><span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-100 uppercase">{item.category}</span></td>
                <td className="p-8 font-bold text-slate-500">
  {/* Priority 1: Nested object from Backend | Priority 2: Enriched name | Priority 3: Fallback */}
  <span>{item.user?.fullName || item.userName || "Student"}</span>
  <small className="block text-slate-400">
    @{item.user?.username || item.userHandle || "user"}
  </small>
</td>
                {user.role.toLowerCase() === 'teacher' && (
                  <td className="p-8 text-right"><button onClick={() => handleDeleteAch(item.id)} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button></td>
                )}
              </tr>
            ))}
            {filteredAchievements.length === 0 && (
                <tr><td colSpan="4" className="p-20 text-center font-bold text-slate-300">No achievements found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-500/40">
              <Trophy className="absolute -right-4 -bottom-4 opacity-20" size={120} />
              <p className="uppercase text-[10px] font-black mb-2 opacity-70 tracking-widest">{user.role.toLowerCase() === 'teacher' ? 'Total Class Awards' : 'My Rank'}</p>
              <p className="text-4xl font-black">{user.role.toLowerCase() === 'teacher' ? data.length : '#1'}</p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <p className="uppercase text-[10px] font-black mb-2 text-slate-400 tracking-widest">{user.role.toLowerCase() === 'teacher' ? 'My Students' : 'My Awards'}</p>
              <p className="text-6xl font-black text-slate-900">{user.role.toLowerCase() === 'teacher' ? students.length : data.length}</p>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center items-center">
              <p className="uppercase text-[10px] font-black mb-2 text-slate-500 tracking-widest">Section Code</p>
              <p className="text-6xl font-black text-blue-400 tracking-tighter">{user.sectionCode}</p>
          </div>
      </div>

      {/* TEACHER VIEW: STUDENT LIST WITH COUNTS */}
      {user.role.toLowerCase() === 'teacher' && (
        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
          <div className="p-8 border-b bg-slate-50/50">
            <h2 className="text-2xl font-black text-slate-900">Student Progress</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-400 tracking-widest">
              <tr>
                <th className="p-8">Student Name</th>
                <th className="p-8">Username</th>
                <th className="p-8 text-center">Awards Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
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
                  <select className="w-full border-2 p-5 rounded-3xl font-bold bg-slate-50 focus:bg-white outline-none transition-all" required onChange={e => setNewAch({ ...newAch, studentUsername: e.target.value })}>
                    <option value="">Select a student...</option>
                    {students.map(s => <option key={s.id} value={s.username}>{s.fullName} (@{s.username})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Award Title</label>
                  <input type="text" placeholder="e.g. Science Fair Winner" className="w-full border-2 p-5 rounded-3xl font-bold bg-slate-50 focus:bg-white outline-none transition-all" required onChange={e => setNewAch({ ...newAch, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Category</label>
                  <select className="w-full border-2 p-5 rounded-3xl font-bold bg-slate-50 focus:bg-white outline-none transition-all" required onChange={e => setNewAch({ ...newAch, category: e.target.value })}>
                    <option value="">Select category...</option>
                    <option value="Academic">Academic</option>
                    <option value="Sports">Sports</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
                <button className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase shadow-xl hover:bg-slate-900 transition-all mt-4">Confirm Award</button>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}