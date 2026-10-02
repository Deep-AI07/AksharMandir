import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Home, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, brandConfig } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || (location.state as any)?.from?.pathname || '/account';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate(redirectTarget, { replace: true });
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
          <h1 className="text-2xl font-serif font-bold text-[#1f1c1b] pt-2">Customer Sign In</h1>
          <p className="text-xs text-gray-500">Access your orders, wishlist, and custom mandir designs.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold shadow-lg shadow-[#570000]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Your Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#eae5e2] text-center text-xs text-gray-500 space-y-2">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#570000] font-bold hover:underline">
              Create One
            </Link>
          </p>
          <p>
            Store Administrator?{' '}
            <Link to="/admin/login" className="text-[#7b581e] font-semibold hover:underline">
              Admin Login Portal →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
