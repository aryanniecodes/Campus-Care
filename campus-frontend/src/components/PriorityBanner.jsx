import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PriorityBanner = () => {
  const [highPriority, setHighPriority] = useState([]);

  const fetchHighPriority = async () => {
    try {
      const res = await api.get('/complaints/high-priority');
      if (res.data.success) {
        setHighPriority(res.data.data);
      }
    } catch (error) {
      // Silent error for banner polling
    }
  };

  useEffect(() => {
    fetchHighPriority();
    const interval = setInterval(fetchHighPriority, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!highPriority || highPriority.length === 0) return null;

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">⚠️</span>
          <h3 className="text-sm font-black text-yellow-800 uppercase tracking-widest">
            High Priority Issues Detected
          </h3>
        </div>
        
        <div className="max-h-40 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {highPriority.map((complaint) => (
            <div key={complaint._id} className="bg-white/50 p-3 rounded-lg flex justify-between items-center group hover:bg-white transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-800 uppercase tracking-tight">
                  {complaint.category}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">
                  {complaint.title || "Urgent Maintenance Required"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                  Action Required
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriorityBanner;
