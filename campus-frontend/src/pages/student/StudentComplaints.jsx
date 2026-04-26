import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

const StudentComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get("/complaints/my");
        console.log("Student complaints response:", res.data);
        setComplaints(res.data.data || res.data);
      } catch (error) {
        console.log("Error fetching complaints:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Complaints</h2>
          <p className="text-gray-500 mt-1">Track your submitted maintenance requests.</p>
        </div>
        <button 
          onClick={() => navigate("/student/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          + Create Complaint
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-medium animate-pulse text-lg">Loading your complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">You haven't submitted any complaints yet.</p>
          <button 
            onClick={() => navigate("/student/create")}
            className="text-blue-600 font-bold mt-2 hover:underline"
          >
            Submit your first complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <h4 className="font-bold text-lg text-gray-900">{complaint.title}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="capitalize">Priority: {complaint.priority}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{complaint.category}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  complaint.status === "resolved" 
                  ? "bg-green-100 text-green-600" 
                  : "bg-yellow-100 text-yellow-600"
                }`}>
                  {complaint.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentComplaints;
