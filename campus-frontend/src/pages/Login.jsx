import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";

const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const payload = { id, password, role };
      const response = await api.post("/auth/login", payload);

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("role", response.data.data.role);
        
        if (response.data.data.role === "admin") {
          localStorage.setItem("userId", "admin");
        } else if (response.data.data.role === "worker") {
          localStorage.setItem("userId", response.data.data.user.workerId || response.data.data.user.id);
        } else {
          localStorage.setItem("userId", response.data.data.user.rollNo || response.data.data.user.id);
        }

        toast.success("Welcome back! Login successful.");

        if (response.data.data.role === "student") navigate("/student");
        else if (response.data.data.role === "worker") navigate("/worker");
        else if (response.data.data.role === "admin") navigate("/admin");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-10">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4"
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">CampusCare</h2>
            <p className="text-gray-500 mt-2 font-medium">Smart Campus Maintenance</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-gray-700 font-medium cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="worker">Maintenance Worker</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                {role === "admin" ? "Email Address" : "ID / Roll Number"}
              </label>
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm placeholder-gray-400 text-gray-800"
                placeholder={role === "admin" ? "admin@university.edu" : "Enter your ID"}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm placeholder-gray-400 text-gray-800"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-4 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/50 hover:shadow-blue-500/70 hover:shadow-2xl'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In to Portal"
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
