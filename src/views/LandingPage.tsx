'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Zap, Briefcase, ShieldCheck, Globe, ChevronRight, Star, Twitter, Linkedin, Github, Mail, MapPin, Phone, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { CountUp } from '../components/CountUp';

export const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const features = [
    { 
      id: 'smart-matching',
      icon: Zap, 
      title: "Smart Matching", 
      desc: "Our intelligent matching system connects your unique skills and interests with the best available roles, ensuring a perfect fit for both you and the company.",
      details: [
        "Algorithm-driven personal recommendations",
        "Skills assessment integration",
        "Career trajectory mapping",
        "Personalized feedback on applications"
      ],
      color: "blue"
    },
    { 
      id: 'job-tracking',
      icon: Globe, 
      title: "Job Tracking", 
      desc: "Stay organized with a centralized dashboard for all your applications. Receive instant notifications on status changes and never miss a follow-up.",
      details: [
        "Real-time application status updates",
        "Interview scheduling calendar",
        "Task management for application requirements",
        "Document storage for resumes and letters"
      ],
      color: "purple"
    },
    { 
      id: 'verified-companies',
      icon: ShieldCheck, 
      title: "Verified Companies", 
      desc: "We manually vet every company and internship post to eliminate scams and low-quality roles, so you can apply with absolute confidence.",
      details: [
        "Thorough background checks on recruiters",
        "Safe payment & stipend verification",
        "Quality of work-life assessments",
        "Student-driven company reviews"
      ],
      color: "emerald"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8 relative overflow-hidden">
        {/* Background blobs for depth */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-[rgb(var(--accent))]/5 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>
        <motion.div 
          style={{ scale, opacity }}
          className="space-y-8 sm:space-y-12"
        >
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] text-sm font-bold mb-4"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span className="uppercase tracking-widest text-[9px] sm:text-[10px]">Empowering Tech Talents</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-[rgb(var(--text-main))] leading-[1.1]"
          >
            Bridging the gap <br className="hidden sm:block" /> between <br className="sm:hidden" />
            <span className="text-[rgb(var(--accent))] bg-clip-text text-transparent bg-linear-to-r from-[rgb(var(--accent))] to-blue-500">Campus and Career</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-[22px] text-[rgb(var(--text-muted))] max-w-3xl mx-auto font-medium leading-relaxed"
          >
            ConnekT connects the brightest university tech talents with leading companies. Simple application tracking and smart matching to jumpstart your career.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Link href="/signup" className="w-full sm:w-auto px-10 py-5 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent))]/90 transition-all text-center flex items-center justify-center shadow-2xl shadow-[rgb(var(--accent))]/20 hover:scale-[1.02] active:scale-95 text-lg">
              Create Free Account
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-[rgb(var(--border))] mt-16 relative">
          {[
            { label: 'Active Students', value: 1000, suffix: '+' },
            { label: 'Verified Partners', value: 50, suffix: '+' },
            { label: 'Monthly Placements', value: 100, suffix: '' },
            { label: 'Match Accuracy', value: 90, suffix: '%' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-1"
            >
              <p className="text-4xl md:text-5xl font-extrabold text-[rgb(var(--text-main))] tracking-tight">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-[12px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="w-full h-px bg-linear-to-r from-transparent via-[rgb(var(--border))] to-transparent mt-12"></div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 sm:mb-24 space-y-4">
           <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[rgb(var(--text-main))]">Everything you need to <span className="text-[rgb(var(--accent))]">succeed</span></h2>
           <p className="text-[rgb(var(--text-muted))] text-lg sm:text-xl max-w-2xl mx-auto font-medium">Powering your internship search with tools designed for the modern student.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {features.map((feature, i) => (
            <FeatureCard 
              key={feature.id}
              {...feature}
              index={i}
              onClick={() => setSelectedFeature(feature)}
            />
          ))}
        </div>
      </section>

      {/* Feature Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-white/10 dark:bg-black/40">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[rgb(var(--bg-main))] rounded-4xl border border-[rgb(var(--border))] shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedFeature(null)}
                aria-label="Close feature details"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                <div className="flex items-center gap-5">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg", 
                    selectedFeature.color === 'blue' ? 'bg-blue-500' : 
                    selectedFeature.color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'
                  )}>
                    <selectedFeature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--text-main))] tracking-tight">{selectedFeature.title}</h3>
                </div>

                <p className="text-base sm:text-lg text-[rgb(var(--text-muted))] leading-relaxed font-medium">
                  {selectedFeature.desc}
                </p>

                <div className="space-y-4 pt-5 border-t border-[rgb(var(--border))]">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[rgb(var(--text-muted))]">Key Advantages</h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedFeature.details.map((detail: string, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-[rgb(var(--text-main))]">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Link 
                    href="/signup" 
                    onClick={() => setSelectedFeature(null)}
                    className="w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-xl hover:bg-[rgb(var(--accent))]/90 flex items-center justify-center gap-3 text-base transition-all shadow-xl shadow-[rgb(var(--accent))]/20"
                  >
                    Start your journey <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
            <div className="absolute inset-0 -z-10" onClick={() => setSelectedFeature(null)}></div>
          </div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[rgb(var(--accent))] rounded-[3.5rem] p-10 sm:p-16 md:p-24 text-center text-white space-y-8 relative overflow-hidden shadow-2xl shadow-[rgb(var(--accent))]/30"
        >
           {/* Animated Background Elements */}
           <motion.div 
             animate={{ 
               y: [0, -20, 0],
               rotate: [0, 10, 0],
               scale: [1, 1.1, 1]
             }}
             transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
             className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"
           ></motion.div>
           <motion.div 
             animate={{ 
               y: [0, 30, 0],
               x: [0, 20, 0],
               scale: [1, 1.2, 1]
             }}
             transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
             className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"
           ></motion.div>
           <motion.div 
             animate={{ 
               scale: [1, 1.5, 1],
               opacity: [0.1, 0.2, 0.1]
             }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/10 blur-[120px] rounded-full"
           ></motion.div>
           
           <div className="relative z-10 space-y-8">
             <h2 className="text-4xl md:text-7xl font-extrabold tracking-tight">Start Your Career <br /> Journey Today.</h2>
             <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">Don&apos;t miss out on life-changing opportunities. Join thousands of students already building their future.</p>
             <div className="flex justify-center pt-4">
                <Link href="/signup" className="px-12 py-6 bg-white text-[rgb(var(--accent))] font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-3 group shadow-2xl hover:scale-105 active:scale-95 text-lg">
                   Get Started Now <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                </Link>
             </div>
           </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 px-6 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-main))] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[rgb(var(--accent))] to-blue-600 flex items-center justify-center shadow-lg shadow-[rgb(var(--accent))]/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[rgb(var(--text-main))] font-display">ConnekT</span>
            </div>
            <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed font-medium">
              Bridging the gap between Campus and Career for the next generation of tech leaders through seamless internship experiences and smart matching.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Linkedin} href="#" />
              <SocialLink icon={Github} href="#" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm">Navigation</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="/login">Recruiter Portal</FooterLink>
              <FooterLink href="/signup">Join as Student</FooterLink>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm">Resources</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="#">Success Stories</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Partner with Us</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[rgb(var(--accent))] shrink-0 mt-0.5" />
                <p className="text-sm text-[rgb(var(--text-muted))] font-medium">Bamenda, Cameroon</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[rgb(var(--accent))] shrink-0" />
                <p className="text-sm text-[rgb(var(--text-muted))] font-medium">contact@connekt.io</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[rgb(var(--accent))] shrink-0" />
                <p className="text-sm text-[rgb(var(--text-muted))] font-medium">+237 671 234 567</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-[rgb(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] font-medium text-[rgb(var(--text-muted))]">
          <p>© 2026 ConnekT. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[rgb(var(--accent))] transition-colors">Terms</a>
            <a href="#" className="hover:text-[rgb(var(--accent))] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[rgb(var(--accent))] transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SocialLink = ({ icon: Icon, href }: any) => (
  <a href={href} aria-label={`Visit our ${href.includes('twitter') ? 'Twitter' : href.includes('linkedin') ? 'LinkedIn' : href.includes('github') ? 'GitHub' : 'social media'} profile`} className="w-10 h-10 rounded-xl bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] flex items-center justify-center text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--accent))] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm">
    <Icon className="w-5 h-5" />
  </a>
);

const FooterLink = ({ href, children }: any) => (
  <Link href={href} className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors w-fit flex items-center gap-2 group">
    <div className="w-0 h-px bg-[rgb(var(--accent))] group-hover:w-4 transition-all duration-300"></div>
    {children}
  </Link>
);

const FeatureCard = ({ icon: Icon, title, desc, color, index, onClick }: any) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="p-8 sm:p-10 rounded-[2.5rem] border border-[rgb(var(--border))] space-y-6 sm:space-y-8 hover:shadow-hard transition-all duration-500 bg-[rgb(var(--bg-main))] group relative overflow-hidden active:scale-[0.98] cursor-pointer shadow-soft text-left"
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--accent))]/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[rgb(var(--accent))]/10 transition-colors"></div>
      
      <div className={cn("w-16 h-16 rounded-[1.25rem] flex items-center justify-center border transition-all duration-500 group-hover:rotate-10 group-hover:scale-110 shadow-sm group-hover:shadow-lg group-hover:shadow-current/20", colors[color])}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--text-main))] tracking-tight group-hover:text-[rgb(var(--accent))] transition-colors">{title}</h3>
        <p className="text-base text-[rgb(var(--text-muted))] leading-relaxed font-medium">{desc}</p>
      </div>
      
      <div className="pt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 duration-500">
         <span className="text-[13px] font-bold text-[rgb(var(--accent))] uppercase tracking-widest flex items-center gap-2 underline underline-offset-4 pointer-events-none">
           Learn more <ChevronRight className="w-4 h-4" />
         </span>
      </div>
    </motion.div>
  );
};
