import { useEffect, useState, useRef, useMemo, memo } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PriorityBanner from "../../components/PriorityBanner";
import EscalationBanner from "../../components/EscalationBanner";
import SLATimer from "../../components/SLATimer";

// ── Shared Design Tokens ──────────────────────────────────────────────────
const COLORS = ["#22c55e", "#facc15"];

// ── Memoized Components ──────────────────────────────────────────────────
const StatCard = memo(({ label, value, color = "text-gray-900", icon, loading }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-in-out h-full">
    {loading ? (
      <div className="animate-pulse space-y-2">
        <div className="h-3 w-20 bg-gray-100 rounded"></div>
        <div className="h-8 w-12 bg-gray-100 rounded"></div>
      </div>
    ) : (
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-semibold mt-1 ${color}`}>{value}</p>
        </div>
        {icon && <span className="text-xl opacity-40">{icon}</span>}
      </div>
    )}
  </div>
));

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, completed: 0, pending: 0, avgRating: 0 });
  const [workerStats, setWorkerStats] = useState([]);
  const [activities, setActivities] = useState([]);
  
  // ── Loading States ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState({
    stats: true,
    activity: true,
    workers: true,
    flow: true
  });

  const hasFetched = useRef(false);

  // ── Data Fetching ───────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    // 1. Fetch Stats & Analytics
    try {
      const res = await api.get("/complaints/analytics");
      const data = res.data?.data || {};
      setAnalytics({
        total: data.total || 0,
        completed: data.completed || 0,
        pending: data.pending || 0,
        avgRating: data.avgRating || 0,
        leaderboard: data.leaderboard || []
      });
    } catch (e) { console.error("Stats fetch failed"); }
    finally { setLoading(prev => ({ ...prev, stats: false })); }

    // 2. Fetch Worker Stats
    try {
      const res = await api.get("/workers/stats");
      setWorkerStats(res.data?.data || []);
    } catch (e) { console.error("Worker stats fetch failed"); }
    finally { setLoading(prev => ({ ...prev, workers: false })); }

    // 3. Fetch Activity Flow (Complaints List)
    try {
      const res = await api.get("/complaints/all");
      setComplaints(res.data?.data || []);
    } catch (e) { console.error("Complaints fetch failed"); }
    finally { setLoading(prev => ({ ...prev, flow: false })); }

    // 4. Fetch Activities
    try {
      const res = await api.get("/activity");
      setActivities(res.data?.data || []);
    } catch (e) { console.error("Activities fetch failed"); }
    finally { setLoading(prev => ({ ...prev, activity: false })); }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetchDashboardData();

    // 60s background refresh for production stability
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Memoized Data ──────────────────────────────────────────────────────
  const chartData = useMemo(() => [
    { name: "Completed", value: analytics.completed || 0 },
    { name: "Pending", value: analytics.pending || 0 }
  ], [analytics.completed, analytics.pending]);

  const safeChartData = useMemo(() => (
    analytics.completed === 0 && analytics.pending === 0
      ? [{ name: "No Data", value: 1 }]
      : chartData
  ), [analytics.completed, analytics.pending, chartData]);

  const rankedWorkers = useMemo(() => 
    [...(workerStats || [])].sort((a, b) => (b.completed || 0) - (a.completed || 0)),
  [workerStats]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this complaint?")) return;
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints(prev => prev.filter(c => c._id !== id));
      toast.success("Complaint removed");
    } catch (e) { toast.error("Delete failed"); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 pb-12">
        
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Admin Command Center</h2>
            <p className="text-sm text-gray-500 mt-0.5">Real-time system health and resolution analytics.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Live
          </div>
        </div>

        <PriorityBanner />
        <EscalationBanner />

        {/* ── Stat Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={analytics.total} icon="📋" loading={loading.stats} />
          <StatCard label="In Queue" value={analytics.pending} color="text-yellow-600" icon="⏳" loading={loading.stats} />
          <StatCard label="Resolved" value={analytics.completed} color="text-green-600" icon="✅" loading={loading.stats} />
          <StatCard label="Avg Rating" value={`${analytics.avgRating} / 5`} color="text-blue-600" icon="⭐" loading={loading.stats} />
        </div>

        {/* ── Visual Analytics Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Resolution Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Resolution Distribution
            </h3>
            <div className="w-full h-[300px]">
              {loading.stats ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl animate-pulse text-gray-400 text-xs">
                  Calculating metrics...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {safeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "No Data" ? "#f3f4f6" : COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Worker Leaderboard */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Top Performance Leaderboard
            </h3>
            {loading.workers ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-gray-50 animate-pulse rounded-xl"></div>)}
              </div>
            ) : rankedWorkers.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm italic">No worker data available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rankedWorkers.slice(0, 4).map((w, index) => (
                  <div key={w?.id || index} className="flex justify-between items-center p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                        index === 0 ? "bg-amber-100 text-amber-600" : "bg-white text-gray-400 border border-gray-100"
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{w?.name || "Anonymous"}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Resolved {w?.completed || 0} tasks</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${w?.available ? "bg-green-500" : "bg-red-400"}`}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Activity Flow ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Global Resolution Stream
          </h3>
          
          {loading.flow ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-gray-50 animate-pulse rounded-xl"></div>)}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">No active requests found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complaints.slice(0, 6).map(c => (
                <div key={c._id} className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex justify-between items-center group">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">{c.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <SLATimer createdAt={c?.createdAt} status={c?.status} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        c.priority === "high" ? "text-red-500" : "text-blue-500"
                      }`}>{c.priority}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(c._id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    title="Remove complaint"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

export default memo(AdminDashboard);
