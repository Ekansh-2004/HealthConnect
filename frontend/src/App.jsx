import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './pages/LoginForm';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App
