import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, brandConfig } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await adminLogin(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1716] flex items-center justify-center px-4 py-12 text-white">
      <div className="max-w-md w-full bg-[#241f1e] p-8 rounded-3xl border border-[#d4af37]/30 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo config={brandConfig} variant="admin" theme="dark" align="center" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#570000] text-[#fdcc87] text-[10px] uppercase font-bold tracking-wider mt-3">
            <KeyRound className="w-3 h-3" />
            <span>Store Administrator Access</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#fbf9f8] pt-1">Admin Control Center</h1>
          <p className="text-xs text-stone-400">Strictly authorized personnel only. All access events are logged.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="uppercase font-bold text-stone-400 block mb-1">Administrator Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aksharmandir.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold focus:outline-hidden focus:border-[#fdcc87]"
              />
            </div>
          </div>

          <div>
            <label className="uppercase font-bold text-stone-400 block mb-1">Master Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold focus:outline-hidden focus:border-[#fdcc87]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#570000] text-[#fdcc87] hover:bg-[#800000] text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying Authorization...' : 'Authorize Admin Session'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
