import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const showFeedback = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchComplaints = async () => {
    try {
      const [complaintsRes, workersRes] = await Promise.all([
        api.get("/complaints/all"),
        api.get("/workers/all")
      ]);
      
      const newComplaints = complaintsRes?.data?.data || [];
      const newWorkers = workersRes?.data?.data || [];

      setComplaints(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newComplaints)) return newComplaints;
        return prev;
      });

      setWorkers(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newWorkers)) return newWorkers;
        return prev;
      });

    } catch (error) {
      // console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();

    const interval = setInterval(() => {
      fetchComplaints();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (complaintId, workerId) => {
    if (!workerId) return toast.error("Please select a worker");
    try {
      setActionLoading(complaintId);
      await api.put(`/complaints/assign/${complaintId}`, { workerId });
      showFeedback("Worker assigned successfully");
      toast.success("Worker assigned successfully");
      await fetchComplaints();
    } catch (error) {
      showFeedback("Assignment failed", true);
      toast.error(error.response?.data?.message || "Assignment failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await api.put(`/complaints/status/${id}`, { status });
      showFeedback(`Status updated to ${status}`);
      toast.success(`Status updated to ${status}`);
      await fetchComplaints();
    } catch (error) {
      showFeedback("Status update failed", true);
      toast.error("Status update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      setActionLoading(id);
      await api.delete(`/complaints/${id}`);
      showFeedback("Complaint deleted");
      toast.success("Complaint deleted");
      setComplaints(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      showFeedback("Delete failed", true);
      toast.error("Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredComplaints = (complaints || []).filter(c => {
    if (filter === "all") return true;
    if (filter === "pending") {
      return c?.status === "pending" || c?.status === "in-progress";
    }
    return c?.status === filter;
  });

  if (!complaints) return <p className="text-center py-20 text-gray-400">Initial data loading...</p>;

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-500">
        {message && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300 font-bold text-sm text-white ${isError ? 'bg-red-600' : 'bg-green-600'}`}>
            {message}
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-outfit">Manage Complaints 📋</h2>
            <p className="text-gray-500 mt-1">Review, assign, and resolve student maintenance requests.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {["all", "pending", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  filter === f 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 font-medium animate-pulse text-lg">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center animate-in zoom-in duration-300">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-blue-400">📋</span>
            </div>
            <p className="text-gray-500 font-bold text-xl uppercase tracking-tight">No {filter} complaints</p>
            <p className="text-gray-400 mt-2">New student requests will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {Array.isArray(filteredComplaints) && filteredComplaints.map((c) => (
              <div key={c._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{c.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      c?.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {c?.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{c.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">Category: {c.category} <span className="lowercase italic font-normal">(AI detected)</span></span>
                    <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">Priority: {c.priority}</span>
                    <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-2">
                      Assigned To: 
                      <span className={c.assignedWorker ? "text-blue-600" : "text-orange-500"}>
                        {c.assignedWorker?.name || "Unassigned"}
                      </span>
                    </span>
                  </div>

                  
                  {/* Minimal Timeline */}
                  {(c?.history || []).length > 0 && (
                    <div className="w-full mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                      {(c?.history || []).map((item, index) => (
                        <div key={item.timestamp || index} className="flex justify-between items-center text-sm">
                          <p className="font-semibold text-gray-700 capitalize">{item.status}</p>
                          <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6 min-w-[220px]">
                  {c.status !== "completed" && (
                    <div className="flex flex-col gap-2">
                      <select 
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        onChange={(e) => handleAssign(c._id, e.target.value)}
                        disabled={actionLoading === c._id}
                        defaultValue=""
                      >
                        <option value="" disabled>Reassign Worker...</option>
                        {workers.filter(w => {
                          if (c.category === "plumbing") return w.role === "plumber";
                          if (c.category === "electric" || c.category === "electrical") return w.role === "electrician";
                          if (c.category === "cleaning") return w.role === "cleaner";
                          return true;
                        }).map(w => (
                          <option key={w._id} value={w._id}>{w.name} ({w.tasksAssigned} tasks)</option>
                        ))}
                      </select>
                      
                      <button 
                        onClick={() => handleUpdateStatus(c._id, "completed")}
                        disabled={actionLoading === c._id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-green-900/10 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading === c._id ? "Processing..." : "Mark Completed"}
                      </button>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleDelete(c._id)}
                    disabled={actionLoading === c._id}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    Delete Complaint
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminComplaints;
