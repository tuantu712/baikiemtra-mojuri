import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';

const API_BASE = 'https://baikiemtra-mojuri-lfov.vercel.app/api';

export default function Dashboard() {
  const { token, user } = useAuthStore();

  // Fetch administrative statistics
  const fetchStats = async () => {
    const { data } = await axios.get(`${API_BASE}/orders/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  };

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchStats,
  });

  // Fetch recent orders for summary list
  const fetchRecentOrders = async () => {
    const { data } = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.slice(0, 5); // Get top 5 latest orders
  };

  const { data: recentOrders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['adminDashboardRecentOrders'],
    queryFn: fetchRecentOrders,
    enabled: !!token,
  });

  // Fetch recent products for summary list
  const fetchRecentProducts = async () => {
    const { data } = await axios.get(`${API_BASE}/products?limit=5`);
    return data.products;
  };

  const { data: recentProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ['adminDashboardRecentProducts'],
    queryFn: fetchRecentProducts,
  });

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Đã xảy ra lỗi khi tải số liệu thống kê. Vui lòng kiểm tra quyền đăng nhập của bạn.
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-pending';
      case 'PROCESSING': return 'badge-processing';
      case 'SHIPPED': return 'badge-shipped';
      case 'DELIVERED': return 'badge-delivered';
      case 'CANCELLED': return 'badge-cancelled';
      default: return 'bg-secondary text-white';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'PROCESSING': return 'Đang xử lý';
      case 'SHIPPED': return 'Đang giao';
      case 'DELIVERED': return 'Đã giao';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="container-fluid px-0" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome Banner */}
      <div 
        className="card p-4 border-0 text-white position-relative shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #111111 0%, #2c251e 100%)',
          borderRadius: '16px',
          overflow: 'hidden',
          margin: 0
        }}
      >
        <div 
          style={{
            position: 'absolute',
            right: '-10%',
            top: '-20%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(224, 169, 109, 0.05)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        ></div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: '1 1 400px' }}>
            <span className="badge mb-2 px-3 py-1.5" style={{ background: 'rgba(224, 169, 109, 0.2)', color: '#e0a96d', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Bảng điều khiển Mojuri
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold', fontSize: '32px', margin: '0 0 10px 0', color: '#e0a96d' }}>
              Chào mừng trở lại, {user?.name || 'Quản trị viên'}!
            </h2>
            <p className="mb-0 text-white-50" style={{ fontSize: '13px' }}>
              Hệ thống hoạt động bình thường. Dưới đây là phân tích kết quả kinh doanh và trạng thái hoạt động của cửa hàng trang sức hôm nay.
            </p>
          </div>
          <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
            <span className="text-white-50 d-block" style={{ fontSize: '12px' }}>Thời gian hệ thống</span>
            <span className="font-weight-bold" style={{ fontSize: '16px', color: '#e0a96d' }}>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-success-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-money"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Doanh thu</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: '#28a745', fontWeight: 800 }}>${stats.totalRevenue.toLocaleString()}</span>
            <small className="text-success" style={{ fontSize: '10px', marginTop: '2px' }}><i className="fa fa-info-circle mr-1"></i> Không tính đơn hủy</small>
          </div>
        </div>

        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-primary-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-shopping-bag"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Tổng đơn hàng</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: '#111', fontWeight: 800 }}>{stats.totalOrders}</span>
            <small className="text-muted" style={{ fontSize: '10px', marginTop: '2px' }}>Tất cả trạng thái đơn</small>
          </div>
        </div>

        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-info-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-diamond"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Tổng sản phẩm</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: '#111', fontWeight: 800 }}>{stats.totalProducts}</span>
            <small className="text-muted" style={{ fontSize: '10px', marginTop: '2px' }}>Đang đăng bán</small>
          </div>
        </div>

        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-warning-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-check-circle-o"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Đã bán ra</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: '#111', fontWeight: 800 }}>{stats.totalItemsSold}</span>
            <small className="text-muted" style={{ fontSize: '10px', marginTop: '2px' }}>Sản phẩm trong đơn hàng</small>
          </div>
        </div>

      </div>

      {/* Chart and Guide section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Left: SVG Revenue Chart */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column' }}>
          <div className="card p-4 border-0 shadow-sm bg-white" style={{ borderRadius: '12px', minHeight: '340px', display: 'flex', flexDirection: 'column', height: '100%', margin: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', color: '#1a202c' }}>
                Biểu đồ doanh thu hàng ngày
              </h4>
              <span className="text-muted" style={{ fontSize: '11px' }}><i className="fa fa-bar-chart mr-1"></i> Trực quan hoá doanh thu gần đây</span>
            </div>
            
            {stats.revenueChart.length === 0 ? (
              <div className="text-center py-5 text-muted d-flex flex-column align-items-center justify-content-center" style={{ flexGrow: 1 }}>
                <i className="fa fa-line-chart mb-2" style={{ fontSize: '28px', color: '#cbd5e0' }}></i>
                Chưa có dữ liệu doanh thu phát sinh.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
                {/* SVG Visual Chart */}
                <div className="py-2 text-center">
                  <svg viewBox="0 0 500 200" className="w-100" style={{ maxHeight: '220px' }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e0a96d" />
                        <stop offset="100%" stopColor="#e0a96d" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#f8fafc" strokeWidth="1" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#f8fafc" strokeWidth="1" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#f8fafc" strokeWidth="1" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Draw Bars */}
                    {stats.revenueChart.map((item, idx) => {
                      const barWidth = 22;
                      const gap = (440 / stats.revenueChart.length);
                      const x = 50 + idx * gap;
                      const maxVal = Math.max(...stats.revenueChart.map(i => i.revenue), 100);
                      const height = (item.revenue / maxVal) * 130; // Max height 130px
                      const y = 170 - height;
                      
                      return (
                        <g key={idx}>
                          {/* Hover effect bar */}
                          <rect
                            x={x - barWidth / 2}
                            y={y}
                            width={barWidth}
                            height={height}
                            fill="url(#barGradient)"
                            rx="4"
                            style={{ cursor: 'pointer' }}
                          />
                          {/* Value display */}
                          <text
                            x={x}
                            y={y - 6}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="700"
                            fill="#e0a96d"
                          >
                            ${item.revenue}
                          </text>
                          {/* X-axis labels (Date formatted to DD/MM) */}
                          <text
                            x={x}
                            y="185"
                            textAnchor="middle"
                            fontSize="8"
                            fill="#94a3b8"
                            fontWeight="600"
                          >
                            {item.date.split('-').slice(1).reverse().join('/')}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Administrative guide */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
          <div className="card p-4 border-0 shadow-sm bg-white" style={{ borderRadius: '12px', minHeight: '340px', display: 'flex', flexDirection: 'column', height: '100%', margin: 0 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', color: '#1a202c' }}>
              Hướng dẫn quản trị
            </h4>
            <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.6' }}>
              Chào mừng bạn đến với trang quản trị Mojuri Jewelry Store. Sử dụng thanh điều hướng bên trái để quản lý các tính năng:
            </p>
            <ul className="list-unstyled p-0" style={{ fontSize: '12.5px', color: '#4a5568', margin: 0 }}>
              <li className="mb-2 d-flex align-items-start gap-2">
                <i className="fa fa-circle mt-1.5" style={{ fontSize: '6px', color: '#e0a96d', flexShrink: 0 }}></i>
                <div><strong>Sản phẩm:</strong> Quản lý danh mục, thêm mới, cập nhật giá bán, tồn kho hoặc mô tả các loại trang sức.</div>
              </li>
              <li className="mb-2 d-flex align-items-start gap-2">
                <i className="fa fa-circle mt-1.5" style={{ fontSize: '6px', color: '#e0a96d', flexShrink: 0 }}></i>
                <div><strong>Đơn hàng:</strong> Theo dõi thông tin khách mua, đổi trạng thái giao nhận và quản lý hóa đơn.</div>
              </li>
              <li className="mb-2 d-flex align-items-start gap-2">
                <i className="fa fa-circle mt-1.5" style={{ fontSize: '6px', color: '#e0a96d', flexShrink: 0 }}></i>
                <div><strong>Bài viết &amp; Liên hệ:</strong> Tạo bài viết chia sẻ xu hướng trang sức và xem các phản hồi liên hệ của khách hàng.</div>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Recent Activity: Orders and Products side-by-side */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Left: Recent Orders */}
        <div style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column' }}>
          <div className="card p-4 border-0 shadow-sm bg-white" style={{ borderRadius: '12px', height: '100%', margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', color: '#1a202c' }}>
                Đơn hàng mới nhận
              </h4>
              <Link to="/admin/orders" className="text-decoration-none" style={{ color: '#e0a96d', fontSize: '12px', fontWeight: 600 }}>
                Xem tất cả <i className="fa fa-arrow-right ml-1"></i>
              </Link>
            </div>

            {isOrdersLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
              </div>
            ) : !recentOrders || recentOrders.length === 0 ? (
              <p className="text-muted text-center py-4" style={{ fontSize: '13px' }}>Chưa có đơn đặt hàng nào.</p>
            ) : (
              <div className="table-responsive" style={{ flexGrow: 1 }}>
                <table className="table table-sm align-middle" style={{ fontSize: '13px', margin: 0 }}>
                  <thead>
                    <tr className="text-muted">
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-weight-bold" style={{ py: '10px' }}>
                          <Link to="/admin/orders" style={{ textDecoration: 'none', color: '#2b6cb0' }}>
                            #{order.id.substring(0, 8)}
                          </Link>
                        </td>
                        <td>{order.name}</td>
                        <td className="font-weight-bold" style={{ color: '#e0a96d' }}>${order.totalPrice}</td>
                        <td>
                          <span className={`badge-custom ${getStatusBadgeClass(order.status)}`} style={{ padding: '4px 8px', fontSize: '10px' }}>
                            <span className="badge-dot" style={{ width: '4px', height: '4px' }}></span>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Products */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
          <div className="card p-4 border-0 shadow-sm bg-white" style={{ borderRadius: '12px', height: '100%', margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', color: '#1a202c' }}>
                Sản phẩm mới thêm
              </h4>
              <Link to="/admin/products" className="text-decoration-none" style={{ color: '#e0a96d', fontSize: '12px', fontWeight: 600 }}>
                Xem tất cả <i className="fa fa-arrow-right ml-1"></i>
              </Link>
            </div>

            {isProductsLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
              </div>
            ) : !recentProducts || recentProducts.length === 0 ? (
              <p className="text-muted text-center py-4" style={{ fontSize: '13px' }}>Chưa có sản phẩm nào.</p>
            ) : (
              <div className="d-flex flex-column gap-3" style={{ flexGrow: 1, justifyContent: 'center' }}>
                {recentProducts.map((product) => {
                  const imageSrc = product.thumbnail.startsWith('http') ? product.thumbnail : `/${product.thumbnail}`;
                  return (
                    <div key={product.id} className="d-flex align-items-center justify-content-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="d-flex align-items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                          <img 
                            src={imageSrc} 
                            alt="" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => e.target.src = "https://html-demo-orcin.vercel.app/premium/mojuri/media/product/3.jpg"} 
                          />
                        </div>
                        <div>
                          <span className="font-weight-bold text-dark d-block" style={{ fontSize: '13px', lineHeight: '1.2' }}>{product.name}</span>
                          <span className="badge bg-light text-muted px-2 py-0.5 mt-1" style={{ border: '1px solid #e2e8f0', fontSize: '9px', borderRadius: '4px' }}>
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-end" style={{ textAlign: 'right' }}>
                        <span className="font-weight-bold d-block" style={{ color: '#e0a96d', fontSize: '13px' }}>
                          ${product.salePrice || product.price}
                        </span>
                        <small className="text-muted" style={{ fontSize: '10px' }}>
                          Kho: {product.stock > 0 ? `${product.stock} cái` : 'Hết hàng'}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
