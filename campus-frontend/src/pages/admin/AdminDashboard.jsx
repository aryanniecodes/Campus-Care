const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Welcome to the admin dashboard. UI pending API integration.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
