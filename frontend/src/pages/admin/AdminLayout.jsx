import React from 'react';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';

export default function AdminLayout() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // Helper to determine if a sidebar link is currently active
  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  // Get first letter of user's name for visual avatar placeholder
  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : 'A';

  // Get current section label for header breadcrumb
  const getCurrentSectionLabel = () => {
    if (location.pathname === '/admin/products') return 'Quản lý Sản phẩm';
    if (location.pathname === '/admin/orders') return 'Quản lý Đơn hàng';
    if (location.pathname === '/admin/blogs') return 'Quản lý Bài viết';
    if (location.pathname === '/admin/contacts') return 'Hộp thư Liên hệ';
    return 'Tổng quan Hệ thống';
  };

  return (
    <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fb' }}>
      
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar-modern text-white p-3" style={{ width: '250px', flexShrink: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#111115' }}>
        
        {/* Brand/Logo Area */}
        <div className="text-center py-4 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2, width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(224, 169, 109, 0.1)', border: '1px solid rgba(224, 169, 109, 0.3)', margin: '0 auto 10px auto' }}>
            <i className="fa fa-diamond" style={{ color: '#e0a96d', fontSize: '18px' }}></i>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#e0a96d', margin: 0, fontWeight: 'bold', letterSpacing: '0.5px' }}>
            Mojuri Admin
          </h2>
          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.65)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px', display: 'block' }}>
            Hệ thống quản trị
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <ul className="nav flex-column mb-auto w-100" style={{ listStyle: 'none', padding: 0 }}>
          <li className="nav-item mb-1">
            <Link 
              to="/admin" 
              className={`sidebar-link rounded ${isActive('/admin') ? 'active' : ''}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <i className="fa fa-dashboard" style={{ width: '20px' }}></i>
              <span>Tổng quan</span>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/admin/products" 
              className={`sidebar-link rounded ${isActive('/admin/products') ? 'active' : ''}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <i className="fa fa-diamond" style={{ width: '20px' }}></i>
              <span>Sản phẩm</span>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/admin/orders" 
              className={`sidebar-link rounded ${isActive('/admin/orders') ? 'active' : ''}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <i className="fa fa-shopping-cart" style={{ width: '20px' }}></i>
              <span>Đơn hàng</span>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/admin/blogs" 
              className={`sidebar-link rounded ${isActive('/admin/blogs') ? 'active' : ''}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <i className="fa fa-newspaper-o" style={{ width: '20px' }}></i>
              <span>Bài viết</span>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/admin/contacts" 
              className={`sidebar-link rounded ${isActive('/admin/contacts') ? 'active' : ''}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <i className="fa fa-envelope" style={{ width: '20px' }}></i>
              <span>Liên hệ</span>
            </Link>
          </li>
        </ul>

        {/* Sidebar Footer Link */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link 
            to="/" 
            className="btn btn-sm btn-outline-light w-100 py-2"
            style={{ borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <i className="fa fa-arrow-left"></i>
            <span>Về trang bán hàng</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Section Wrapper */}
      <div className="admin-content-wrapper" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Modern Header */}
        <header className="bg-white py-3 px-4 border-bottom shadow-sm" style={{ height: '70px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Breadcrumb section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-muted" style={{ fontSize: '13px' }}>Mojuri</span>
            <span className="text-muted" style={{ fontSize: '11px' }}>/</span>
            <span className="font-weight-bold" style={{ color: '#2d3748', fontSize: '13.5px' }}>
              {getCurrentSectionLabel()}
            </span>
          </div>

          {/* User profile dropdown/display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="d-none d-md-flex flex-column text-end" style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
              <span className="font-weight-bold text-dark" style={{ fontSize: '14px', lineHeight: '1.2' }}>{user.name}</span>
              <span className="text-muted text-uppercase" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>Quyền quản trị</span>
            </div>
            
            <div className="admin-avatar">
              {avatarLetter}
            </div>
          </div>
        </header>

        {/* Content outlet area */}
        <main className="p-4" style={{ flexGrow: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

    </div>
  );
}
