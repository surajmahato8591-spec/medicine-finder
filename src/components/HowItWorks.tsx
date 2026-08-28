import React from 'react';
import { Search, Store, ShoppingBag, Heart, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Search Medicine',
      description: 'Search for the medicine or brand you need.',
      icon: Search,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 text-emerald-700',
      borderColor: 'border-emerald-200',
    },
    {
      number: '2',
      title: 'Find Pharmacies',
      description: 'We show verified nearby pharmacies with real-time stock & prices.',
      icon: Store,
      color: 'from-teal-500 to-sky-500',
      bgColor: 'bg-teal-50 text-teal-700',
      borderColor: 'border-teal-200',
    },
    {
      number: '3',
      title: 'Visit & Pickup',
      description: 'Navigate directly, reserve for pickup, or call ahead to save time.',
      icon: ShoppingBag,
      color: 'from-sky-500 to-indigo-500',
      bgColor: 'bg-sky-50 text-sky-700',
      borderColor: 'border-sky-200',
    },
    {
      number: '4',
      title: 'Stay Healthy',
      description: 'Never miss a dose with medicine reminders and stock alerts.',
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50 text-rose-700',
      borderColor: 'border-rose-200',
    },
  ];

  return (
    <section className="py-14 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2.5">
            How MediFinder Works
          </h2>
          <p className="text-slate-500 text-sm mt-1.5">
            No more running between stores or endless phone calls during health emergencies.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number}
                className="relative bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
              >
                {/* Step numbering */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${step.bgColor} flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-300 group-hover:text-emerald-500 transition-colors">
                    0{step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow connector for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 text-slate-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
