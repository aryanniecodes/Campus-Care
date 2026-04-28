import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

const StatCard = ({ title, value, color = "text-gray-900" }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
    <p className={`text-3xl font-black mt-2 ${color}`}>{value}</p>
  </div>
);

const WorkerHistory = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/complaints/worker");
      const newData = res?.data?.data || [];
      setTasks(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newData)) return newData;
        return prev;
      });
    } catch (error) {
      console.error("TASK FETCH ERROR:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const completedTasks = (tasks || []).filter(c => c?.status === "completed");

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const todayCount = completedTasks.filter(t => {
    const comp = t.history?.find(h => h.status === "completed")?.timestamp;
    return comp && new Date(comp) >= todayStart;
  }).length;

  const weekCount = completedTasks.filter(t => {
    const comp = t.history?.find(h => h.status === "completed")?.timestamp;
    return comp && new Date(comp) >= weekStart;
  }).length;

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 font-outfit tracking-tight">Resolution History 📜</h2>
          <p className="text-gray-500 mt-1 font-medium">Track all your completed tasks and performance metrics.</p>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Resolved" value={completedTasks.length} color="text-blue-600" />
          <StatCard title="Resolved Today" value={todayCount} color="text-green-600" />
          <StatCard title="This Week" value={weekCount} color="text-orange-500" />
        </div>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-8 bg-green-600 rounded-full"></span>
            <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wider">Historical Records</h3>
          </div>

          {loading && completedTasks.length === 0 ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : completedTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 shadow-sm border border-dashed border-gray-200 text-center animate-in zoom-in duration-300">
              <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚀</span>
              </div>
              <p className="text-gray-900 font-black text-xl">No completed tasks yet</p>
              <p className="text-gray-400 mt-2 font-medium">Start completing tasks to see your resolution history here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTasks.map(t => (
                <div key={t?._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-default">
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-extrabold text-lg text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">{t?.title}</p>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-200">
                      Completed
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed h-10">{t?.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100">
                      {t?.category} <span className="lowercase italic font-normal">(AI)</span>
                    </span>
                  </div>

                  <div className="space-y-3 pt-5 border-t border-gray-50">
                    {t?.history?.filter(h => h.status === "created").map(h => (
                      <div key={h.timestamp} className="flex justify-between items-center text-[11px] text-gray-400">
                        <span className="font-bold uppercase tracking-widest">Created</span>
                        <span className="font-medium">{new Date(h.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    ))}
                    {t?.history?.filter(h => h.status === "completed").map(h => (
                      <div key={h.timestamp} className="flex justify-between items-center text-[11px] text-green-600 font-black">
                        <span className="uppercase tracking-widest">Resolved</span>
                        <span>{new Date(h.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default WorkerHistory;
