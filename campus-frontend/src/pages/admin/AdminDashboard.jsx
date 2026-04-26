import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

const StatCard = ({ label, value, color = "text-gray-900" }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get("/complaints/all");
        console.log("API RESPONSE:", res.data);
        setComplaints(res.data.data || res.data);
      } catch (error) {
        console.log("Error fetching complaints:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Overview 🛡️</h2>
          <p className="text-gray-500 mt-1">System-wide complaint and worker management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Complaints" value={loading ? "..." : complaints.length} />
          <StatCard label="Pending" value={loading ? "..." : complaints.filter(c => c.status === "pending").length} color="text-yellow-500" />
          <StatCard label="Completed" value={loading ? "..." : complaints.filter(c => c.status === "resolved" || c.status === "completed").length} color="text-green-600" />
          <StatCard label="Total Workers" value="—" color="text-blue-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Recent Complaints</h3>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : complaints.length === 0 ? (
              <p className="text-sm text-gray-400">No complaints found.</p>
            ) : (
              <div className="space-y-4">
                {complaints.slice(0, 5).map(c => (
                  <div key={c._id} className="border-b border-gray-50 pb-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{c.title}</p>
                      <p className="text-xs text-gray-500">Status: {c.status} | Priority: {c.priority}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(c._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors px-3 py-1 bg-red-50 hover:bg-red-100 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-base font-semibold text-gray-700 mb-2">Worker Status</h3>
            <p className="text-sm text-gray-400">No data yet. Worker availability will appear here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
