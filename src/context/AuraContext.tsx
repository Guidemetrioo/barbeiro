"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Types
export interface ColorRecord {
  id: number;
  client_id: number;
  date: string;
  brand: string;
  number: string;
  oxidant: string;
  ratio: string;
  pause_time: string;
  notes: string;
}

export interface ChemRecord {
  id: number;
  client_id: number;
  date: string;
  procedure: string;
  product: string;
  result: string;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  birthdate: string;
  notes: string;
  hair_type: string;
  hair_length: string;
  hair_condition: string;
  avatar_url?: string;
  colorHistory: ColorRecord[];
  chemicalHistory: ChemRecord[];
  before_after_photos: { id: number; date: string; before: string; after: string }[];
}

export interface Professional {
  id: number;
  user_id?: string;
  name: string;
  phone: string;
  specialties: string[];
  commission_rate: number; // default commission rate e.g. 0.4 (40%)
  work_days: string[]; // ['Seg', 'Ter', ...]
  work_hours: { start: string; end: string };
  appointmentsCountThisMonth: number;
  commissionEarnedThisMonth: number;
  avatar_url?: string;
}

export interface Service {
  id: number;
  name: string;
  category: "Corte" | "Coloração" | "Tratamento" | "Estética" | "Unhas" | "Barba";
  price: number;
  duration_minutes: number;
  commission_rate?: number; // specific commission rate
}

export interface Appointment {
  id: number;
  client_id: number;
  professional_id: number;
  datetime: string; // ISO string e.g. "2026-06-17T10:00:00.000Z"
  status: "Agendado" | "Confirmado" | "Em atendimento" | "Concluído" | "Cancelado";
  notes?: string;
  services: number[]; // Service IDs
  products: { id: number; qty: number }[]; // products consumed
  price_override?: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  stock_quantity: number;
  min_stock: number;
  expiry_date: string;
  unit_cost: number;
}

export interface FinancialEntry {
  id: number;
  type: "Entrada" | "Saída";
  category: "Serviço" | "Produto" | "Fornecedor" | "Despesa" | "Outro";
  amount: number;
  description: string;
  date: string;
  payment_method?: "Dinheiro" | "Pix" | "Crédito" | "Débito" | "Misto";
  appointment_id?: number;
  net_amount?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "A fazer" | "Em andamento" | "Concluído";
  priority: "alta" | "média" | "baixa";
  due_date: string;
  assigned_to: string;
}

export interface Notification {
  id: number;
  type: "agendamento" | "estoque" | "aniversario" | "comissao" | "sistema";
  message: string;
  read: boolean;
  created_at: string;
}

interface AuraContextProps {
  clients: Client[];
  professionals: Professional[];
  services: Service[];
  appointments: Appointment[];
  products: Product[];
  financialEntries: FinancialEntry[];
  tasks: Task[];
  notifications: Notification[];
  waitingList: { id: number; client_id: number; service_id: number; notes?: string }[];
  
  // Actions
  addAppointment: (appt: Omit<Appointment, "id">) => Promise<void>;
  updateAppointmentStatus: (id: number, status: Appointment["status"], paymentMethod?: FinancialEntry["payment_method"]) => Promise<void>;
  addClient: (client: Omit<Client, "id" | "colorHistory" | "chemicalHistory" | "before_after_photos">) => Promise<number>;
  updateClientHair: (id: number, data: Partial<Pick<Client, "hair_type" | "hair_length" | "hair_condition" | "notes">>) => Promise<void>;
  addChemicalHistory: (client_id: number, record: Omit<ChemRecord, "id" | "client_id">) => Promise<void>;
  addColorHistory: (client_id: number, record: Omit<ColorRecord, "id" | "client_id">) => Promise<void>;
  addBeforeAfterPhoto: (client_id: number, before: string, after: string) => Promise<void>;
  addTransaction: (entry: Omit<FinancialEntry, "id">) => Promise<void>;
  moveTask: (id: number, newStatus: Task["status"]) => Promise<void>;
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  addWaitingList: (item: Omit<{ id: number; client_id: number; service_id: number; notes?: string }, "id">) => Promise<void>;
  removeFromWaitingList: (id: number) => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addService: (service: Omit<Service, "id">) => Promise<void>;
  updateService: (id: number, service: Partial<Service>) => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProductStock: (id: number, change: number) => Promise<void>;
  updateProfessional: (id: number, data: Partial<Professional>) => Promise<void>;
}

const AuraContext = createContext<AuraContextProps | undefined>(undefined);

export function AuraProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // States
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [waitingList, setWaitingList] = useState<{ id: number; client_id: number; service_id: number; notes?: string }[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(
      url &&
      url !== "https://your-project.supabase.co" &&
      !url.includes("your-project") &&
      key &&
      !key.includes("placeholder")
    );
  };

  const loadLocalMockData = () => {
    const mockProfs = [
      {
        id: 1,
        name: "Barbeiro 1",
        phone: "(11) 99111-2222",
        specialties: ["Corte Degradê", "Nevou", "Desenhos/Hair Tattoo"],
        commission_rate: 0.45,
        work_days: ["Ter", "Qua", "Qui", "Sex", "Sáb"],
        work_hours: { start: "09:00", end: "19:00" },
        appointmentsCountThisMonth: 12,
        commissionEarnedThisMonth: 450.00
      },
      {
        id: 2,
        name: "Barbeiro 2",
        phone: "(11) 99222-3333",
        specialties: ["Cortes Clássicos", "Selagem Capilar", "Barboterapia"],
        commission_rate: 0.40,
        work_days: ["Ter", "Qua", "Qui", "Sex", "Sáb"],
        work_hours: { start: "09:00", end: "20:00" },
        appointmentsCountThisMonth: 8,
        commissionEarnedThisMonth: 320.00
      },
      {
        id: 3,
        name: "Barbeiro 3",
        phone: "(11) 99333-4444",
        specialties: ["Corte Social", "Barba Toalha Quente", "Sobrancelha"],
        commission_rate: 0.35,
        work_days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        work_hours: { start: "08:00", end: "21:00" },
        appointmentsCountThisMonth: 15,
        commissionEarnedThisMonth: 280.00
      }
    ];
    setProfessionals(mockProfs);

    const mockServices: Service[] = [
      { id: 1, name: "Corte Degradê", category: "Corte", price: 70.00, duration_minutes: 40 },
      { id: 2, name: "Corte Social", category: "Corte", price: 60.00, duration_minutes: 30 },
      { id: 3, name: "Barba Premium", category: "Barba", price: 55.00, duration_minutes: 30 },
      { id: 4, name: "Combo Corte + Barba", category: "Corte", price: 110.00, duration_minutes: 70 },
      { id: 5, name: "Selagem Capilar", category: "Tratamento", price: 120.00, duration_minutes: 60 },
      { id: 6, name: "Nevou / Platinado", category: "Coloração", price: 180.00, duration_minutes: 150 },
      { id: 7, name: "Pigmentação de Barba", category: "Coloração", price: 45.00, duration_minutes: 25 },
      { id: 8, name: "Sobrancelha na Navalha", category: "Estética", price: 25.00, duration_minutes: 15 },
      { id: 9, name: "Barboterapia Completa", category: "Barba", price: 80.00, duration_minutes: 45 },
      { id: 10, name: "Massagem Capilar", category: "Tratamento", price: 40.00, duration_minutes: 20 }
    ];
    setServices(mockServices);

    const mockProducts: Product[] = [
      { id: 1, name: "Pomada Matte Efeito Seco 150g", category: "Finalizadores", stock_quantity: 20, min_stock: 5, expiry_date: "2027-02-15", unit_cost: 25.00 },
      { id: 2, name: "Pó Descolorante Blond Barber 500g", category: "Coloração", stock_quantity: 8, min_stock: 4, expiry_date: "2026-07-10", unit_cost: 65.00 },
      { id: 3, name: "Lâminas Derby Premium (Caixa)", category: "Descartáveis", stock_quantity: 12, min_stock: 10, expiry_date: "2030-01-01", unit_cost: 35.00 },
      { id: 4, name: "Óleo para Barba Wood & Spice 30ml", category: "Finalizadores", stock_quantity: 3, min_stock: 3, expiry_date: "2027-04-20", unit_cost: 30.00 },
      { id: 5, name: "Pigmentação Bigen Preto 6g", category: "Coloração", stock_quantity: 24, min_stock: 15, expiry_date: "2026-06-30", unit_cost: 20.00 },
      { id: 6, name: "Loção Pós-Barba Bay Rum 100ml", category: "Finalizadores", stock_quantity: 4, min_stock: 5, expiry_date: "2028-10-12", unit_cost: 45.00 }
    ];
    setProducts(mockProducts);

    const mockClients: Client[] = [
      {
        id: 1,
        name: "Bruno Souza",
        phone: "(11) 98765-4321",
        email: "bruno.souza@gmail.com",
        birthdate: "1994-06-17",
        notes: "Prefere café expresso. Gosta de risco na sobrancelha.",
        hair_type: "Cabelo Ondulado (2A)",
        hair_length: "Curto (Degradê)",
        hair_condition: "Saudável, couro cabeludo oleoso",
        colorHistory: [
          { id: 101, client_id: 1, date: "2026-03-10", brand: "Bigen", number: "Preto 101", oxidant: "Água", ratio: "1:1", pause_time: "15 min", notes: "Pigmentação perfeita para alinhar barba." }
        ],
        chemicalHistory: [
          { id: 201, client_id: 1, date: "2025-11-15", procedure: "Selagem Masculina", product: "Liss Barber", result: "Fios disciplinados e macios." }
        ],
        before_after_photos: [
          { id: 301, date: "2026-03-10", before: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=400", after: "https://images.unsplash.com/photo-1595959183075-c1d09e77b64d?q=80&w=400" }
        ]
      },
      {
        id: 2,
        name: "Carlos Eduardo Santos",
        phone: "(11) 97654-3210",
        email: "cadu.santos@outlook.com",
        birthdate: "1988-10-05",
        notes: "Sempre corta degrade na navalha. Usa pomada matte.",
        hair_type: "Grosso Crespo",
        hair_length: "Curto",
        hair_condition: "Normal",
        colorHistory: [],
        chemicalHistory: [],
        before_after_photos: []
      },
      {
        id: 3,
        name: "Thiago Lima",
        phone: "(11) 96543-2109",
        email: "thiago.lima@yahoo.com.br",
        birthdate: "1992-06-25",
        notes: "Fazer teste de mecha sempre antes de descolorir.",
        hair_type: "Liso Grosso",
        hair_length: "Médio",
        hair_condition: "Danificado por descoloração antiga",
        colorHistory: [
          { id: 102, client_id: 3, date: "2026-04-12", brand: "Blond Barber", number: "10.11", oxidant: "30 vol", ratio: "1:2", pause_time: "50 min", notes: "Luzes platinadas efeito nevou." }
        ],
        chemicalHistory: [
          { id: 202, client_id: 3, date: "2026-04-12", procedure: "Platinado Global", product: "Blond Pro", result: "Tom platinado sem quebra de fibra." }
        ],
        before_after_photos: []
      }
    ];
    setClients(mockClients);

    const mockAppts: Appointment[] = [
      {
        id: 1,
        client_id: 1,
        professional_id: 1,
        datetime: getTodayISO("10:00"),
        status: "Concluído",
        services: [1, 8],
        products: [{ id: 3, qty: 1 }],
        notes: "Gosta de risco na sobrancelha."
      },
      {
        id: 2,
        client_id: 2,
        professional_id: 3,
        datetime: getTodayISO("14:00"),
        status: "Confirmado",
        services: [1, 3],
        products: [{ id: 3, qty: 1 }],
        notes: "Gosta de corte degrade navalhado."
      }
    ];
    setAppointments(mockAppts);

    const mockFinances: FinancialEntry[] = [
      { id: 1, type: "Entrada", category: "Serviço", amount: 95.00, description: "Atendimento Concluído - Bruno Souza", date: new Date().toISOString(), payment_method: "Pix", net_amount: 95.00 }
    ];
    setFinancialEntries(mockFinances);

    const mockTasks: Task[] = [
      { id: 1, title: "Organizar armário de químicos", description: "Verificar validades e agrupar por numeração.", status: "A fazer", priority: "média", due_date: "Hoje, 19:00", assigned_to: "Barbeiro 2" }
    ];
    setTasks(mockTasks);

    const mockWaitingList: { id: number; client_id: number; service_id: number; notes?: string }[] = [];
    setWaitingList(mockWaitingList);

    const mockNotifs = [
      { id: 1, type: "sistema" as const, message: "Sistema Aura iniciado no modo de demonstração local. Conecte ao Supabase para produção.", read: false, created_at: new Date().toISOString() }
    ];
    setNotifications(mockNotifs);
  };

  // Helper date generator for today's date
  const getTodayISO = (hourStr: string) => {
    const today = new Date();
    const [h, m] = hourStr.split(":");
    today.setHours(parseInt(h), parseInt(m), 0, 0);
    return today.toISOString();
  };

  // Seeding method if database is empty
  const seedDatabase = async () => {
    // 1. Seed Professionals
    const { data: profs } = await supabase.from("professionals").select("*");
    if (!profs || profs.length === 0) {
      const initialProfs = [
        {
          name: "Barbeiro 1",
          phone: "(11) 99111-2222",
          specialties: ["Corte Degradê", "Nevou", "Desenhos/Hair Tattoo"],
          commission_rate: 0.45,
          work_days: ["Ter", "Qua", "Qui", "Sex", "Sáb"],
          work_hours: { start: "09:00", end: "19:00" },
        },
        {
          name: "Barbeiro 2",
          phone: "(11) 99222-3333",
          specialties: ["Cortes Clássicos", "Selagem Capilar", "Barboterapia"],
          commission_rate: 0.40,
          work_days: ["Ter", "Qua", "Qui", "Sex", "Sáb"],
          work_hours: { start: "09:00", end: "20:00" },
        },
        {
          name: "Barbeiro 3",
          phone: "(11) 99333-4444",
          specialties: ["Corte Social", "Barba Toalha Quente", "Sobrancelha"],
          commission_rate: 0.35,
          work_days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
          work_hours: { start: "08:00", end: "21:00" },
        }
      ];
      await supabase.from("professionals").insert(initialProfs);
    }

    // 2. Seed Services
    const { data: svcs } = await supabase.from("services").select("*");
    if (!svcs || svcs.length === 0) {
      const initialServices = [
        { name: "Corte Degradê", category: "Corte", price: 70.00, duration_minutes: 40 },
        { name: "Corte Social", category: "Corte", price: 60.00, duration_minutes: 30 },
        { name: "Barba Premium", category: "Barba", price: 55.00, duration_minutes: 30 },
        { name: "Combo Corte + Barba", category: "Corte", price: 110.00, duration_minutes: 70 },
        { name: "Selagem Capilar", category: "Tratamento", price: 120.00, duration_minutes: 60 },
        { name: "Nevou / Platinado", category: "Coloração", price: 180.00, duration_minutes: 150 },
        { name: "Pigmentação de Barba", category: "Coloração", price: 45.00, duration_minutes: 25 },
        { name: "Sobrancelha na Navalha", category: "Estética", price: 25.00, duration_minutes: 15 },
        { name: "Barboterapia Completa", category: "Barba", price: 80.00, duration_minutes: 45 },
        { name: "Massagem Capilar", category: "Tratamento", price: 40.00, duration_minutes: 20 }
      ];
      await supabase.from("services").insert(initialServices);
    }

    // 3. Seed Products
    const { data: prods } = await supabase.from("products").select("*");
    if (!prods || prods.length === 0) {
      const initialProducts = [
        { name: "Pomada Matte Efeito Seco 150g", category: "Finalizadores", stock_quantity: 20, min_stock: 5, expiry_date: "2027-02-15", unit_cost: 25.00 },
        { name: "Pó Descolorante Blond Barber 500g", category: "Coloração", stock_quantity: 8, min_stock: 4, expiry_date: "2026-07-10", unit_cost: 65.00 },
        { name: "Lâminas Derby Premium (Caixa)", category: "Descartáveis", stock_quantity: 12, min_stock: 10, expiry_date: "2030-01-01", unit_cost: 35.00 },
        { name: "Óleo para Barba Wood & Spice 30ml", category: "Finalizadores", stock_quantity: 3, min_stock: 3, expiry_date: "2027-04-20", unit_cost: 30.00 },
        { name: "Pigmentação Bigen Preto 6g", category: "Coloração", stock_quantity: 24, min_stock: 15, expiry_date: "2026-06-30", unit_cost: 20.00 },
        { name: "Loção Pós-Barba Bay Rum 100ml", category: "Finalizadores", stock_quantity: 4, min_stock: 5, expiry_date: "2028-10-12", unit_cost: 45.00 }
      ];
      await supabase.from("products").insert(initialProducts);
    }

    // 4. Seed Clients
    const { data: cls } = await supabase.from("clients").select("*");
    if (!cls || cls.length === 0) {
      const initialClients = [
        {
          name: "Bruno Souza",
          phone: "(11) 98765-4321",
          email: "bruno.souza@gmail.com",
          birthdate: "1994-06-17",
          notes: "Prefere café expresso. Gosta de risco na sobrancelha.",
          hair_type: "Cabelo Ondulado (2A)",
          hair_length: "Curto (Degradê)",
          hair_condition: "Saudável, couro cabeludo oleoso",
          color_history: [
            { id: 101, client_id: 1, date: "2026-03-10", brand: "Bigen", number: "Preto 101", oxidant: "Água", ratio: "1:1", pause_time: "15 min", notes: "Pigmentação perfeita para alinhar barba." }
          ],
          chemical_history: [
            { id: 201, client_id: 1, date: "2025-11-15", procedure: "Selagem Masculina", product: "Liss Barber", result: "Fios disciplinados e macios." }
          ],
          before_after_photos: [
            { id: 301, date: "2026-03-10", before: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=400", after: "https://images.unsplash.com/photo-1595959183075-c1d09e77b64d?q=80&w=400" }
          ]
        },
        {
          name: "Carlos Eduardo Santos",
          phone: "(11) 97654-3210",
          email: "cadu.santos@outlook.com",
          birthdate: "1988-10-05",
          notes: "Sempre corta degrade na navalha. Usa pomada matte.",
          hair_type: "Grosso Crespo",
          hair_length: "Curto",
          hair_condition: "Normal"
        },
        {
          name: "Thiago Lima",
          phone: "(11) 96543-2109",
          email: "thiago.lima@yahoo.com.br",
          birthdate: "1992-06-25",
          notes: "Fazer teste de mecha sempre antes de descolorir.",
          hair_type: "Liso Grosso",
          hair_length: "Médio",
          hair_condition: "Danificado por descoloração antiga",
          color_history: [
            { id: 102, client_id: 3, date: "2026-04-12", brand: "Blond Barber", number: "10.11", oxidant: "30 vol", ratio: "1:2", pause_time: "50 min", notes: "Luzes platinadas efeito nevou." }
          ],
          chemical_history: [
            { id: 202, client_id: 3, date: "2026-04-12", procedure: "Platinado Global", product: "Blond Pro", result: "Tom platinado sem quebra de fibra." }
          ]
        },
        {
          name: "Marcelo Rodrigues",
          phone: "(11) 95432-1098",
          email: "marcelo.r@gmail.com",
          birthdate: "2000-02-12",
          notes: "Barba longa e espessa, prefere usar balm hidratante.",
          hair_type: "Barba Ondulada",
          hair_length: "Longo (Barba)",
          hair_condition: "Fios ressecados"
        },
        {
          name: "Gabriel Santos",
          phone: "(11) 94321-0987",
          email: "gabriel.santos@gmail.com",
          birthdate: "1995-07-29",
          notes: "Alérgico a produtos pós-barba com álcool.",
          hair_type: "Crespo Volumoso",
          hair_length: "Curto",
          hair_condition: "Saudável"
        },
        {
          name: "Amanda Costa",
          phone: "(11) 93210-9876",
          email: "amanda.costa@outlook.com",
          birthdate: "1991-04-03",
          notes: "Corte Pixie curtinho raspado na nuca.",
          hair_type: "Liso Fino",
          hair_length: "Muito Curto",
          hair_condition: "Saudável",
          chemical_history: [
            { id: 203, client_id: 6, date: "2026-02-10", procedure: "Reconstrução Capilar", product: "Keratin Barber", result: "Fios restaurados e brilhantes." }
          ]
        },
        {
          name: "Roberto Almeida",
          phone: "(11) 92109-8765",
          email: "roberto.almeida@gmail.com",
          birthdate: "1975-12-18",
          notes: "Corte clássico social apenas na tesoura.",
          hair_type: "Liso Grisalho",
          hair_length: "Curto",
          hair_condition: "Fios finos"
        },
        {
          name: "Fernanda Oliveira",
          phone: "(11) 91098-7654",
          email: "fernanda.o@gmail.com",
          birthdate: "1993-08-14",
          notes: "Cabelo curto raspado na lateral (sidecut).",
          hair_type: "Ondulado (2B)",
          hair_length: "Curto",
          hair_condition: "Normal"
        }
      ];
      await supabase.from("clients").insert(initialClients);
    }
    
    // 5. Seed Appointments
    const { data: appts } = await supabase.from("appointments").select("*");
    if (!appts || appts.length === 0) {
      const { data: dbClients } = await supabase.from("clients").select("id, name");
      const { data: dbProfs } = await supabase.from("professionals").select("id, name");
      
      const enzoId = dbProfs?.find(p => p.name.includes("Barbeiro 1"))?.id || 1;
      const carolId = dbProfs?.find(p => p.name.includes("Barbeiro 2"))?.id || 2;
      const marcosId = dbProfs?.find(p => p.name.includes("Barbeiro 3"))?.id || 3;
      
      const brunoId = dbClients?.find(c => c.name === "Bruno Souza")?.id || 1;
      const carlosId = dbClients?.find(c => c.name === "Carlos Eduardo Santos")?.id || 2;
      const thiagoId = dbClients?.find(c => c.name === "Thiago Lima")?.id || 3;
      const marceloId = dbClients?.find(c => c.name === "Marcelo Rodrigues")?.id || 4;
      const fernandaId = dbClients?.find(c => c.name === "Fernanda Oliveira")?.id || 8;

      const initialAppts = [
        {
          client_id: brunoId,
          professional_id: enzoId,
          datetime: getTodayISO("10:00"),
          status: "Concluído",
          services: [1, 8],
          products: [{ id: 3, qty: 1 }],
          notes: "Gosta de risco na sobrancelha."
        },
        {
          client_id: carlosId,
          professional_id: marcosId,
          datetime: getTodayISO("14:00"),
          status: "Confirmado",
          services: [1, 3],
          products: [{ id: 3, qty: 1 }],
          notes: "Gosta de corte degrade navalhado."
        },
        {
          client_id: thiagoId,
          professional_id: enzoId,
          datetime: getTodayISO("15:00"),
          status: "Em atendimento",
          services: [6],
          products: [{ id: 2, qty: 1 }],
          notes: "Cabelo resistente. Quer efeito bem platinado."
        },
        {
          client_id: marceloId,
          professional_id: carolId,
          datetime: getTodayISO("16:30"),
          status: "Agendado",
          services: [2],
          products: [],
          notes: "Cortar baixo nas laterais."
        },
        {
          client_id: fernandaId,
          professional_id: carolId,
          datetime: getTodayISO("11:30"),
          status: "Cancelado",
          services: [9],
          products: [],
          notes: "Desmarcou por conta de imprevisto comercial."
        }
      ];
      await supabase.from("appointments").insert(initialAppts);
    }
  };

  const fetchAllData = async () => {
    if (!isSupabaseConfigured()) {
      loadLocalMockData();
      return;
    }
    try {
      await seedDatabase();

      // Clients
      const { data: dbClients } = await supabase.from("clients").select("*").order("name", { ascending: true });
      if (dbClients) {
        setClients(dbClients.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || "",
          birthdate: c.birthdate || "",
          notes: c.notes || "",
          hair_type: c.hair_type || "Não especificado",
          hair_length: c.hair_length || "Não especificado",
          hair_condition: c.hair_condition || "Não especificado",
          avatar_url: c.avatar_url || undefined,
          colorHistory: c.color_history || [],
          chemicalHistory: c.chemical_history || [],
          before_after_photos: c.before_after_photos || []
        })));
      }

      // Professionals
      const { data: dbProfs } = await supabase.from("professionals").select("*").order("id", { ascending: true });
      if (dbProfs) {
        setProfessionals(dbProfs.map((p: any) => ({
          id: p.id,
          name: p.name,
          phone: p.phone || "",
          specialties: p.specialties || [],
          commission_rate: p.commission_rate || 0.4,
          work_days: p.work_days || [],
          work_hours: p.work_hours || { start: "09:00", end: "18:00" },
          appointmentsCountThisMonth: 0,
          commissionEarnedThisMonth: 0,
          avatar_url: p.avatar_url || undefined
        })));
      }

      // Services
      const { data: dbServices } = await supabase.from("services").select("*").order("id", { ascending: true });
      if (dbServices) setServices(dbServices);

      // Appointments
      const { data: dbAppts } = await supabase.from("appointments").select("*").order("datetime", { ascending: false });
      if (dbAppts) setAppointments(dbAppts);

      // Products
      const { data: dbProducts } = await supabase.from("products").select("*").order("name", { ascending: true });
      if (dbProducts) setProducts(dbProducts);

      // Financial
      const { data: dbFinancial } = await supabase.from("financial_entries").select("*").order("date", { ascending: false });
      if (dbFinancial) setFinancialEntries(dbFinancial);

      // Tasks
      const { data: dbTasks } = await supabase.from("tasks").select("*").order("id", { ascending: true });
      if (dbTasks) setTasks(dbTasks);

      // Waiting List
      const { data: dbWaiting } = await supabase.from("waiting_list").select("*").order("id", { ascending: true });
      if (dbWaiting) setWaitingList(dbWaiting);

      // Notifications
      const { data: dbNotifications } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (dbNotifications) setNotifications(dbNotifications);

    } catch (e) {
      console.error("Error loading data from Supabase:", e);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Action implementations
  const addAppointment = async (appt: Omit<Appointment, "id">) => {
    if (!isSupabaseConfigured()) {
      const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
      const newAppt = { id: newId, ...appt };
      setAppointments(prev => [newAppt, ...prev]);

      const client = clients.find(c => c.id === appt.client_id);
      const professional = professionals.find(p => p.id === appt.professional_id);
      const newNotif = {
        id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
        type: "agendamento" as const,
        message: `Novo agendamento: ${client?.name || "Cliente"} com ${professional?.name || "Profissional"}.`,
        read: false,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
      return;
    }
    const { data, error } = await supabase.from("appointments").insert({
      client_id: appt.client_id,
      professional_id: appt.professional_id,
      datetime: appt.datetime,
      status: appt.status || "Agendado",
      services: appt.services,
      products: appt.products,
      price_override: appt.price_override,
      notes: appt.notes
    }).select();

    if (data && data[0]) {
      setAppointments(prev => [data[0], ...prev]);

      const client = clients.find(c => c.id === appt.client_id);
      const professional = professionals.find(p => p.id === appt.professional_id);
      
      const newNotif = {
        type: "agendamento" as const,
        message: `Novo agendamento: ${client?.name || "Cliente"} com ${professional?.name || "Profissional"}.`,
        read: false
      };
      
      const { data: dbNotif } = await supabase.from("notifications").insert(newNotif).select();
      if (dbNotif && dbNotif[0]) {
        setNotifications(prev => [dbNotif[0], ...prev]);
      }
    }
  };

  const updateAppointmentStatus = async (
    id: number,
    status: Appointment["status"],
    paymentMethod?: FinancialEntry["payment_method"]
  ) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;

    if (!isSupabaseConfigured()) {
      setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));

      if (status === "Concluído" && appt.status !== "Concluído") {
        let totalPrice = appt.price_override || 0;
        if (totalPrice === 0) {
          appt.services.forEach(svcId => {
            const svc = services.find(s => s.id === svcId);
            if (svc) totalPrice += svc.price;
          });
        }

        const client = clients.find(c => c.id === appt.client_id);
        const payment = paymentMethod || "Pix";
        let machineFee = 0;
        if (payment === "Crédito") machineFee = totalPrice * 0.03;
        if (payment === "Débito") machineFee = totalPrice * 0.015;
        const net = totalPrice - machineFee;

        const newEntry = {
          id: financialEntries.length > 0 ? Math.max(...financialEntries.map(f => f.id)) + 1 : 1,
          type: "Entrada" as const,
          category: "Serviço" as const,
          amount: totalPrice,
          description: `Atendimento Concluído - ${client?.name || "Cliente"}`,
          date: new Date().toISOString(),
          payment_method: payment,
          net_amount: parseFloat(net.toFixed(2)),
          appointment_id: id
        };

        setFinancialEntries(prevFin => [newEntry, ...prevFin]);

        const professional = professionals.find(p => p.id === appt.professional_id);
        if (professional) {
          let totalCommission = 0;
          appt.services.forEach(svcId => {
            const svc = services.find(s => s.id === svcId);
            if (svc) {
              const rate = svc.commission_rate || professional.commission_rate;
              totalCommission += svc.price * rate;
            }
          });

          // Update professional locally
          setProfessionals(prevProfs => prevProfs.map(p => {
            if (p.id !== professional.id) return p;
            return {
              ...p,
              appointmentsCountThisMonth: p.appointmentsCountThisMonth + 1,
              commissionEarnedThisMonth: p.commissionEarnedThisMonth + totalCommission
            };
          }));

          const newNotif = {
            id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
            type: "comissao" as const,
            message: `Comissão calculada: +R$ ${totalCommission.toFixed(2)} para ${professional.name}.`,
            read: false,
            created_at: new Date().toISOString()
          };
          setNotifications(prevNotifs => [newNotif, ...prevNotifs]);
        }

        appt.products.forEach((pUse) => {
          const prod = products.find(p => p.id === pUse.id);
          if (prod) {
            const newQty = Math.max(0, prod.stock_quantity - pUse.qty);
            setProducts(prevProducts => prevProducts.map(p => (p.id === pUse.id ? { ...p, stock_quantity: newQty } : p)));
          }
        });
      }
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .select();

    if (data && data[0]) {
      setAppointments(prev => prev.map(a => (a.id === id ? data[0] : a)));

      if (status === "Concluído" && appt.status !== "Concluído") {
        let totalPrice = appt.price_override || 0;
        if (totalPrice === 0) {
          appt.services.forEach(svcId => {
            const svc = services.find(s => s.id === svcId);
            if (svc) totalPrice += svc.price;
          });
        }

        const client = clients.find(c => c.id === appt.client_id);
        const payment = paymentMethod || "Pix";
        let machineFee = 0;
        if (payment === "Crédito") machineFee = totalPrice * 0.03;
        if (payment === "Débito") machineFee = totalPrice * 0.015;
        const net = totalPrice - machineFee;

        const newEntry = {
          type: "Entrada" as const,
          category: "Serviço",
          amount: totalPrice,
          description: `Atendimento Concluído - ${client?.name || "Cliente"}`,
          date: new Date().toISOString(),
          payment_method: payment,
          net_amount: parseFloat(net.toFixed(2)),
          appointment_id: id
        };

        const { data: dbFin } = await supabase.from("financial_entries").insert(newEntry).select();
        if (dbFin && dbFin[0]) {
          setFinancialEntries(prevFin => [dbFin[0], ...prevFin]);
        }

        const professional = professionals.find(p => p.id === appt.professional_id);
        if (professional) {
          let totalCommission = 0;
          appt.services.forEach(svcId => {
            const svc = services.find(s => s.id === svcId);
            if (svc) {
              const rate = svc.commission_rate || professional.commission_rate;
              totalCommission += svc.price * rate;
            }
          });

          const newNotif = {
            type: "comissao" as const,
            message: `Comissão calculada: +R$ ${totalCommission.toFixed(2)} para ${professional.name}.`,
            read: false
          };
          const { data: dbNotif } = await supabase.from("notifications").insert(newNotif).select();
          if (dbNotif && dbNotif[0]) {
            setNotifications(prevNotifs => [dbNotif[0], ...prevNotifs]);
          }
        }

        appt.products.forEach(async (pUse) => {
          const prod = products.find(p => p.id === pUse.id);
          if (prod) {
            const newQty = Math.max(0, prod.stock_quantity - pUse.qty);
            const { data: dbProd } = await supabase
              .from("products")
              .update({ stock_quantity: newQty })
              .eq("id", pUse.id)
              .select();
            
            if (dbProd && dbProd[0]) {
              setProducts(prevProducts => prevProducts.map(p => (p.id === pUse.id ? dbProd[0] : p)));

              if (newQty <= prod.min_stock) {
                const stockNotif = {
                  type: "estoque" as const,
                  message: `Estoque crítico: ${prod.name} está com ${newQty} itens. Mínimo: ${prod.min_stock}`,
                  read: false
                };
                const { data: dbNotif } = await supabase.from("notifications").insert(stockNotif).select();
                if (dbNotif && dbNotif[0]) {
                  setNotifications(prev => [dbNotif[0], ...prev]);
                }
              }
            }
          }
        });
      }
    }
  };

  const addClient = async (client: Omit<Client, "id" | "colorHistory" | "chemicalHistory" | "before_after_photos">) => {
    if (!isSupabaseConfigured()) {
      const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
      const mappedClient: Client = {
        id: newId,
        name: client.name,
        phone: client.phone,
        email: client.email || "",
        birthdate: client.birthdate || "",
        notes: client.notes || "",
        hair_type: client.hair_type || "Não especificado",
        hair_length: client.hair_length || "Não especificado",
        hair_condition: client.hair_condition || "Não especificado",
        avatar_url: client.avatar_url,
        colorHistory: [],
        chemicalHistory: [],
        before_after_photos: []
      };
      setClients(prev => [...prev, mappedClient]);
      return newId;
    }

    const { data, error } = await supabase.from("clients").insert({
      name: client.name,
      phone: client.phone,
      email: client.email,
      birthdate: client.birthdate,
      notes: client.notes,
      hair_type: client.hair_type,
      hair_length: client.hair_length,
      hair_condition: client.hair_condition,
      avatar_url: client.avatar_url,
      color_history: [],
      chemical_history: [],
      before_after_photos: []
    }).select();

    if (data && data[0]) {
      const mappedClient: Client = {
        id: data[0].id,
        name: data[0].name,
        phone: data[0].phone,
        email: data[0].email || "",
        birthdate: data[0].birthdate || "",
        notes: data[0].notes || "",
        hair_type: data[0].hair_type || "Não especificado",
        hair_length: data[0].hair_length || "Não especificado",
        hair_condition: data[0].hair_condition || "Não especificado",
        avatar_url: data[0].avatar_url || undefined,
        colorHistory: data[0].color_history || [],
        chemicalHistory: data[0].chemical_history || [],
        before_after_photos: data[0].before_after_photos || []
      };
      setClients(prev => [...prev, mappedClient]);
      return data[0].id;
    }
    return 0;
  };

  const updateClientHair = async (id: number, data: Partial<Pick<Client, "hair_type" | "hair_length" | "hair_condition" | "notes">>) => {
    if (!isSupabaseConfigured()) {
      setClients(prev =>
        prev.map(c => {
          if (c.id !== id) return c;
          return {
            ...c,
            hair_type: data.hair_type !== undefined ? data.hair_type : c.hair_type,
            hair_length: data.hair_length !== undefined ? data.hair_length : c.hair_length,
            hair_condition: data.hair_condition !== undefined ? data.hair_condition : c.hair_condition,
            notes: data.notes !== undefined ? data.notes : c.notes
          };
        })
      );
      return;
    }
    const { data: dbClient, error } = await supabase
      .from("clients")
      .update({
        hair_type: data.hair_type,
        hair_length: data.hair_length,
        hair_condition: data.hair_condition,
        notes: data.notes
      })
      .eq("id", id)
      .select();

    if (dbClient && dbClient[0]) {
      setClients(prev =>
        prev.map(c => {
          if (c.id !== id) return c;
          return {
            ...c,
            hair_type: dbClient[0].hair_type,
            hair_length: dbClient[0].hair_length,
            hair_condition: dbClient[0].hair_condition,
            notes: dbClient[0].notes
          };
        })
      );
    }
  };

  const addChemicalHistory = async (client_id: number, record: Omit<ChemRecord, "id" | "client_id">) => {
    const c = clients.find(cl => cl.id === client_id);
    if (!c) return;

    if (!isSupabaseConfigured()) {
      const newId = c.chemicalHistory.length > 0 ? Math.max(...c.chemicalHistory.map(ch => ch.id)) + 1 : 201;
      const newRecord: ChemRecord = { id: newId, client_id, date: record.date, procedure: record.procedure, product: record.product, result: record.result };
      setClients(prev =>
        prev.map(cl => {
          if (cl.id !== client_id) return cl;
          return { ...cl, chemicalHistory: [newRecord, ...cl.chemicalHistory] };
        })
      );
      return;
    }

    const newId = c.chemicalHistory.length > 0 ? Math.max(...c.chemicalHistory.map(ch => ch.id)) + 1 : 201;
    const newRecord = { id: newId, date: record.date, procedure: record.procedure, product: record.product, result: record.result };
    const updatedHistory = [newRecord, ...c.chemicalHistory];

    const { data: dbClient, error } = await supabase
      .from("clients")
      .update({ chemical_history: updatedHistory })
      .eq("id", client_id)
      .select();

    if (dbClient && dbClient[0]) {
      setClients(prev =>
        prev.map(cl => {
          if (cl.id !== client_id) return cl;
          return { ...cl, chemicalHistory: dbClient[0].chemical_history };
        })
      );
    }
  };

  const addColorHistory = async (client_id: number, record: Omit<ColorRecord, "id" | "client_id">) => {
    const c = clients.find(cl => cl.id === client_id);
    if (!c) return;

    if (!isSupabaseConfigured()) {
      const newId = c.colorHistory.length > 0 ? Math.max(...c.colorHistory.map(co => co.id)) + 1 : 101;
      const newRecord: ColorRecord = { id: newId, client_id, date: record.date, brand: record.brand, number: record.number, oxidant: record.oxidant, ratio: record.ratio, pause_time: record.pause_time, notes: record.notes };
      setClients(prev =>
        prev.map(cl => {
          if (cl.id !== client_id) return cl;
          return { ...cl, colorHistory: [newRecord, ...cl.colorHistory] };
        })
      );
      return;
    }

    const newId = c.colorHistory.length > 0 ? Math.max(...c.colorHistory.map(co => co.id)) + 1 : 101;
    const newRecord = { id: newId, date: record.date, brand: record.brand, number: record.number, oxidant: record.oxidant, ratio: record.ratio, pause_time: record.pause_time, notes: record.notes };
    const updatedHistory = [newRecord, ...c.colorHistory];

    const { data: dbClient, error } = await supabase
      .from("clients")
      .update({ color_history: updatedHistory })
      .eq("id", client_id)
      .select();

    if (dbClient && dbClient[0]) {
      setClients(prev =>
        prev.map(cl => {
          if (cl.id !== client_id) return cl;
          return { ...cl, colorHistory: dbClient[0].color_history };
        })
      );
    }
  };

  const addBeforeAfterPhoto = async (client_id: number, before: string, after: string) => {
    const c = clients.find(cl => cl.id === client_id);
    if (!c) return;

    if (!isSupabaseConfigured()) {
      const newId = c.before_after_photos.length > 0 ? Math.max(...c.before_after_photos.map(p => p.id)) + 1 : 301;
      const newPhoto = { id: newId, date: new Date().toISOString().split("T")[0], before, after };
      setClients(prev =>
        prev.map(cl => {
          if (cl.id !== client_id) return cl;
          return { ...cl, before_after_photos: [newPhoto, ...cl.before_after_photos] };
        })
      );
      return;
    }

    const newId = c.before_after_photos.length > 0 ? Math.max(...c.before_after_photos.map(p => p.id)) + 1 : 301;
    const newPhoto = { id: newId, date: new Date().toISOString().split("T")[0], before, after };
    const updatedHistory = [newPhoto, ...c.before_after_photos];

    const { data: dbClient, error } = await supabase
      .from("clients")
      .update({ before_after_photos: updatedHistory })
      .eq("id", client_id)
      .select();

    if (dbClient && dbClient[0]) {
      setClients(prev =>
        prev.map(cl => {
          if (cl.id !== client_id) return cl;
          return { ...cl, before_after_photos: dbClient[0].before_after_photos };
        })
      );
    }
  };

  const addTransaction = async (entry: Omit<FinancialEntry, "id">) => {
    if (!isSupabaseConfigured()) {
      const newId = financialEntries.length > 0 ? Math.max(...financialEntries.map(f => f.id)) + 1 : 1;
      const newEntry = { id: newId, ...entry, net_amount: entry.net_amount || entry.amount };
      setFinancialEntries(prev => [newEntry, ...prev]);
      return;
    }
    const { data, error } = await supabase.from("financial_entries").insert({
      type: entry.type,
      category: entry.category,
      amount: entry.amount,
      description: entry.description,
      date: entry.date,
      payment_method: entry.payment_method,
      appointment_id: entry.appointment_id,
      net_amount: entry.net_amount
    }).select();

    if (data && data[0]) {
      setFinancialEntries(prev => [data[0], ...prev]);
    }
  };

  const moveTask = async (id: number, newStatus: Task["status"]) => {
    if (!isSupabaseConfigured()) {
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)));
      return;
    }
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", id)
      .select();

    if (data && data[0]) {
      setTasks(prev => prev.map(t => (t.id === id ? data[0] : t)));
    }
  };

  const addTask = async (task: Omit<Task, "id">) => {
    if (!isSupabaseConfigured()) {
      const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
      setTasks(prev => [...prev, { id: newId, ...task }]);
      return;
    }
    const { data, error } = await supabase.from("tasks").insert({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      assigned_to: task.assigned_to
    }).select();

    if (data && data[0]) {
      setTasks(prev => [...prev, data[0]]);
    }
  };

  const addWaitingList = async (item: Omit<{ id: number; client_id: number; service_id: number; notes?: string }, "id">) => {
    if (!isSupabaseConfigured()) {
      const newId = waitingList.length > 0 ? Math.max(...waitingList.map(w => w.id)) + 1 : 1;
      setWaitingList(prev => [...prev, { id: newId, ...item }]);
      return;
    }
    const { data, error } = await supabase.from("waiting_list").insert({
      client_id: item.client_id,
      service_id: item.service_id,
      notes: item.notes
    }).select();

    if (data && data[0]) {
      setWaitingList(prev => [...prev, data[0]]);
    }
  };

  const removeFromWaitingList = async (id: number) => {
    if (!isSupabaseConfigured()) {
      setWaitingList(prev => prev.filter(w => w.id !== id));
      return;
    }
    const { error } = await supabase.from("waiting_list").delete().eq("id", id);
    if (!error) {
      setWaitingList(prev => prev.filter(w => w.id !== id));
    }
  };

  const markNotificationRead = async (id: number) => {
    if (!isSupabaseConfigured()) {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      return;
    }
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .select();

    if (data && data[0]) {
      setNotifications(prev => prev.map(n => (n.id === id ? data[0] : n)));
    }
  };

  const markAllNotificationsRead = async () => {
    if (!isSupabaseConfigured()) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      return;
    }
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const addService = async (service: Omit<Service, "id">) => {
    if (!isSupabaseConfigured()) {
      const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
      setServices(prev => [...prev, { id: newId, ...service }]);
      return;
    }
    const { data, error } = await supabase.from("services").insert(service).select();
    if (data && data[0]) {
      setServices(prev => [...prev, data[0]]);
    }
  };

  const updateService = async (id: number, service: Partial<Service>) => {
    if (!isSupabaseConfigured()) {
      setServices(prev => prev.map(s => (s.id === id ? { ...s, ...service } : s)));
      return;
    }
    const { data, error } = await supabase
      .from("services")
      .update(service)
      .eq("id", id)
      .select();

    if (data && data[0]) {
      setServices(prev => prev.map(s => (s.id === id ? data[0] : s)));
    }
  };

  const addProduct = async (product: Omit<Product, "id">) => {
    if (!isSupabaseConfigured()) {
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      setProducts(prev => [...prev, { id: newId, ...product }]);
      return;
    }
    const { data, error } = await supabase.from("products").insert(product).select();
    if (data && data[0]) {
      setProducts(prev => [...prev, data[0]]);
    }
  };

  const updateProductStock = async (id: number, change: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    if (!isSupabaseConfigured()) {
      const newQty = Math.max(0, prod.stock_quantity + change);
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, stock_quantity: newQty } : p)));
      return;
    }
    const newQty = Math.max(0, prod.stock_quantity + change);
    const { data, error } = await supabase
      .from("products")
      .update({ stock_quantity: newQty })
      .eq("id", id)
      .select();

    if (data && data[0]) {
      setProducts(prev => prev.map(p => (p.id === id ? data[0] : p)));
    }
  };

  const updateProfessional = async (id: number, data: Partial<Professional>) => {
    if (!isSupabaseConfigured()) {
      setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
      return;
    }
    const { data: dbProf, error } = await supabase
      .from("professionals")
      .update(data)
      .eq("id", id)
      .select();

    if (dbProf && dbProf[0]) {
      setProfessionals(prev => prev.map(p => (p.id === id ? dbProf[0] : p)));
    }
  };

  return (
    <AuraContext.Provider
      value={{
        clients,
        professionals,
        services,
        appointments,
        products,
        financialEntries,
        tasks,
        notifications,
        waitingList,
        addAppointment,
        updateAppointmentStatus,
        addClient,
        updateClientHair,
        addChemicalHistory,
        addColorHistory,
        addBeforeAfterPhoto,
        addTransaction,
        moveTask,
        addTask,
        addWaitingList,
        removeFromWaitingList,
        markNotificationRead,
        markAllNotificationsRead,
        addService,
        updateService,
        addProduct,
        updateProductStock,
        updateProfessional
      }}
    >
      {children}
    </AuraContext.Provider>
  );
}

export function useAura() {
  const context = useContext(AuraContext);
  if (context === undefined) {
    throw new Error("useAura deve ser usado dentro de um AuraProvider");
  }
  return context;
}
