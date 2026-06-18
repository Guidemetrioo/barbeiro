"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  addAppointment: (appt: Omit<Appointment, "id">) => void;
  updateAppointmentStatus: (id: number, status: Appointment["status"], paymentMethod?: FinancialEntry["payment_method"]) => void;
  addClient: (client: Omit<Client, "id" | "colorHistory" | "chemicalHistory" | "before_after_photos">) => number;
  updateClientHair: (id: number, data: Partial<Pick<Client, "hair_type" | "hair_length" | "hair_condition" | "notes">>) => void;
  addChemicalHistory: (client_id: number, record: Omit<ChemRecord, "id" | "client_id">) => void;
  addColorHistory: (client_id: number, record: Omit<ColorRecord, "id" | "client_id">) => void;
  addBeforeAfterPhoto: (client_id: number, before: string, after: string) => void;
  addTransaction: (entry: Omit<FinancialEntry, "id">) => void;
  moveTask: (id: number, newStatus: Task["status"]) => void;
  addTask: (task: Omit<Task, "id">) => void;
  addWaitingList: (item: Omit<{ id: number; client_id: number; service_id: number; notes?: string }, "id">) => void;
  removeFromWaitingList: (id: number) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  addService: (service: Omit<Service, "id">) => void;
  updateService: (id: number, service: Partial<Service>) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProductStock: (id: number, change: number) => void;
  updateProfessional: (id: number, data: Partial<Professional>) => void;
}

const AuraContext = createContext<AuraContextProps | undefined>(undefined);

export function AuraProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial Brazilian Mock Clients
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: "Bruno Souza",
      phone: "(11) 98765-4321",
      email: "bruno.souza@gmail.com",
      birthdate: "1994-06-17", // Aniversário hoje!
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
    },
    {
      id: 4,
      name: "Marcelo Rodrigues",
      phone: "(11) 95432-1098",
      email: "marcelo.r@gmail.com",
      birthdate: "2000-02-12",
      notes: "Barba longa e espessa, prefere usar balm hidratante.",
      hair_type: "Barba Ondulada",
      hair_length: "Longo (Barba)",
      hair_condition: "Fios ressecados",
      colorHistory: [],
      chemicalHistory: [],
      before_after_photos: []
    },
    {
      id: 5,
      name: "Gabriel Santos",
      phone: "(11) 94321-0987",
      email: "gabriel.santos@gmail.com",
      birthdate: "1995-07-29",
      notes: "Alérgico a produtos pós-barba com álcool.",
      hair_type: "Crespo Volumoso",
      hair_length: "Curto",
      hair_condition: "Saudável",
      colorHistory: [],
      chemicalHistory: [],
      before_after_photos: []
    },
    {
      id: 6,
      name: "Amanda Costa",
      phone: "(11) 93210-9876",
      email: "amanda.costa@outlook.com",
      birthdate: "1991-04-03",
      notes: "Corte Pixie curtinho raspado na nuca.",
      hair_type: "Liso Fino",
      hair_length: "Muito Curto",
      hair_condition: "Saudável",
      colorHistory: [],
      chemicalHistory: [
        { id: 203, client_id: 6, date: "2026-02-10", procedure: "Reconstrução Capilar", product: "Keratin Barber", result: "Fios restaurados e brilhantes." }
      ],
      before_after_photos: []
    },
    {
      id: 7,
      name: "Roberto Almeida",
      phone: "(11) 92109-8765",
      email: "roberto.almeida@gmail.com",
      birthdate: "1975-12-18",
      notes: "Corte clássico social apenas na tesoura.",
      hair_type: "Liso Grisalho",
      hair_length: "Curto",
      hair_condition: "Fios finos",
      colorHistory: [],
      chemicalHistory: [],
      before_after_photos: []
    },
    {
      id: 8,
      name: "Fernanda Oliveira",
      phone: "(11) 91098-7654",
      email: "fernanda.o@gmail.com",
      birthdate: "1993-08-14",
      notes: "Cabelo curto raspado na lateral (sidecut).",
      hair_type: "Ondulado (2B)",
      hair_length: "Curto",
      hair_condition: "Normal",
      colorHistory: [],
      chemicalHistory: [],
      before_after_photos: []
    }
  ]);

  // 2. Mock Professionals
  const [professionals, setProfessionals] = useState<Professional[]>([
    {
      id: 1,
      name: "Enzo (Barbeiro Master)",
      phone: "(11) 99111-2222",
      specialties: ["Corte Degradê", "Nevou", "Desenhos/Hair Tattoo"],
      commission_rate: 0.45, // 45% comissão
      work_days: ["Ter", "Qua", "Qui", "Sex", "Sáb"],
      work_hours: { start: "09:00", end: "19:00" },
      appointmentsCountThisMonth: 48,
      commissionEarnedThisMonth: 1980.00
    },
    {
      id: 2,
      name: "Carol (Barbeira/Visagista)",
      specialties: ["Cortes Clássicos", "Selagem Capilar", "Barboterapia"],
      phone: "(11) 99222-3333",
      commission_rate: 0.40, // 40% comissão
      work_days: ["Ter", "Qua", "Qui", "Sex", "Sáb"],
      work_hours: { start: "09:00", end: "20:00" },
      appointmentsCountThisMonth: 62,
      commissionEarnedThisMonth: 2350.00
    },
    {
      id: 3,
      name: "Marcos (Barbeiro Tradicional)",
      specialties: ["Corte Social", "Barba Toalha Quente", "Sobrancelha"],
      phone: "(11) 99333-4444",
      commission_rate: 0.35, // 35% comissão
      work_days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
      work_hours: { start: "08:00", end: "21:00" },
      appointmentsCountThisMonth: 75,
      commissionEarnedThisMonth: 1680.00
    }
  ]);

  // 3. Mock Services
  const [services, setServices] = useState<Service[]>([
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
  ]);

  // Helper date generators for current week
  const getTodayISO = (hourStr: string) => {
    const today = new Date();
    const [h, m] = hourStr.split(":");
    today.setHours(parseInt(h), parseInt(m), 0, 0);
    return today.toISOString();
  };

  // 4. Mock Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      client_id: 1,
      professional_id: 1, // Enzo
      datetime: getTodayISO("10:00"),
      status: "Concluído",
      services: [1, 8], // Corte Degradê + Sobrancelha
      products: [{ id: 3, qty: 1 }], // Lâminas Derby
      notes: "Gosta de risco na sobrancelha."
    },
    {
      id: 2,
      client_id: 2,
      professional_id: 3, // Marcos
      datetime: getTodayISO("14:00"),
      status: "Confirmado",
      services: [1, 3], // Corte Degradê + Barba Premium
      products: [{ id: 3, qty: 1 }], // Lâminas Derby
      notes: "Gosta de corte degrade navalhado."
    },
    {
      id: 3,
      client_id: 3,
      professional_id: 1, // Enzo
      datetime: getTodayISO("15:00"),
      status: "Em atendimento",
      services: [6], // Nevou / Platinado
      products: [{ id: 2, qty: 1 }], // Pó Descolorante
      notes: "Cabelo resistente. Quer efeito bem platinado."
    },
    {
      id: 4,
      client_id: 4,
      professional_id: 2, // Carol
      datetime: getTodayISO("16:30"),
      status: "Agendado",
      services: [2], // Corte Social
      products: [],
      notes: "Cortar baixo nas laterais."
    },
    {
      id: 5,
      client_id: 8,
      professional_id: 2, // Carol
      datetime: getTodayISO("11:30"),
      status: "Cancelado",
      services: [9], // Barboterapia
      products: [],
      notes: "Desmarcou por conta de imprevisto comercial."
    }
  ]);

  // 5. Mock Products (Stock)
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Pomada Matte Efeito Seco 150g", category: "Finalizadores", stock_quantity: 20, min_stock: 5, expiry_date: "2027-02-15", unit_cost: 25.00 },
    { id: 2, name: "Pó Descolorante Blond Barber 500g", category: "Coloração", stock_quantity: 8, min_stock: 4, expiry_date: "2026-07-10", unit_cost: 65.00 }, // Validade próxima!
    { id: 3, name: "Lâminas Derby Premium (Caixa)", category: "Descartáveis", stock_quantity: 12, min_stock: 10, expiry_date: "2030-01-01", unit_cost: 35.00 },
    { id: 4, name: "Óleo para Barba Wood & Spice 30ml", category: "Finalizadores", stock_quantity: 3, min_stock: 3, expiry_date: "2027-04-20", unit_cost: 30.00 }, // Estoque crítico!
    { id: 5, name: "Pigmentação Bigen Preto 6g", category: "Coloração", stock_quantity: 24, min_stock: 15, expiry_date: "2026-06-30", unit_cost: 20.00 }, // Validade próxima!
    { id: 6, name: "Loção Pós-Barba Bay Rum 100ml", category: "Finalizadores", stock_quantity: 4, min_stock: 5, expiry_date: "2028-10-12", unit_cost: 45.00 }
  ]);

  // 6. Mock Financial Entries
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>([
    { id: 1, type: "Entrada", category: "Serviço", amount: 95.00, description: "Corte Degradê + Sobrancelha - Bruno Souza", date: getTodayISO("12:30"), payment_method: "Crédito", net_amount: 92.15, appointment_id: 1 },
    { id: 2, type: "Saída", category: "Fornecedor", amount: 450.00, description: "Compra de insumos de barbearia (navalhas, pomadas)", date: getTodayISO("09:15"), payment_method: "Pix" },
    { id: 3, type: "Entrada", category: "Produto", amount: 110.00, description: "Venda Óleo + Pomada Matte - Thiago Lima", date: getTodayISO("10:00"), payment_method: "Pix", net_amount: 110.00 },
    { id: 4, type: "Saída", category: "Despesa", amount: 320.00, description: "Conta de Água Sabesp", date: "2026-06-15T10:00:00.000Z", payment_method: "Misto" },
    { id: 5, type: "Entrada", category: "Serviço", amount: 60.00, description: "Corte Social - Roberto Almeida", date: "2026-06-16T14:00:00.000Z", payment_method: "Débito", net_amount: 59.10 }
  ]);

  // 7. Mock Tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Esterilizar tesouras e navalhetes", description: "Fazer higienização completa dos utensílios cortantes na autoclave.", status: "A fazer", priority: "alta", due_date: "Hoje, 19:00", assigned_to: "Marcos" },
    { id: 2, title: "Repor toalhas quentes no aquecedor", description: "Preparar lote de toalhas úmidas com óleos essenciais para barboterapia.", status: "Em andamento", priority: "média", due_date: "Hoje, 15:30", assigned_to: "Carol" },
    { id: 3, title: "Confirmar agendamentos de amanhã", description: "Enviar lembretes no WhatsApp para confirmar presença no dia seguinte.", status: "Concluído", priority: "alta", due_date: "Ontem, 18:00", assigned_to: "Recepção" },
    { id: 4, title: "Fazer balanço de estoque mensal", description: "Conferir fisicamente quantidade de pomadas modeladoras e lâminas.", status: "A fazer", priority: "baixa", due_date: "25 Jun 2026", assigned_to: "Administrador" }
  ]);

  // 8. Mock Waiting List
  const [waitingList, setWaitingList] = useState<{ id: number; client_id: number; service_id: number; notes?: string }[]>([
    { id: 1, client_id: 5, service_id: 1, notes: "Gostaria de encaixe à tarde com o Enzo." },
    { id: 2, client_id: 6, service_id: 8, notes: "Pode ser qualquer profissional para sobrancelha." }
  ]);

  // 9. Mock Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: "aniversario", message: "Hoje é aniversário do cliente Bruno Souza!", read: false, created_at: getTodayISO("08:00") },
    { id: 2, type: "estoque", message: "Estoque crítico: Óleo para Barba Wood & Spice 30ml abaixo do mínimo!", read: false, created_at: getTodayISO("08:15") },
    { id: 3, type: "agendamento", message: "Novo agendamento: Marcelo Rodrigues reservou Corte Social às 16:30.", read: true, created_at: getTodayISO("09:00") }
  ]);

  // Trigger notification on load for expiry date
  useEffect(() => {
    // Generate notification for expiry date if it doesn't exist
    const hasExpiryNotif = notifications.some(n => n.message.includes("validade"));
    if (!hasExpiryNotif) {
      setNotifications(prev => [
        {
          id: prev.length + 1,
          type: "estoque",
          message: "Atenção: Pó Descolorante Blond Barber vence em 10/07/2026!",
          read: false,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Action implementations
  const addAppointment = (appt: Omit<Appointment, "id">) => {
    const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    const newAppt: Appointment = {
      id: newId,
      ...appt,
      status: appt.status || "Agendado"
    };

    setAppointments(prev => [newAppt, ...prev]);

    // Create a notification
    const client = clients.find(c => c.id === appt.client_id);
    const professional = professionals.find(p => p.id === appt.professional_id);
    
    setNotifications(prev => [
      {
        id: prev.length + 1,
        type: "agendamento",
        message: `Novo agendamento: ${client?.name || "Cliente"} com ${professional?.name || "Profissional"}.`,
        read: false,
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const updateAppointmentStatus = (
    id: number,
    status: Appointment["status"],
    paymentMethod?: FinancialEntry["payment_method"]
  ) => {
    setAppointments(prev =>
      prev.map(appt => {
        if (appt.id !== id) return appt;

        const updatedAppt = { ...appt, status };

        // IF status changed to Concluído, trigger side effects
        if (status === "Concluído" && appt.status !== "Concluído") {
          // 1. Calculate price
          let totalPrice = appt.price_override || 0;
          if (totalPrice === 0) {
            appt.services.forEach(svcId => {
              const svc = services.find(s => s.id === svcId);
              if (svc) totalPrice += svc.price;
            });
          }

          // 2. Add financial entry
          const client = clients.find(c => c.id === appt.client_id);
          const payment = paymentMethod || "Pix";
          let machineFee = 0;
          if (payment === "Crédito") machineFee = totalPrice * 0.03; // 3% fee
          if (payment === "Débito") machineFee = totalPrice * 0.015; // 1.5% fee
          const net = totalPrice - machineFee;

          const newFinId = financialEntries.length > 0 ? Math.max(...financialEntries.map(f => f.id)) + 1 : 1;
          const newEntry: FinancialEntry = {
            id: newFinId,
            type: "Entrada",
            category: "Serviço",
            amount: totalPrice,
            description: `Atendimento Concluído - ${client?.name || "Cliente"}`,
            date: new Date().toISOString(),
            payment_method: payment,
            net_amount: parseFloat(net.toFixed(2)),
            appointment_id: id
          };

          setFinancialEntries(prevFin => [newEntry, ...prevFin]);

          // 3. Calculate and update commission
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

            setProfessionals(prevProfs =>
              prevProfs.map(p => {
                if (p.id !== appt.professional_id) return p;
                return {
                  ...p,
                  appointmentsCountThisMonth: p.appointmentsCountThisMonth + 1,
                  commissionEarnedThisMonth: p.commissionEarnedThisMonth + totalCommission
                };
              })
            );

            // Notify about commission calculated
            setNotifications(prevNotifs => [
              {
                id: prevNotifs.length + 1,
                type: "comissao",
                message: `Comissão calculada: +R$ ${totalCommission.toFixed(2)} para ${professional.name}.`,
                read: false,
                created_at: new Date().toISOString()
              },
              ...prevNotifs
            ]);
          }

          // 4. Automatic stock deduction (simulate product consumption)
          appt.products.forEach(pUse => {
            setProducts(prevProducts =>
              prevProducts.map(prod => {
                if (prod.id !== pUse.id) return prod;
                const newQty = Math.max(0, prod.stock_quantity - pUse.qty);
                
                // Add notification if low stock
                if (newQty <= prod.min_stock) {
                  setTimeout(() => {
                    setNotifications(prevN => [
                      {
                        id: prevN.length + 1,
                        type: "estoque",
                        message: `Estoque crítico: ${prod.name} está com ${newQty} ${prod.unit_cost ? "unidades" : "itens"}. Mínimo: ${prod.min_stock}`,
                        read: false,
                        created_at: new Date().toISOString()
                      },
                      ...prevN
                    ]);
                  }, 100);
                }

                return { ...prod, stock_quantity: newQty };
              })
            );
          });
        }

        return updatedAppt;
      })
    );
  };

  const addClient = (client: Omit<Client, "id" | "colorHistory" | "chemicalHistory" | "before_after_photos">) => {
    const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
    const newClient: Client = {
      id: newId,
      ...client,
      colorHistory: [],
      chemicalHistory: [],
      before_after_photos: []
    };
    setClients(prev => [...prev, newClient]);
    return newId;
  };

  const updateClientHair = (id: number, data: Partial<Pick<Client, "hair_type" | "hair_length" | "hair_condition" | "notes">>) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        return { ...c, ...data };
      })
    );
  };

  const addChemicalHistory = (client_id: number, record: Omit<ChemRecord, "id" | "client_id">) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id !== client_id) return c;
        const newId = c.chemicalHistory.length > 0 ? Math.max(...c.chemicalHistory.map(ch => ch.id)) + 1 : 201;
        const newRecord: ChemRecord = { id: newId, client_id, ...record };
        return {
          ...c,
          chemicalHistory: [newRecord, ...c.chemicalHistory]
        };
      })
    );
  };

  const addColorHistory = (client_id: number, record: Omit<ColorRecord, "id" | "client_id">) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id !== client_id) return c;
        const newId = c.colorHistory.length > 0 ? Math.max(...c.colorHistory.map(co => co.id)) + 1 : 101;
        const newRecord: ColorRecord = { id: newId, client_id, ...record };
        return {
          ...c,
          colorHistory: [newRecord, ...c.colorHistory]
        };
      })
    );
  };

  const addBeforeAfterPhoto = (client_id: number, before: string, after: string) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id !== client_id) return c;
        const newId = c.before_after_photos.length > 0 ? Math.max(...c.before_after_photos.map(p => p.id)) + 1 : 301;
        const newPhoto = { id: newId, date: new Date().toISOString().split("T")[0], before, after };
        return {
          ...c,
          before_after_photos: [newPhoto, ...c.before_after_photos]
        };
      })
    );
  };

  const addTransaction = (entry: Omit<FinancialEntry, "id">) => {
    const newId = financialEntries.length > 0 ? Math.max(...financialEntries.map(f => f.id)) + 1 : 1;
    const newEntry: FinancialEntry = {
      id: newId,
      ...entry,
      net_amount: entry.net_amount || entry.amount
    };
    setFinancialEntries(prev => [newEntry, ...prev]);
  };

  const moveTask = (id: number, newStatus: Task["status"]) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const addTask = (task: Omit<Task, "id">) => {
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    setTasks(prev => [...prev, { id: newId, ...task }]);
  };

  const addWaitingList = (item: Omit<{ id: number; client_id: number; service_id: number; notes?: string }, "id">) => {
    const newId = waitingList.length > 0 ? Math.max(...waitingList.map(w => w.id)) + 1 : 1;
    setWaitingList(prev => [...prev, { id: newId, ...item }]);
  };

  const removeFromWaitingList = (id: number) => {
    setWaitingList(prev => prev.filter(w => w.id !== id));
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addService = (service: Omit<Service, "id">) => {
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    setServices(prev => [...prev, { id: newId, ...service }]);
  };

  const updateService = (id: number, service: Partial<Service>) => {
    setServices(prev => prev.map(s => (s.id === id ? { ...s, ...service } : s)));
  };

  const addProduct = (product: Omit<Product, "id">) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts(prev => [...prev, { id: newId, ...product }]);
  };

  const updateProductStock = (id: number, change: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, stock_quantity: Math.max(0, p.stock_quantity + change) } : p))
    );
  };

  const updateProfessional = (id: number, data: Partial<Professional>) => {
    setProfessionals(prev =>
      prev.map(p => (p.id === id ? { ...p, ...data } : p))
    );
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
