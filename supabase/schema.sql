-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  role text not null check (role in ('admin', 'professional')) default 'professional',
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update their own profiles." on public.profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'professional'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  birthdate DATE,
  notes TEXT,
  hair_type TEXT DEFAULT 'Não especificado',
  hair_length TEXT DEFAULT 'Não especificado',
  hair_condition TEXT DEFAULT 'Não especificado',
  avatar_url TEXT,
  color_history JSONB DEFAULT '[]'::jsonb,
  chemical_history JSONB DEFAULT '[]'::jsonb,
  before_after_photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.clients FOR DELETE USING (true);

-- Professionals table
CREATE TABLE IF NOT EXISTS public.professionals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  specialties TEXT[] DEFAULT '{}'::text[],
  commission_rate NUMERIC DEFAULT 0.4,
  work_days TEXT[] DEFAULT '{}'::text[],
  work_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00"}'::jsonb,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON public.professionals FOR ALL USING (true);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration_minutes INT NOT NULL,
  commission_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON public.services FOR ALL USING (true);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id INT REFERENCES public.professionals(id) ON DELETE CASCADE,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status in ('Agendado', 'Confirmado', 'Em atendimento', 'Concluído', 'Cancelado')) DEFAULT 'Agendado',
  notes TEXT,
  services INT[] DEFAULT '{}'::integer[],
  products JSONB DEFAULT '[]'::jsonb,
  price_override NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.appointments FOR DELETE USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock_quantity INT NOT NULL,
  min_stock INT NOT NULL,
  expiry_date DATE,
  unit_cost NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON public.products FOR ALL USING (true);

-- Financial Entries table
CREATE TABLE IF NOT EXISTS public.financial_entries (
  id SERIAL PRIMARY KEY,
  type TEXT CHECK (type in ('Entrada', 'Saída')) NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT CHECK (payment_method in ('Dinheiro', 'Pix', 'Crédito', 'Débito', 'Misto')),
  appointment_id INT,
  net_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.financial_entries FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON public.financial_entries FOR ALL USING (true);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status in ('A fazer', 'Em andamento', 'Concluído')) DEFAULT 'A fazer',
  priority TEXT CHECK (priority in ('alta', 'média', 'baixa')) DEFAULT 'média',
  due_date TEXT,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON public.tasks FOR ALL USING (true);

-- Waiting List table
CREATE TABLE IF NOT EXISTS public.waiting_list (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id INT REFERENCES public.services(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.waiting_list FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON public.waiting_list FOR ALL USING (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  type TEXT CHECK (type in ('agendamento', 'estoque', 'aniversario', 'comissao', 'sistema')) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON public.notifications FOR ALL USING (true);
