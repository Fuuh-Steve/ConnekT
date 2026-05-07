import { Application, JobListing, Transaction, VerificationTask } from './types';

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    role: 'Frontend Developer Intern',
    company: 'TechFlow Systems',
    location: 'Remote / Douala, CM',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
    appliedDate: '24 May 2024',
    status: 'Interview',
    progress: 65,
  },
  {
    id: '2',
    role: 'UI Designer Intern',
    company: 'Pixel Perfect',
    location: 'Douala, CM',
    logo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bde7?w=100&h=100&fit=crop',
    appliedDate: '12 May 2024',
    status: 'Reviewed',
    progress: 30,
  },
  {
    id: '3',
    role: 'Backend Engineer (Node.js)',
    company: 'DataSecure',
    location: 'Yaoundé, CM',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    appliedDate: '01 May 2024',
    status: 'Accepted',
    progress: 100,
  },
];

export const MOCK_JOBS: JobListing[] = [
  {
    id: 'j1',
    title: 'Machine Learning Intern',
    company: 'NeuroCore AI',
    location: 'Hybrid / Nairobi',
    logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&h=100&fit=crop',
    matchScore: 98,
    tags: ['Python', 'PyTorch', 'Data Science'],
    postedDate: '2 days ago',
  },
  {
    id: 'j2',
    title: 'Cloud Architect Intern',
    company: 'SkyScale',
    location: 'Remote',
    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop',
    matchScore: 85,
    tags: ['AWS', 'Terraform', 'DevOps'],
    postedDate: '5 days ago',
  },
  {
    id: 'j3',
    title: 'Product Management Intern',
    company: 'LaunchPad',
    location: 'Yaoundé, CM',
    logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
    matchScore: 72,
    tags: ['Agile', 'Jira', 'Strategy'],
    postedDate: '1 week ago',
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'Verification Fee', source: 'MTN Mobile Money', amount: 'XAF 5,000', status: 'Success', date: '2 mins ago', userInitials: 'JD' },
  { id: 't2', type: 'Premium Listing', source: 'Orange Money', amount: 'XAF 15,000', status: 'Success', date: '15 mins ago', userInitials: 'SK' },
  { id: 't3', type: 'Verification Fee', source: 'Visa Card', amount: 'XAF 5,000', status: 'Pending', date: '1 hour ago', userInitials: 'AL' },
];

export const MOCK_VERIFICATIONS: VerificationTask[] = [
  { id: 'v1', company: 'Build-IT Ltd', website: 'buildit.com', industry: 'Construction', submittedAt: '12:45 PM', status: 'Pending' },
  { id: 'v2', company: 'AgroConnect', website: 'agro.cm', industry: 'Agriculture', submittedAt: 'Yesterday', status: 'Under Investigation' },
];
