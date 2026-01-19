import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import LibraryPage from './pages/LibraryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AudiobookDetailPage from './pages/AudiobookDetailPage';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, validateToken } = useAuthStore();
  
  // Validate token when accessing private routes
  useEffect(() => {
    validateToken();
  }, [validateToken]);
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { validateToken } = useAuthStore();
  
  // Validate token on app initialization
  useEffect(() => {
    validateToken();
  }, [validateToken]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/library"
              element={
                <PrivateRoute>
                  <LibraryPage />
                </PrivateRoute>
              }
            />
            <Route path="/audiobook/:id" element={<AudiobookDetailPage />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
