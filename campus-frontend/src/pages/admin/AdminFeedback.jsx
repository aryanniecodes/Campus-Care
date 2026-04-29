import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

const AdminFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get("/complaints/feedback");
        setFeedbackList(res.data.data);
      } catch (error) {
        toast.error("Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-500">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 font-outfit">User Feedback ⭐</h2>
          <p className="text-gray-500 mt-1">Review student ratings and comments on resolved complaints.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 animate-pulse font-medium">Loading feedback...</p>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center animate-in zoom-in duration-300">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-orange-400">⭐</span>
            </div>
            <p className="text-gray-500 font-bold text-xl">No feedback yet</p>
            <p className="text-gray-400 mt-2">Student reviews will appear here once they rate resolved complaints.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbackList.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1 opacity-70">{item.category} • {item.status}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100 shadow-sm shadow-orange-900/5">
                    <span className="text-orange-600 font-black text-lg">{item.rating}</span>
                    <span className="text-orange-400 text-sm">★</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-200"></div>
                  <p className="text-gray-700 text-sm italic leading-relaxed relative z-10">
                    "{item.feedback || "The student provided a rating without a comment."}"
                  </p>
                </div>
                <div className="mt-5 flex justify-between items-center pt-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Verification ID: {item._id.slice(-6)}</span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    {new Date(item.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminFeedback;
