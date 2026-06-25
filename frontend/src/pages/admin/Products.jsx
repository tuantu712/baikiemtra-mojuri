import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../context/authStore';

const API_BASE = 'https://baikiemtra-mojuri-lfov.vercel.app/api';

export default function Products() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    category: 'Rings',
    thumbnail: 'media/product/1.jpg',
    images: '["media/product/1.jpg"]'
  });

  const fetchAdminProducts = async () => {
    const { data } = await axios.get(`${API_BASE}/products?limit=100`);
    return data.products;
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['adminProductsList'],
    queryFn: fetchAdminProducts,
  });

  const createMutation = useMutation({
    mutationFn: async (newProduct) => {
      const { data } = await axios.post(`${API_BASE}/products`, newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProductsList']);
      closeForm();
      alert('Sản phẩm đã được tạo thành công!');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Đã có lỗi xảy ra.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updatedProduct }) => {
      const { data } = await axios.put(`${API_BASE}/products/${id}`, updatedProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProductsList']);
      closeForm();
      alert('Sản phẩm đã được cập nhật thành công!');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Đã có lỗi xảy ra.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.delete(`${API_BASE}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProductsList']);
      alert('Đã xóa sản phẩm thành công!');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Đã có lỗi xảy ra.');
    }
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : '',
      stock: product.stock.toString(),
      category: product.category,
      thumbnail: product.thumbnail,
      images: JSON.stringify(product.images || [])
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      stock: '',
      category: 'Rings',
      thumbnail: 'media/product/1.jpg',
      images: '["media/product/1.jpg"]'
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let galleryImages = [];
    try {
      galleryImages = JSON.parse(formData.images);
    } catch {
      galleryImages = [formData.thumbnail];
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      stock: parseInt(formData.stock),
      category: formData.category,
      thumbnail: formData.thumbnail,
      images: galleryImages
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, updatedProduct: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Calculate quick stats from products list
  const totalProducts = products ? products.length : 0;
  const outOfStock = products ? products.filter(p => p.stock === 0).length : 0;
  const lowStock = products ? products.filter(p => p.stock > 0 && p.stock < 10).length : 0;
  const avgPrice = products && products.length > 0
    ? (products.reduce((acc, p) => acc + p.price, 0) / products.length).toFixed(1)
    : '0.0';

  // Apply filters
  const filteredProducts = products ? products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || product.category.toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesStock = true;
    if (stockFilter === 'InStock') {
      matchesStock = product.stock > 0;
    } else if (stockFilter === 'LowStock') {
      matchesStock = product.stock > 0 && product.stock < 10;
    } else if (stockFilter === 'OutOfStock') {
      matchesStock = product.stock === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  }) : [];

  return (
    <div className="container-fluid px-0">
      
      {/* Upper header section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold', margin: 0, fontSize: '28px', color: '#111' }}>
            Quản lý sản phẩm
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Xem danh sách, thêm, sửa đổi hoặc xóa thông tin sản phẩm trang sức Mojuri.</p>
        </div>
        <button onClick={handleOpenCreateForm} className="btn btn-dark px-4 py-2" style={{ background: '#111', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
          <i className="fa fa-plus mr-2"></i> Thêm sản phẩm
        </button>
      </div>

      {/* Metrics Stats section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-primary-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-diamond"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Tổng sản phẩm</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: '#111', fontWeight: 800 }}>{totalProducts}</span>
          </div>
        </div>

        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-info-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-usd"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Giá trung bình</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: '#111', fontWeight: 800 }}>${avgPrice}</span>
          </div>
        </div>

        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-danger-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-exclamation-triangle"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Đã hết hàng</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: outOfStock > 0 ? '#dc3545' : '#111', fontWeight: 800 }}>{outOfStock}</span>
          </div>
        </div>

        <div className="card metric-card-custom p-3 border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
          <div className="metric-card-icon icon-warning-light" style={{ flexShrink: 0 }}>
            <i className="fa fa-bell-o"></i>
          </div>
          <div className="stat-item-info">
            <span className="text-muted text-uppercase" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Sắp hết hàng (&lt;10)</span>
            <span className="h3 mb-0 font-weight-bold" style={{ color: lowStock > 0 ? '#ffc107' : '#111', fontWeight: 800 }}>{lowStock}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* Search bar */}
          <div className="search-wrapper" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <i className="fa fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm tên hoặc mô tả sản phẩm..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="input-custom py-2" 
              style={{ paddingLeft: '38px', fontSize: '13px' }} 
            />
          </div>

          {/* Stock selector filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <span className="text-nowrap mb-0 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>Tồn kho:</span>
            <select 
              value={stockFilter} 
              onChange={(e) => setStockFilter(e.target.value)} 
              className="input-custom py-2" 
              style={{ fontSize: '13px', width: '150px' }}
            >
              <option value="All">Tất cả kho</option>
              <option value="InStock">Còn hàng</option>
              <option value="LowStock">Sắp hết hàng</option>
              <option value="OutOfStock">Hết hàng</option>
            </select>
          </div>

        </div>
      </div>

      {/* Category filter tabs */}
      <div className="filter-tabs">
        {['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`filter-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
          >
            {cat === 'All' ? 'Tất cả danh mục' : cat}
          </button>
        ))}
      </div>

      {/* Listing Products Modern Table */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
        </div>
      ) : (
        <div className="admin-card-table">
          <div className="table-responsive">
            <table className="table table-modern align-middle" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá gốc</th>
                  <th>Khuyến mãi</th>
                  <th>Trạng thái kho</th>
                  <th className="text-center" style={{ width: '150px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="fa fa-cubes d-block mb-2" style={{ fontSize: '24px' }}></i>
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const imageSrc = product.thumbnail.startsWith('http') ? product.thumbnail : `/${product.thumbnail}`;
                    const isOutOfStock = product.stock === 0;
                    const isLowStock = product.stock > 0 && product.stock < 10;

                    return (
                      <tr key={product.id}>
                        <td>
                          <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                            <img 
                              src={imageSrc} 
                              alt={product.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }} 
                              className="product-table-img"
                              onError={(e) => e.target.src = "https://html-demo-orcin.vercel.app/premium/mojuri/media/product/3.jpg"} 
                            />
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="font-weight-bold" style={{ color: '#1a202c', fontSize: '14px', display: 'block' }}>{product.name}</span>
                            <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '300px', fontSize: '11px' }}>
                              {product.description}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark px-2.5 py-1.5" style={{ border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                            {product.category}
                          </span>
                        </td>
                        <td>
                          <span style={{ textDecoration: product.salePrice ? 'line-through' : 'none', color: product.salePrice ? '#a0aec0' : '#1a202c' }}>
                            ${product.price}
                          </span>
                        </td>
                        <td>
                          {product.salePrice ? (
                            <span style={{ color: '#e0a96d', fontWeight: 'bold' }}>
                              ${product.salePrice}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {isOutOfStock ? (
                            <span className="badge-custom badge-cancelled">
                              <span className="badge-dot"></span>
                              Hết hàng
                            </span>
                          ) : isLowStock ? (
                            <span className="badge-custom badge-pending">
                              <span className="badge-dot"></span>
                              Chỉ còn {product.stock} cái
                            </span>
                          ) : (
                            <span className="badge-custom badge-delivered">
                              <span className="badge-dot"></span>
                              {product.stock} cái (Còn hàng)
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button 
                              onClick={() => handleEditClick(product)} 
                              className="btn btn-sm btn-outline-dark d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px', borderRadius: '6px', padding: 0 }}
                              title="Sửa thông tin sản phẩm"
                            >
                              <i className="fa fa-pencil"></i>
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(product.id)} 
                              className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px', borderRadius: '6px', padding: 0 }}
                              title="Xóa sản phẩm"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Drawer for Add/Edit Product */}
      <div className={`drawer-backdrop ${isFormOpen ? 'open' : ''}`} onClick={closeForm}>
        <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold', margin: 0, fontSize: '20px' }}>
              {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <button onClick={closeForm} className="border-0 bg-transparent text-muted" style={{ fontSize: '24px', cursor: 'pointer', outline: 'none' }}>
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit} className="h-100 d-flex flex-column" style={{ overflow: 'hidden' }}>
            <div className="drawer-body">
              
              {/* Image Preview Area */}
              <div className="mb-4 text-center">
                <span className="form-label-custom d-block mb-2">Ảnh xem trước (Thumbnail)</span>
                <div className="mx-auto d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px', borderRadius: '10px', border: '1.5px dashed #cbd5e0', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                  <img 
                    src={formData.thumbnail.startsWith('http') ? formData.thumbnail : `/${formData.thumbnail}`} 
                    alt="Product preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = "https://html-demo-orcin.vercel.app/premium/mojuri/media/product/3.jpg"; }} 
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Tên sản phẩm</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="input-custom" 
                  placeholder="Nhập tên sản phẩm trang sức..."
                  required 
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label-custom">Danh mục</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className="input-custom"
                  >
                    <option value="Rings">Rings (Nhẫn)</option>
                    <option value="Necklaces">Necklaces (Dây chuyền)</option>
                    <option value="Earrings">Earrings (Bông tai)</option>
                    <option value="Bracelets">Bracelets (Vòng tay)</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label-custom">Số lượng tồn kho</label>
                  <input 
                    type="number" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleInputChange} 
                    className="input-custom" 
                    placeholder="VD: 50"
                    required 
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label-custom">Giá gốc ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    className="input-custom" 
                    placeholder="VD: 150.00"
                    required 
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label-custom">Giá khuyến mãi ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    name="salePrice" 
                    value={formData.salePrice} 
                    onChange={handleInputChange} 
                    className="input-custom" 
                    placeholder="Không có giảm giá thì để trống"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Đường dẫn ảnh đại diện (Thumbnail path)</label>
                <input 
                  type="text" 
                  name="thumbnail" 
                  value={formData.thumbnail} 
                  onChange={handleInputChange} 
                  className="input-custom" 
                  placeholder="VD: media/product/1.jpg"
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Bộ sưu tập ảnh (JSON gallery paths)</label>
                <input 
                  type="text" 
                  name="images" 
                  value={formData.images} 
                  onChange={handleInputChange} 
                  className="input-custom" 
                  placeholder='VD: ["media/product/1.jpg"]'
                  required 
                />
                
                {/* Visual gallery image previews */}
                <div className="img-preview-container">
                  {(() => {
                    try {
                      const gallery = JSON.parse(formData.images);
                      if (Array.isArray(gallery)) {
                        return gallery.map((img, i) => (
                          <div key={i} className="img-preview-box">
                            <img 
                              src={img.startsWith('http') ? img : `/${img}`} 
                              alt="Gallery Preview" 
                              onError={(e) => { e.target.src = "https://html-demo-orcin.vercel.app/premium/mojuri/media/product/3.jpg"; }} 
                            />
                          </div>
                        ));
                      }
                    } catch (err) {}
                    return null;
                  })()}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Mô tả sản phẩm</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="input-custom" 
                  rows="4" 
                  placeholder="Mô tả sản phẩm, chất liệu, kích thước..."
                  required
                ></textarea>
              </div>

            </div>
            <div className="drawer-footer">
              <button type="submit" className="btn btn-dark px-4 py-2" style={{ background: '#111', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px' }}>
                <i className="fa fa-save mr-2"></i> Lưu sản phẩm
              </button>
              <button type="button" onClick={closeForm} className="btn btn-outline-secondary px-4 py-2" style={{ fontSize: '13px', borderRadius: '6px' }}>
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
