import React from 'react';
import { useSelector } from 'react-redux';
import AdolescentDashboard from './AdolescentDashboard';
import AdultDashboard from './AdultDashboard';
import HealthcareDashboard from './HealthcareDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  switch (user.role) {
    case 'adolescent':
      return <AdolescentDashboard />;
    case 'adult':
      return <AdultDashboard />;
    case 'healthcare_professional':
      return <HealthcareDashboard />;
    default:
      return <AdultDashboard />;
  }
};

export default Dashboard;