import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EscalationBanner = () => {
  const [escalated, setEscalated] = useState([]);

  const fetchEscalated = async () => {
    try {
      const res = await api.get('/complaints/escalated');
      if (res.data.success) {
        setEscalated(res.data.data);
      }
    } catch (error) {
      // Silent fail for production
    }
  };

  useEffect(() => {
    fetchEscalated();
    const interval = setInterval(fetchEscalated, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!escalated || escalated.length === 0) return null;

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl animate-pulse">🚨</span>
          <h3 className="text-xs font-black text-red-800 uppercase tracking-widest">
            Escalated Complaints (Pending {'>'} 24h)
          </h3>
        </div>

        <div className="max-h-48 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {escalated.map((c) => {
            const hours = Math.floor((new Date() - new Date(c.createdAt)) / (1000 * 60 * 60));
            return (
              <div key={c._id} className="bg-white/60 p-3 rounded-xl flex justify-between items-center group hover:bg-white transition-all border border-red-100/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter">
                    {c.category}
                  </span>
                  <span className="text-xs text-red-600 font-bold">
                    Pending for {hours} hours
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-red-100 text-red-600 px-3 py-1 rounded-lg font-black uppercase tracking-tighter border border-red-200">
                    SLA Breached
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EscalationBanner;
