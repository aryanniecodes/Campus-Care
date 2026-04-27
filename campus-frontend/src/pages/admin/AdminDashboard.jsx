import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

const StatCard = ({ label, value, color = "text-gray-900", icon }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      {icon && <span className="text-2xl opacity-50">{icon}</span>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, completed: 0, pending: 0, avgRating: 0 });
  const [workerStats, setWorkerStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, analyticsRes, workerStatsRes] = await Promise.all([
          api.get("/complaints/all"),
          api.get("/complaints/analytics"),
          api.get("/workers/stats")
        ]);
        
        setComplaints(complaintsRes.data.data);
        setAnalytics(analyticsRes.data.data);
        setWorkerStats(workerStatsRes.data.data);
      } catch (error) {
        console.log("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      toast.success("Complaint deleted successfully");
    } catch (error) {
      console.log("Delete error:", error);
      toast.error("Failed to delete complaint");
    }
  };

  const topWorker = workerStats.length > 0 
    ? [...workerStats].sort((a, b) => b.completed - a.completed)[0]
    : null;

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-outfit">Admin Analytics 📈</h2>
            <p className="text-gray-500 mt-1">Real-time performance and system monitoring.</p>
          </div>
          {topWorker && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm animate-in slide-in-from-right duration-700">
              <div className="bg-amber-400 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg shadow-amber-200">
                🏆
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Top Performer</p>
                <p className="font-bold text-gray-900">{topWorker.name} <span className="text-amber-600 ml-2">({topWorker.completed} solved)</span></p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Requests" value={loading ? "..." : analytics.total} icon="📋" />
          <StatCard label="Pending" value={loading ? "..." : analytics.pending} color="text-yellow-500" icon="⏳" />
          <StatCard label="Resolved" value={loading ? "..." : analytics.completed} color="text-green-600" icon="✅" />
          <StatCard label="Student Rating" value={loading ? "..." : `${analytics.avgRating} / 5`} color="text-blue-600" icon="⭐" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Worker Performance Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-base font-semibold text-gray-700 mb-6 flex items-center gap-2">
              👷 Worker Performance
            </h3>
            {loading ? (
              <p className="text-sm text-gray-400 animate-pulse">Calculating stats...</p>
            ) : (
              <div className="space-y-4">
                {workerStats.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:shadow-md transition-all duration-300 group">
                    <div>
                      <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{w.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">ID: {w.id}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Active</p>
                        <p className="text-sm font-bold text-gray-700">{w.tasksAssigned}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Solved</p>
                        <p className="text-sm font-bold text-green-600">{w.completed}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        w.available ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}>
                        {w.available ? "Free" : "Busy"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-base font-semibold text-gray-700 mb-6">Recent Activity</h3>
            {loading ? (
              <p className="text-sm text-gray-400 animate-pulse">Fetching updates...</p>
            ) : complaints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No activity recorded.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.slice(0, 5).map(c => (
                  <div key={c._id} className="p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-all duration-200 flex justify-between items-center group">
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{c.title}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{c.category} • {c.priority}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(c._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold transition-all px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
