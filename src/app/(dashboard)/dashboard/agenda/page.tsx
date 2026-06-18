"use client";

import { useState } from "react";
import { useAura, Appointment, Client, Service } from "@/context/AuraContext";
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  Scissors,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Check,
  Search,
  MoreVertical,
  X,
  Play,
  CheckCircle,
  Slash,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function AgendaPage() {
  const {
    clients,
    professionals,
    services,
    appointments,
    waitingList,
    addAppointment,
    updateAppointmentStatus,
    addClient,
    removeFromWaitingList,
  } = useAura();

  // View States
  const [view, setView] = useState<"dia" | "semana">("dia");
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMobileProf, setSelectedMobileProf] = useState(1); // Default to Marcos (3) or Ana (1)

  // Booking Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchClientQuery, setSearchClientQuery] = useState("");
  const [clientSelected, setClientSelected] = useState<Client | null>(null);
  const [targetProfId, setTargetProfId] = useState<number>(1);
  const [chosenServices, setChosenServices] = useState<number[]>([]);
  const [apptTime, setApptTime] = useState("10:00");
  const [apptNotes, setApptNotes] = useState("");

  // Create Client Inline States
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");

  // Card Action States
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Dinheiro" | "Pix" | "Crédito" | "Débito" | "Misto">("Pix");

  // Grid Hours list: 08:00 to 21:00 in 30-min slots
  const generateHours = () => {
    const arr = [];
    for (let h = 8; h <= 20; h++) {
      const hStr = h < 10 ? `0${h}` : `${h}`;
      arr.push(`${hStr}:00`);
      arr.push(`${hStr}:30`);
    }
    arr.push("21:00");
    return arr;
  };
  const hours = generateHours();

  // Find appointment occupying a specific slot for a professional
  const findAppointment = (profId: number, hourStr: string) => {
    return appointments.find((appt) => {
      if (appt.professional_id !== profId) return false;
      const apptDate = appt.datetime.split("T")[0];
      if (apptDate !== selectedDateStr) return false;

      const apptTimePart = new Date(appt.datetime).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
      return apptTimePart === hourStr;
    });
  };

  // Get service duration and calculate automatically
  const totalDuration = chosenServices.reduce((acc, curr) => {
    const svc = services.find((s) => s.id === curr);
    return acc + (svc ? svc.duration_minutes : 0);
  }, 0);

  // Client Search filtering
  const filteredClients = searchClientQuery.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(searchClientQuery.toLowerCase()) ||
          c.phone.includes(searchClientQuery)
      )
    : [];

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone) return;

    const newClientId = addClient({
      name: newClientName,
      phone: newClientPhone,
      email: newClientEmail || `${newClientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      birthdate: "1995-01-01",
      notes: "Cliente cadastrado rapidamente pela agenda.",
      hair_type: "Liso Fino",
      hair_length: "Médio",
      hair_condition: "Saudável",
    });

    const newC = clients.find((c) => c.id === newClientId) || {
      id: newClientId,
      name: newClientName,
      phone: newClientPhone,
      email: newClientEmail,
      birthdate: "",
      notes: "",
      hair_type: "",
      hair_length: "",
      hair_condition: "",
      colorHistory: [],
      chemicalHistory: [],
      before_after_photos: [],
    };

    setClientSelected(newC);
    setIsAddingClient(false);
    setSearchClientQuery("");
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
  };

  const handleBook = () => {
    if (!clientSelected || chosenServices.length === 0) return;

    // Convert date + time to ISO string
    const dateObj = new Date(selectedDateStr);
    const [h, m] = apptTime.split(":");
    dateObj.setUTCHours(parseInt(h), parseInt(m), 0, 0);

    addAppointment({
      client_id: clientSelected.id,
      professional_id: targetProfId,
      datetime: dateObj.toISOString(),
      status: "Agendado",
      services: chosenServices,
      products: [], // Empty initially
      notes: apptNotes,
    });

    // Reset states
    setIsNewModalOpen(false);
    setClientSelected(null);
    setChosenServices([]);
    setApptNotes("");
  };

  const handleCardClick = (appt: Appointment) => {
    setSelectedAppt(appt);
    setIsActionModalOpen(true);
  };

  const handleAction = (status: Appointment["status"]) => {
    if (!selectedAppt) return;
    if (status === "Concluído") {
      setIsActionModalOpen(false);
      setIsPaymentModalOpen(true);
    } else {
      updateAppointmentStatus(selectedAppt.id, status);
      setIsActionModalOpen(false);
      setSelectedAppt(null);
    }
  };

  const handleConcludePayment = () => {
    if (!selectedAppt) return;
    updateAppointmentStatus(selectedAppt.id, "Concluído", paymentMethod);
    setIsPaymentModalOpen(false);
    setSelectedAppt(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Central Viewport Grid */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Agenda Integrada</h2>
            <p className="text-salon-text-secondary text-sm">
              Gerencie a ocupação das cadeiras e os horários dos profissionais.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* View selectors */}
            <div className="bg-salon-surface border border-salon-border rounded-salon p-1 flex">
              <button
                onClick={() => setView("dia")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === "dia" ? "bg-primary text-salon-bg" : "text-salon-text-secondary"
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setView("semana")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === "semana" ? "bg-primary text-salon-bg" : "text-salon-text-secondary"
                }`}
              >
                Semana
              </button>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-salon-bg font-semibold px-4 py-2 rounded-salon text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)]"
            >
              <Plus className="w-4 h-4" />
              Novo Horário
            </button>
          </div>
        </div>

        {/* Date navigators and mobile filters */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={() => {
                const d = new Date(selectedDateStr);
                d.setDate(d.getDate() - 1);
                setSelectedDateStr(d.toISOString().split("T")[0]);
              }}
              className="p-2 border border-salon-border rounded-lg bg-salon-bg hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm">
              {new Date(selectedDateStr).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
            <button
              onClick={() => {
                const d = new Date(selectedDateStr);
                d.setDate(d.getDate() + 1);
                setSelectedDateStr(d.toISOString().split("T")[0]);
              }}
              className="p-2 border border-salon-border rounded-lg bg-salon-bg hover:text-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Professional Tab Selector */}
          <div className="md:hidden w-full overflow-x-auto pb-1 flex gap-2 scrollbar-none">
            {professionals.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setSelectedMobileProf(prof.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                  selectedMobileProf === prof.id
                    ? "bg-primary border-primary text-salon-bg"
                    : "bg-salon-bg border-salon-border text-salon-text-secondary"
                }`}
              >
                {prof.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid View */}
        <div className="bg-salon-surface border border-salon-border rounded-salon overflow-hidden">
          
          {/* Day View Desktop layout */}
          {view === "dia" && (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Headers columns */}
                <div className="grid grid-cols-4 border-b border-salon-border bg-salon-bg/40 p-4 font-bold text-xs text-salon-text-secondary text-center">
                  <div className="text-left pl-2">Horário</div>
                  {professionals.map((p) => (
                    <div key={p.id} className="border-l border-salon-border/60">
                      {p.name}
                    </div>
                  ))}
                </div>

                {/* Hour slots */}
                <div className="divide-y divide-salon-border/50">
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-4 min-h-[56px] items-center text-xs group">
                      {/* Horário */}
                      <div className="font-medium text-salon-text-secondary pl-4 py-2 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 opacity-50" />
                        {hour}
                      </div>

                      {/* Professional Columns */}
                      {professionals.map((p) => {
                        const appt = findAppointment(p.id, hour);

                        return (
                          <div
                            key={p.id}
                            className="border-l border-salon-border/30 h-full p-1 self-stretch flex items-center"
                          >
                            {appt ? (
                              <button
                                onClick={() => handleCardClick(appt)}
                                className={`w-full h-full p-2 rounded text-left flex flex-col justify-between transition-all hover:scale-[1.01] ${
                                  appt.status === "Agendado"
                                    ? "bg-blue-500/10 border-l-4 border-blue-500 text-blue-400 border border-blue-500/10"
                                    : appt.status === "Confirmado"
                                    ? "bg-salon-success/10 border-l-4 border-salon-success text-salon-success border border-salon-success/10"
                                    : appt.status === "Em atendimento"
                                    ? "bg-salon-alert/10 border-l-4 border-salon-alert text-salon-alert border border-salon-alert/10"
                                    : appt.status === "Concluído"
                                    ? "bg-salon-text-secondary/10 border-l-4 border-salon-text-secondary text-salon-text-secondary border border-salon-border"
                                    : "bg-salon-error/10 border-l-4 border-salon-error text-salon-error border border-salon-error/10"
                                }`}
                              >
                                <div className="font-bold flex justify-between items-center w-full">
                                  <span>{clients.find((c) => c.id === appt.client_id)?.name}</span>
                                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-85">
                                    {appt.status}
                                  </span>
                                </div>
                                <div className="text-[10px] mt-1 opacity-90 flex justify-between items-center w-full">
                                  <span>
                                    {appt.services
                                      .map((sId) => services.find((s) => s.id === sId)?.name)
                                      .join(" + ")}
                                  </span>
                                  <span>
                                    {appt.services.reduce(
                                      (acc, sId) => acc + (services.find((s) => s.id === sId)?.duration_minutes || 0),
                                      0
                                    )}{" "}
                                    min
                                  </span>
                                </div>
                              </button>
                            ) : (
                              // Blank cell
                              <button
                                onClick={() => {
                                  setTargetProfId(p.id);
                                  setApptTime(hour);
                                  setIsNewModalOpen(true);
                                }}
                                className="w-full h-full rounded hover:bg-salon-bg/30 text-transparent hover:text-salon-text-secondary flex items-center justify-center font-medium text-[10px] transition-colors"
                              >
                                + Reservar às {hour}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Week View Desktop Grid placeholder */}
          {view === "semana" && (
            <div className="p-8 text-center text-salon-text-secondary text-xs flex flex-col items-center justify-center space-y-4">
              <CalendarDays className="w-12 h-12 text-primary/40" />
              <div>
                <p className="font-bold text-salon-text-primary text-sm">Visualização da Semana</p>
                <p className="max-w-md mt-1 mx-auto leading-relaxed">
                  Para fins de apresentação, navegue selecionando horários vazios na grade diária ou gerencie o fluxo utilizando os cards interativos no topo.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sidebar Fila de Espera Panel */}
      <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6 h-fit">
        <div>
          <h4 className="text-base font-bold text-salon-text-primary">Fila de Encaixes</h4>
          <p className="text-xs text-salon-text-secondary">Clientes aguardando liberação de vaga hoje</p>
        </div>

        <div className="space-y-4">
          {waitingList.length === 0 ? (
            <div className="text-center py-6 text-xs text-salon-text-secondary leading-relaxed border border-dashed border-salon-border rounded-lg">
              Sem encaixes pendentes na fila.
            </div>
          ) : (
            waitingList.map((item) => {
              const client = clients.find((c) => c.id === item.client_id);
              const service = services.find((s) => s.id === item.service_id);

              return (
                <div
                  key={item.id}
                  className="bg-salon-bg border border-salon-border/80 rounded-salon p-4 space-y-3.5 hover:border-primary/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-bold text-salon-text-primary">{client?.name}</h5>
                      <span className="text-[10px] text-primary font-medium mt-0.5 inline-block">
                        {service?.name}
                      </span>
                    </div>
                    <span className="text-[9px] bg-salon-alert/15 text-salon-alert border border-salon-alert/20 px-2 py-0.5 rounded-full font-bold uppercase">
                      Espera
                    </span>
                  </div>

                  {item.notes && <p className="text-[10px] text-salon-text-secondary">{item.notes}</p>}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setClientSelected(client || null);
                        setChosenServices([item.service_id]);
                        removeFromWaitingList(item.id);
                        setIsNewModalOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-salon-bg font-semibold rounded text-[10px] transition-all"
                    >
                      Agendar
                    </button>
                    <button
                      onClick={() => removeFromWaitingList(item.id)}
                      className="p-1.5 border border-salon-border hover:bg-salon-error/10 hover:text-salon-error rounded transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Novo Agendamento */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNewModalOpen(false)} />
          
          <div className="bg-salon-surface border border-salon-border rounded-salon p-6 w-full max-w-lg shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-salon-border/50">
              <h3 className="font-bold text-base">Agendar Novo Atendimento</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-salon-text-secondary hover:text-salon-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Search */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-salon-text-secondary">Cliente</label>
              
              {!clientSelected ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-salon-text-secondary absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Buscar por nome ou telefone..."
                        value={searchClientQuery}
                        onChange={(e) => setSearchClientQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <button
                      onClick={() => setIsAddingClient(!isAddingClient)}
                      className="p-2.5 border border-salon-border hover:border-primary rounded-lg bg-salon-bg text-primary flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <UserPlus className="w-4 h-4" />
                      Cadastrar
                    </button>
                  </div>

                  {/* Inline Create Client Form */}
                  {isAddingClient && (
                    <form onSubmit={handleCreateClient} className="bg-salon-bg border border-salon-border rounded-salon p-4 space-y-3">
                      <h4 className="text-xs font-bold text-primary">Cadastro Rápido</h4>
                      <input
                        type="text"
                        required
                        placeholder="Nome Completo"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Celular"
                          value={newClientPhone}
                          onChange={(e) => setNewClientPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
                        />
                        <input
                          type="email"
                          placeholder="E-mail (opcional)"
                          value={newClientEmail}
                          onChange={(e) => setNewClientEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingClient(false)}
                          className="px-3 py-1.5 border border-salon-border rounded text-[10px] font-semibold text-salon-text-secondary"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-primary text-salon-bg rounded text-[10px] font-bold"
                        >
                          Salvar Cliente
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Filter Results Dropdown */}
                  {filteredClients.length > 0 && (
                    <div className="border border-salon-border bg-salon-bg rounded-lg divide-y divide-salon-border/50 max-h-40 overflow-y-auto">
                      {filteredClients.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setClientSelected(c);
                            setSearchClientQuery("");
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs hover:bg-primary/5 hover:text-primary transition-all flex justify-between font-semibold"
                        >
                          <span>{c.name}</span>
                          <span className="text-salon-text-secondary font-normal">{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 rounded-salon p-3 flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2 text-primary">
                    <User className="w-4.5 h-4.5" />
                    <span>{clientSelected.name} &bull; {clientSelected.phone}</span>
                  </div>
                  <button onClick={() => setClientSelected(null)} className="text-salon-text-secondary hover:text-salon-error">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Select Professional & Time slot */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-salon-text-secondary mb-2">Profissional</label>
                <select
                  value={targetProfId}
                  onChange={(e) => setTargetProfId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
                >
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-salon-text-secondary mb-2">Horário</label>
                <select
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Multi-select Services */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-salon-text-secondary">Serviços Selecionados</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {services.map((svc) => {
                  const isChecked = chosenServices.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      onClick={() => {
                        if (isChecked) {
                          setChosenServices(chosenServices.filter((id) => id !== svc.id));
                        } else {
                          setChosenServices([...chosenServices, svc.id]);
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                        isChecked
                          ? "bg-primary/5 border-primary text-primary font-bold"
                          : "bg-salon-bg border-salon-border text-salon-text-secondary hover:text-salon-text-primary"
                      }`}
                    >
                      <span>{svc.name}</span>
                      <span className="text-[10px] opacity-80">R$ {svc.price}</span>
                    </button>
                  );
                })}
              </div>

              {/* Automatic duration calculation output */}
              {chosenServices.length > 0 && (
                <div className="flex justify-between items-center text-[11px] text-primary font-semibold pt-1">
                  <span>Duração Estimada Somada:</span>
                  <span>{totalDuration} min</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-salon-text-secondary mb-2">Observações</label>
              <textarea
                placeholder="Ex: Alérgica a tonalizante forte..."
                rows={2}
                value={apptNotes}
                onChange={(e) => setApptNotes(e.target.value)}
                className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-salon-border/50">
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 border border-salon-border rounded-salon text-xs font-semibold text-salon-text-secondary"
              >
                Voltar
              </button>
              <button
                disabled={!clientSelected || chosenServices.length === 0}
                onClick={handleBook}
                className="px-4 py-2 bg-primary text-salon-bg hover:bg-primary-hover disabled:opacity-55 disabled:cursor-not-allowed font-bold rounded-salon text-xs shadow-[0_0_12px_rgba(201,169,110,0.2)]"
              >
                Confirmar Agendamento
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Card Click Options / Actions */}
      {isActionModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsActionModalOpen(false)} />

          <div className="bg-salon-surface border border-salon-border rounded-salon p-6 w-full max-w-sm shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-salon-border/50">
              <div>
                <h3 className="font-bold text-sm text-salon-text-primary">
                  {clients.find((c) => c.id === selectedAppt.client_id)?.name}
                </h3>
                <p className="text-[10px] text-primary font-semibold mt-0.5">
                  {selectedAppt.services.map((sId) => services.find((s) => s.id === sId)?.name).join(" + ")}
                </p>
              </div>
              <button onClick={() => setIsActionModalOpen(false)} className="text-salon-text-secondary hover:text-salon-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleAction("Confirmado")}
                className="w-full py-2.5 border border-salon-border hover:border-salon-success hover:text-salon-success rounded-salon bg-salon-bg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                Confirmar Agendamento
              </button>

              <button
                onClick={() => handleAction("Em atendimento")}
                className="w-full py-2.5 border border-salon-border hover:border-salon-alert hover:text-salon-alert rounded-salon bg-salon-bg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4" />
                Iniciar Atendimento
              </button>

              <button
                onClick={() => handleAction("Concluído")}
                className="w-full py-2.5 bg-primary text-salon-bg hover:bg-primary-hover rounded-salon text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                Concluir &amp; Lançar Caixa
              </button>

              <button
                onClick={() => handleAction("Cancelado")}
                className="w-full py-2.5 border border-salon-border hover:border-salon-error hover:text-salon-error rounded-salon bg-salon-bg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Slash className="w-4 h-4" />
                Cancelar Horário
              </button>
            </div>

            <div className="pt-4 border-t border-salon-border/50 flex gap-2">
              <Link
                href={`/dashboard/clientes/${selectedAppt.client_id}`}
                onClick={() => setIsActionModalOpen(false)}
                className="flex-1 py-2 border border-salon-border text-center rounded-salon bg-salon-bg text-[11px] text-salon-text-secondary hover:text-salon-text-primary font-semibold transition-colors"
              >
                Ver Ficha do Cliente
              </Link>
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="px-4 py-2 border border-salon-border rounded-salon text-[11px] font-semibold text-salon-text-secondary hover:bg-salon-bg"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Select Payment Method & Conclude */}
      {isPaymentModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPaymentModalOpen(false)} />

          <div className="bg-salon-surface border border-salon-border rounded-salon p-6 w-full max-w-sm shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-salon-border/50">
              <h3 className="font-bold text-sm">Concluir Atendimento</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-salon-text-secondary hover:text-salon-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-salon-bg/40 border border-salon-border rounded-salon p-4 space-y-2">
                <div className="flex justify-between text-xs text-salon-text-secondary">
                  <span>Valor Total Bruto:</span>
                  <span className="font-bold text-salon-text-primary text-sm">
                    R${" "}
                    {selectedAppt.price_override ||
                      selectedAppt.services
                        .reduce((acc, sId) => acc + (services.find((s) => s.id === sId)?.price || 0), 0)
                        .toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-salon-text-secondary">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Pix", "Crédito", "Débito", "Dinheiro", "Misto"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 border rounded-lg text-xs font-semibold transition-all ${
                        paymentMethod === method
                          ? "bg-primary border-primary text-salon-bg font-bold"
                          : "bg-salon-bg border-salon-border text-salon-text-secondary hover:text-salon-text-primary"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tax metadata details */}
              <div className="text-[10px] text-salon-text-secondary bg-salon-bg p-3 rounded-lg flex items-start gap-2 border border-salon-border/40">
                <AlertCircle className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <p>
                  {paymentMethod === "Crédito" && "Taxa de maquininha de 3% será deduzida automaticamente do caixa líquido."}
                  {paymentMethod === "Débito" && "Taxa de maquininha de 1.5% será deduzida automaticamente do caixa líquido."}
                  {paymentMethod === "Pix" && "Taxa nula. Valor integral creditado em caixa."}
                  {paymentMethod === "Dinheiro" && "Valor integral guardado na gaveta da barbearia."}
                  {paymentMethod === "Misto" && "Método misto configurado no caixa."}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-salon-border/50">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 border border-salon-border rounded-salon text-xs font-semibold text-salon-text-secondary"
              >
                Voltar
              </button>
              <button
                onClick={handleConcludePayment}
                className="px-4 py-2 bg-primary text-salon-bg hover:bg-primary-hover font-bold rounded-salon text-xs"
              >
                Finalizar Venda
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
