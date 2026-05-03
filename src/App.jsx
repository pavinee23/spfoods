import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Products from './components/Products';
import About from './components/About';
import PromoSection from './components/PromoSection';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLoginPage from './components/AdminLoginModal';
import AdminDashboard from './components/AdminDashboard';
import DeptDashboard from './components/DeptDashboard';
import RegisterPage from './components/RegisterPage';
import './index.css';

function PublicSite() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <PromoSection />
        <Services />
        <Products />
        <Testimonials />
        <Blog />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function RequireAdminAuth({ children }) {
  const token = sessionStorage.getItem('adminToken');
  if (!token) return <Navigate to="/sp/admin-sp" replace />;
  return children;
}

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/sp/register-sp" element={<RegisterPage />} />
        <Route path="/sp/admin-sp" element={<AdminLoginPage />} />
        <Route path="/sp/admin-sp/dashboard" element={
          <RequireAdminAuth><AdminDashboard /></RequireAdminAuth>
        } />
        <Route path="/sp/admin-sp/dept/:deptId" element={
          <RequireAdminAuth><DeptDashboard /></RequireAdminAuth>
        } />
        <Route path="/sp/admin-sp/dept/:deptId/:pageId" element={
          <RequireAdminAuth><DeptDashboard /></RequireAdminAuth>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}
