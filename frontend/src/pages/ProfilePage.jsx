import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Lock, MapPin, Camera, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { setUser } from '../store/slices/authSlice';
import { notify } from '../store/slices/uiSlice';
import api from '../services/api';

const TABS = ['Profile', 'Password', 'Addresses'];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', address: '', city: '', state: '', country: 'India', postalCode: '', isDefault: false,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/profile', profileForm);
      dispatch(setUser(res.data.user));
      dispatch(notify('Profile updated!', 'success'));
    } catch (err) {
      dispatch(notify(err.response?.data?.message || 'Failed', 'error'));
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      dispatch(notify('Passwords do not match', 'error')); return;
    }
    setSaving(true);
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      dispatch(notify('Password changed!', 'success'));
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      dispatch(notify(err.response?.data?.message || 'Failed', 'error'));
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(setUser({ ...user, avatar: res.data.avatar }));
      dispatch(notify('Avatar updated!', 'success'));
    } catch {
      dispatch(notify('Failed to upload avatar', 'error'));
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = editingAddress
        ? await api.put(`/users/addresses/${editingAddress}`, addressForm)
        : await api.post('/users/addresses', addressForm);
      dispatch(setUser({ ...user, addresses: res.data.addresses }));
      dispatch(notify(editingAddress ? 'Address updated!' : 'Address added!', 'success'));
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({ fullName: '', phone: '', address: '', city: '', state: '', country: 'India', postalCode: '', isDefault: false });
    } catch (err) {
      dispatch(notify(err.response?.data?.message || 'Failed', 'error'));
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      dispatch(setUser({ ...user, addresses: res.data.addresses }));
      dispatch(notify('Address deleted', 'info'));
    } catch {
      dispatch(notify('Failed to delete', 'error'));
    }
  };

  const startEditAddress = (addr) => {
    setEditingAddress(addr._id);
    setAddressForm({ ...addr });
    setShowAddressForm(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Avatar */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-700">{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
            <Camera className="w-3 h-3 text-white" />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="badge badge-info text-xs capitalize mt-1">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === 0 && (
        <form onSubmit={handleProfileSave} className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={user?.email} disabled className="input bg-gray-50 text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
              className="input"
              placeholder="+91 98765 43210"
            />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Tab: Password */}
      {activeTab === 1 && (
        <form onSubmit={handlePasswordChange} className="card p-5 space-y-4">
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                value={pwForm[field]}
                onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                className="input"
                required
                minLength={field !== 'currentPassword' ? 8 : 1}
              />
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      )}

      {/* Tab: Addresses */}
      {activeTab === 2 && (
        <div className="space-y-3">
          {user?.addresses?.map((addr) => (
            <div key={addr._id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{addr.fullName}</p>
                    {addr.isDefault && <span className="badge badge-success text-xs">Default</span>}
                  </div>
                  <p className="text-gray-500">{addr.phone}</p>
                  <p className="text-gray-600">{addr.address}, {addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-gray-500">{addr.country}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => startEditAddress(addr)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteAddress(addr._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!showAddressForm && (
            <button
              onClick={() => { setShowAddressForm(true); setEditingAddress(null); }}
              className="btn btn-outline w-full gap-2"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          )}

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="card p-5 space-y-3 border-2 border-blue-200">
              <h3 className="font-semibold text-gray-900">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'fullName', label: 'Full Name', full: true },
                  { key: 'phone', label: 'Phone', full: true },
                  { key: 'address', label: 'Street Address', full: true },
                  { key: 'city', label: 'City' },
                  { key: 'state', label: 'State' },
                  { key: 'country', label: 'Country' },
                  { key: 'postalCode', label: 'Postal Code' },
                ].map(({ key, label, full }) => (
                  <div key={key} className={full ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={addressForm[key]}
                      onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                      required
                      className="input text-sm"
                    />
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Set as default address</span>
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">
                  <Check className="w-4 h-4" /> {editingAddress ? 'Update' : 'Save'} Address
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
