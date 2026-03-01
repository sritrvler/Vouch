-- ============================================================
-- Vouch — Supabase Schema
-- Run this in Supabase SQL Editor after creating your project
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('active', 'inactive', 'past_due', 'cancelled')),
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- PROJECTS (a user can have multiple projects/businesses)
-- ============================================================
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique,
  website text,
  logo_url text,
  accent_color text default '#6366F1',
  google_review_url text,
  linkedin_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- COLLECTION FORMS
-- ============================================================
create table public.collection_forms (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Share your experience',
  description text,
  custom_questions text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now() not null
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
create table public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references public.collection_forms(id) on delete set null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  author_email text,
  author_role text,
  author_company text,
  author_avatar_url text,
  rating integer not null default 5 check (rating between 1 and 5),
  content text not null,
  enhanced_content text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  source text default 'form' check (source in ('form', 'import', 'manual')),
  source_url text,
  golden_sentence text,
  metric_label text,
  featured boolean default false,
  custom_answers jsonb default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- WIDGETS
-- ============================================================
create table public.widgets (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'My Widget',
  layout text not null default 'grid' check (layout in ('grid', 'carousel', 'wall', 'list', 'single')),
  theme jsonb default '{
    "primaryColor": "#6366F1",
    "backgroundColor": "#ffffff",
    "textColor": "#0f172a",
    "cardStyle": "shadow",
    "showRating": true,
    "showAvatar": true,
    "showDate": true,
    "showSource": false
  }',
  filter_mode text default 'all' check (filter_mode in ('all', 'featured', 'rating')),
  min_rating integer default 4,
  max_items integer default 12,
  hide_branding boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- ANALYTICS — Form views
-- ============================================================
create table public.form_views (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references public.collection_forms(id) on delete cascade not null,
  submitted boolean default false,
  referrer text,
  user_agent text,
  created_at timestamptz default now() not null
);

-- ============================================================
-- ANALYTICS — Widget views
-- ============================================================
create table public.widget_views (
  id uuid primary key default uuid_generate_v4(),
  widget_id uuid references public.widgets(id) on delete cascade not null,
  referrer text,
  user_agent text,
  created_at timestamptz default now() not null
);

-- ============================================================
-- INDEXES
-- ============================================================
create index on public.testimonials (user_id, status);
create index on public.testimonials (project_id, status);
create index on public.widget_views (widget_id, created_at);
create index on public.form_views (form_id, created_at);
create index on public.collection_forms (project_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.subscriptions enable row level security;
alter table public.projects enable row level security;
alter table public.collection_forms enable row level security;
alter table public.testimonials enable row level security;
alter table public.widgets enable row level security;
alter table public.form_views enable row level security;
alter table public.widget_views enable row level security;

-- Subscriptions: users manage their own
create policy "Users manage own subscription" on public.subscriptions
  for all using (auth.uid() = user_id);

-- Projects: users manage their own
create policy "Users manage own projects" on public.projects
  for all using (auth.uid() = user_id);

-- Forms: owners manage, public can view active forms
create policy "Owners manage forms" on public.collection_forms
  for all using (auth.uid() = user_id);
create policy "Public can view active forms" on public.collection_forms
  for select using (is_active = true);

-- Testimonials: owners manage, public can view approved
create policy "Owners manage testimonials" on public.testimonials
  for all using (auth.uid() = user_id);
create policy "Public can view approved testimonials" on public.testimonials
  for select using (status = 'approved');

-- Widgets: owners manage, public can read
create policy "Owners manage widgets" on public.widgets
  for all using (auth.uid() = user_id);
create policy "Public can read widgets" on public.widgets
  for select using (true);

-- Analytics: owners read, anyone can insert
create policy "Owners read form views" on public.form_views
  for select using (
    form_id in (select id from public.collection_forms where user_id = auth.uid())
  );
create policy "Anyone can insert form views" on public.form_views
  for insert with check (true);

create policy "Owners read widget views" on public.widget_views
  for select using (
    widget_id in (select id from public.widgets where user_id = auth.uid())
  );
create policy "Anyone can insert widget views" on public.widget_views
  for insert with check (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create subscription on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_updated_at before update on public.projects
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.testimonials
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.widgets
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();
