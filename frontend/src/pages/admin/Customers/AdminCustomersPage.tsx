import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { 
  Users, 
  Search, 
  ShoppingBag, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Eye,
  X,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  UserCheck,
  Lock,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Key
} from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const { formatPrice, showToast, user: currentUser } = useApp();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'ADMIN'>('ALL');

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getCustomers({ 
        search: searchQuery.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined
      });
      if (res.success && res.data.customers) {
        setCustomers(res.data.customers);
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching customers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const openAddModal = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('CUSTOMER');
    setIsAddModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingCustomer(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone || '');
    setPassword('');
    setRole(c.role || 'CUSTOMER');
    setIsEditModalOpen(true);
  };

  // Create Customer / Admin
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Name, Email, and Password are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.admin.createCustomer({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
        role,
      });

      showToast(res.message || `Account "${name}" created successfully!`, 'success');
      setIsAddModalOpen(false);
      await fetchCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to create customer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Customer & Permissions
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!name.trim() || !email.trim()) {
      showToast('Name and Email are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        role,
      };
      if (password && password.trim() !== '') {
        payload.password = password.trim();
      }

      const res = await api.admin.updateCustomer(editingCustomer.id, payload);
      showToast(res.message || `Account "${name}" updated successfully!`, 'success');
      setIsEditModalOpen(false);
      await fetchCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update customer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Role Toggle (Customer <-> Admin)
  const handleQuickRoleToggle = async (c: any) => {
    const newRole = c.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    const roleLabel = newRole === 'ADMIN' ? 'Administrator (Full Store Access)' : 'Customer (Standard Shopper)';

    if (!window.confirm(`Change permissions for "${c.name}" to ${roleLabel}?`)) return;

    try {
      await api.admin.updateCustomer(c.id, { role: newRole });
      showToast(`Permission for "${c.name}" changed to ${newRole}!`, 'success');
      await fetchCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to change permission.', 'error');
    }
  };

  // Delete Customer Account
  const handleDeleteCustomer = async () => {
    if (!deleteConfirmUser) return;
    try {
      setSubmitting(true);
      const res = await api.admin.deleteCustomer(deleteConfirmUser.id);
      showToast(res.message || `Account "${deleteConfirmUser.name}" removed successfully!`, 'info');
      setDeleteConfirmUser(null);
      await fetchCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const customerCount = customers.filter(c => c.role !== 'ADMIN').length;
  const adminCount = customers.filter(c => c.role === 'ADMIN').length;

  return (
    <div id="admin-customers-page" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Customer & User Management</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Customer & Admin Accounts ({customers.length})
          </h1>
          <p className="text-xs text-gray-500">
            Add or remove customer accounts, manage access roles, and assign administrative permissions.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer / Admin</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#fbf9f8] rounded-2xl border border-[#eae5e2] text-xs font-bold">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-4 py-2 rounded-xl transition-all ${
              roleFilter === 'ALL'
                ? 'bg-[#570000] text-[#fdcc87] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Accounts ({customers.length})
          </button>
          <button
            onClick={() => setRoleFilter('CUSTOMER')}
            className={`px-4 py-2 rounded-xl transition-all ${
              roleFilter === 'CUSTOMER'
                ? 'bg-[#570000] text-[#fdcc87] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Customers ({customerCount})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-4 py-2 rounded-xl transition-all ${
              roleFilter === 'ADMIN'
                ? 'bg-[#570000] text-[#fdcc87] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin Custodians ({adminCount})
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="p-2 rounded-2xl bg-white border border-[#eae5e2] shadow-xs max-w-md w-full relative flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-1 text-xs bg-transparent focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[#570000] text-white font-bold text-xs hover:bg-[#800000]"
          >
            Search
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eae5e2] bg-[#fbf9f8] text-gray-500 uppercase font-bold">
                <th className="p-4">User Particulars</th>
                <th className="p-4">Contact Channels</th>
                <th className="p-4">Role & Permissions</th>
                <th className="p-4">Orders & Lifetime Spend</th>
                <th className="p-4">Last Order</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae5e2]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#570000]" />
                    <span>Loading User Accounts...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>No user accounts found matching your filters.</span>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isCurrentAdmin = currentUser?.id === c.id;
                  const isAdmin = c.role === 'ADMIN';

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-serif font-bold text-sm shadow-2xs ${
                            isAdmin
                              ? 'bg-gradient-to-br from-[#570000] to-[#7b0000] text-[#fdcc87] border border-[#fdcc87]/40'
                              : 'bg-stone-100 text-stone-700 border border-[#eae5e2]'
                          }`}>
                            {c.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-sm font-serif font-bold text-[#1f1c1b] block">{c.name}</strong>
                              {isCurrentAdmin && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              Joined {c.joinedAt ? new Date(c.joinedAt).toLocaleDateString('en-IN') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="text-gray-700 font-medium">{c.email}</p>
                        <p className="text-gray-400 font-mono text-[11px]">{c.phone || 'No phone'}</p>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => !isCurrentAdmin && handleQuickRoleToggle(c)}
                            disabled={isCurrentAdmin}
                            title={isCurrentAdmin ? 'You cannot modify your own role' : 'Click to toggle permission'}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                              isAdmin
                                ? 'bg-[#570000] text-[#fdcc87] border-[#fdcc87]/40 hover:brightness-110'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            } ${isCurrentAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#fdcc87]" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{isAdmin ? 'ADMIN CUSTODIAN' : 'CUSTOMER'}</span>
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <strong className="font-serif font-bold text-sm text-[#570000] block">{formatPrice(c.totalSpent || 0)}</strong>
                          <span className="text-gray-500 text-[11px]">{c.totalOrders || 0} Orders Placed</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {c.lastOrderNumber ? (
                          <div>
                            <span className="font-mono font-bold text-gray-800 block">{c.lastOrderNumber}</span>
                            <span className="text-[10px] text-gray-400">{new Date(c.lastOrderDate).toLocaleDateString('en-IN')}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#570000] hover:border-[#570000] transition-colors"
                            title="Inspect Profile & Orders"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#570000] hover:border-[#570000] transition-colors"
                            title="Edit Account & Permissions"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!isCurrentAdmin && (
                            <button
                              onClick={() => setDeleteConfirmUser(c)}
                              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 transition-colors"
                              title="Delete Customer Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Add Customer / Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateCustomer} className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#570000]/10 text-[#570000]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Add New Account</h3>
                  <p className="text-[11px] text-gray-500">Create a customer account or assign administrative custodian access</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="uppercase font-bold text-gray-600 block mb-1">
                  Full Name <span className="text-[#570000]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra, Anand Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold text-sm focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="uppercase font-bold text-gray-600 block mb-1">
                    Email Address <span className="text-[#570000]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                  />
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-600 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase font-bold text-gray-600 block mb-1">
                  Password <span className="text-[#570000]">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Set initial password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-mono focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              {/* Role & Permissions Selector */}
              <div className="pt-2 border-t border-[#eae5e2] space-y-2">
                <label className="uppercase font-bold text-gray-700 block">Account Role & Permission Level</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all space-y-1 ${
                      role === 'CUSTOMER'
                        ? 'border-[#570000] bg-[#570000]/5 ring-2 ring-[#570000]/20'
                        : 'border-[#eae5e2] bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-gray-800">
                      <UserCheck className="w-4 h-4 text-[#570000]" />
                      <span>Customer</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Standard shopping access, order tracking & personal custom mandir inquiries.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all space-y-1 ${
                      role === 'ADMIN'
                        ? 'border-[#570000] bg-[#570000]/5 ring-2 ring-[#570000]/20'
                        : 'border-[#eae5e2] bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#570000]">
                      <ShieldCheck className="w-4 h-4 text-[#570000]" />
                      <span>Admin Custodian</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Full control over products, orders, settings, invoices, categories, and users.
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#eae5e2]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#570000] text-white font-bold hover:bg-[#800000] shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{submitting ? 'Creating...' : 'Create Account'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Customer & Permissions Modal */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateCustomer} className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#570000]/10 text-[#570000]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Edit Account & Permissions</h3>
                  <p className="text-[11px] text-gray-500">Update particulars and modify operational authority</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="uppercase font-bold text-gray-600 block mb-1">
                  Full Name <span className="text-[#570000]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold text-sm focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="uppercase font-bold text-gray-600 block mb-1">
                    Email Address <span className="text-[#570000]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                  />
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-600 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase font-bold text-gray-600 block mb-1">
                  Reset Password (Leave blank to keep current password)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password if changing"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-mono focus:outline-hidden"
                />
              </div>

              {/* Role & Permissions Selector */}
              <div className="pt-2 border-t border-[#eae5e2] space-y-2">
                <label className="uppercase font-bold text-gray-700 block">Account Role & Permission Level</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all space-y-1 ${
                      role === 'CUSTOMER'
                        ? 'border-[#570000] bg-[#570000]/5 ring-2 ring-[#570000]/20'
                        : 'border-[#eae5e2] bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-gray-800">
                      <UserCheck className="w-4 h-4 text-[#570000]" />
                      <span>Customer</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Standard shopping access, order tracking & personal custom mandir inquiries.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all space-y-1 ${
                      role === 'ADMIN'
                        ? 'border-[#570000] bg-[#570000]/5 ring-2 ring-[#570000]/20'
                        : 'border-[#eae5e2] bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#570000]">
                      <ShieldCheck className="w-4 h-4 text-[#570000]" />
                      <span>Admin Custodian</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Full control over products, orders, settings, invoices, categories, and users.
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#eae5e2]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#570000] text-white font-bold hover:bg-[#800000] shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{submitting ? 'Saving...' : 'Update Account & Permissions'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-xs animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-gray-900">Remove Account</h3>
              <p className="text-gray-500">
                Are you sure you want to permanently delete account <strong>"{deleteConfirmUser.name}"</strong> ({deleteConfirmUser.email})?
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>This action cannot be undone. All personal addresses and history will be detached.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{submitting ? 'Deleting...' : 'Yes, Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start pb-3 border-b border-[#eae5e2]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#570000] text-[#fdcc87] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                  {selectedCustomer.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">{selectedCustomer.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      selectedCustomer.role === 'ADMIN'
                        ? 'bg-[#570000] text-[#fdcc87]'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedCustomer.role || 'CUSTOMER'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500">{selectedCustomer.email}</span>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2]">
              <div>
                <span className="text-gray-400 block uppercase font-bold text-[10px]">Mobile Phone</span>
                <strong className="text-gray-800">{selectedCustomer.phone || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-bold text-[10px]">Total Orders</span>
                <strong className="text-[#570000] text-sm">{selectedCustomer.totalOrders || 0} Orders</strong>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-bold text-[10px]">Lifetime Spend</span>
                <strong className="font-serif font-bold text-[#570000] text-sm">{formatPrice(selectedCustomer.totalSpent || 0)}</strong>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-bold text-[10px]">Member Since</span>
                <strong className="text-gray-800">{selectedCustomer.joinedAt ? new Date(selectedCustomer.joinedAt).toLocaleDateString('en-IN') : 'N/A'}</strong>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-2 pt-2 border-t border-[#eae5e2]">
              <h4 className="font-serif font-bold text-sm text-[#1f1c1b]">Saved Delivery Addresses</h4>
              {selectedCustomer.addresses?.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.addresses.map((addr: any) => (
                    <div key={addr.id} className="p-3 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-gray-800">{addr.fullName}</strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-[#eae5e2] text-[#570000]">
                          {addr.type}
                        </span>
                      </div>
                      <p className="text-gray-500">{addr.streetAddress}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-gray-400 font-mono text-[11px]">{addr.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No saved addresses on file.</p>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#eae5e2]">
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  openEditModal(selectedCustomer);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Account</span>
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex-1 py-2.5 bg-[#570000] text-white font-bold rounded-xl hover:bg-[#800000]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
