-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create users table (extends auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create cars table
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  registration text not null,
  make text not null,
  model text not null,
  fuel_type text not null check (fuel_type in ('petrol')),
  tank_capacity_l numeric check (tank_capacity_l > 0),
  year integer check (year >= 1900 and year <= extract(year from now()) + 1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraints
  unique(owner_id, registration)
);

-- Create fuel_logs table
create table public.fuel_logs (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  filled_at date not null,
  odometer_km numeric not null check (odometer_km >= 0),
  liters numeric not null check (liters > 0),
  price_per_l numeric check (price_per_l > 0),
  total_cost numeric check (total_cost > 0),
  is_partial boolean default false not null,
  station text,
  notes text,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure either price_per_l or total_cost is provided
  constraint cost_presence check (price_per_l is not null or total_cost is not null)
);

-- Create indexes for better performance
create index fuel_logs_car_id_idx on public.fuel_logs(car_id);
create index fuel_logs_filled_at_idx on public.fuel_logs(filled_at desc);
create index cars_owner_id_idx on public.cars(owner_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger cars_updated_at
  before update on public.cars
  for each row execute function public.handle_updated_at();

create trigger fuel_logs_updated_at
  before update on public.fuel_logs
  for each row execute function public.handle_updated_at();

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.cars enable row level security;
alter table public.fuel_logs enable row level security;

-- RLS Policies for users table
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- RLS Policies for cars table
create policy "Users can view own cars"
  on public.cars for select
  using (auth.uid() = owner_id);

create policy "Users can insert own cars"
  on public.cars for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own cars"
  on public.cars for update
  using (auth.uid() = owner_id);

create policy "Users can delete own cars"
  on public.cars for delete
  using (auth.uid() = owner_id);

-- RLS Policies for fuel_logs table
create policy "Users can view fuel logs for own cars"
  on public.fuel_logs for select
  using (
    exists (
      select 1 from public.cars 
      where cars.id = fuel_logs.car_id 
      and cars.owner_id = auth.uid()
    )
  );

create policy "Users can insert fuel logs for own cars"
  on public.fuel_logs for insert
  with check (
    exists (
      select 1 from public.cars 
      where cars.id = fuel_logs.car_id 
      and cars.owner_id = auth.uid()
    )
  );

create policy "Users can update fuel logs for own cars"
  on public.fuel_logs for update
  using (
    exists (
      select 1 from public.cars 
      where cars.id = fuel_logs.car_id 
      and cars.owner_id = auth.uid()
    )
  );

create policy "Users can delete fuel logs for own cars"
  on public.fuel_logs for delete
  using (
    exists (
      select 1 from public.cars 
      where cars.id = fuel_logs.car_id 
      and cars.owner_id = auth.uid()
    )
  );

-- Create function to automatically create user profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
