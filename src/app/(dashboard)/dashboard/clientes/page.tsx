"use client";

import { useState } from "react";
import { useAura, Client } from "@/context/AuraContext";
import { Search, UserPlus, Phone, Mail, Calendar, Eye, CalendarClock } from "lucide-react";
import Link from "next/link";

export default function ClientesPage() {
  const { clients, appointments, services } = useAura();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "aniversariantes" | "inativos">("todos");

  // Helper: Find total spent by client
  const calculateTotalSpent = (clientId: number) => {
    const clientAppts = appointments.filter(
      (a) => a.client_id === clientId && a.status === "Concluído"
    );

    return clientAppts.reduce((acc, appt) => {
      let total = appt.price_override || 0;
      if (total === 0) {
        appt.services.forEach((sId) => {
          const svc = services.find((s) => s.id === sId);
          if (svc) total += svc.price;
        });
      }
      return acc + total;
    }, 0);
  };

  // Helper: Find last visit date
  const getLastVisitDate = (clientId: number) => {
    const clientAppts = appointments.filter(
      (a) => a.client_id === clientId && a.status === "Concluído"
    );
    if (clientAppts.length === 0) return "Nenhum";

    // Sort by date descending
    const sorted = [...clientAppts].sort((a, b) => b.datetime.localeCompare(a.datetime));
    return new Date(sorted[0].datetime).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // Filter Clients
  const filteredClients = clients.filter((client) => {
    // 1. Search filter
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    // 2. Type filter
    if (filterType === "aniversariantes") {
      const currentMonth = new Date().getMonth();
      const clientBirthMonth = new Date(client.birthdate).getMonth();
      return currentMonth === clientBirthMonth;
    }

    if (filterType === "inativos") {
      // Find last appointment date
      const clientAppts = appointments.filter(
        (a) => a.client_id === client.id && a.status === "Concluído"
      );
      if (clientAppts.length === 0) return true; // No appointments = inactive

      const sorted = [...clientAppts].sort((a, b) => b.datetime.localeCompare(a.datetime));
      const lastVisitTime = new Date(sorted[0].datetime).getTime();
      const sixtyDaysAgo = new Date().getTime() - 60 * 24 * 60 * 60 * 1000;
      return lastVisitTime < sixtyDaysAgo;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fichas de Clientes</h2>
          <p className="text-salon-text-secondary text-sm">
            Visualize o histórico de procedimentos, químicas e agendamentos de cada cliente.
          </p>
        </div>
        <Link
          href="/dashboard/agenda"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-salon-bg font-semibold px-4 py-2.5 rounded-salon text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)]"
        >
          <UserPlus className="w-4 h-4" />
          Novo Cadastro
        </Link>
      </div>

      {/* Toolbar filters */}
      <div className="bg-salon-surface border border-salon-border rounded-salon p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Filter categories tabs */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-none">
          {([
            { type: "todos", label: "Todos" },
            { type: "aniversariantes", label: "Aniversariantes do Mês" },
            { type: "inativos", label: "Inativos (+60 dias)" },
          ] as const).map((tab) => (
            <button
              key={tab.type}
              onClick={() => setFilterType(tab.type)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                filterType === tab.type
                  ? "bg-primary border-primary text-salon-bg"
                  : "bg-salon-bg border-salon-border text-salon-text-secondary hover:text-salon-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-salon-text-secondary">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary placeholder-salon-text-secondary/50 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Clientes Table */}
      <div className="bg-salon-surface border border-salon-border rounded-salon overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center text-salon-text-secondary flex flex-col items-center justify-center space-y-3">
            <Eye className="w-10 h-10 text-primary/30" />
            <p className="font-bold text-sm text-salon-text-primary">Nenhum cliente encontrado</p>
            <p className="text-xs max-w-xs leading-relaxed">
              Tente redefinir sua busca ou alterar os filtros de seleção no painel superior.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-salon-border bg-salon-bg/30 text-salon-text-secondary font-semibold uppercase tracking-wider">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Contato</th>
                  <th className="p-4">Última Visita</th>
                  <th className="p-4">Total Gasto</th>
                  <th className="p-4 text-right">Ficha Técnica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-border/50">
                {filteredClients.map((client) => {
                  const spent = calculateTotalSpent(client.id);
                  const lastVisit = getLastVisitDate(client.id);

                  return (
                    <tr key={client.id} className="hover:bg-salon-bg/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-salon-text-primary text-sm">{client.name}</p>
                            <p className="text-[10px] text-salon-text-secondary mt-0.5">
                              Nascimento: {new Date(client.birthdate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-salon-text-secondary">
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {client.phone}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {client.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-salon-text-secondary font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {lastVisit}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-salon-text-primary">
                        R$ {spent.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/dashboard/clientes/${client.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-salon-bg rounded-lg text-xs font-bold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver Perfil
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
