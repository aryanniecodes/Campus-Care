import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

const CreateComplaint = () => {
  useEffect(() => {
    console.log("🚀 CreateComplaint Component Mounted");
  }, []);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const showFeedback = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });

    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({ detected: false, prompts: [], category: null, improvedDescription: null });
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.title.trim().length >= 5) {
        setAiLoading(true);
        console.log("🔍 Triggering AI Suggestion for:", formData.title);
        try {
          const res = await api.post("/ai/suggest", { text: formData.title });
          console.log("✨ AI Response Received:", res.data);
          if (res.data.success) {
            setSuggestions(res.data.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("❌ AI Suggestion Error:", error);
          // Silent fail for UX
        } finally {
          setAiLoading(false);
        }
      } else {
        setShowSuggestions(false);
        setSuggestions({ detected: false, prompts: [], category: null, improvedDescription: null });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.title]);

  const applySuggestion = (type, value = null) => {
    if (type === 'category' && (value || suggestions.category)) {
      setFormData(prev => ({ ...prev, category: value || suggestions.category }));
    } else if (type === 'description' && suggestions.improvedDescription) {
      setFormData(prev => ({ ...prev, description: suggestions.improvedDescription }));
    } else if (type === 'prompt' && value) {
       setFormData(prev => ({ ...prev, description: (prev.description ? prev.description + "\n" : "") + value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("priority", formData.priority);

      if (formData.image) {
        data.append("image", formData.image);
      }

      await api.post("/complaints", data);

      showFeedback("Complaint submitted successfully");
      toast.success("Complaint submitted successfully");
      setTimeout(() => navigate("/student/complaints"), 1500);
    } catch (error) {
      showFeedback("Failed to submit complaint", true);
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {message && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300 font-bold text-sm text-white ${isError ? 'bg-red-600' : 'bg-green-600'}`}>
          {message}
        </div>
      )}
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Submit New Complaint</h2>
          <p className="text-sm text-gray-500 mt-0.5">Please provide details about the maintenance issue.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              disabled={loading}
              placeholder="e.g. Broken Light in Room 101"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            
            {aiLoading && (
              <div className="absolute right-3 top-[42px] flex items-center gap-2 text-blue-500">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-medium">AI Thinking...</span>
              </div>
            )}

            {showSuggestions && (suggestions.detected || suggestions.prompts.length > 0) && !aiLoading && (
              <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-blue-600 rounded-md">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">AI Assistant</p>
                  </div>
                  {suggestions.category && (
                    <button 
                      type="button"
                      onClick={() => applySuggestion('category')}
                      className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-bold hover:bg-blue-700 transition-all hover:shadow-md"
                    >
                      Set Category to {suggestions.category}
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-blue-600/70 mb-1">Suggestions to include in description:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.prompts.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applySuggestion('prompt', p)}
                        className="text-[10px] bg-white border border-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left shadow-sm"
                      >
                        + {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="electric">Electric</option>
                <option value="plumbing">Plumbing</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              required
              disabled={loading}
              rows="4"
              placeholder="Describe the problem in detail..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {showSuggestions && suggestions.improvedDescription && (
              <div className="mt-2 flex justify-end">
                <button 
                  type="button"
                  onClick={() => applySuggestion('description')}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  ✨ Improve description with AI
                </button>
              </div>
            )}
          </div>


          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image Upload (Optional)</label>
            <div className="flex flex-col items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                  <p className="text-sm mb-1 font-semibold">Click to upload photo</p>
                  <p className="text-xs">PNG, JPG or JPEG</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  disabled={loading}
                  onChange={handleImageChange}
                />
              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="mt-3 w-40 h-40 object-cover rounded-xl shadow-md border border-gray-100"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateComplaint;
