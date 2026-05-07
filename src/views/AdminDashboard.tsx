'use client';

import React from 'react';
import { ShieldCheck, CheckCircle, ChevronRight, CreditCard, Activity, Globe, Scale, User, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_TRANSACTIONS, MOCK_VERIFICATIONS } from '../mockData';
import { cn } from '../lib/utils';
import { CountUp } from '../components/CountUp';
import { AdminStatProps } from '../types';

export const AdminDashboard = () => (
  <div className="space-y-10 pb-20">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--text-main))] flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[rgb(var(--accent))]" />
          Admin Overview
        </h1>
        <p className="text-[rgb(var(--text-muted))] text-sm">Monitor platform activity, manage verifications, and financial logs.</p>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Platform Status: Healthy
      </motion.div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <AdminStat icon={<User className="w-5 h-5" />} label="Total Users" value={2842} color="text-blue-500" delay={0.1} />
      <AdminStat icon={<Briefcase className="w-5 h-5" />} label="Active Jobs" value={1242} color="text-indigo-500" delay={0.2} />
      <AdminStat icon={<CreditCard className="w-5 h-5" />} label="Monthly Revenue" value={42400} prefix="$" color="text-emerald-500" delay={0.3} />
      <AdminStat icon={<Activity className="w-5 h-5" />} label="Conversion Rate" value={3.2} suffix="%" color="text-purple-500" delay={0.4} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
      <section className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between border-l-4 border-amber-400 pl-4 items-center">
          <div>
            <h2 className="text-lg font-bold text-[rgb(var(--text-main))]">Verification Queue</h2>
            <p className="text-xs text-[rgb(var(--text-muted))] font-medium uppercase tracking-wider">Pending Approvals</p>
          </div>
          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm">4 Urgent</span>
        </div>
        <div className="space-y-3">
          {MOCK_VERIFICATIONS.map((v, i) => (
            <motion.div 
              key={v.id} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[rgb(var(--bg-main))] p-5 rounded-xl border border-[rgb(var(--border))] flex items-center justify-between group hover:border-[rgb(var(--accent))]/30 transition-all shadow-sm"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-[rgb(var(--text-main))] group-hover:text-[rgb(var(--accent))] transition-colors">{v.company}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[rgb(var(--accent))]">{v.website}</span>
                  <span className="text-[10px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest">• {v.industry}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">Pending</span>
                <button className="p-2.5 bg-[rgb(var(--bg-side))] rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-[rgb(var(--border))] hover:border-transparent shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="lg:col-span-3 space-y-6">
        <div className="space-y-1 border-l-4 border-purple-400 pl-4">
           <h2 className="text-lg font-bold text-[rgb(var(--text-main))]">Transaction Ledger</h2>
           <p className="text-xs text-[rgb(var(--text-muted))] font-medium uppercase tracking-wider">Latest Payments</p>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[rgb(var(--bg-main))] rounded-xl border border-[rgb(var(--border))] overflow-hidden shadow-sm"
        >
          <div className="divide-y divide-[rgb(var(--border))]">
            {MOCK_TRANSACTIONS.map((t, idx) => (
              <motion.div 
                key={t.id} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 py-4 px-6 group hover:bg-[rgb(var(--bg-side))] transition-all"
              >
                <span className="text-[10px] font-bold text-[rgb(var(--text-muted))] w-14 shrink-0 uppercase tracking-wider">{t.date}</span>
                <div className="w-9 h-9 rounded-lg bg-[rgb(var(--bg-side))] flex items-center justify-center text-[10px] font-bold border border-[rgb(var(--border))] group-hover:border-[rgb(var(--accent))]/40 shadow-sm shrink-0">
                  {t.userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold block leading-none mb-1 text-[rgb(var(--text-main))] truncate">{t.type}</span>
                  <span className="text-[10px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest">{t.source}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-sm block leading-none mb-1 text-[rgb(var(--text-main))]">{t.amount}</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    t.status === 'Success' ? 'text-emerald-500' : 'text-amber-500'
                  )}>{t.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  </div>
);

const AdminStat = ({ icon, label, value, color, delay, prefix = '', suffix = '' }: AdminStatProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-[rgb(var(--bg-main))] p-6 rounded-2xl border border-[rgb(var(--border))] group hover:border-[rgb(var(--accent))]/40 transition-all shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 transition-transform group-hover:scale-110", color)}>
        {icon}
      </div>
      <div className="h-1 w-10 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: '70%' }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          className={cn("h-full bg-current opacity-50", color)} 
        />
      </div>
    </div>
    <p className="text-[rgb(var(--text-muted))] text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-bold tracking-tight text-[rgb(var(--text-main))]">
       <CountUp end={value} prefix={prefix} suffix={suffix} />
    </p>
  </motion.div>
);
