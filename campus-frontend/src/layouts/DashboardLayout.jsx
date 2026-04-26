import { useNavigate, NavLink } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const navLinks = {
    student: [
      { label: "📊 Dashboard", path: "/student" },
      { label: "📝 Complaints", path: "/student/complaints" },
      { label: "➕ Create", path: "/student/create" },
    ],
    worker: [
      { label: "📊 Dashboard", path: "/worker" },
    ],
    admin: [
      { label: "📊 Dashboard", path: "/admin" },
    ],
  };

  const links = navLinks[role] || navLinks.student;

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-wide text-blue-500">CampusCare</h1>
          <p className="text-sm text-gray-400 mt-1 capitalize">{role} Portal</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) =>
                `w-full text-left block p-3 rounded-lg transition-colors font-medium cursor-pointer ${
                  isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 font-medium cursor-pointer transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
