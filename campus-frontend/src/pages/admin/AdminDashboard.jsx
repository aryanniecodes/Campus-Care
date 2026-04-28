import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch Activities
      const actRes = await api.get("/activity");
      const activitiesData = actRes?.data?.data || [];
      
      setActivities(prev => {
        const newData = activitiesData.length === 0 ? [
          { type: "create", message: "New complaint submitted", createdAt: new Date() },
          { type: "assign", message: "Worker assigned to complaint", createdAt: new Date() }
        ] : (Array.isArray(activitiesData) ? activitiesData : []);
        
        if (JSON.stringify(prev) !== JSON.stringify(newData)) return newData;
        return prev;
      });

      // Fetch Stats
      const [complaintsRes, analyticsRes, workerStatsRes] = await Promise.all([
        api.get("/complaints/all"),
        api.get("/complaints/analytics"),
        api.get("/workers/stats")
      ]);
      
      const compData = complaintsRes?.data?.data || [];
      setComplaints(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(compData)) return compData;
        return prev;
      });
      
      const data = analyticsRes?.data?.data || {};
      setAnalytics(prev => {
        const newData = {
          total: data.total || 0,
          completed: data.completed || 0,
          pending: data.pending || 0,
          avgRating: data.avgRating || 0,
          leaderboard: data.leaderboard || []
        };
        if (JSON.stringify(prev) !== JSON.stringify(newData)) return newData;
        return prev;
      });
      
      const workerData = workerStatsRes?.data?.data || [];
      setWorkerStats(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(workerData)) return workerData;
        return prev;
      });
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Initializing Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) return <p>Loading...</p>;

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

  const rankedWorkers = [...workerStats].sort((a, b) => b.completed - a.completed);

  const chartData = [
    { name: "Completed", value: analytics.completed || 0 },
    { name: "Pending", value: analytics.pending || 0 }
  ];

  const safeChartData =
    analytics.completed === 0 && analytics.pending === 0
      ? [
          { name: "Completed", value: 1 },
          { name: "Pending", value: 0 }
        ]
      : chartData;

  const COLORS = ["#22c55e", "#facc15"];

  return (
    <DashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 font-outfit tracking-tight">Admin Analytics 📈</h2>
            <p className="text-gray-500 mt-1 font-medium">Real-time performance and system monitoring.</p>
          </div>
          {topWorker && (
            <div className="bg-white border border-amber-100 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-amber-900/5 hover:scale-105 transition-all duration-500 cursor-default">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-200 rotate-3">
                🏆
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Leaderboard #1</p>
                <p className="font-extrabold text-gray-900 text-lg">{topWorker.name}</p>
                <p className="text-xs text-gray-400 font-bold">{topWorker.completed} resolutions</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Requests" value={analytics.total} icon="📋" />
          <StatCard label="Pending" value={analytics.pending} color="text-yellow-500" icon="⏳" />
          <StatCard label="Completed" value={analytics.completed} color="text-green-600" icon="✅" />
          <StatCard label="Student Rating" value={`${analytics.avgRating} / 5`} color="text-blue-600" icon="⭐" />
        </div>

        <div className="bg-white p-4 rounded-xl shadow mt-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>

          {activities.length === 0 ? (
            <p className="text-gray-400">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {activities.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="text-xl">
                    {item.type === "create" && "📝"}
                    {item.type === "complete" && "✅"}
                    {item.type === "assign" && "🔧"}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pie Chart Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center hover:shadow-xl transition-all duration-500">
            <h3 className="text-base font-bold text-gray-800 mb-4 self-start uppercase tracking-wider">📊 Resolution Split</h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {safeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Worker Performance Ranking */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-500">
            <h3 className="text-base font-bold text-gray-800 mb-8 flex items-center gap-2 uppercase tracking-wider">
              🏅 Worker Leaderboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(analytics.leaderboard || []).map((w, index) => (
                <div key={w.workerId} className="flex justify-between items-center p-5 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
                  <div className="flex items-center gap-5">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${
                      index === 0 ? "bg-amber-100 text-amber-600 rotate-3" : 
                      index === 1 ? "bg-slate-100 text-slate-600 -rotate-3" :
                      index === 2 ? "bg-orange-100 text-orange-600 rotate-2" : "bg-white text-gray-400"
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">{w.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">Worker ID: {w.workerId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">Success</p>
                      <p className="font-black text-green-600">{w.completed}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      w.available ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {w.available ? "Available" : "Busy"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-500">
          <h3 className="text-base font-bold text-gray-800 mb-8 uppercase tracking-wider">Recent Activity Flow</h3>
          {complaints.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No activity flow recorded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.slice(0, 6).map(c => (
                <div key={c._id} className="p-5 rounded-2xl border border-gray-50 bg-gray-50/20 hover:bg-white hover:shadow-xl hover:scale-[1.03] transition-all duration-300 flex justify-between items-center group">
                  <div>
                    <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[180px]">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.category}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        c.priority === "high" ? "text-red-500" : "text-blue-500"
                      }`}>{c.priority}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(c._id)}
                    className="text-red-500 hover:text-white hover:bg-red-500 text-[10px] font-black uppercase tracking-widest transition-all px-4 py-2 bg-red-50 rounded-xl cursor-pointer shadow-sm active:scale-90"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
