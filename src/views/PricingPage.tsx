'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Globe, Star, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const PLANS = [
  {
    name: 'Free',
    role: 'Student',
    price: 'XAF 0',
    frequency: '/forever',
    description: 'Perfect for getting started and finding your first internship.',
    features: [
      'Apply to 5 internships/month',
      'Smart Match Score',
      'Basic Portfolio Builder',
      'Community Access',
      'Email Notifications'
    ],
    buttonText: 'Current Plan',
    highlight: false
  },
  {
    name: 'Pro',
    role: 'Student',
    price: 'XAF 1,000',
    frequency: '/month',
    description: 'Advanced tools to fast-track your career growth.',
    features: [
      'Unlimited Applications',
      'Priority Job Matching',
      'Resume Review Tips',
      'Verified Badge',
      'Interview Prep Tools'
    ],
    buttonText: 'Upgrade to Pro',
    highlight: true,
    color: 'rgb(var(--accent))'
  },
  {
    name: 'Recruiter',
    role: 'Company',
    price: 'XAF 3,000',
    frequency: '/month',
    description: 'Scale your team with better candidate matching.',
    features: [
      'Unlimited Job Postings',
      'Advanced Candidate Search',
      'Team Collaboration Tools',
      'Bulk Messaging',
      'Dedicated Support'
    ],
    buttonText: 'Start Hiring',
    highlight: true,
    color: 'rgb(168, 85, 247)'
  }
];

export const PricingPage = () => {
  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-xs font-bold text-[rgb(var(--accent))] uppercase tracking-widest">Pricing Plans</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[rgb(var(--text-main))]">Simple, Transparent Pricing</h1>
          <p className="text-[rgb(var(--text-muted))] text-sm">Choose the plan that best fits your current needs.</p>
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
                  Most Popular
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
            <h3 className="text-xl font-bold text-[rgb(var(--text-main))]">Security & Trust</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
               <h4 className="text-sm font-bold text-[rgb(var(--text-main))]">Data Privacy</h4>
               <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed font-medium">Your data is stored securely and is never shared with third parties without your consent.</p>
            </div>
            <div className="space-y-2">
               <h4 className="text-sm font-bold text-[rgb(var(--text-main))]">Verified Employers</h4>
               <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed font-medium">Every company on our platform undergoes a vetting process to ensure safe internships.</p>
            </div>
            <div className="space-y-2">
               <h4 className="text-sm font-bold text-[rgb(var(--text-main))]">Secure Payments</h4>
               <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed font-medium">All transactions are processed through enterprise-grade encrypted payment gateways.</p>
            </div>
         </div>
      </motion.div>
    </div>
  );
};
