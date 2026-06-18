"use client";

import { Save, Settings, User, Bell, Clock, Shield, Sparkles } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-500">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-salon-text-secondary uppercase tracking-wider font-semibold">Painel de Controle</p>
          <h2 className="text-2xl font-bold">Configurações Gerais</h2>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-salon-bg font-semibold px-4 py-2.5 rounded-salon text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)]">
          <Save className="w-4 h-4" />
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation Sidebar settings */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-4 space-y-2 h-fit">
          {[
            { label: "Perfil da Barbearia", icon: User, active: true },
            { label: "Horário de Funcionamento", icon: Clock, active: false },
            { label: "Notificações & Alertas", icon: Bell, active: false },
            { label: "Segurança & Acessos", icon: Shield, active: false },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  item.active
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-salon-text-secondary hover:text-salon-text-primary hover:bg-salon-bg"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Configurations Fields */}
        <div className="md:col-span-2 bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6">
          <h3 className="text-sm font-bold border-b border-salon-border/50 pb-3">Perfil da Empresa</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-salon-text-secondary mb-2">Nome Comercial</label>
              <input
                type="text"
                defaultValue="Aura Barber & Co."
                className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-salon-text-secondary mb-2">Telefone para Contato</label>
              <input
                type="text"
                defaultValue="(11) 99876-5432"
                className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-salon-text-secondary mb-2">Endereço Comercial</label>
            <input
              type="text"
              defaultValue="Av. Faria Lima, 1500 - Itaim Bibi, São Paulo - SP"
              className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="pt-4 border-t border-salon-border/40 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-salon-text-secondary">Definições da Conta Supabase</h4>
            <div className="bg-salon-bg border border-salon-border rounded-salon p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-salon-text-secondary">Status de Conectividade</span>
                <span className="text-salon-success font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-salon-success animate-ping" />
                  Ativo
                </span>
              </div>
              <div className="text-[10px] text-salon-text-secondary leading-relaxed">
                As variáveis de ambiente do banco de dados e autenticação estão vinculadas ao seu projeto local.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
