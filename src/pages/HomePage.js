import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <GraduationCap size={120} className="text-blue-600 mb-6" />
      <h1 className="text-7xl font-black text-slate-900 mb-4 text-center leading-tight">STUDENT ACHIEVEMENT <br/> TRACKER</h1>
      <p className="text-slate-500 font-bold mb-8 text-center max-w-md">Track and celebrate student achievements in extracurricular activities</p>
      <button onClick={() => navigate('/auth')} className="bg-slate-900 text-white px-14 py-6 rounded-2xl font-black text-xl hover:bg-blue-600 transition-all shadow-xl">GET STARTED</button>
    </div>
  );
};
