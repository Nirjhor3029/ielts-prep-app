import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { analyticsAPI } from './lib/api';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ChapterList from './pages/ChapterList';
import ChapterDetail from './pages/ChapterDetail';
import PracticeMode from './pages/PracticeMode';
import TestMode from './pages/TestMode';
import TestResult from './pages/TestResult';
import ModuleComplete from './pages/ModuleComplete';
import Progress from './pages/Progress';
import Mistakes from './pages/Mistakes';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChapterEditor from './pages/admin/ChapterEditor';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="font-label-md text-on-surface-variant">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
    useThemeStore.getState().init();
    analyticsAPI.trackVisit(false).catch(() => {});
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="font-label-md text-on-surface-variant">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/modules" element={<ProtectedRoute><ChapterList /></ProtectedRoute>} />
        <Route path="/modules/:slug" element={<ProtectedRoute><ChapterDetail /></ProtectedRoute>} />
        <Route path="/modules/:slug/practice/:setId" element={<ProtectedRoute><PracticeMode /></ProtectedRoute>} />
        <Route path="/modules/:slug/test/:setId" element={<ProtectedRoute><TestMode /></ProtectedRoute>} />
        <Route path="/result/:attemptId" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
        <Route path="/module-complete" element={<ProtectedRoute><ModuleComplete /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/mistakes" element={<ProtectedRoute><Mistakes /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/chapters/new" element={<ProtectedRoute><AdminRoute><ChapterEditor /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/chapters/:id" element={<ProtectedRoute><AdminRoute><ChapterEditor /></AdminRoute></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
