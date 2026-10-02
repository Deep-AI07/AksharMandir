import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Lock, Mail, User, Phone, Sparkles, ArrowRight, Home, ArrowLeft } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, brandConfig } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/account';

  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (name.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim() || undefined
    });
    setLoading(false);
    if (res.success) {
      navigate(redirectTarget, { replace: true });
    } else {
      setErrorMessage(res.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#eae5e2] shadow-xl space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eae5e2]">
          <Link to="/" className="text-xs font-semibold text-gray-500 hover:text-[#570000] flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <Link to="/mandirs" className="text-xs font-semibold text-gray-500 hover:text-[#570000] transition-colors">
            Browse Mandirs →
          </Link>
        </div>

        <div className="text-center space-y-2">
          <BrandLogo config={brandConfig} variant="compact" align="center" />
          <h1 className="text-2xl font-serif font-bold text-[#1f1c1b] pt-2">Create Your Account</h1>
          <p className="text-xs text-gray-500">Join Akshar Mandir to manage your orders, invoices, and custom designs.</p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
              />
            </div>
          </div>

          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
              />
            </div>
          </div>

          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Mobile Phone (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
              />
            </div>
          </div>

          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold shadow-lg shadow-[#570000]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#eae5e2] text-center text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="text-[#570000] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
