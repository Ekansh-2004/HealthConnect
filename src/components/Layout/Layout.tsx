import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ChatWidget from '../Chat/ChatWidget';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ChatWidget />
    </div>
  );
};

export default Layout;