import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Plus, Edit2, Trash2, Tag, Check, X } from 'lucide-react';
import { notify } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const INIT_FORM = { name: '', description: '', sortOrder: 0, isActive: true };

const AdminCategories = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch {
      dispatch(notify('Failed to load categories', 'error'));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        dispatch(notify('Category updated!', 'success'));
      } else {
        await api.post('/categories', form);
        dispatch(notify('Category created!', 'success'));
      }
      setShowForm(false);
      setEditingId(null);
      setForm(INIT_FORM);
      load();
    } catch (err) {
      dispatch(notify(err.response?.data?.message || 'Failed', 'error'));
    } finally { setSaving(false); }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0, isActive: cat.isActive });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      dispatch(notify('Category deleted', 'success'));
      load();
    } catch (err) {
      dispatch(notify(err.response?.data?.message || 'Failed', 'error'));
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-400">{categories.length} categories</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(INIT_FORM); }}
          className="btn btn-primary gap-2"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 border-2 border-blue-200 space-y-4">
          <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Category' : 'New Category'}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="input"
              placeholder="e.g. Electronics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="input resize-none"
              placeholder="Short description…"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="input"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="btn btn-outline flex-1"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              <Check className="w-4 h-4" /> {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No categories yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-xs ${cat.isActive ? 'badge-success' : 'badge-gray'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(cat._id, cat.name)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
