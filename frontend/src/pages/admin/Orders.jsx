import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../context/authStore';

const API_BASE = 'https://baikiemtra-mojuri-lfov.vercel.app/api';

export default function Orders() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  
  // Drawer visibility and detail state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search and status filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAdminOrders = async () => {
    const { data } = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrdersList'],
    queryFn: fetchAdminOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await axios.put(`${API_BASE}/orders/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['adminOrdersList']);
      if (selectedOrder && selectedOrder.id === data.id) {
        setSelectedOrder({ ...selectedOrder, status: data.status });
      }
      alert('Đã cập nhật trạng thái đơn hàng thành công!');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Không thể cập nhật trạng thái.');
    }
  });

  const handleStatusChange = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-pending';
      case 'PROCESSING': return 'badge-processing';
      case 'SHIPPED': return 'badge-shipped';
      case 'DELIVERED': return 'badge-delivered';
      case 'CANCELLED': return 'badge-cancelled';
      default: return '';
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

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
  };

  // Helper values for statistics
  const totalOrders = orders ? orders.length : 0;
  const pendingOrders = orders ? orders.filter(o => o.status === 'PENDING').length : 0;
  const inProgressOrders = orders ? orders.filter(o => o.status === 'PROCESSING' || o.status === 'SHIPPED').length : 0;
  const deliveredOrders = orders ? orders.filter(o => o.status === 'DELIVERED').length : 0;
  
  // Total Revenue (excluding cancelled orders)
  const totalRevenue = orders 
    ? orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.totalPrice, 0)
    : 0;

  // Filtering orders
  const filteredOrders = orders ? orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) : [];

  // Order Stepper Helper configuration
  const steps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const getProgressWidth = (status) => {
    switch (status) {
      case 'PENDING': return '0%';
      case 'PROCESSING': return '33%';
      case 'SHIPPED': return '66%';
      case 'DELIVERED': return '100%';
      default: return '0%';
    }
  };

  const getStepClass = (stepName, currentStatus) => {
    if (currentStatus === 'CANCELLED') return '';
    const orderIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(stepName);
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) {
      return currentStatus === 'DELIVERED' ? 'completed' : 'active';
    }
    return '';
  };

  return (
    <div className="container-fluid px-0">
      
      {/* Header title */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold', margin: 0, fontSize: '28px', color: '#111' }}>
            Quản lý đơn hàng
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Theo dõi đơn hàng mới, cập nhật tiến độ vận chuyển và quản lý trạng thái thanh toán.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-primary-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-shopping-cart"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Tổng đơn hàng</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: '#111', fontWeight: 800 }}>{totalOrders}</span>
          </div>
        </div>

        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-success-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-money"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Tổng doanh thu</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: '#28a745', fontWeight: 800 }}>${totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-warning-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-clock-o"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Chờ xử lý</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: pendingOrders > 0 ? '#ffc107' : '#111', fontWeight: 800 }}>{pendingOrders}</span>
          </div>
        </div>

        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-info-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-truck"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Đang vận chuyển</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: '#17a2b8', fontWeight: 800 }}>{inProgressOrders}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* Search */}
          <div className="search-wrapper" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <i className="fa fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm mã đơn, tên, điện thoại khách..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="input-custom py-2" 
              style={{ paddingLeft: '38px', fontSize: '13px' }} 
            />
          </div>

        </div>
      </div>

      {/* Status filter tabs */}
      <div className="filter-tabs">
        <button onClick={() => setStatusFilter('All')} className={`filter-tab-btn ${statusFilter === 'All' ? 'active' : ''}`}>Tất cả đơn</button>
        <button onClick={() => setStatusFilter('PENDING')} className={`filter-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}>Chờ xử lý</button>
        <button onClick={() => setStatusFilter('PROCESSING')} className={`filter-tab-btn ${statusFilter === 'PROCESSING' ? 'active' : ''}`}>Đang xử lý</button>
        <button onClick={() => setStatusFilter('SHIPPED')} className={`filter-tab-btn ${statusFilter === 'SHIPPED' ? 'active' : ''}`}>Đang giao</button>
        <button onClick={() => setStatusFilter('DELIVERED')} className={`filter-tab-btn ${statusFilter === 'DELIVERED' ? 'active' : ''}`}>Đã giao</button>
        <button onClick={() => setStatusFilter('CANCELLED')} className={`filter-tab-btn ${statusFilter === 'CANCELLED' ? 'active' : ''}`}>Đã hủy</button>
      </div>

      {/* Modern Table List */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
        </div>
      ) : (
        <div className="admin-card-table">
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Ngày đặt hàng</th>
                  <th>Tổng thanh toán</th>
                  <th>Trạng thái</th>
                  <th className="text-center" style={{ width: '220px' }}>Thay đổi trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="fa fa-shopping-basket d-block mb-2" style={{ fontSize: '24px' }}></i>
                      Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetails(order)}>
                      <td className="font-weight-bold" style={{ color: '#1a202c', fontSize: '13px' }}>
                        #{order.id.substring(0, 8)}...
                      </td>
                      <td>
                        <div>
                          <span className="font-weight-bold d-block" style={{ color: '#2d3748' }}>{order.name}</span>
                          <small className="text-muted" style={{ fontSize: '11px' }}>{order.email}</small>
                        </div>
                      </td>
                      <td>{order.phone}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="font-weight-bold" style={{ color: '#e0a96d' }}>${order.totalPrice}</td>
                      <td>
                        <span className={`badge-custom ${getStatusBadgeClass(order.status)}`}>
                          <span className="badge-dot"></span>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="input-custom py-1.5 px-2"
                            style={{ width: '130px', fontSize: '12px', borderRadius: '6px' }}
                          >
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="SHIPPED">Đang giao</option>
                            <option value="DELIVERED">Đã giao</option>
                            <option value="CANCELLED">Hủy đơn</option>
                          </select>
                          <button 
                            onClick={() => handleViewDetails(order)} 
                            className="btn btn-sm btn-outline-dark d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', borderRadius: '6px', padding: 0 }}
                            title="Chi tiết đơn hàng"
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Drawer for Order Details */}
      <div className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`} onClick={closeDrawer}>
        <div className="drawer-content" style={{ width: '600px' }} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold', margin: 0, fontSize: '22px' }}>
                Chi tiết đơn hàng
              </h3>
              {selectedOrder && (
                <span className="text-muted" style={{ fontSize: '11px' }}>Mã: #{selectedOrder.id}</span>
              )}
            </div>
            <button onClick={closeDrawer} className="border-0 bg-transparent text-muted" style={{ fontSize: '24px', cursor: 'pointer', outline: 'none' }}>
              &times;
            </button>
          </div>

          {selectedOrder && (
            <div className="drawer-body" style={{ background: '#f8fafc' }}>
              
              {/* Stepper Progress */}
              <div className="card p-3 border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '10px' }}>
                <span className="form-label-custom d-block mb-1 text-center">Tiến độ đơn hàng</span>
                
                {selectedOrder.status === 'CANCELLED' ? (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-0" style={{ borderRadius: '8px', fontSize: '13px' }}>
                    <i className="fa fa-times-circle" style={{ fontSize: '18px' }}></i>
                    <strong>Đơn hàng này đã bị hủy bỏ.</strong>
                  </div>
                ) : (
                  <div className="timeline-stepper">
                    <div className="timeline-progress-line" style={{ width: getProgressWidth(selectedOrder.status) }}></div>
                    
                    <div className={`timeline-step ${getStepClass('PENDING', selectedOrder.status)}`}>
                      <div className="timeline-step-circle">
                        {getStepClass('PENDING', selectedOrder.status) === 'completed' ? <i className="fa fa-check"></i> : '1'}
                      </div>
                      <div className="timeline-step-label">Chờ duyệt</div>
                    </div>

                    <div className={`timeline-step ${getStepClass('PROCESSING', selectedOrder.status)}`}>
                      <div className="timeline-step-circle">
                        {getStepClass('PROCESSING', selectedOrder.status) === 'completed' ? <i className="fa fa-check"></i> : '2'}
                      </div>
                      <div className="timeline-step-label">Chuẩn bị</div>
                    </div>

                    <div className={`timeline-step ${getStepClass('SHIPPED', selectedOrder.status)}`}>
                      <div className="timeline-step-circle">
                        {getStepClass('SHIPPED', selectedOrder.status) === 'completed' ? <i className="fa fa-check"></i> : '3'}
                      </div>
                      <div className="timeline-step-label">Đang giao</div>
                    </div>

                    <div className={`timeline-step ${getStepClass('DELIVERED', selectedOrder.status)}`}>
                      <div className="timeline-step-circle">
                        {getStepClass('DELIVERED', selectedOrder.status) === 'completed' ? <i className="fa fa-check"></i> : '4'}
                      </div>
                      <div className="timeline-step-label">Đã giao</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Fast Update Section */}
              <div className="card p-3 border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '10px' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-weight-bold" style={{ fontSize: '13px', color: '#4a5568' }}>Cập nhật trạng thái nhanh:</span>
                  <select 
                    value={selectedOrder.status} 
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="input-custom py-1.5 px-2 w-auto"
                    style={{ fontSize: '13px', borderRadius: '6px', minWidth: '150px' }}
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="SHIPPED">Đang giao hàng</option>
                    <option value="DELIVERED">Đã giao hàng</option>
                    <option value="CANCELLED">Hủy bỏ đơn hàng</option>
                  </select>
                </div>
              </div>

              {/* Customer details card */}
              <div className="card p-3 border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '10px' }}>
                <h5 className="form-label-custom border-bottom pb-2 mb-3" style={{ fontSize: '12px', color: '#1a202c' }}>Thông tin giao nhận</h5>
                
                <div className="d-flex flex-column gap-2" style={{ fontSize: '13px' }}>
                  <div className="d-flex align-items-start gap-2">
                    <i className="fa fa-user text-muted mt-1" style={{ width: '16px' }}></i>
                    <div>
                      <strong className="text-dark">Người nhận:</strong> {selectedOrder.name}
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start gap-2">
                    <i className="fa fa-envelope text-muted mt-1" style={{ width: '16px' }}></i>
                    <div>
                      <strong className="text-dark">Email:</strong> {selectedOrder.email || 'N/A'}
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-2">
                    <i className="fa fa-phone text-muted mt-1" style={{ width: '16px' }}></i>
                    <div>
                      <strong className="text-dark">Điện thoại:</strong> {selectedOrder.phone}
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-2">
                    <i className="fa fa-map-marker text-muted mt-1" style={{ width: '16px' }}></i>
                    <div>
                      <strong className="text-dark">Địa chỉ:</strong> {selectedOrder.address}
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-2">
                    <i className="fa fa-calendar text-muted mt-1" style={{ width: '16px' }}></i>
                    <div>
                      <strong className="text-dark">Ngày đặt hàng:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchased items card */}
              <div className="card p-3 border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '10px' }}>
                <h5 className="form-label-custom border-bottom pb-2 mb-3" style={{ fontSize: '12px', color: '#1a202c' }}>Danh sách sản phẩm mua</h5>
                
                <div className="table-responsive">
                  <table className="table table-sm align-middle" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-center" style={{ width: '80px' }}>Giá</th>
                        <th className="text-center" style={{ width: '60px' }}>SL</th>
                        <th className="text-end" style={{ width: '90px', textAlign: 'right' }}>Tổng cộng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => {
                        const imageSrc = item.product.thumbnail.startsWith('http') ? item.product.thumbnail : `/${item.product.thumbnail}`;
                        return (
                          <tr key={item.id}>
                            <td className="py-2">
                              <div className="d-flex align-items-center gap-2">
                                <div style={{ width: '36px', height: '36px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                  <img 
                                    src={imageSrc} 
                                    alt="" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    onError={(e) => e.target.src = "https://html-demo-orcin.vercel.app/premium/mojuri/media/product/3.jpg"} 
                                  />
                                </div>
                                <span className="font-weight-bold text-dark text-truncate" style={{ maxWidth: '180px' }} title={item.product.name}>
                                  {item.product.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-2">${item.price}</td>
                            <td className="text-center py-2">x{item.quantity}</td>
                            <td className="text-end font-weight-bold py-2" style={{ textAlign: 'right' }}>${item.price * item.quantity}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                  <span className="font-weight-bold" style={{ color: '#4a5568' }}>Tổng giá trị hóa đơn:</span>
                  <span className="h4 font-weight-bold mb-0" style={{ color: '#e0a96d', fontWeight: 800 }}>
                    ${selectedOrder.totalPrice}
                  </span>
                </div>
              </div>

            </div>
          )}

          <div className="drawer-footer">
            <button 
              onClick={() => {
                window.print();
              }} 
              className="btn btn-dark px-4 py-2" 
              style={{ background: '#111', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px' }}
            >
              <i className="fa fa-print mr-2"></i> In hóa đơn
            </button>
            <button onClick={closeDrawer} className="btn btn-outline-secondary px-4 py-2" style={{ fontSize: '13px', borderRadius: '6px' }}>
              Đóng
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
