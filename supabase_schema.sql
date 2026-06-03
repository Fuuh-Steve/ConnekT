-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text unique,
  role text default 'student',
  full_name text,
  avatar_url text,
  cover_url text,
  bio text,
  location text,
  skills jsonb default '[]'::jsonb,
  experience jsonb default '[]'::jsonb,
  education jsonb default '[]'::jsonb,
  github_url text,
  linkedin_url text,
  twitter_url text,
  portfolio_url text,
  company_name text,
  company_logo text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create jobs table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company text not null,
  location text,
  logo text,
  description text,
  requirements text[],
  tags text[],
  posted_date timestamp with time zone default timezone('utc'::text, now()) not null,
  recruiter_id uuid references auth.users on delete cascade
);

-- Create applications table
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs on delete cascade,
  student_id uuid references auth.users on delete cascade,
  status text default 'Pending',
  resume_url text,
  cover_letter text,
  interview_details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, student_id)
);

-- Set up RLS
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = id);

-- Jobs Policies
create policy "Jobs are viewable by everyone" on public.jobs for select using (true);
create policy "Recruiters can insert jobs" on public.jobs for insert with check (auth.uid() = recruiter_id);
create policy "Recruiters can update own jobs" on public.jobs for update using (auth.uid() = recruiter_id);
create policy "Recruiters can delete own jobs" on public.jobs for delete using (auth.uid() = recruiter_id);

-- Applications Policies
create policy "Students can view own applications" on public.applications for select using (auth.uid() = student_id);
create policy "Recruiters can view applications for their jobs" on public.applications for select using (
  exists (
    select 1 from public.jobs 
    where id = public.applications.job_id 
    and recruiter_id = auth.uid()
  )
);
create policy "Students can apply for jobs" on public.applications for insert with check (auth.uid() = student_id);
create policy "Recruiters can update applications for their jobs" on public.applications for update using (
  exists (
    select 1 from public.jobs 
    where id = public.applications.job_id 
    and recruiter_id = auth.uid()
  )
);

-- Create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.user_metadata->>'role', new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.user_metadata->>'full_name', new.raw_user_meta_data->>'full_name'),
    coalesce(new.user_metadata->>'avatar_url', new.raw_user_meta_data->>'avatar_url')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to allow a user to delete their own account
create or replace function public.delete_user_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;

