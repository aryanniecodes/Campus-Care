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

const WorkerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const showFeedback = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchWorker = async () => {
    try {
      const res = await api.get("/workers/me");
      const newData = res?.data?.data || null;
      setWorker(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newData)) return newData;
        return prev;
      });
    } catch (error) {
      // Failed silently in background refresh
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get("/complaints/worker");
      const newData = res?.data?.data || [];
      setTasks(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newData)) return newData;
        return prev;
      });
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      setLoadingId(id);
      await api.put(`/workers/complete/${id}`);
      showFeedback("Task marked as completed");
      toast.success("Task completed successfully!");

      // Optimistic UI Update
      setTasks(prev =>
        (prev || []).map(task =>
          task?._id === id ? { ...task, status: "completed" } : task
        )
      );
      
      await fetchTasks();
      await fetchWorker();
    } catch (error) {
      showFeedback("Failed to complete task", true);
      toast.error("Failed to complete task");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchWorker();
    fetchTasks();

    const interval = setInterval(() => {
      fetchWorker();
      fetchTasks();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const pendingTasks = (tasks || []).filter(c => c?.status !== "completed");
  const completedTasks = (tasks || []).filter(c => c?.status === "completed");

  if (loading && !worker) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-medium animate-pulse text-lg">Loading Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
        {message && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300 font-bold text-sm text-white ${isError ? 'bg-red-600' : 'bg-green-600'}`}>
            {message}
          </div>
        )}
        
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 font-outfit tracking-tight">Worker Dashboard 🔧</h2>
          <p className="text-gray-500 mt-1 font-medium italic">Welcome back, {worker?.name || "Worker"}. Ready to resolve some issues?</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Assigned Tasks" value={worker?.assignedTasks || 0} icon="📋" />
          <StatCard label="Completed Tasks" value={completedTasks.length} color="text-green-600" icon="✅" />
          <StatCard label="Availability" value={worker?.available ? "Available" : "Busy"} color={worker?.available ? "text-green-600" : "text-red-600"} icon="⚡" />
        </div>

        <div className="grid grid-cols-1 gap-10">
          {/* Pending Tasks Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wider">Pending Tasks</h3>
            </div>
            
            {loading && tasks.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-bold text-lg">No pending tasks 🎉</p>
                <p className="text-sm text-gray-300 mt-1">Great job! You've cleared your queue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingTasks.map(t => (
                  <div key={t?._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <p className="font-extrabold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{t?.title}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{t?.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 border border-blue-200">
                        {t?.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                        t?.priority === "high" ? "bg-red-100 text-red-600 border-red-200" :
                        t?.priority === "medium" ? "bg-yellow-100 text-yellow-600 border-yellow-200" :
                        "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>{t?.priority}</span>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-yellow-200 text-yellow-800 border border-yellow-300">
                        IN PROGRESS
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      {t?.history?.filter(h => h.status === "created").map(h => (
                        <div key={h.timestamp} className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="font-bold uppercase tracking-tight text-[10px]">Created:</span>
                          <span>{new Date(h.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={loadingId === t?._id}
                      onClick={() => handleComplete(t?._id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-green-900/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loadingId === t?._id ? "Syncing..." : "Mark as Resolved"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;
