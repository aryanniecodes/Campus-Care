import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import SLATimer from "../../components/SLATimer";

const StatCard = ({ label, value, color = "text-gray-900", darkColor = "dark:text-gray-100", icon, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ scale: 1.02, y: -4 }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between transition-all duration-300"
  >
    <div>
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={`text-3xl font-extrabold mt-2 ${color} ${darkColor}`}>{value}</p>
    </div>
    <div className={`p-4 rounded-xl ${icon.bg}`}>
      {icon.svg}
    </div>
  </motion.div>
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

  // Define icons for stats
  const icons = {
    total: {
      bg: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      svg: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    },
    pending: {
      bg: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      svg: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    completed: {
      bg: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      svg: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ── Page Header ── */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Welcome back 👋</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Here's an overview of your campus maintenance requests.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/student/create")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            New Request
          </motion.button>
        </motion.div>


        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Requests" value={stats.total} icon={icons.total} delay={0.1} />
          <StatCard label="In Progress" value={stats.pending} color="text-yellow-600" darkColor="dark:text-yellow-400" icon={icons.pending} delay={0.2} />
          <StatCard label="Resolved" value={stats.completed} color="text-green-600" darkColor="dark:text-green-400" icon={icons.completed} delay={0.3} />
        </div>

        {/* ── Recent Complaints ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Activity</h3>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">You have no recent requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.slice(0, 5).map((c, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  key={c._id} 
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 group cursor-pointer"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <SLATimer createdAt={c?.createdAt} status={c?.status} />
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                      c.status === "completed"
                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-400/20"
                        : "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-400/20"
                    }`}>
                      {c.status === "completed" ? "Done" : "Active"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
