'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Globe, Star, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export const PricingPage = () => {
  const t = useTranslations('pricing');

  const PLANS = [
    {
      name: t('plans.free.name'),
      role: t('plans.free.role'),
      price: t('plans.free.price'),
      frequency: t('plans.free.frequency'),
      description: t('plans.free.description'),
      features: [
        t('plans.free.features.f1'),
        t('plans.free.features.f2'),
        t('plans.free.features.f3'),
        t('plans.free.features.f4'),
        t('plans.free.features.f5'),
      ],
      buttonText: t('plans.free.buttonText'),
      highlight: false
    },
    {
      name: t('plans.pro.name'),
      role: t('plans.pro.role'),
      price: t('plans.pro.price'),
      frequency: t('plans.pro.frequency'),
      description: t('plans.pro.description'),
      features: [
        t('plans.pro.features.f1'),
        t('plans.pro.features.f2'),
        t('plans.pro.features.f3'),
        t('plans.pro.features.f4'),
        t('plans.pro.features.f5'),
      ],
      buttonText: t('plans.pro.buttonText'),
      highlight: true,
      color: 'rgb(var(--accent))'
    },
    {
      name: t('plans.recruiter.name'),
      role: t('plans.recruiter.role'),
      price: t('plans.recruiter.price'),
      frequency: t('plans.recruiter.frequency'),
      description: t('plans.recruiter.description'),
      features: [
        t('plans.recruiter.features.f1'),
        t('plans.recruiter.features.f2'),
        t('plans.recruiter.features.f3'),
        t('plans.recruiter.features.f4'),
        t('plans.recruiter.features.f5'),
      ],
      buttonText: t('plans.recruiter.buttonText'),
      highlight: true,
      color: 'rgb(168, 85, 247)'
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-xs font-bold text-[rgb(var(--accent))] uppercase tracking-widest">{t('heading.eyebrow')}</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[rgb(var(--text-main))]">{t('heading.title')}</h1>
          <p className="text-[rgb(var(--text-muted))] text-sm">{t('heading.subtitle')}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "bg-[rgb(var(--bg-main))] p-8 rounded-2xl relative overflow-hidden flex flex-col group border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50 transition-all shadow-soft hover:shadow-hard",
              plan.highlight && "ring-2 ring-[rgb(var(--accent))]/10 border-[rgb(var(--accent))]/30"
            )}
          >
            {plan.highlight && (
               <div className="absolute top-0 right-0 px-4 py-1.5 bg-[rgb(var(--accent))] text-[10px] uppercase font-bold tracking-widest text-white rounded-bl-xl rounded-tr-xl">
                  {t('mostPopular')}
               </div>
            )}

            <div className="space-y-6 relative z-10 flex-1">
              <div>
                <span className="text-[10px] font-bold text-[rgb(var(--accent))] uppercase tracking-widest opacity-80">{plan.role}</span>
                <h3 className="text-2xl font-bold text-[rgb(var(--text-main))] mt-1">{plan.name}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-2 leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[rgb(var(--text-main))]">{plan.price}</span>
                <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">{plan.frequency}</span>
              </div>

              <div className="space-y-3.5 pt-6 border-t border-[rgb(var(--border))]">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-xs text-[rgb(var(--text-muted))] font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className={cn(
                "w-full mt-10 py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                plan.highlight 
                  ? "bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20" 
                  : "bg-[rgb(var(--bg-side))] text-[rgb(var(--text-main))] border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-main))]"
              )}
            >
              <span>{plan.buttonText}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Trust Section */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         className="bg-[rgb(var(--bg-side))] rounded-2xl p-8 md:p-10 border border-[rgb(var(--border))] mt-12 shadow-sm"
      >
         <div className="flex items-center gap-3 mb-8">
            < Shield className="w-6 h-6 text-[rgb(var(--accent))]" />
            <h3 className="text-xl font-bold text-[rgb(var(--text-main))]">{t('trust.heading')}</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
               <h4 className="text-sm font-bold text-[rgb(var(--text-main))]">{t('trust.dataPrivacy.title')}</h4>
               <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed font-medium">{t('trust.dataPrivacy.description')}</p>
            </div>
            <div className="space-y-2">
               <h4 className="text-sm font-bold text-[rgb(var(--text-main))]">{t('trust.verifiedEmployers.title')}</h4>
               <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed font-medium">{t('trust.verifiedEmployers.description')}</p>
            </div>
            <div className="space-y-2">
               <h4 className="text-sm font-bold text-[rgb(var(--text-main))]">{t('trust.securePayments.title')}</h4>
               <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed font-medium">{t('trust.securePayments.description')}</p>
            </div>
         </div>
      </motion.div>
    </div>
  );
};
