'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Zap, Briefcase, ShieldCheck, Globe, ChevronRight, Star, Twitter, Linkedin, Github, Mail, MapPin, Phone, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { CountUp } from '../components/CountUp';

export const LandingPage = () => {
  const t = useTranslations('home');
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  const features = [
    {
      id: 'smart-matching',
      icon: Zap,
      title: t('features.smartMatching.title'),
      desc: t('features.smartMatching.desc'),
      details: t.raw('features.smartMatching.details') as string[],
      color: "blue"
    },
    {
      id: 'job-tracking',
      icon: Globe,
      title: t('features.jobTracking.title'),
      desc: t('features.jobTracking.desc'),
      details: t.raw('features.jobTracking.details') as string[],
      color: "purple"
    },
    {
      id: 'verified-companies',
      icon: ShieldCheck,
      title: t('features.verifiedCompanies.title'),
      desc: t('features.verifiedCompanies.desc'),
      details: t.raw('features.verifiedCompanies.details') as string[],
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
            <span className="uppercase tracking-widest text-[9px] sm:text-[10px]">{t('hero.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-[rgb(var(--text-main))] leading-[1.1]"
          >
            {t('hero.headline')} <br className="hidden sm:block" />
            <span className="text-[rgb(var(--accent))] bg-clip-text text-transparent bg-linear-to-r from-[rgb(var(--accent))] to-blue-500">{t('hero.headlineHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-[22px] text-[rgb(var(--text-muted))] max-w-3xl mx-auto font-medium leading-relaxed"
          >
            {t('hero.subheadline')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Link href="/auth?mode=signup" className="w-full sm:w-auto px-10 py-5 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent))]/90 transition-all text-center flex items-center justify-center shadow-2xl shadow-[rgb(var(--accent))]/20 hover:scale-[1.02] active:scale-95 text-lg">
              {t('hero.cta')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-[rgb(var(--border))] mt-16 relative">
          {[
            { label: t('hero.stats.activeStudents'), value: 1000, suffix: '+' },
            { label: t('hero.stats.verifiedPartners'), value: 50, suffix: '+' },
            { label: t('hero.stats.monthlyPlacements'), value: 100, suffix: '' },
            { label: t('hero.stats.matchAccuracy'), value: 90, suffix: '%' },
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
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[rgb(var(--text-main))]">{t('features.title')} <span className="text-[rgb(var(--accent))]">{t('features.titleHighlight')}</span></h2>
          <p className="text-[rgb(var(--text-muted))] text-lg sm:text-xl max-w-2xl mx-auto font-medium">{t('features.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.id}
              {...feature}
              index={i}
              learnMoreLabel={t('features.learnMore')}
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
                aria-label={t('featureModal.closeAriaLabel')}
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
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[rgb(var(--text-muted))]">{t('featureModal.keyAdvantages')}</h4>
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
                    href="/auth?mode=signup"
                    onClick={() => setSelectedFeature(null)}
                    className="w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-xl hover:bg-[rgb(var(--accent))]/90 flex items-center justify-center gap-3 text-base transition-all shadow-xl shadow-[rgb(var(--accent))]/20"
                  >
                    {t('featureModal.startJourney')} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
            <div className="absolute inset-0 -z-10" onClick={() => setSelectedFeature(null)}></div>
          </div>
        )}
      </AnimatePresence>

      {/* About Us */}
      <section className="py-16 sm:py-20 px-6 max-w-7xl mx-auto">
        <div className="space-y-8 md:space-y-12">
          <div className="text-center space-y-4">
            <p className="text-2xl font-extrabold uppercase tracking-[0.35em] text-[rgb(var(--accent))]">{t('about.kicker')}</p>
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-[rgb(var(--text-main))] leading-[1.1] max-w-4xl mx-auto">{t('about.heading')}</h2>
            <p className="text-base md:text-lg text-[rgb(var(--text-muted))] max-w-3xl mx-auto leading-relaxed font-light">{t('about.body')}</p>
          </div>
        </div>
      </section>

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
            <h2 className="text-4xl md:text-7xl font-extrabold tracking-tight">{t('ctaSection.headingLine1')} <br /> {t('ctaSection.headingLine2')}</h2>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">{t('ctaSection.body')}</p>
            <div className="flex justify-center pt-4">
              <Link href="/auth?mode=signup" className="px-12 py-6 bg-white text-[rgb(var(--accent))] font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-3 group shadow-2xl hover:scale-105 active:scale-95 text-lg">
                {t('ctaSection.cta')} <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
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
              <span className="font-bold text-xl tracking-tight text-[rgb(var(--text-main))] font-display">{t('footer.brand')}</span>
            </div>
            <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed font-medium">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              <SocialLink icon={Twitter} href="#" t={t} />
              <SocialLink icon={Linkedin} href="#" t={t} />
              <SocialLink icon={Github} href="#" t={t} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm">{t('footer.navigationHeading')}</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="/auth">{t('footer.recruiterPortal')}</FooterLink>
              <FooterLink href="/auth?mode=signup">{t('footer.joinAsStudent')}</FooterLink>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm">{t('footer.resourcesHeading')}</h4>
            <div className="flex flex-col gap-2">
              <FooterResourceButton onClick={() => setSelectedResource({ id: 'success-stories', title: t('footer.resources.successStories.title'), summary: t('footer.resources.successStories.summary'), details: t.raw('footer.resources.successStories.details') as string[] })}>
                {t('footer.resources.successStories.title')}
              </FooterResourceButton>
              <FooterResourceButton onClick={() => setSelectedResource({ id: 'blog', title: t('footer.resources.blog.title'), summary: t('footer.resources.blog.summary'), details: t.raw('footer.resources.blog.details') as string[] })}>
                {t('footer.resources.blog.title')}
              </FooterResourceButton>
              <FooterResourceButton onClick={() => setSelectedResource({ id: 'partner-with-us', title: t('footer.resources.partnerWithUs.title'), summary: t('footer.resources.partnerWithUs.summary'), details: t.raw('footer.resources.partnerWithUs.details') as string[] })}>
                {t('footer.resources.partnerWithUs.title')}
              </FooterResourceButton>
              <FooterResourceButton onClick={() => setSelectedResource({ id: 'privacy-policy', title: t('footer.resources.privacyPolicy.title'), summary: t('footer.resources.privacyPolicy.summary'), details: t.raw('footer.resources.privacyPolicy.details') as string[] })}>
                {t('footer.resources.privacyPolicy.title')}
              </FooterResourceButton>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm">{t('footer.contactHeading')}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[rgb(var(--accent))] shrink-0 mt-0.5" />
                <p className="text-sm text-[rgb(var(--text-muted))] font-medium">{t('footer.location')}</p>
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
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[rgb(var(--accent))] transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-[rgb(var(--accent))] transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-[rgb(var(--accent))] transition-colors">{t('footer.security')}</a>
          </div>
        </div>
      </footer>

      {/* Resource Modal */}
      <AnimatePresence>
        {selectedResource && (
          <ResourceModal resource={selectedResource} onClose={() => setSelectedResource(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const SocialLink = ({ icon: Icon, href, t }: any) => {
  const networkKey = href.includes('twitter') ? 'twitter' : href.includes('linkedin') ? 'linkedin' : href.includes('github') ? 'github' : 'default';
  return (
    <a href={href} aria-label={t('footer.socialAriaLabel', { network: t(`footer.socialNetworks.${networkKey}`) })} className="w-10 h-10 rounded-xl bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] flex items-center justify-center text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--accent))] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm">
      <Icon className="w-5 h-5" />
    </a>
  );
};

const FooterLink = ({ href, children }: any) => (
  <Link href={href} className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors w-fit flex items-center gap-2 group">
    <div className="w-0 h-px bg-[rgb(var(--accent))] group-hover:w-4 transition-all duration-300"></div>
    {children}
  </Link>
);

const FooterResourceButton = ({ onClick, children }: any) => (
  <button onClick={onClick} className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors w-fit flex items-center gap-2 group text-left">
    <div className="w-0 h-px bg-[rgb(var(--accent))] group-hover:w-4 transition-all duration-300"></div>
    {children}
  </button>
);

const FeatureCard = ({ icon: Icon, title, desc, color, index, onClick, learnMoreLabel }: any) => {
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
          {learnMoreLabel} <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </motion.div>
  );
};

const ResourceModal = ({ resource, onClose }: any) => {
  const t = useTranslations('home');
  if (!resource) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[rgb(var(--text-main))]">{resource.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] flex items-center justify-center text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--accent))] hover:text-white hover:border-transparent transition-all duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-base text-[rgb(var(--text-muted))] leading-relaxed">{resource.summary}</p>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--text-main))]">{t('resourceModal.keyHighlights')}</h3>
            <ul className="space-y-3">
              {resource.details.map((detail: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[rgb(var(--accent))] shrink-0 mt-0.5" />
                  <span className="text-sm text-[rgb(var(--text-muted))] leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[rgb(var(--border))] flex justify-between items-center">
            <p className="text-sm text-[rgb(var(--text-muted))] text-center">
              {t('resourceModal.contactPrompt')}{' '}
              <a href="mailto:contact@connekt.io" className="text-[rgb(var(--accent))] hover:underline">
                contact@connekt.io
              </a>
            </p>
            {resource.id === 'partner-with-us' && (
              <Link
                href="/auth"
                onClick={onClose}
                className="px-6 py-2 bg-[rgb(var(--accent))] text-white font-bold rounded-xl hover:bg-[rgb(var(--accent))]/90 transition-all text-sm"
              >
                {t('resourceModal.getStarted')}
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
