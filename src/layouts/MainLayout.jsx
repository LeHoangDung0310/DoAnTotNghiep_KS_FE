import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import '../styles/layout.css';

export default function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <Header />

      <main className="main-content">
        {children || <Outlet />}
      </main>

      <Footer />
    </div>
  );
}
