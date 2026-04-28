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

  const fetchWorker = async () => {
    try {
      const res = await api.get("/workers/me");
      setWorker(res.data.data);
    } catch (error) {
      console.log("Error fetching worker stats:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get("/complaints/worker");
      const tasksData = res?.data?.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error("TASK FETCH ERROR:", error);
      // DO NOT show toast if no tasks
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      setLoadingId(id);
      await api.put(`/workers/complete/${id}`);
      toast.success("Task completed successfully!");

      // Optimistic UI Update
      setTasks(prev =>
        prev.map(task =>
          task._id === id ? { ...task, status: "completed" } : task
        )
      );
      
      // Refresh data to ensure full sync
      await fetchTasks();
      await fetchWorker();
    } catch (error) {
      console.log(error);
      toast.error("Failed to complete task");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchWorker();
    fetchTasks();
  }, []);

  const pendingTasks = tasks?.filter(c => c?.status !== "completed") || [];
  const completedTasks = tasks?.filter(c => c?.status === "completed") || [];

  if (!worker && loading) {
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
      <div className="animate-in fade-in duration-500">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 font-outfit">Worker Dashboard 🔧</h2>
          <p className="text-gray-500 mt-1">Welcome back, {worker?.name || "Worker"}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Assigned Tasks" value={worker ? worker.assignedTasks : 0} />
          <StatCard label="Completed Tasks" value={worker ? worker.completedTasks : 0} color="text-green-600" />
          <StatCard label="Availability" value={worker?.available ? "Available" : "Busy"} color={worker?.available ? "text-green-600" : "text-red-600"} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-hidden">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Pending Tasks</h3>
          {loading ? (
            <p className="text-sm text-gray-400">Loading tasks...</p>
          ) : pendingTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks assigned yet</p>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map(t => (
                <div key={t?._id} className="p-4 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300 flex justify-between items-center flex-wrap gap-4 group">
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{t?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{t?.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-500">{t?.category}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t?.priority === "high" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                      }`}>{t?.priority}</span>
                    </div>
                  </div>
                  {t?.status !== "completed" && (
                    <button
                      disabled={loadingId === t?._id}
                      onClick={() => handleComplete(t?._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 text-sm font-bold rounded-lg transition-all shadow-md shadow-green-900/10 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loadingId === t?._id ? "Processing..." : "Mark as Completed"}
                    </button>
                  )}
                  
                  {/* Minimal Timeline */}
                  {(t?.history || []).length > 0 && (
                    <div className="w-full mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                      {(t?.history || []).map((item, index) => (
                        <div key={item.timestamp || index} className="flex justify-between items-center text-sm">
                          <p className="font-semibold text-gray-700 capitalize">{item.status}</p>
                          <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-hidden mt-8">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Completed Tasks</h3>
          {completedTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No completed tasks yet</p>
          ) : (
            <div className="space-y-4">
              {completedTasks.map(t => (
                <div key={t?._id} className="p-4 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300 flex justify-between items-center flex-wrap gap-4 group opacity-75">
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-through">{t?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{t?.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-500">{t?.category}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-600">COMPLETED</span>
                    </div>
                  </div>

                  {/* Minimal Timeline */}
                  {(t?.history || []).length > 0 && (
                    <div className="w-full mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                      {(t?.history || []).map((item, index) => (
                        <div key={item.timestamp || index} className="flex justify-between items-center text-sm">
                          <p className="font-semibold text-gray-700 capitalize">{item.status}</p>
                          <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;
