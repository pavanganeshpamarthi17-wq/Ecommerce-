import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash2, Search, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminDeleteProduct, adminUpdateProduct } from '../../store/slices/productSlice';
import { notify } from '../../store/slices/uiSlice';
import { notify as notifyAction } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const loadProducts = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/products/admin/all', { params: { page: p, limit: 15 } });
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch {
      dispatch(notify('Failed to load products', 'error'));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const result = await dispatch(adminDeleteProduct(id));
    if (adminDeleteProduct.fulfilled.match(result)) {
      dispatch(notify('Product deleted', 'success'));
      loadProducts(page);
    } else {
      dispatch(notify('Failed to delete', 'error'));
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isActive: !product.isActive });
      dispatch(notify(`Product ${product.isActive ? 'deactivated' : 'activated'}`, 'success'));
      loadProducts(page);
    } catch {
      dispatch(notify('Failed to update', 'error'));
    }
  };

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400">{total} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title or brand…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/40'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">{product.title}</p>
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      {product.category?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-gray-900">
                          ₹{(product.discountPrice || product.price)?.toLocaleString()}
                        </span>
                        {product.discountPrice > 0 && (
                          <p className="text-xs text-gray-400 line-through">₹{product.price?.toLocaleString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`flex items-center gap-1.5 text-xs font-medium ${product.isActive ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {product.isActive
                          ? <ToggleRight className="w-5 h-5 text-green-500" />
                          : <ToggleLeft className="w-5 h-5 text-gray-300" />
                        }
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.title)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No products found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
              <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => loadProducts(page - 1)}
                  disabled={page === 1}
                  className="btn btn-outline text-sm py-1.5 px-3 disabled:opacity-40"
                >Prev</button>
                <button
                  onClick={() => loadProducts(page + 1)}
                  disabled={page === totalPages}
                  className="btn btn-outline text-sm py-1.5 px-3 disabled:opacity-40"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
