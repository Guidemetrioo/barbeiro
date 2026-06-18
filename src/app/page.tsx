"use client";

import { useState } from "react";
import { useAura } from "@/context/AuraContext";
import {
  Scissors,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Phone,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { services, professionals, addClient, addAppointment } = useAura();

  // Booking Form States
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0]?.id || 1);
  const [selectedProfId, setSelectedProfId] = useState<number>(professionals[0]?.id || 1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [isBooked, setIsBooked] = useState(false);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);

  // Form errors
  const [error, setError] = useState<string | null>(null);

  // Time slots list
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00"
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientName.trim() || !clientPhone.trim()) {
      setError("Por favor, preencha o seu nome e telefone celular.");
      return;
    }

    try {
      // 1. Create client in global context
      const newClientId = addClient({
        name: clientName,
        phone: clientPhone,
        email: `${clientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        birthdate: "1995-01-01",
        notes: "Cliente agendado pelo portal de autoatendimento.",
        hair_type: "Não especificado",
        hair_length: "Não especificado",
        hair_condition: "Não especificado",
      });

      // 2. Combine date + time
      const [year, month, day] = selectedDate.split("-").map(Number);
      const [hour, minute] = selectedTime.split(":").map(Number);
      const dateObj = new Date(year, month - 1, day, hour, minute);

      // 3. Add appointment
      addAppointment({
        client_id: newClientId,
        professional_id: selectedProfId,
        datetime: dateObj.toISOString(),
        status: "Agendado",
        services: [selectedServiceId],
        products: [],
        notes: "Agendado online pelo próprio cliente.",
      });

      setIsBooked(true);
    } catch (err) {
      setError("Ocorreu um erro ao processar o seu agendamento. Tente novamente.");
    }
  };

  const getServiceDetails = () => services.find((s) => s.id === selectedServiceId);
  const getProfDetails = () => professionals.find((p) => p.id === selectedProfId);

  return (
    <main className="min-h-screen bg-salon-bg text-salon-text-primary flex flex-col relative overflow-hidden">
      {/* Background visual styles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.04),transparent_60%)] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="h-16 border-b border-salon-border/60 bg-salon-surface/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary">
            <Scissors className="w-4.5 h-4.5 rotate-45" />
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-sm md:text-base">AURA BARBER</h1>
            <p className="text-[8px] tracking-widest text-primary font-semibold uppercase -mt-0.5">
              Barber &amp; Co.
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard"
          className="px-4 py-2 border border-salon-border hover:border-primary text-salon-text-secondary hover:text-primary transition-all text-xs font-semibold rounded-salon flex items-center gap-1.5"
        >
          Área de Colaboradores
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main page body layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start relative z-10">
        
        {/* Column Left: Information about business and catalog */}
        <section className="lg:col-span-7 space-y-10">
          
          {/* Welcome title and info */}
          <div className="space-y-4">
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Experiência de Barbearia Premium
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Seu estilo em alto nível na <span className="text-primary">Aura Barber</span>
            </h2>
            <p className="text-salon-text-secondary text-sm md:text-base leading-relaxed max-w-2xl">
              Cortes degradês milimetricamente desenhados, barboterapia com toalha quente e óleos essenciais, 
              platinados perfeitos e um ambiente planejado com café expresso e muito conforto. 
              Escolha seu barbeiro e garanta seu horário online.
            </p>
            <div className="flex items-center gap-2 text-xs text-salon-text-secondary font-medium pt-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>Av. Faria Lima, 1500 - Itaim Bibi, São Paulo - SP</span>
            </div>
          </div>

          {/* Services prices list */}
          <div className="space-y-4">
            <button
              onClick={() => setIsServicesExpanded(!isServicesExpanded)}
              className="flex justify-between items-center w-full text-left bg-salon-surface border border-salon-border p-4 rounded-salon hover:border-primary/30 transition-all group"
            >
              <div>
                <h3 className="text-sm md:text-base font-bold text-salon-text-primary flex items-center gap-2">
                  Nosso Menu de Serviços
                </h3>
                <p className="text-xs text-salon-text-secondary mt-0.5">Clique para {isServicesExpanded ? "ocultar" : "visualizar"} preços e durações</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-salon-bg border border-salon-border flex items-center justify-center text-salon-text-secondary group-hover:text-primary transition-all">
                {isServicesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isServicesExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-4 bg-salon-surface border border-salon-border rounded-salon flex justify-between items-center transition-all hover:border-primary/20"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-salon-text-primary">{svc.name}</h4>
                      <span className="text-[10px] text-salon-text-secondary block">
                        {svc.duration_minutes} min &bull; {svc.category}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      R$ {svc.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team list */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-salon-text-primary">Nossa Equipe de Barbeiros</h3>
              <p className="text-xs text-salon-text-secondary">Visagistas de ponta ao seu dispor</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {professionals.map((prof) => (
                <div
                  key={prof.id}
                  className="p-4 bg-salon-surface border border-salon-border rounded-salon text-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm mx-auto">
                    {prof.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-salon-text-primary">{prof.name.split(" ")[0]}</h4>
                    <p className="text-[9px] text-salon-text-secondary mt-0.5 uppercase tracking-wide truncate">
                      {prof.specialties[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Column Right: Interactive Booking card */}
        <section className="lg:col-span-5 bg-salon-surface border border-salon-border rounded-salon p-6 md:p-8 shadow-2xl relative">
          {!isBooked ? (
            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-salon-text-primary">Agendamento Online</h3>
                <p className="text-xs text-salon-text-secondary">Escolha e reserve em poucos segundos</p>
              </div>

              {error && (
                <div className="p-3.5 bg-salon-error/10 border border-salon-error/20 rounded-lg text-xs text-salon-error font-medium">
                  {error}
                </div>
              )}

              {/* Personal Data */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-salon-text-secondary mb-1.5">Seu Nome</label>
                  <input
                    type="text"
                    required
                    placeholder="Como gostaria de ser chamado?"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-salon-text-secondary mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary" /> Celular / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-salon-text-secondary mb-1.5">Serviço Desejado</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-colors"
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} - R$ {svc.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Barber Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-salon-text-secondary mb-1.5">Barbeiro Preferido</label>
                <select
                  value={selectedProfId}
                  onChange={(e) => setSelectedProfId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                >
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-salon-text-secondary mb-1.5">Data</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-salon-text-secondary mb-1.5">Horário</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary-hover text-salon-bg font-bold rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)] mt-3 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4.5 h-4.5" />
                Confirmar Minha Reserva
              </button>
            </form>
          ) : (
            /* Success confirmation card */
            <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-salon-success/10 border border-salon-success/20 rounded-full flex items-center justify-center text-salon-success mx-auto">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-salon-text-primary">Agendamento Confirmado!</h3>
                <p className="text-xs text-salon-text-secondary max-w-sm mx-auto leading-relaxed">
                  Seu horário foi reservado com sucesso no sistema. Aguardamos sua visita na data escolhida!
                </p>
              </div>

              {/* Details box */}
              <div className="bg-salon-bg/40 border border-salon-border rounded-salon p-5 text-left text-xs space-y-3 max-w-sm mx-auto">
                <div className="flex justify-between border-b border-salon-border/30 pb-2">
                  <span className="text-salon-text-secondary">Cliente:</span>
                  <span className="font-bold text-salon-text-primary">{clientName}</span>
                </div>
                <div className="flex justify-between border-b border-salon-border/30 pb-2">
                  <span className="text-salon-text-secondary">Serviço:</span>
                  <span className="font-bold text-primary">{getServiceDetails()?.name}</span>
                </div>
                <div className="flex justify-between border-b border-salon-border/30 pb-2">
                  <span className="text-salon-text-secondary">Barbeiro:</span>
                  <span className="font-bold text-salon-text-primary">{getProfDetails()?.name.split(" ")[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-salon-text-secondary">Horário:</span>
                  <span className="font-bold text-primary">
                    {new Date(selectedDate + "T" + selectedTime).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    às {selectedTime}h
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setClientName("");
                  setClientPhone("");
                  setIsBooked(false);
                }}
                className="px-6 py-2.5 border border-salon-border hover:border-primary hover:text-primary text-salon-text-secondary rounded-salon text-xs font-semibold transition-all"
              >
                Fazer Novo Agendamento
              </button>
            </div>
          )}
        </section>

      </div>

      {/* Footer copyright */}
      <footer className="py-6 border-t border-salon-border/40 text-center text-[10px] text-salon-text-secondary/60">
        Aura Barber &amp; Co. &bull; Gestão Premium &bull; &copy; 2026 Todos os direitos reservados.
      </footer>
    </main>
  );
}
