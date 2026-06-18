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
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Coffee,
  ShieldCheck,
  Compass,
  Award,
  HelpCircle,
  Mail,
  ChevronRight,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";

export default function LandingPageClient() {
  const { services, professionals, addClient, addAppointment } = useAura();

  // States
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0]?.id || 1);
  const [selectedProfId, setSelectedProfId] = useState<number>(professionals[0]?.id || 1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateInputText, setDateInputText] = useState(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  });

  const getNext7Days = () => {
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = weekdays[d.getDay()];
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const yearNum = d.getFullYear();
      const isoString = `${yearNum}-${monthNum}-${dayNum}`;
      days.push({
        label: `${dayName} ${dayNum}/${monthNum}`,
        value: isoString,
        displayText: `${dayNum}/${monthNum}/${yearNum}`
      });
    }
    return days;
  };
  const next7Days = getNext7Days();

  const handleDateTextChange = (value: string) => {
    const clean = value.replace(/\D/g, "");
    let formatted = "";
    if (clean.length > 0) {
      formatted = clean.slice(0, 2);
    }
    if (clean.length > 2) {
      formatted += "/" + clean.slice(2, 4);
    }
    if (clean.length > 4) {
      formatted += "/" + clean.slice(4, 8);
    }
    setDateInputText(formatted);

    if (clean.length === 8) {
      const d = parseInt(clean.slice(0, 2), 10);
      const m = parseInt(clean.slice(2, 4), 10);
      const y = parseInt(clean.slice(4, 8), 10);
      
      const testDate = new Date(y, m - 1, d);
      if (testDate.getFullYear() === y && testDate.getMonth() === m - 1 && testDate.getDate() === d) {
        const yStr = String(y);
        const mStr = String(m).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        setSelectedDate(`${yStr}-${mStr}-${dStr}`);
        setError(null);
      } else {
        setError("Data inválida. Use o formato DD/MM/AAAA.");
      }
    }
  };

  const [selectedTime, setSelectedTime] = useState("10:00");
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive UI States
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [bookingStep, setBookingStep] = useState(1);

  // Time slots
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00"
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientName.trim() || !clientPhone.trim()) {
      setError("Por favor, informe seu nome e celular para contato.");
      return;
    }

    try {
      // 1. Add Client
      const newClientId = await addClient({
        name: clientName,
        phone: clientPhone,
        email: `${clientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        birthdate: "1995-01-01",
        notes: "Cliente agendado pelo portal público de autoatendimento.",
        hair_type: "Não especificado",
        hair_length: "Não especificado",
        hair_condition: "Não especificado",
      });

      // 2. Format DateTime
      const [year, month, day] = selectedDate.split("-").map(Number);
      const [hour, minute] = selectedTime.split(":").map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute));

      // 3. Add Appointment
      await addAppointment({
        client_id: newClientId,
        professional_id: selectedProfId,
        datetime: dateObj.toISOString(),
        status: "Agendado",
        services: [selectedServiceId],
        products: [],
        notes: "Agendamento online efetuado pelo site.",
      });

      setIsBooked(true);
    } catch (err) {
      setError("Houve um problema ao processar seu agendamento. Tente novamente.");
    }
  };

  const getServiceDetails = () => services.find((s) => s.id === selectedServiceId);
  const getProfDetails = () => professionals.find((p) => p.id === selectedProfId);

  // Smooth scroll and auto-select service
  const handleSelectServiceAndScroll = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setBookingStep(1); // Set to step 1
    const element = document.getElementById("agendar");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // FAQ items
  const faqItems = [
    {
      q: "Preciso agendar com antecedência ou posso ir direto?",
      a: "Recomendamos fortemente o agendamento prévio online para evitar filas e garantir atendimento com seu barbeiro preferido, porém atendemos clientes sem horário marcado conforme a disponibilidade de encaixes."
    },
    {
      q: "Quais as formas de pagamento aceitas?",
      a: "Aceitamos Pix, Dinheiro, Cartões de Débito e Crédito (Visa, Mastercard, Elo, Amex). Parcelamos combos e pacotes de serviços no cartão."
    },
    {
      q: "Como funciona a política de cancelamento ou remarcação?",
      a: "Você pode alterar ou cancelar seu horário com até 2 horas de antecedência diretamente entrando em contato conosco via WhatsApp."
    },
    {
      q: "O café ou cerveja de cortesia estão inclusos?",
      a: "Sim! Todos os nossos clientes têm direito a um café espresso de grãos nobres ou a uma cerveja artesanal gelada como cortesia durante o atendimento."
    }
  ];

  return (
    <div className="min-h-screen bg-salon-bg text-salon-text-primary flex flex-col relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.04),transparent_60%)] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER SEMÂNTICO */}
      <header className="h-20 border-b border-salon-border/60 bg-salon-bg/85 backdrop-blur-md px-6 md:px-12 flex items-center justify-between z-30 sticky top-0 transition-all duration-350">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-350">
            <Scissors className="w-5 h-5 rotate-45 group-hover:rotate-[90deg] transition-transform duration-500" />
          </div>
          <div>
            <span className="font-bold tracking-wider text-base md:text-lg text-salon-text-primary group-hover:text-primary transition-colors">AURA BARBER</span>
            <p className="text-[9px] tracking-widest text-primary font-semibold uppercase -mt-0.5">
              Barber &amp; Co.
            </p>
          </div>
        </Link>

        {/* Navigation Links for SEO site hierarchy */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-salon-text-secondary">
          <a href="#inicio" className="hover:text-primary transition-colors duration-250 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300">Início</a>
          <a href="#servicos" className="hover:text-primary transition-colors duration-250 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300">Serviços</a>
          <a href="#profissionais" className="hover:text-primary transition-colors duration-250 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300">Barbeiros</a>
          <a href="#sobre" className="hover:text-primary transition-colors duration-250 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300">Sobre</a>
          <a href="#depoimentos" className="hover:text-primary transition-colors duration-250 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300">Depoimentos</a>
          <a href="#faq" className="hover:text-primary transition-colors duration-250 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-xs font-bold border border-salon-border hover:border-primary/50 bg-salon-surface/40 hover:bg-primary/5 text-salon-text-secondary hover:text-primary transition-all duration-300 rounded-salon uppercase tracking-wider flex items-center gap-2"
          >
            Painel Gestor
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* SECTION 1: HERO / BANNER PRINCIPAL */}
      <section id="inicio" className="max-w-7xl mx-auto w-full px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 space-y-6 md:pr-6">
          <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest inline-flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Estilo, Cerveja &amp; Navalha
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-salon-text-primary">
            A Arte da Barbearia em <span className="text-primary bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Alto Nível</span>
          </h2>
          <p className="text-salon-text-secondary text-sm md:text-base leading-relaxed max-w-xl">
            A Aura Barber &amp; Co. combina o clássico atendimento com toalha quente e lâmina afiada 
            com as técnicas de visagismo mais modernas. Um refúgio premium no Itaim Bibi para homens que exigem o melhor.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#agendar"
              className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-salon-bg font-extrabold rounded-salon text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(201,169,110,0.2)] hover:shadow-[0_0_30px_rgba(201,169,110,0.4)] flex items-center gap-2 hover:-translate-y-0.5 transform"
            >
              Agendar Horário Online
              <Calendar className="w-4 h-4" />
            </a>
            <a
              href="#servicos"
              className="px-6 py-3.5 border border-salon-border hover:border-primary/30 text-salon-text-primary hover:text-primary font-bold rounded-salon text-xs uppercase tracking-wider transition-all duration-300 bg-salon-surface/30 hover:bg-salon-surface/60 flex items-center gap-1.5"
            >
              Ver Menu de Serviços
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-primary/10 rounded-salon blur-3xl transform rotate-3 scale-95 pointer-events-none" />
          <div className="border border-salon-border/80 bg-salon-surface/40 backdrop-blur-md p-2 rounded-salon relative transition-all duration-500 hover:border-primary/20 group">
            <img
              src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600"
              alt="Ambiente premium Aura Barber com cadeiras de couro"
              className="w-full h-80 md:h-[400px] object-cover rounded-lg filter grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-salon-bg/95 border border-salon-border/80 backdrop-blur-md p-4 rounded-lg flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-salon-text-primary">Itaim Bibi, SP</h4>
                  <p className="text-[10px] text-salon-text-secondary">Av. Faria Lima, 1500</p>
                </div>
              </div>
              <span className="text-[10px] bg-salon-success/15 border border-salon-success/30 text-salon-success px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Aberto
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: WIDGET DE AGENDAMENTO DINÂMICO (PASSOS) */}
      <section id="agendar" className="border-t border-salon-border bg-salon-surface/20 py-16 relative z-10">
        <div className="max-w-xl mx-auto px-6">
          <div className="bg-salon-surface border border-salon-border/80 backdrop-blur-md rounded-salon p-6 md:p-8 shadow-2xl relative">
            
            {!isBooked ? (
              <form onSubmit={handleBooking} className="space-y-6">
                
                {/* Steps Header indicator */}
                <div className="flex justify-between items-center border-b border-salon-border/50 pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-salon-text-primary uppercase tracking-wide">Reserve Seu Horário</h3>
                    <p className="text-[10px] text-salon-text-secondary mt-0.5 font-medium">Etapa {bookingStep} de 3</p>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`w-4 h-1.5 rounded-full transition-all duration-300 ${
                          bookingStep === step ? "bg-primary w-8" : "bg-salon-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-salon-error/10 border border-salon-error/25 text-salon-error text-[11px] rounded-lg">
                    {error}
                  </div>
                )}

                {/* STEP 1: SELECT SERVICE AND PROFESSIONAL */}
                {bookingStep === 1 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-salon-text-secondary">Qual serviço deseja?</label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                        className="w-full px-3.5 py-3.5 bg-salon-bg border border-salon-border rounded-lg text-xs focus:outline-none focus:border-primary/50 text-salon-text-primary cursor-pointer"
                      >
                        {services.map((svc) => (
                          <option key={svc.id} value={svc.id} className="bg-salon-surface">
                            {svc.name} - R$ {svc.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-salon-text-secondary">Escolha seu barbeiro</label>
                      <select
                        value={selectedProfId}
                        onChange={(e) => setSelectedProfId(Number(e.target.value))}
                        className="w-full px-3.5 py-3.5 bg-salon-bg border border-salon-border rounded-lg text-xs focus:outline-none focus:border-primary/50 text-salon-text-primary cursor-pointer"
                      >
                        {professionals.map((p) => (
                          <option key={p.id} value={p.id} className="bg-salon-surface">
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="w-full py-3.5 bg-primary text-salon-bg font-extrabold rounded-lg text-xs uppercase tracking-wider hover:bg-primary-hover flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(201,169,110,0.3)]"
                    >
                      Continuar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 2: CHOOSE DATE AND TIME */}
                {bookingStep === 2 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-salon-text-secondary">Selecione o Dia</label>
                        
                        {/* Horizontal quick-select days */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-primary/25 scrollbar-track-transparent">
                          {next7Days.map((day) => {
                            const isSelected = selectedDate === day.value;
                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(day.value);
                                  setDateInputText(day.displayText);
                                }}
                                className={`py-2 px-3 border rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all duration-200 shrink-0 ${
                                  isSelected
                                    ? "bg-primary border-primary text-salon-bg shadow-[0_0_10px_rgba(201,169,110,0.3)]"
                                    : "bg-salon-bg border-salon-border text-salon-text-secondary hover:text-salon-text-primary hover:border-salon-border/80"
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Text input with custom DD/MM/AAAA mask for other dates */}
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-salon-text-secondary/70">Ou digite outra data (DD/MM/AAAA)</label>
                          <input
                            type="text"
                            placeholder="DD/MM/AAAA"
                            maxLength={10}
                            value={dateInputText}
                            onChange={(e) => handleDateTextChange(e.target.value)}
                            className="w-full px-3.5 py-3 bg-salon-bg border border-salon-border rounded-lg text-xs focus:outline-none focus:border-primary/50 text-salon-text-primary placeholder-salon-text-secondary/40 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-salon-text-secondary font-semibold">Horários disponíveis</label>
                        <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                          {timeSlots.map((time) => {
                            const isSelected = selectedTime === time;
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setSelectedTime(time)}
                                className={`py-2 px-1 border rounded text-[10px] font-bold transition-all duration-200 ${
                                  isSelected
                                    ? "bg-primary border-primary text-salon-bg"
                                    : "bg-salon-bg border-salon-border text-salon-text-secondary hover:text-salon-text-primary hover:border-salon-border/80"
                                }`}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setBookingStep(1)}
                        className="flex-1 py-3 border border-salon-border hover:border-primary/50 text-salon-text-secondary hover:text-salon-text-primary rounded-lg text-xs uppercase font-extrabold tracking-wider transition-colors duration-300"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(3)}
                        className="flex-1 py-3 bg-primary text-salon-bg font-extrabold rounded-lg text-xs uppercase tracking-wider hover:bg-primary-hover flex items-center justify-center gap-1 transition-all duration-300 hover:shadow-[0_0_15px_rgba(201,169,110,0.3)]"
                      >
                        Próximo <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: CUSTOMER DATA AND CONFIRMATION */}
                {bookingStep === 3 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-salon-text-secondary font-bold">Seu Nome Completo</label>
                        <input
                          type="text"
                          required
                          placeholder="Digite seu nome completo"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3.5 py-3 bg-salon-bg border border-salon-border rounded-lg text-xs focus:outline-none focus:border-primary/50 text-salon-text-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-salon-text-secondary font-bold">Celular (WhatsApp)</label>
                        <input
                          type="tel"
                          required
                          placeholder="(11) 99999-9999"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full px-3.5 py-3 bg-salon-bg border border-salon-border rounded-lg text-xs focus:outline-none focus:border-primary/50 text-salon-text-primary"
                        />
                      </div>
                    </div>

                    {/* Resume details card */}
                    <div className="bg-salon-bg/60 border border-salon-border/80 rounded-lg p-4 text-[10px] space-y-2 text-salon-text-secondary font-medium">
                      <p className="flex justify-between">
                        <span>Serviço Escolhido:</span>
                        <span className="font-bold text-salon-text-primary">{getServiceDetails()?.name} (R$ {getServiceDetails()?.price})</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Barbeiro Responsável:</span>
                        <span className="font-bold text-salon-text-primary">{getProfDetails()?.name.split(" ")[0]}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Data / Hora:</span>
                        <span className="font-bold text-primary">{selectedDate.split("-").reverse().join("/")} às {selectedTime}h</span>
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setBookingStep(2)}
                        className="flex-1 py-3 border border-salon-border hover:border-primary/50 text-salon-text-secondary hover:text-salon-text-primary rounded-lg text-xs uppercase font-extrabold tracking-wider transition-colors duration-300"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-primary text-salon-bg font-extrabold rounded-lg text-xs uppercase tracking-wider hover:bg-primary-hover flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(201,169,110,0.3)]"
                      >
                        Confirmar Reserva <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </form>
            ) : (
              /* Checkmark confirmation state */
              <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-400">
                <div className="w-16 h-16 bg-salon-success/15 border border-salon-success/30 rounded-full flex items-center justify-center text-salon-success mx-auto">
                  <CheckCircle className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-salon-text-primary">Reserva Efetuada!</h3>
                  <p className="text-[11px] text-salon-text-secondary max-w-xs mx-auto leading-relaxed">
                    Seu horário foi agendado em nosso painel. Em breve você receberá as instruções e lembretes via WhatsApp.
                  </p>
                </div>

                {/* Recibo Premium */}
                <div className="bg-salon-bg/85 border border-primary/20 rounded-salon p-5 text-left text-[11px] space-y-3 max-w-sm mx-auto shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-md" />
                  <div className="flex justify-between border-b border-salon-border/30 pb-2">
                    <span className="text-salon-text-secondary">Nome do Cliente:</span>
                    <span className="font-extrabold text-salon-text-primary">{clientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-salon-border/30 pb-2">
                    <span className="text-salon-text-secondary">Serviço:</span>
                    <span className="font-extrabold text-primary">{getServiceDetails()?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-salon-border/30 pb-2">
                    <span className="text-salon-text-secondary">Profissional:</span>
                    <span className="font-extrabold text-salon-text-primary">{getProfDetails()?.name.split(" ")[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-salon-text-secondary">Horário Agendado:</span>
                    <span className="font-extrabold text-primary">
                      {selectedDate.split("-").reverse().join("/")} às {selectedTime}h
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto pt-2">
                  <button
                    onClick={() => {
                      setClientName("");
                      setClientPhone("");
                      setIsBooked(false);
                      setBookingStep(1);
                    }}
                    className="flex-1 px-4 py-2.5 border border-salon-border hover:border-primary/50 text-salon-text-secondary hover:text-salon-text-primary rounded-salon text-xs font-bold transition-all uppercase tracking-wider"
                  >
                    Novo Agendamento
                  </button>
                  <button
                    onClick={() => alert("Recibo baixado no dispositivo ficticiamente (PDF mock).")}
                    className="flex-1 px-4 py-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-salon text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar PDF
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* SECTION 2: DIFERENCIAIS DA MARCA */}
      <section className="border-y border-salon-border bg-salon-surface/20 py-12 relative z-10">
        <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex gap-4 p-2 rounded-lg hover:bg-salon-surface/30 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-salon-text-primary uppercase tracking-wide">Corte Visagista</h4>
              <p className="text-[11px] text-salon-text-secondary leading-relaxed">Cortes planejados sob medida para o formato do seu rosto e estilo.</p>
            </div>
          </div>

          <div className="flex gap-4 p-2 rounded-lg hover:bg-salon-surface/30 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-salon-text-primary uppercase tracking-wide">Cerveja &amp; Café Cortesia</h4>
              <p className="text-[11px] text-salon-text-secondary leading-relaxed">Aprecie um espresso especial ou cerveja artesanal trincando de gelada.</p>
            </div>
          </div>

          <div className="flex gap-4 p-2 rounded-lg hover:bg-salon-surface/30 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-salon-text-primary uppercase tracking-wide">Higiene Estrita</h4>
              <p className="text-[11px] text-salon-text-secondary leading-relaxed">Materiais esterilizados em autoclave e descartáveis individuais.</p>
            </div>
          </div>

          <div className="flex gap-4 p-2 rounded-lg hover:bg-salon-surface/30 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-salon-text-primary uppercase tracking-wide">Pontualidade Britânica</h4>
              <p className="text-[11px] text-salon-text-secondary leading-relaxed">Seu tempo é sagrado. Garantimos atendimento rigoroso no horário.</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: MENU DE SERVIÇOS RETRÁTIL */}
      <section id="servicos" className="max-w-7xl mx-auto w-full px-6 py-16 space-y-8 relative z-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-primary font-extrabold bg-primary/10 px-3 py-1 rounded-full">Catálogo</span>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-salon-text-primary">Serviços Executados por Especialistas</h3>
          <p className="text-xs text-salon-text-secondary">Selecione o serviço ideal e inicie seu agendamento instantâneo com um clique.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <button
            onClick={() => setIsServicesExpanded(!isServicesExpanded)}
            className="flex justify-between items-center w-full text-left bg-salon-surface/60 backdrop-blur-sm border border-salon-border/80 p-5 rounded-salon hover:border-primary/40 transition-all duration-300 group"
          >
            <div>
              <h4 className="text-xs font-extrabold text-salon-text-primary uppercase tracking-wider flex items-center gap-2.5">
                <Scissors className="w-4.5 h-4.5 text-primary" /> Visualizar Menu Completo de Serviços
              </h4>
              <p className="text-[11px] text-salon-text-secondary mt-1">Clique para expandir valores e tempo estimado de cada procedimento.</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-salon-bg border border-salon-border flex items-center justify-center text-salon-text-secondary group-hover:text-primary group-hover:border-primary/30 transition-all duration-300">
              {isServicesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {isServicesExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="p-5 bg-salon-surface border border-salon-border rounded-salon flex justify-between items-center transition-all duration-300 hover:border-primary/20 hover:bg-salon-surface/60 group"
                >
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs text-salon-text-primary group-hover:text-primary transition-colors">{svc.name}</h5>
                    <span className="text-[10px] text-salon-text-secondary block">
                      {svc.duration_minutes} min &bull; Categoria: {svc.category}
                    </span>
                    <button
                      onClick={() => handleSelectServiceAndScroll(svc.id)}
                      className="text-[9px] font-bold text-primary hover:text-primary-light uppercase tracking-wider flex items-center gap-0.5 mt-1 underline"
                    >
                      Agendar este <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-bold text-primary block">
                      R$ {svc.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: APRESENTAÇÃO DOS BARBEIROS */}
      <section id="profissionais" className="border-t border-salon-border bg-salon-surface/10 py-16 relative z-10">
        <div className="max-w-7xl mx-auto w-full px-6 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-primary font-extrabold bg-primary/10 px-3 py-1 rounded-full">Os Artistas</span>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-salon-text-primary">Equipe de Barbeiros &amp; Visagistas</h3>
            <p className="text-xs text-salon-text-secondary">Profissionais altamente treinados e atualizados com as últimas tendências mundiais.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Barber 1 */}
            <div className="bg-salon-surface/80 backdrop-blur-sm border border-salon-border rounded-salon overflow-hidden flex flex-col group hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-500">
              <div className="overflow-hidden relative h-64">
                <img
                  src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400"
                  alt="Barbeiro Enzo - especialista em Degradê e platinado"
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-salon-text-primary">Enzo</h4>
                  <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">Master</span>
                </div>
                <p className="text-[11px] text-salon-text-secondary leading-relaxed">Especialista em degradê navalhado, freestyle hair art e descolorações globais platinadas.</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] bg-salon-bg border border-salon-border text-salon-text-secondary px-2.5 py-0.5 rounded font-medium">Corte Degradê</span>
                  <span className="text-[9px] bg-salon-bg border border-salon-border text-salon-text-secondary px-2.5 py-0.5 rounded font-medium">Platinados</span>
                </div>
              </div>
            </div>

            {/* Barber 2 */}
            <div className="bg-salon-surface/80 backdrop-blur-sm border border-salon-border rounded-salon overflow-hidden flex flex-col group hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-500">
              <div className="overflow-hidden relative h-64">
                <img
                  src="https://images.unsplash.com/photo-1596075780750-846441ecb66a?q=80&w=400"
                  alt="Barbeira Carol - especialista em cortes clássicos e visagismo"
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-salon-text-primary">Carol</h4>
                  <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">Visagista</span>
                </div>
                <p className="text-[11px] text-salon-text-secondary leading-relaxed">Formada em estética e visagismo capilar. Especializada em alinhamento de barba e terapia capilar.</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] bg-salon-bg border border-salon-border text-salon-text-secondary px-2.5 py-0.5 rounded font-medium">Visagismo</span>
                  <span className="text-[9px] bg-salon-bg border border-salon-border text-salon-text-secondary px-2.5 py-0.5 rounded font-medium">Barboterapia</span>
                </div>
              </div>
            </div>

            {/* Barber 3 */}
            <div className="bg-salon-surface/80 backdrop-blur-sm border border-salon-border rounded-salon overflow-hidden flex flex-col group hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-500">
              <div className="overflow-hidden relative h-64">
                <img
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400"
                  alt="Barbeiro Marcos - especialista em cortes sociais e barba clássica"
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-salon-text-primary">Marcos</h4>
                  <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">Tradicional</span>
                </div>
                <p className="text-[11px] text-salon-text-secondary leading-relaxed">Especialista em tesoura fina clássica, barba clássica com toalha quente e massagem facial.</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] bg-salon-bg border border-salon-border text-salon-text-secondary px-2.5 py-0.5 rounded font-medium">Social Tesoura</span>
                  <span className="text-[9px] bg-salon-bg border border-salon-border text-salon-text-secondary px-2.5 py-0.5 rounded font-medium">Toalha Quente</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: INSTITUCIONAL / QUEM SOMOS */}
      <section id="sobre" className="max-w-7xl mx-auto w-full px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="border border-salon-border/80 bg-salon-surface p-2 rounded-salon relative group hover:border-primary/25 transition-all duration-500">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800"
            alt="Processo de barboterapia de luxo na Aura Barber"
            className="w-full h-72 md:h-96 object-cover rounded-lg filter grayscale group-hover:grayscale-0 transition-all duration-750"
          />
        </div>

        <div className="space-y-6">
          <span className="text-[10px] uppercase tracking-widest text-primary font-extrabold bg-primary/10 px-3 py-1 rounded-full">Nossa Tradição</span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-salon-text-primary">Onde o Cuidado Masculino Se Torna Arte</h3>
          <p className="text-salon-text-secondary text-xs md:text-sm leading-relaxed">
            Fundada em 2024 no coração do Itaim Bibi, a **Aura Barber &amp; Co.** nasceu com o propósito de que a barbearia 
            deve ser um momento de pausa, descompressão e reconexão. Nossas confortáveis cadeiras clássicas de couro 
            e o projeto de iluminação personalizado garantem que cada corte e barba sejam executados com máxima precisão.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs font-bold pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>Cafeteria Exclusiva</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>Ambiente Climatizado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>Wi-Fi de Alta Velocidade</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>Manobrista no Local</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: DEPOIMENTOS DE CLIENTES */}
      <section id="depoimentos" className="max-w-7xl mx-auto w-full px-6 py-16 space-y-10 relative z-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-primary font-extrabold bg-primary/10 px-3 py-1 rounded-full">Avaliações</span>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-salon-text-primary">O Que Nossos Clientes Dizem</h3>
          <p className="text-xs text-salon-text-secondary">Compromisso total com a excelência. Veja os depoimentos reais de nossos frequentadores.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-xs">
          
          <div className="bg-salon-surface/60 border border-salon-border/80 p-6 rounded-salon space-y-4 hover:border-primary/30 transition-all duration-300">
            <div className="flex gap-0.5 text-primary">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-primary text-primary" />)}
            </div>
            <p className="text-salon-text-secondary leading-relaxed italic">
              {`“Melhor degradê que já fiz em São Paulo. O Enzo é extremamente detalhista e a cerveja artesanal de cortesia estava gelada. O espaço é muito bonito e premium.”`}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-bold text-primary">
                GL
              </div>
              <div>
                <h4 className="font-bold text-salon-text-primary">Gustavo Lima</h4>
                <p className="text-[9px] text-salon-text-secondary">Cliente Mensal</p>
              </div>
            </div>
          </div>

          <div className="bg-salon-surface/60 border border-salon-border/80 p-6 rounded-salon space-y-4 hover:border-primary/30 transition-all duration-300">
            <div className="flex gap-0.5 text-primary">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-primary text-primary" />)}
            </div>
            <p className="text-salon-text-secondary leading-relaxed italic">
              {`“A Carol é incrível no visagismo. Ela sugeriu mudanças no alinhamento da minha barba que valorizaram muito meu rosto. Recomendo de olhos fechados!”`}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-bold text-primary">
                FA
              </div>
              <div>
                <h4 className="font-bold text-salon-text-primary">Felipe Azevedo</h4>
                <p className="text-[9px] text-salon-text-secondary">Cliente Quinzenal</p>
              </div>
            </div>
          </div>

          <div className="bg-salon-surface/60 border border-salon-border/80 p-6 rounded-salon space-y-4 hover:border-primary/30 transition-all duration-300">
            <div className="flex gap-0.5 text-primary">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-primary text-primary" />)}
            </div>
            <p className="text-salon-text-secondary leading-relaxed italic">
              {`“Fiz o combo de corte e barba com toalha quente com o Marcos. A experiência é relaxante demais, toalha quente no ponto certo e massagem relaxante. Excelente.”`}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-bold text-primary">
                RC
              </div>
              <div>
                <h4 className="font-bold text-salon-text-primary">Rodrigo Costa</h4>
                <p className="text-[9px] text-salon-text-secondary">Cliente Fiel</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 8: FAQ SANFONADO INTERATIVO */}
      <section id="faq" className="border-t border-salon-border bg-salon-surface/10 py-16 relative z-10">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-primary font-extrabold bg-primary/10 px-3 py-1 rounded-full">Dúvidas</span>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-salon-text-primary">Perguntas Frequentes</h3>
            <p className="text-xs text-salon-text-secondary">Tudo o que você precisa saber sobre nosso modelo de atendimento.</p>
          </div>

          <div className="space-y-3.5 max-w-2xl mx-auto text-xs">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-salon-surface/60 border border-salon-border/80 rounded-salon overflow-hidden transition-all duration-300 hover:border-primary/20"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex justify-between items-center p-4 text-left font-bold text-salon-text-primary hover:text-primary transition-colors duration-250 focus:outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                      {item.q}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-primary" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-salon-text-secondary leading-relaxed border-t border-salon-border/30 bg-salon-bg/30 animate-in fade-in duration-300">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER SEMÂNTICO */}
      <footer className="border-t border-salon-border bg-salon-surface py-12 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Scissors className="w-5 h-5 text-primary rotate-45" />
              <span className="font-bold text-sm tracking-wide text-salon-text-primary">AURA BARBER</span>
            </div>
            <p className="text-[11px] text-salon-text-secondary leading-relaxed">
              Barbearia premium focada em proporcionar a melhor experiência de visagismo masculino, 
              estilo clássico e cuidados pessoais no Itaim Bibi, São Paulo.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Links Rápidos</h4>
            <ul className="space-y-2 text-[11px] text-salon-text-secondary">
              <li><a href="#inicio" className="hover:text-primary transition-colors">Início</a></li>
              <li><a href="#servicos" className="hover:text-primary transition-colors">Serviços</a></li>
              <li><a href="#profissionais" className="hover:text-primary transition-colors">Nossos Barbeiros</a></li>
              <li><a href="#sobre" className="hover:text-primary transition-colors">Sobre a Aura</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Funcionamento</h4>
            <ul className="space-y-2 text-[11px] text-salon-text-secondary">
              <li>Segunda a Sexta: 09h às 21h</li>
              <li>Sábado: 09h às 20h</li>
              <li>Domingo: Fechado</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Contatos</h4>
            <ul className="space-y-2 text-[11px] text-salon-text-secondary">
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                (11) 99876-5432
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                contato@aurabarber.com.br
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                Itaim Bibi, São Paulo - SP
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-salon-border/50 text-center text-[10px] text-salon-text-secondary/60">
          Aura Barber &amp; Co. &bull; Gestão Premium &bull; &copy; 2026 Todos os direitos reservados.
        </div>
      </footer>

    </div>
  );
}
