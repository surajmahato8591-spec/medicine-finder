import React, { useState } from 'react';
import { 
  PlusCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../types';

interface FooterProps {
  onNavigate: (tab: 'home' | 'search' | 'nearby-pharmacies' | 'how-it-works' | 'about') => void;
  onOpenAuth?: (isRegister?: boolean, role?: UserRole) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
                <PlusCircle className="w-6 h-6 stroke-[2.4]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-outfit">Medi<span className="text-emerald-400">Finder</span></span>
                <p className="text-[11px] text-slate-400 font-medium">Find Medicine. Save Time.</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              MediFinder helps you check live medicine availability in nearby pharmacies quickly and easily, avoiding unnecessary travel during health emergencies.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-400 transition-colors">
                  Search Medicine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('nearby-pharmacies')} className="hover:text-emerald-400 transition-colors">
                  Nearby Pharmacies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-emerald-400 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors">
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* For Pharmacy */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">For Pharmacy</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => onOpenAuth && onOpenAuth(false, 'pharmacy_owner')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Pharmacy Login
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenAuth && onOpenAuth(true, 'pharmacy_owner')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Register Pharmacy
                </button>
              </li>
            </ul>

            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white pt-3">Account</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => onOpenAuth && onOpenAuth(false, 'patient')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Patient Login
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenAuth && onOpenAuth(true, 'patient')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Create Account
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Contact & Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>support@medifinder.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Mira Road, Maharashtra - 401107</span>
              </li>
            </ul>

            <div className="pt-2">
              <p className="text-xs text-slate-400 mb-2 font-medium">Get stock updates in your email:</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1"
                >
                  {subscribed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediFinder. Find Medicine. Save Time. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms & Conditions</a>
            <a href="#" className="hover:text-slate-400 font-semibold text-emerald-400">Emergency Protocol</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
