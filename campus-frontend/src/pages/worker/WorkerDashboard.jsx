import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

const StatCard = ({ label, value, color = "text-gray-900" }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const WorkerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/complaints/assigned");
        console.log("API RESPONSE:", res.data);
        setTasks(res.data.data || res.data);
      } catch (error) {
        console.log("Error fetching assigned tasks:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Worker Dashboard 🔧</h2>
          <p className="text-gray-500 mt-1">Manage your assigned tasks here.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Assigned Tasks" value={loading ? "..." : tasks.length} />
          <StatCard label="Completed Today" value="—" color="text-green-600" />
          <StatCard label="Availability" value="—" color="text-blue-600" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Pending Tasks</h3>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-gray-400">No tasks assigned yet. Your tasks will appear here.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map(t => (
                <div key={t._id} className="border-b border-gray-50 pb-2">
                  <p className="font-medium text-gray-900">{t.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Status: {t.status} | Priority: {t.priority}</p>
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
