import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import SLATimer from "../../components/SLATimer";

const StatCard = ({ label, value, color = "text-gray-900" }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-in-out">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    <p className={`text-2xl font-semibold mt-1 ${color}`}>{value}</p>
  </div>
);

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: "...",
    pending: "...",
    completed: "..."
  });

  const fetchData = async () => {
    try {
      const res = await api.get("/complaints/my");
      const data = res?.data?.data || [];
      const safeData = Array.isArray(data) ? data : [];
      
      setComplaints(safeData);
      
      setStats({
        total: safeData.length,
        pending: safeData.filter(c => c?.status !== "completed").length,
        completed: safeData.filter(c => c?.status === "completed").length
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Page Header ── */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Welcome back 👋</h2>
            <p className="text-sm text-gray-500 mt-0.5">Here's an overview of your complaints.</p>
          </div>
          <button 
            onClick={() => {
              console.log("🖱️ Navigating to create complaint...");
              navigate("/student/create");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            + New Complaint
          </button>
        </div>


        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Complaints" value={stats.total} />
          <StatCard label="In Progress" value={stats.pending} color="text-yellow-600" />
          <StatCard label="Completed" value={stats.completed} color="text-green-600" />
        </div>

        {/* ── Recent Complaints ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Complaints</h3>
          {loading ? (
            <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="text-sm text-gray-400">You have no recent complaints.</p>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 5).map(c => (
                <div key={c._id} className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <SLATimer createdAt={c?.createdAt} status={c?.status} />
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${
                      c.status === "completed"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                    }`}>
                      {c.status === "completed" ? "Done" : "Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
