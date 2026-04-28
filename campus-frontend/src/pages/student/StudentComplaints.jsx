import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

const StudentComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints/my");
      setComplaints(res.data.data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmitFeedback = async (id) => {
    if (!feedback.trim()) return toast.error("Please enter your feedback");
    
    try {
      setIsSubmitting(true);
      await api.put(`/complaints/${id}/feedback`, { rating, feedback });
      toast.success("Feedback submitted successfully!");
      setReviewingId(null);
      setFeedback("");
      setRating(5);
      await fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit">My Complaints</h2>
          <p className="text-gray-500 mt-1">Track your submitted maintenance requests.</p>
        </div>
        <button 
          onClick={() => navigate("/student/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 cursor-pointer"
        >
          + Create Complaint
        </button>
      </div>

      {!complaints ? <div>Loading...</div> : loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-medium animate-pulse text-lg">Loading your complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">No complaints found</p>
          <button 
            onClick={() => navigate("/student/create")}
            className="text-blue-600 font-bold mt-2 hover:underline cursor-pointer"
          >
            Submit your first complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {Array.isArray(complaints) && complaints.map((complaint) => (
            <div key={complaint._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              <div className="flex justify-between items-center w-full">
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
                    complaint.status === "completed" 
                    ? "bg-green-100 text-green-600" 
                    : "bg-yellow-100 text-yellow-600"
                  }`}>
                    {complaint.status}
                  </span>
                  
                  {complaint.status === "completed" && !complaint.rating && reviewingId !== complaint._id && (
                    <button 
                      onClick={() => setReviewingId(complaint._id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Give Feedback
                    </button>
                  )}
                </div>
              </div>

              {reviewingId === complaint._id && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-semibold text-gray-700">Rating:</label>
                      <select 
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                      >
                        {[5, 4, 3, 2, 1].map(n => (
                          <option key={n} value={n}>{n} Stars</option>
                        ))}
                      </select>
                    </div>
                    <textarea 
                      placeholder="Tell us about your experience..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSubmitFeedback(complaint._id)}
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                      </button>
                      <button 
                        onClick={() => setReviewingId(null)}
                        className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-bold text-sm transition-all hover:bg-gray-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {complaint.rating !== undefined && complaint.feedback && (
                <div className="mt-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
                  <p className="text-orange-600 font-medium text-sm italic">
                    <span className="font-bold mr-1">★ {complaint.rating}/5</span> — {complaint.feedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentComplaints;
