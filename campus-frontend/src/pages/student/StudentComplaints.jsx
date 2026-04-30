import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";
import SLATimer from "../../components/SLATimer";
import SimilarComplaints from "../../components/SimilarComplaints";


const StudentComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const showFeedback = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints/my");
      const newData = res.data.data || [];
      
      setComplaints(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newData)) {
          return newData;
        }
        return prev;
      });
    } catch (error) {
      // Silent error for background sync
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();

    const interval = setInterval(() => {
      fetchComplaints();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmitFeedback = async (id) => {
    if (!feedback.trim()) return toast.error("Please enter your feedback");
    
    try {
      setIsSubmitting(true);
      await api.put(`/complaints/${id}/feedback`, { rating, feedback });
      showFeedback("Feedback submitted successfully");
      toast.success("Feedback submitted successfully!");
      setReviewingId(null);
      setFeedback("");
      setRating(5);
      await fetchComplaints();
    } catch (error) {
      showFeedback("Failed to submit feedback", true);
      toast.error(error.response?.data?.message || "Error submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-24 left-1/2 px-6 py-2.5 rounded-full shadow-lg z-50 font-bold text-sm text-white ${isError ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {message}
        </motion.div>
      )}
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">My Requests</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Track and manage your submitted maintenance tickets.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/student/create")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-500/30 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          New Request
        </motion.button>
      </motion.div>

      {!complaints ? <div>Loading...</div> : loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse text-lg">Loading your requests...</p>
        </div>
      ) : complaints.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-16 shadow-sm border border-gray-200 dark:border-gray-700 text-center flex flex-col items-center justify-center transition-colors duration-300"
        >
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 transition-colors duration-300">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="text-gray-900 dark:text-gray-100 text-lg font-bold">No requests found</p>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">You haven't submitted any maintenance requests yet.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Array.isArray(complaints) && complaints.map((complaint, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2, scale: 1.005 }}
              key={complaint._id} 
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-md dark:hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                <div className="flex flex-col gap-3">
                  <h4 className="font-extrabold text-xl text-gray-900 dark:text-gray-100 leading-tight">{complaint.title}</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                      complaint.priority === "high" ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-400/20" :
                      complaint.priority === "medium" ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-400/20" :
                      "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500/20"
                    }`}>
                      {complaint.priority}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-400/20">
                      {complaint.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 self-end md:self-auto">
                  <SLATimer createdAt={complaint?.createdAt} status={complaint?.status} />
                  <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                    complaint.status === "completed" 
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-400/20" 
                    : "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-400/20"
                  }`}>
                    {complaint.status === "completed" ? "Resolved" : "In Progress"}
                  </span>
                  
                  {complaint.status === "completed" && !complaint.rating && reviewingId !== complaint._id && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setReviewingId(complaint._id)}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      Give Feedback
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Similar Complaints Clustering */}
              <div className="mt-4">
                <SimilarComplaints complaintId={complaint._id} />
              </div>

              {/* Timeline */}
              {(complaint.history || []).length > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700/60">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Timeline</p>
                  <div className="flex flex-col gap-3">
                    {(complaint.history || []).map((item, index) => (
                      <div key={item.timestamp || index} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600/50 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${index === complaint.history.length - 1 ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                          <p className="font-semibold text-gray-900 dark:text-gray-300 capitalize">{item.status}</p>
                        </div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Form */}
              {reviewingId === complaint._id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">How was your experience?</h4>
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</label>
                      <select 
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-sm font-medium transition-colors duration-300"
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
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl p-4 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm resize-none"
                    />
                    <div className="flex gap-3 mt-2">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubmitFeedback(complaint._id)}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setReviewingId(null)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submitted Feedback Display */}
              {complaint.rating !== undefined && complaint.feedback && (
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800/50 flex gap-3 items-start transition-colors duration-300">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="text-orange-900 dark:text-orange-400 font-bold text-sm">
                      Rated {complaint.rating}/5
                    </p>
                    <p className="text-orange-800 dark:text-orange-300/80 text-sm mt-1 font-medium">{complaint.feedback}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentComplaints;
