import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Catalog from './pages/Catalog';
import Contact from './pages/Contact';
import SignIn from './pages/Auth/SignIn';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/Admin/AdminPanel';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { AdminRoute } from './components/Auth/AdminRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/catalogo" element={<Catalog />} />
      <Route path="/contacto" element={<Contact />} />
      <Route path="/auth/signin" element={<SignIn />} />
      
      {/* Protected App Route */}
      <Route 
        path="/app" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Admin Panel Route */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
    </Routes>
  );
}
