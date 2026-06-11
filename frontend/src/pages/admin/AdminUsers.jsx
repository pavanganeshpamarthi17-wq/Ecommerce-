import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Search, Users, UserCheck, UserX, Trash2 } from 'lucide-react';
import { notify } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { page: p, limit: 15, search, role: roleFilter } });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch {
      dispatch(notify('Failed to load users', 'error'));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [roleFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      dispatch(notify('User deleted', 'success'));
      load(page);
    } catch (err) {
      dispatch(notify(err.response?.data?.message || 'Failed', 'error'));
    }
  };

  const handleToggleRole = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { role: user.role === 'admin' ? 'customer' : 'admin' });
      dispatch(notify('User role updated', 'success'));
      load(page);
    } catch {
      dispatch(notify('Failed to update role', 'error'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400">{total} total users</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-primary px-4">Search</button>
        </form>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input w-auto min-w-[130px]">
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-700">{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${user.role === 'admin' ? 'badge-info' : 'badge-gray'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleRole(user)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                          title={user.role === 'admin' ? 'Make Customer' : 'Make Admin'}
                        >
                          {user.role === 'admin' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
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
            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No users found</p>
              </div>
            )}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => load(p)} />
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
