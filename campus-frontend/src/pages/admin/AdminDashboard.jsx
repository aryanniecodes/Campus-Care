import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

const StatCard = ({ label, value, color = "text-gray-900" }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, workersRes] = await Promise.all([
          api.get("/complaints/all"),
          api.get("/workers/all")
        ]);
        
        setComplaints(complaintsRes.data.data);
        setWorkers(workersRes.data.data);
      } catch (error) {
        console.log("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
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

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-500">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 font-outfit">Admin Overview 🛡️</h2>
          <p className="text-gray-500 mt-1">System-wide complaint and worker management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Complaints" value={loading ? "..." : complaints.length} />
          <StatCard label="Pending" value={loading ? "..." : complaints.filter(c => c.status === "pending").length} color="text-yellow-500" />
          <StatCard label="Completed" value={loading ? "..." : complaints.filter(c => c.status === "completed").length} color="text-green-600" />
          <StatCard label="Total Workers" value={loading ? "..." : workers.length} color="text-blue-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Recent Complaints</h3>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : complaints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No complaints found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.slice(0, 5).map(c => (
                  <div key={c._id} className="p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-all duration-200 flex justify-between items-center group">
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{c.title}</p>
                      <p className="text-xs text-gray-500 mt-1">Status: {c.status} | Priority: {c.priority}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(c._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold transition-all px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Worker Status</h3>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : workers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No workers registered.</p>
            ) : (
              <div className="space-y-4">
                {workers.map(w => (
                  <div key={w._id} className="flex justify-between items-center p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-all duration-200 group">
                    <div>
                      <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{w.name || w.workerId}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{w.role}</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Tasks</p>
                        <p className="text-sm font-bold text-gray-700">{w.tasksAssigned}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        w.available ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}>
                        {w.available ? "Available" : "Busy"}
                      </span>
                    </div>
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
