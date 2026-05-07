'use client';

import React, { useEffect, useState } from 'react';
import { Search, Globe, ChevronRight, Zap, Bookmark } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { JobListing, JobCardProps } from '../types';
import { cn } from '../lib/utils';
import { CountUp } from '../components/CountUp';

export const JobBoard = () => {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const fetchJobs = React.useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('jobs').select('*').order('posted_date', { ascending: false });
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching jobs:', error);
      } else if (data) {
        // Map database fields to JobListing interface
        const mappedJobs: JobListing[] = data.map((job: JobListing) => ({
          ...job,
          postedDate: new Date(job.postedDate).toLocaleDateString(),
          matchScore: Math.floor(Math.random() * 20) + 80 // Temporary until ML match score is implemented
        }));
        setJobs(mappedJobs);
      }
    } catch (err) {
      console.error('Unexpected error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 pb-8 border-b border-[rgb(var(--border))]">
        <div className="space-y-3 max-w-2xl w-full">
          <h1 className="text-3xl font-bold tracking-tight">Browse Internships</h1>
          <p className="text-[rgb(var(--text-muted))] text-sm">Find your next opportunity from top vetted companies globally.</p>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
            <input 
              type="text" 
              placeholder="Search roles or companies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] focus:ring-4 focus:ring-[rgb(var(--accent))]/5 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[300px] w-full bg-[rgb(var(--bg-side))] animate-pulse rounded-2xl border border-[rgb(var(--border))]"></div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <JobCard {...job} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[rgb(var(--bg-side))] rounded-[3rem] border border-[rgb(var(--border))]">
          <Globe className="w-16 h-16 text-[rgb(var(--text-muted))] mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-bold mb-2">No internships found</h3>
          <p className="text-[rgb(var(--text-muted))]">Try adjusting your search query or check back later.</p>
        </div>
      )}
    </div>
  );
};

const JobCard = ({ id, title, company, location, logo, matchScore, tags }: JobCardProps) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-[rgb(var(--bg-main))] p-6 rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50 transition-all flex flex-col h-full group shadow-soft hover:shadow-hard"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-14 h-14 rounded-xl bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] overflow-hidden p-1.5 shadow-sm">
        <Image 
          src={logo} 
          alt={company} 
          width={56}
          height={56}
          className="w-full h-full object-contain" 
        />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] px-3 py-1.5 rounded-lg text-xs font-bold">
          <CountUp end={matchScore ?? 0} suffix="% Match" />
        </div>
      </div>
    </div>

    <div className="space-y-1 mb-4">
      <h3 className="text-lg font-bold group-hover:text-[rgb(var(--accent))] transition-colors">{title}</h3>
      <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))] font-medium">
        <Globe className="w-3.5 h-3.5" />
        <span>{company} • {location}</span>
      </div>
    </div>

    <div className="flex flex-wrap gap-1.5 mb-6">
      {tags.slice(0, 3).map((tag: string) => (
        <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-side))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border))]">
          {tag}
        </span>
      ))}
    </div>

    <div className="mt-auto pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between">
      <span className="text-xs text-[rgb(var(--text-muted))] font-bold">
        <CountUp end={42} suffix=" applicants" />
      </span>
      <Link href={`/jobs/${id}`} className="text-xs font-bold text-[rgb(var(--accent))] flex items-center gap-1">
        Details <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  </motion.div>
);
