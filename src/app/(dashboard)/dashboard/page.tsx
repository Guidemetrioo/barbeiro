"use client";

import { useEffect, useState } from "react";
import { useAura } from "@/context/AuraContext";
import {
  TrendingUp,
  Calendar,
  Users,
  AlertTriangle,
  Gift,
  Clock,
  Sparkles,
  Scissors,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const {
    clients,
    appointments,
    professionals,
    services,
    products,
    financialEntries,
  } = useAura();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Calculations for KPIs
  const todayStr = new Date().toISOString().split("T")[0];

  // Faturamento de Hoje
  const todayEntries = financialEntries.filter(
    (entry) =>
      entry.type === "Entrada" && entry.date.startsWith(todayStr)
  );
  const todayRevenue = todayEntries.reduce((acc, curr) => acc + curr.amount, 0);

  // Faturamento de Ontem (simulação para cálculo de variação %)
  const yesterdayRevenue = 650.00;
  const revenueChangePercent = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
    : 0;

  // Agendamentos de Hoje
  const todayAppts = appointments.filter((appt) =>
    appt.datetime.startsWith(todayStr)
  );
  const totalTodayAppts = todayAppts.length;
  const completedTodayAppts = todayAppts.filter(
    (appt) => appt.status === "Concluído"
  ).length;

  // Clientes atendidos no mês
  const uniqueClientsMonth = new Set(
    appointments
      .filter((appt) => appt.status === "Concluído")
      .map((appt) => appt.client_id)
  ).size;

  // Profissional destaque
  const topProfessional = [...professionals].sort(
    (a, b) => b.appointmentsCountThisMonth - a.appointmentsCountThisMonth
  )[0];

  // 2. Data for Weekly Chart (Recharts)
  // Last 7 days names (Brazilian Portuguese abbreviation)
  const last7DaysData = [
    { name: "Qui", faturamento: 950 },
    { name: "Sex", faturamento: 1400 },
    { name: "Sáb", faturamento: 1850 },
    { name: "Seg", faturamento: 450 },
    { name: "Ter", faturamento: 720 },
    { name: "Qua", faturamento: todayRevenue || 590 },
  ];

  // 3. Next Appointments of the Day
  const upcomingAppts = todayAppts
    .filter((appt) => appt.status !== "Concluído" && appt.status !== "Cancelado")
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  // 4. Top 5 Services of the Month
  // Simulating top services based on appointments count
  const topServices = [
    { name: "Corte Degradê", count: 48, percent: 90 },
    { name: "Barba Premium", count: 36, percent: 75 },
    { name: "Nevou / Platinado", count: 20, percent: 50 },
    { name: "Corte Social", count: 18, percent: 42 },
    { name: "Sobrancelha na Navalha", count: 15, percent: 35 },
  ];

  // 5. Smart Alerts
  // A. Low stock
  const lowStockItems = products.filter((p) => p.stock_quantity <= p.min_stock);
  // B. Unconfirmed appointments
  const unconfirmedAppts = appointments.filter((a) => a.status === "Agendado");
  // C. Birthdays
  const currentMonthDay = new Date().toISOString().slice(5, 10); // "MM-DD"
  const birthdayClients = clients.filter(
    (c) => c.birthdate.slice(5, 10) === currentMonthDay
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Geral</h2>
        <p className="text-salon-text-secondary text-sm">
          Acompanhe o desempenho do Aura Barber em tempo real.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 flex justify-between items-center relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-xs text-salon-text-secondary font-medium uppercase tracking-wider">
              Faturamento (Hoje)
            </span>
            <h3 className="text-2xl font-bold text-salon-text-primary">
              R$ {todayRevenue.toFixed(2)}
            </h3>
            <p className="text-[10px] flex items-center gap-1">
              <span className={revenueChangePercent >= 0 ? "text-salon-success" : "text-salon-error"}>
                {revenueChangePercent >= 0 ? "+" : ""}
                {revenueChangePercent.toFixed(1)}%
              </span>
              <span className="text-salon-text-secondary">vs ontem</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 flex justify-between items-center">
          <div className="space-y-2">
            <span className="text-xs text-salon-text-secondary font-medium uppercase tracking-wider">
              Agendamentos Hoje
            </span>
            <h3 className="text-2xl font-bold text-salon-text-primary">
              {totalTodayAppts}
            </h3>
            <p className="text-[10px] text-salon-text-secondary">
              {completedTodayAppts} concluídos
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-salon-success/10 border border-salon-success/20 flex items-center justify-center text-salon-success">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 flex justify-between items-center">
          <div className="space-y-2">
            <span className="text-xs text-salon-text-secondary font-medium uppercase tracking-wider">
              Clientes Atendidos (Mês)
            </span>
            <h3 className="text-2xl font-bold text-salon-text-primary">
              {uniqueClientsMonth}
            </h3>
            <p className="text-[10px] text-salon-text-secondary">
              Fidelizados ou novos
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 flex justify-between items-center">
          <div className="space-y-2">
            <span className="text-xs text-salon-text-secondary font-medium uppercase tracking-wider">
              Destaque do Mês
            </span>
            <h3 className="text-base font-bold text-salon-text-primary">
              {topProfessional ? topProfessional.name : "Nenhum"}
            </h3>
            <p className="text-[10px] text-salon-text-secondary">
              {topProfessional ? `${topProfessional.appointmentsCountThisMonth} atendimentos` : "Carregando..."}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Central Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Column 1: Weekly Revenue Chart */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-4">
          <div>
            <h4 className="text-base font-bold">Faturamento Últimos 7 Dias</h4>
            <p className="text-xs text-salon-text-secondary">Faturamento consolidado em Reais (R$)</p>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "12px" }}
                    labelStyle={{ color: "#F5F5F5", fontWeight: "bold", fontSize: 12 }}
                    itemStyle={{ color: "#C9A96E", fontSize: 12 }}
                    formatter={(value: any) => [`R$ ${value}`, "Receita"]}
                  />
                  <Bar dataKey="faturamento" fill="#C9A96E" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-salon-bg animate-pulse rounded-lg flex items-center justify-center text-xs text-salon-text-secondary">
                Carregando gráfico...
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Today's Appointments */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-bold">Próximos Atendimentos Hoje</h4>
              <p className="text-xs text-salon-text-secondary">Fila de espera ordenada por horário</p>
            </div>
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase">
              {upcomingAppts.length} pendentes
            </span>
          </div>

          <div className="flex-1 space-y-3.5 mt-4 overflow-y-auto max-h-64 pr-1">
            {upcomingAppts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-salon-success opacity-85" />
                <p className="text-xs font-semibold text-salon-text-primary">Tudo concluído!</p>
                <p className="text-[10px] text-salon-text-secondary">Não há mais atendimentos pendentes para hoje.</p>
              </div>
            ) : (
              upcomingAppts.map((appt) => {
                const client = clients.find((c) => c.id === appt.client_id);
                const professional = professionals.find((p) => p.id === appt.professional_id);
                const firstSvcId = appt.services[0];
                const service = services.find((s) => s.id === firstSvcId);

                // Hour parsing
                const time = new Date(appt.datetime).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                });

                return (
                  <div
                    key={appt.id}
                    className="p-3 bg-salon-bg/40 border border-salon-border/60 rounded-lg flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary bg-primary/5 border border-primary/20 p-2 rounded-lg shrink-0">
                        {time}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-salon-text-primary">{client?.name}</h5>
                        <p className="text-[10px] text-salon-text-secondary mt-0.5">
                          {service?.name} {appt.services.length > 1 ? `+${appt.services.length - 1}` : ""} &bull; {professional?.name.split(" ")[0]}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 ${
                        appt.status === "Confirmado"
                          ? "bg-salon-success/15 text-salon-success border border-salon-success/20"
                          : appt.status === "Em atendimento"
                          ? "bg-salon-alert/15 text-salon-alert border border-salon-alert/20"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Services Progress */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-4">
          <div>
            <h4 className="text-base font-bold">Top Serviços do Mês</h4>
            <p className="text-xs text-salon-text-secondary">Tratamentos mais solicitados pelos clientes</p>
          </div>

          <div className="space-y-4 mt-6">
            {topServices.map((svc, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-salon-text-primary">{svc.name}</span>
                  <span className="text-salon-text-secondary">{svc.count} atendimentos</span>
                </div>
                <div className="w-full h-2 bg-salon-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${svc.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts and Special Notices */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-4">
          <div>
            <h4 className="text-base font-bold">Painel de Alertas</h4>
            <p className="text-xs text-salon-text-secondary">Notificações e ações importantes pendentes</p>
          </div>

          <div className="space-y-3 mt-4 overflow-y-auto max-h-64 pr-1">
            {/* 1. Expirations & Low Stock Alerts */}
            {lowStockItems.map((prod) => (
              <div
                key={`stock-${prod.id}`}
                className="bg-salon-error/10 border border-salon-error/25 text-salon-error text-xs rounded-lg p-3.5 flex items-start gap-3"
              >
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-salon-error" />
                <div>
                  <p className="font-bold">Estoque Crítico</p>
                  <p className="text-[10px] text-salon-text-secondary mt-0.5">
                    {prod.name} restam apenas {prod.stock_quantity} unidades.
                  </p>
                </div>
              </div>
            ))}

            {/* 2. Unconfirmed bookings */}
            {unconfirmedAppts.slice(0, 2).map((appt) => {
              const client = clients.find((c) => c.id === appt.client_id);
              const time = new Date(appt.datetime).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
              });
              return (
                <div
                  key={`unconf-${appt.id}`}
                  className="bg-salon-alert/10 border border-salon-alert/25 text-salon-alert text-xs rounded-lg p-3.5 flex items-start gap-3"
                >
                  <Clock className="w-4.5 h-4.5 shrink-0 mt-0.5 text-salon-alert" />
                  <div>
                    <p className="font-bold">Agendamento sem Confirmação</p>
                    <p className="text-[10px] text-salon-text-secondary mt-0.5">
                      Cliente {client?.name} às {time}.
                    </p>
                  </div>
                </div>
              );
            })}

            {/* 3. Birthday notifications */}
            {birthdayClients.map((client) => (
              <div
                key={`bday-${client.id}`}
                className="bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs rounded-lg p-3.5 flex items-start gap-3"
              >
                <Gift className="w-4.5 h-4.5 shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <p className="font-bold">Aniversariante do Dia</p>
                  <p className="text-[10px] text-salon-text-secondary mt-0.5">
                    Envie os parabéns para {client.name}! {client.phone}
                  </p>
                </div>
              </div>
            ))}

            {/* Empty state alerts */}
            {lowStockItems.length === 0 && unconfirmedAppts.length === 0 && birthdayClients.length === 0 && (
              <div className="h-full flex items-center justify-center text-center p-6 text-salon-text-secondary text-xs">
                Nenhum alerta pendente para hoje.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
