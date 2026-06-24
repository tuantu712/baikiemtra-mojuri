import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../context/authStore';

const API_BASE = 'http://localhost:3000/api';

const STATUS_LABELS = {
  PENDING:    { label: 'Chờ xử lý',     color: '#f39c12' },
  PROCESSING: { label: 'Đang chuẩn bị', color: '#3498db' },
  SHIPPED:    { label: 'Đang giao',      color: '#9b59b6' },
  DELIVERED:  { label: 'Đã giao',        color: '#27ae60' },
  CANCELLED:  { label: 'Đã hủy',         color: '#e74c3c' },
};

export default function MyOrders() {
  const { user, token } = useAuthStore();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['myOrders', user?.id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!user && !!token,
  });

  if (!user) {
    return (
      <div id="site-main" className="site-main">
        <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }}>Vui lòng đăng nhập để xem đơn hàng</h3>
          <Link to="/login" className="button mt-3" style={{ padding: '10px 30px' }}>Đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div id="site-main" className="site-main">
      <div id="main-content" className="main-content">

        <div id="title" className="page-title" style={{ backgroundImage: "url('/media/site-header.jpg')" }}>
          <div className="section-container">
            <div className="content-title-heading">
              <h1 className="text-title-heading">Đơn hàng của tôi</h1>
            </div>
            <div className="breadcrumbs">
              <Link to="/">Home</Link>
              <span className="delimiter"></span>
              Đơn hàng của tôi
            </div>
          </div>
        </div>

        <div id="content" className="site-content" role="main">
          <div className="section-padding">
            <div className="section-container p-l-r">

              {isLoading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-dark" role="status"></div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger">Không thể tải đơn hàng. Vui lòng thử lại.</div>
              )}

              {orders && orders.length === 0 && (
                <div className="text-center py-5">
                  <p style={{ color: '#777', fontSize: '16px' }}>Bạn chưa có đơn hàng nào.</p>
                  <Link to="/shop" className="button mt-3" style={{ padding: '10px 30px' }}>Mua sắm ngay</Link>
                </div>
              )}

              {orders && orders.length > 0 && (
                <table className="shop_table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '12px 8px', fontSize: '13px', textTransform: 'uppercase' }}>Mã đơn</th>
                      <th style={{ padding: '12px 8px', fontSize: '13px', textTransform: 'uppercase' }}>Ngày đặt</th>
                      <th style={{ padding: '12px 8px', fontSize: '13px', textTransform: 'uppercase' }}>Trạng thái</th>
                      <th style={{ padding: '12px 8px', fontSize: '13px', textTransform: 'uppercase' }}>Sản phẩm</th>
                      <th style={{ padding: '12px 8px', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const status = STATUS_LABELS[order.status] || { label: order.status, color: '#888' };
                      const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
                      return (
                        <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '14px 8px', color: '#e0a96d', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' }}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td style={{ padding: '14px 8px', fontSize: '13px', color: '#555' }}>{date}</td>
                          <td style={{ padding: '14px 8px' }}>
                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: status.color + '20', color: status.color, border: `1px solid ${status.color}40` }}>
                              {status.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 8px', fontSize: '13px', color: '#555' }}>
                            {order.items.map(i => i.product?.name).join(', ')}
                          </td>
                          <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 'bold', color: '#111' }}>
                            ${order.totalPrice.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
