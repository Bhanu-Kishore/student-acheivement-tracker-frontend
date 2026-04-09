import React, { useState, useEffect } from 'react';
import { AlertCircle, LogOut, Clock } from 'lucide-react';

export const SessionWarning = ({ isVisible, onExtend, onLogout, timeRemaining }) => {
  const [displayTime, setDisplayTime] = useState(timeRemaining);

  useEffect(() => {
    setDisplayTime(timeRemaining);
  }, [timeRemaining]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="text-red-600" size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 text-center mb-4">Session Expiring</h2>
        
        <p className="text-slate-600 text-center font-bold mb-6">
          Your session will expire due to inactivity. You will be logged out in:
        </p>
        
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="text-red-600" size={24} />
            <span className="text-4xl font-black text-red-600">{displayTime}</span>
          </div>
          <p className="text-sm text-red-600 font-bold">seconds remaining</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onExtend}
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase hover:bg-blue-700 transition-colors"
          >
            Continue Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-slate-200 text-slate-900 py-4 rounded-2xl font-black uppercase hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};
