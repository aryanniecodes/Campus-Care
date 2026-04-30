import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import NotificationBell from "../components/NotificationBell";
import ThemeToggle from "../components/ThemeToggle";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const currentUser = { role, id: userId, workerId: role === 'worker' ? userId : null };

  const navLinks = {
    student: [
      { label: "Dashboard", icon: "📊", path: "/student" },
      { label: "Complaints", icon: "📝", path: "/student/complaints" },
      { label: "Create Request", icon: "➕", path: "/student/create" },
    ],
    worker: [
      { label: "Dashboard", icon: "📊", path: "/worker" },
      { label: "History", icon: "📜", path: "/worker/history" },
    ],
    admin: [
      { label: "Dashboard", icon: "📊", path: "/admin" },
      { label: "Manage Complaints", icon: "📋", path: "/admin/complaints" },
      { label: "Analytics", icon: "📈", path: "/admin/analytics" },
      { label: "Feedback", icon: "⭐", path: "/admin/feedback" },
    ],
  };

  const links = navLinks[role] || navLinks.student;

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden transition-colors duration-300">
      {/* ── Premium Sidebar ── */}
      <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm relative z-20 transition-colors duration-300">
        {/* Brand Header */}
        <div className="px-8 py-8">
          <h1 
            onClick={() => navigate(`/${role || "student"}`)} 
            className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 cursor-pointer hover:opacity-80 transition-opacity"
          >
            CampusCare
          </h1>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">{role} Portal</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer font-medium ${
                  isActive 
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border-l-4 border-blue-500 shadow-sm" 
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 font-medium cursor-pointer transition-all duration-200 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto relative z-10 bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-end items-center gap-4 sticky top-0 z-40 transition-colors duration-300">
          <ThemeToggle />
          <NotificationBell 
            user={role === 'worker' ? { id: currentUser?.workerId, role: 'worker' } : currentUser} 
          />
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
