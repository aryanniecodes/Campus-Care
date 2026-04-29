import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PriorityBanner from "../../components/PriorityBanner";
import EscalationBanner from "../../components/EscalationBanner";
import SLATimer from "../../components/SLATimer";

const StatCard = ({ label, value, color = "text-gray-900", icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-in-out">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-semibold mt-1 ${color}`}>{value}</p>
      </div>
      {icon && <span className="text-xl opacity-40">{icon}</span>}
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

  // Guard against React StrictMode double-invoke and duplicate calls
  const hasFetched = useRef(false);

  const fetchData = async (signal) => {
    try {
      // Fetch Activities
      const actRes = await api.get("/activity", { signal });
      const activitiesData = actRes?.data?.data || [];
      
      setActivities(
        activitiesData.length === 0
          ? [
              { type: "create", message: "New complaint submitted", createdAt: new Date() },
              { type: "assign", message: "Worker assigned to complaint", createdAt: new Date() }
            ]
          : Array.isArray(activitiesData) ? activitiesData : []
      );

      // Batch fetch all stats in parallel
      const [complaintsRes, analyticsRes, workerStatsRes] = await Promise.all([
        api.get("/complaints/all", { signal }),
        api.get("/complaints/analytics", { signal }),
        api.get("/workers/stats", { signal })
      ]);
      
      setComplaints(complaintsRes?.data?.data || []);
      
      const data = analyticsRes?.data?.data || {};
      setAnalytics({
        total: data.total || 0,
        completed: data.completed || 0,
        pending: data.pending || 0,
        avgRating: data.avgRating || 0,
        leaderboard: data.leaderboard || []
      });
      
      setWorkerStats(workerStatsRes?.data?.data || []);
    } catch (err) {
      // Ignore AbortError — request was cancelled on unmount
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        // Silent fail on background refresh — don't toast on polling
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent double-fire from React StrictMode in development
    if (hasFetched.current) return;
    hasFetched.current = true;

    const controller = new AbortController();
    fetchData(controller.signal);

    // 30s polling — frequent enough to feel live, won't spam the backend
    const interval = setInterval(() => {
      fetchData(controller.signal);
    }, 30000);

    return () => {
      clearInterval(interval);
      controller.abort(); // Cancel in-flight requests on unmount
    };
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
      toast.error("Failed to delete complaint");
    }
  };

  const topWorker = workerStats.length > 0 
    ? [...workerStats].sort((a, b) => b.completed - a.completed)[0]
    : null;

  const rankedWorkers = [...(workerStats || [])].sort((a, b) => (b.completed || 0) - (a.completed || 0));

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
      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
            <p className="text-sm text-gray-500 mt-0.5">Real-time performance and system monitoring.</p>
          </div>
          {topWorker && (
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default">
              <span className="text-lg">🏆</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Top Worker</p>
                <p className="font-semibold text-gray-800 text-sm">{topWorker.name}</p>
                <p className="text-xs text-gray-400">{topWorker.completed} resolutions</p>
              </div>
            </div>
          )}
        </div>

        <PriorityBanner />
        <EscalationBanner />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={analytics.total} icon="📋" />
          <StatCard label="Pending" value={analytics.pending} color="text-yellow-600" icon="⏳" />
          <StatCard label="Completed" value={analytics.completed} color="text-green-600" icon="✅" />
          <StatCard label="Avg Rating" value={`${analytics.avgRating} / 5`} color="text-blue-600" icon="⭐" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>

          {activities.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activities.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="text-base">
                    {item.type === "create" && "📝"}
                    {item.type === "complete" && "✅"}
                    {item.type === "assign" && "🔧"}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.message}</p>
                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center hover:shadow-md transition-all duration-200 ease-in-out">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 self-start">📊 Resolution Split</h3>
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

          {/* Worker Leaderboard */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 ease-in-out">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">🏅 Worker Leaderboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(rankedWorkers || []).length === 0 ? (
                <p className="text-gray-400 text-center py-8 col-span-full font-medium">No worker data available</p>
              ) : (rankedWorkers || []).map((w, index) => (
                <div key={w?._id || w?.workerId || index} className="flex justify-between items-center p-5 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
                  <div className="flex items-center gap-5">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${
                      index === 0 ? "bg-amber-100 text-amber-600 rotate-3" : 
                      index === 1 ? "bg-slate-100 text-slate-600 -rotate-3" :
                      index === 2 ? "bg-orange-100 text-orange-600 rotate-2" : "bg-white text-gray-400"
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">{w?.name || "Unknown Worker"}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">Worker ID: {w?._id || w?.workerId || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">Success</p>
                      <p className="font-black text-green-600">{w?.completed || 0}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      w?.available ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {w?.available ? "Available" : "Busy"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity Flow</h3>
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
                      <SLATimer createdAt={c?.createdAt} status={c?.status} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.category}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        c.priority === "high" ? "text-red-500" : "text-blue-500"
                      }`}>{c.priority}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(c._id)}
                    className="text-red-500 text-xs font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition-all duration-200 border border-red-100"
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
