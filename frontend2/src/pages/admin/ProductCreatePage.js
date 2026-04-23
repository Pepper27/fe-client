import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const ProductCreatePage = () => {
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    materials: [],
    colors: [],
    sizes: [],
    variants: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load dropdown data
    const loadData = async () => {
      try {
        const [categoriesRes, materialsRes, colorsRes, sizesRes] = await Promise.all([
          api.getCategories(),
          api.getMaterials(),
          api.getColors(),
          api.getSizes()
        ]);
        
        setCategories(categoriesRes.data || []);
        setMaterials(materialsRes || []);
        setColors(colorsRes || []);
        setSizes(sizesRes || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3866/api/v1/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Sản phẩm đã được tạo thành công!');
        // Reset form
        setFormData({
          name: '',
          slug: '',
          description: '',
          category: '',
          materials: [],
          colors: [],
          sizes: [],
          variants: []
        });
      } else {
        const error = await response.json();
        setMessage(error.message || 'Không thể tạo sản phẩm');
      }
    } catch (error) {
      setMessage('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="admin-page">
      <div className="container">
        <h1>Tạo Sản Phẩm Mới</h1>
        <div className="admin-info">
          <p>Đây là trang admin để tạo sản phẩm mới.</p>
          <p>Sử dụng thông tin từ aggregation filters để điền thông tin sản phẩm.</p>
        </div>
        
        {message && <div className="message">{message}</div>}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Tên sản phẩm:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Slug:</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="ten-san-pham"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mô tả:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Danh mục:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreatePage;