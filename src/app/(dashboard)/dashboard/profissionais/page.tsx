"use client";

import { useState, useEffect } from "react";
import { useAura, Professional } from "@/context/AuraContext";
import {
  Scissors,
  Plus,
  Phone,
  Clock,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Save,
  X,
  Target,
} from "lucide-react";

export default function ProfissionaisPage() {
  const { professionals, updateProfessional } = useAura();
  const [selectedProfId, setSelectedProfId] = useState<number>(1);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  // Form states for schedule editing
  const selectedProf = professionals.find((p) => p.id === selectedProfId) || professionals[0];
  const [workStart, setWorkStart] = useState(selectedProf?.work_hours?.start || "09:00");
  const [workEnd, setWorkEnd] = useState(selectedProf?.work_hours?.end || "19:00");
  const [workDays, setWorkDays] = useState<string[]>(selectedProf?.work_days || []);

  useEffect(() => {
    if (selectedProf) {
      setWorkStart(selectedProf.work_hours.start);
      setWorkEnd(selectedProf.work_hours.end);
      setWorkDays(selectedProf.work_days);
    }
  }, [selectedProf]);

  if (!selectedProf) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-salon-text-secondary text-xs">
        <div className="animate-pulse flex items-center gap-2">
          <span>Carregando dados da equipe...</span>
        </div>
      </div>
    );
  }

  const handleSelectProf = (id: number) => {
    setSelectedProfId(id);
    const prof = professionals.find((p) => p.id === id);
    if (prof) {
      setWorkStart(prof.work_hours.start);
      setWorkEnd(prof.work_hours.end);
      setWorkDays(prof.work_days);
    }
    setIsEditingSchedule(false);
  };

  const handleSaveSchedule = () => {
    updateProfessional(selectedProf.id, {
      work_hours: { start: workStart, end: workEnd },
      work_days: workDays,
    });
    setIsEditingSchedule(false);
  };

  const toggleDay = (day: string) => {
    if (workDays.includes(day)) {
      setWorkDays(workDays.filter((d) => d !== day));
    } else {
      setWorkDays([...workDays, day]);
    }
  };

  // Mock Goals
  const targetRevenue = 5000.00;
  const currentCommission = selectedProf?.commissionEarnedThisMonth || 0;
  const progressPercent = Math.min(100, (currentCommission / targetRevenue) * 100);

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipe Profissional</h2>
          <p className="text-salon-text-secondary text-sm">
            Gerencie horários de expediente, taxas de comissão e metas de vendas.
          </p>
        </div>
      </div>

      {/* Grid: Left Column Cards, Right Column Detail Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Staff Cards list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-xs font-bold text-salon-text-secondary uppercase tracking-wider mb-2">Colaboradores</div>
          {professionals.map((prof) => {
            const isSelected = selectedProf.id === prof.id;

            return (
              <button
                key={prof.id}
                onClick={() => handleSelectProf(prof.id)}
                className={`w-full text-left p-5 border rounded-salon transition-all flex flex-col justify-between space-y-4 hover:border-primary/30 relative overflow-hidden ${
                  isSelected
                    ? "bg-salon-surface border-primary shadow-[0_4px_15px_rgba(201,169,110,0.08)]"
                    : "bg-salon-surface border-salon-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs border ${
                    isSelected ? "bg-primary/20 border-primary text-primary" : "bg-salon-bg border-salon-border text-salon-text-secondary"
                  }`}>
                    {prof.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-salon-text-primary">{prof.name}</h4>
                    <p className="text-[10px] text-primary font-semibold mt-0.5">
                      Comissão: {(prof.commission_rate * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-salon-text-secondary border-t border-salon-border/30 pt-3">
                  <div>
                    <span className="block opacity-65">Atendimentos</span>
                    <span className="font-bold text-salon-text-primary">{prof.appointmentsCountThisMonth}</span>
                  </div>
                  <div>
                    <span className="block opacity-65">Comissão Acumulada</span>
                    <span className="font-bold text-salon-success">R$ {prof.commissionEarnedThisMonth.toFixed(2)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Professional Dashboard Detail */}
        <div className="lg:col-span-2 bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-salon-border/50 pb-4">
            <div>
              <h3 className="text-base font-bold">{selectedProf.name}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {selectedProf.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setIsEditingSchedule(!isEditingSchedule)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {isEditingSchedule ? "Cancelar" : "Ajustar Escala"}
            </button>
          </div>

          {/* Goal tracker card */}
          <div className="bg-salon-bg/40 border border-salon-border rounded-salon p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-xs">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-bold">Meta de Comissões Mensal</h4>
                  <p className="text-[10px] text-salon-text-secondary mt-0.5">Progresso de comissões prontas para saque</p>
                </div>
              </div>
              <span className="text-xs font-bold text-primary">
                {progressPercent.toFixed(0)}%
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-2 bg-salon-surface rounded-full overflow-hidden border border-salon-border">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-salon-text-secondary font-semibold">
                <span>R$ {currentCommission.toFixed(2)} acumulados</span>
                <span>Alvo: R$ {targetRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Schedule / Business Hours overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Display / Edit working hours */}
            <div className="bg-salon-bg/30 border border-salon-border rounded-salon p-5 space-y-4">
              <h4 className="text-xs font-bold text-salon-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Horário de Trabalho
              </h4>

              {!isEditingSchedule ? (
                <div className="text-xs space-y-3">
                  <div className="flex justify-between font-semibold">
                    <span>Entrada / Saída:</span>
                    <span className="text-salon-text-primary">
                      {selectedProf.work_hours.start}h - {selectedProf.work_hours.end}h
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Dias Escalados:</span>
                    <span className="text-primary">{selectedProf.work_days.join(", ")}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-salon-text-secondary mb-1">Entrada</label>
                      <input
                        type="text"
                        value={workStart}
                        onChange={(e) => setWorkStart(e.target.value)}
                        placeholder="09:00"
                        className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-salon-text-secondary mb-1">Saída</label>
                      <input
                        type="text"
                        value={workEnd}
                        onChange={(e) => setWorkEnd(e.target.value)}
                        placeholder="19:00"
                        className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-salon-text-secondary mb-2">Dias da Semana</label>
                    <div className="flex flex-wrap gap-1.5">
                      {weekDays.map((day) => {
                        const isChosen = workDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${
                              isChosen
                                ? "bg-primary border-primary text-salon-bg"
                                : "bg-salon-surface border-salon-border text-salon-text-secondary"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSchedule}
                    className="w-full py-2 bg-primary text-salon-bg font-bold rounded-lg text-xs hover:bg-primary-hover flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Salvar Horários
                  </button>
                </div>
              )}
            </div>

            {/* Performance Indicators */}
            <div className="bg-salon-bg/30 border border-salon-border rounded-salon p-5 space-y-4">
              <h4 className="text-xs font-bold text-salon-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Resumo Financeiro
              </h4>
              <div className="text-xs space-y-3 font-semibold">
                <div className="flex justify-between">
                  <span>Atendimentos no Mês:</span>
                  <span className="text-salon-text-primary">{selectedProf.appointmentsCountThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comissões Pendentes:</span>
                  <span className="text-salon-success">R$ {currentCommission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Celular / WhatsApp:</span>
                  <span className="text-salon-text-secondary">{selectedProf.phone}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
