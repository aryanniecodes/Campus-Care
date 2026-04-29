import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const payload = {
        id,
        password,
        role
      };

      const response = await api.post("/auth/login", payload);

      if (response.data.success) {
        // Store auth data
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("role", response.data.data.role);
        
        // Store user specific ID for notifications
        if (response.data.data.role === "admin") {
          localStorage.setItem("userId", "admin");
        } else if (response.data.data.role === "worker") {
          localStorage.setItem("userId", response.data.data.user.workerId || response.data.data.user.id);
        } else {
          localStorage.setItem("userId", response.data.data.user.rollNo || response.data.data.user.id);
        }

        toast.success("Welcome back! Login successful.");

        // Redirect based on role
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-600">CampusCare</h2>
          <p className="text-gray-400 mt-1 text-sm">University Maintenance Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
            >
              <option value="student">Student</option>
              <option value="worker">Worker</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              {role === "admin" ? "Email Address" : "ID / Roll Number"}
            </label>
            <input
              type="text"
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-300"
              placeholder={role === "admin" ? "admin@test.com" : "e.g. 123456"}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-300"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
