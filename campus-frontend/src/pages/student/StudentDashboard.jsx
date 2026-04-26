import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

const StatCard = ({ label, value, color = "text-gray-900" }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const StudentDashboard = () => {
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
      const data = res.data.data || res.data;
      
      setComplaints(data);
      
      setStats({
        total: data.length,
        pending: data.filter(c => c.status !== "resolved" && c.status !== "completed").length,
        completed: data.filter(c => c.status === "resolved" || c.status === "completed").length
      });
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back 👋</h2>
          <p className="text-gray-500 mt-1">Here's an overview of your complaints.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Complaints" value={stats.total} />
          <StatCard label="In Progress" value={stats.pending} color="text-blue-600" />
          <StatCard label="Resolved" value={stats.completed} color="text-green-600" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Recent Complaints</h3>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="text-sm text-gray-400">You have no recent complaints.</p>
          ) : (
            <div className="space-y-4">
              {complaints.slice(0, 5).map(c => (
                <div key={c._id} className="border-b border-gray-50 pb-3">
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-sm text-gray-600 mt-1 truncate">{c.description}</p>
                  <p className="text-xs text-gray-500 mt-2 font-semibold uppercase tracking-wide">
                    <span className={c.status === "resolved" || c.status === "completed" ? "text-green-600" : "text-yellow-600"}>
                      {c.status}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    Priority: {c.priority}
                  </p>
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
