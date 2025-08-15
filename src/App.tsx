import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import { store, RootState } from './store';
import './i18n';

import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './components/Dashboard/Dashboard';
import LearnPage from './components/Learn/LearnPage';
import StoriesPage from './components/Stories/StoriesPage';
import ConsultationsPage from './components/Consultations/ConsultationsPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginForm /> : <Navigate to="/dashboard" replace />} 
        />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="learn" element={<LearnPage />} />
          <Route 
            path="stories" 
            element={
              <ProtectedRoute allowedRoles={['adult', 'healthcare_professional']}>
                <StoriesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="consultations" 
            element={
              <ProtectedRoute allowedRoles={['adult', 'healthcare_professional']}>
                <ConsultationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin" 
            element={
              <ProtectedRoute allowedRoles={['healthcare_professional']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;