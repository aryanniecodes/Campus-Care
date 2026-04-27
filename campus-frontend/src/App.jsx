import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentComplaints from './pages/student/StudentComplaints';
import CreateComplaint from './pages/student/CreateComplaint';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminComplaints from './pages/admin/AdminComplaints';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Student Routes */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/complaints" 
          element={
            <ProtectedRoute>
              <StudentComplaints />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/create" 
          element={
            <ProtectedRoute>
              <CreateComplaint />
            </ProtectedRoute>
          } 
        />
        
        {/* Worker Routes */}
        <Route 
          path="/worker" 
          element={
            <ProtectedRoute>
              <WorkerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/feedback" 
          element={
            <ProtectedRoute>
              <AdminFeedback />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/complaints" 
          element={
            <ProtectedRoute>
              <AdminComplaints />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
