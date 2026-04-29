import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SimilarComplaints = ({ complaintId }) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const res = await api.get(`/complaints/${complaintId}/similar`);
        if (res.data.success) {
          setSimilar(res.data.data);
        }
      } catch (error) {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    if (complaintId) {
      fetchSimilar();
    }
  }, [complaintId]);

  if (loading) return <p className="text-[10px] text-gray-400 mt-4">Searching for similar issues...</p>;
  if (similar.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
        <span>🔗 Similar complaints in your area</span>
        <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{similar.length}</span>
      </p>
      <div className="space-y-1.5">
        {similar.map((c) => (
          <div key={c._id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-50">
            <p className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{c.title}</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
              c.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarComplaints;
