import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Upload, X, Star } from 'lucide-react';
import { adminCreateProduct, adminUpdateProduct, fetchCategories } from '../../store/slices/productSlice';
import { notify } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const INIT = {
  title: '', description: '', price: '', discountPrice: '', brand: '',
  category: '', stock: '', sku: '', isFeatured: false, isActive: true,
  tags: '', weight: '',
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories } = useSelector((s) => s.products);
  const isEdit = !!id;

  const [form, setForm] = useState(INIT);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const res = await api.get(`/products/${id}`);
          const p = res.data.product;
          setForm({
            title: p.title || '',
            description: p.description || '',
            price: p.price || '',
            discountPrice: p.discountPrice || '',
            brand: p.brand || '',
            category: p.category?._id || '',
            stock: p.stock || '',
            sku: p.sku || '',
            isFeatured: p.isFeatured || false,
            isActive: p.isActive !== false,
            tags: p.tags?.join(', ') || '',
            weight: p.weight || '',
          });
          setImages(p.images || []);
        } catch {
          dispatch(notify('Failed to load product', 'error'));
          navigate('/admin/products');
        } finally { setFetching(false); }
      })();
    }
  }, [id, isEdit, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const res = await api.post('/upload/product-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages((prev) => [...prev, ...res.data.images]);
      dispatch(notify('Images uploaded!', 'success'));
    } catch {
      dispatch(notify('Image upload failed', 'error'));
    } finally { setUploadingImages(false); }
  };

  const removeImage = (idx) => {
    setImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      stock: Number(form.stock),
      weight: Number(form.weight) || 0,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images,
    };

    const result = isEdit
      ? await dispatch(adminUpdateProduct({ id, data: payload }))
      : await dispatch(adminCreateProduct(payload));

    setLoading(false);

    if ((isEdit ? adminUpdateProduct : adminCreateProduct).fulfilled.match(result)) {
      dispatch(notify(isEdit ? 'Product updated!' : 'Product created!', 'success'));
      navigate('/admin/products');
    } else {
      dispatch(notify(result.payload || 'Failed', 'error'));
    }
  };

  if (fetching) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="input" placeholder="e.g. Premium Wireless Headphones" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="input resize-none" placeholder="Describe the product in detail…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand *</label>
              <input name="brand" value={form.brand} onChange={handleChange} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required className="input">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="wireless, headphones, audio" />
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Pricing & Inventory</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Price (₹)</label>
              <input name="discountPrice" type="number" min="0" step="0.01" value={form.discountPrice} onChange={handleChange} className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity *</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange} className="input" placeholder="Auto-generated if empty" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (grams)</label>
              <input name="weight" type="number" min="0" value={form.weight} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Product Images</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && (
                  <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">Main</div>
                )}
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              {uploadingImages ? (
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Upload</span>
                </>
              )}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
            </label>
          </div>
        </div>

        {/* Settings */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-gray-900">Settings</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 rounded text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Active</p>
              <p className="text-xs text-gray-400">Product visible to customers</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 rounded text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> Featured</p>
              <p className="text-xs text-gray-400">Show on homepage featured section</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-outline flex-1 sm:flex-none sm:px-8">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary flex-1 sm:flex-none sm:px-8">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? 'Updating…' : 'Creating…'}
              </span>
            ) : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
