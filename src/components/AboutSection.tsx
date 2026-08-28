import React from 'react';
import { ShieldCheck, Heart, Users, MapPin, Award, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            About MediFinder
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Bridging the Critical Gap in Emergency Medicine Access
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            During medical emergencies or critical treatments, running from chemist to chemist in search of out-of-stock medicines causes dangerous delays. MediFinder connects patients directly to real-time inventory from neighborhood pharmacies.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">100% Verified Pharmacies</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every listing is verified with official state drug license registrations to ensure genuine medicines and quality healthcare.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hyperlocal Spatial Search</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Intuitive GPS maps and radius filters help you navigate to the closest open pharmacy, whether by walking or driving.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Patient-First Care</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Built-in dosage reminders, transparent price comparisons, and direct one-tap calling simplify healthcare for every family.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
