import { LucideIcon } from 'lucide-react';

export type UserRole = 'student' | 'recruiter' | 'admin' | 'guest';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  id: string;
  path?: string;
}

export type ApplicationStatus = 'Pending' | 'Reviewed' | 'Interview' | 'Accepted' | 'Rejected' | 'Offer Received';

export interface Application {
  id: string;
  role: string;
  company: string;
  location: string;
  logo: string;
  appliedDate: string;
  status: ApplicationStatus;
  progress: number; // 0-100
  interviewDetails?: any;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  logo: string;
  matchScore?: number;
  tags: string[];
  postedDate: string;
  description?: string;
  requirements?: string[];
  applicantsCount?: number;
}

export interface Transaction {
  id: string;
  type: string;
  source: string;
  amount: string;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
  userInitials: string;
}

export interface VerificationTask {
  id: string;
  company: string;
  website: string;
  industry: string;
  submittedAt: string;
  status: 'Pending' | 'Under Investigation' | 'Verified' | 'Rejected';
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  username?: string;
  role: UserRole;
  experience?: string[];
  education?: string[];
  skills?: string[];
  github_url?: string;
  linkedin_url?: string;
}

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  trend?: number | string;
  trendColor?: string;
  delay?: number;
  tooltip?: string;
}

export interface AdminStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  delay: number;
  prefix?: string;
  suffix?: string;
}

export interface MobileNavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}

export interface SettingInputProps {
  label: string;
  defaultValue: string;
  icon?: LucideIcon;
}

export interface ToggleSettingProps {
  icon?: LucideIcon;
  title: string;
  desc?: string;
  defaultChecked?: boolean;
  value?: string;
}

export interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isDanger?: boolean;
}

export interface JobCardProps extends JobListing {}
