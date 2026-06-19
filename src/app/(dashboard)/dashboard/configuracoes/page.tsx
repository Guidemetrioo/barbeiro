"use client";

import { useState, useEffect } from "react";
import { Save, Settings, User, Bell, Clock, Shield, Sparkles, MessageSquare, Smartphone, RefreshCw, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<"perfil" | "whatsapp">("perfil");
  const [loading, setLoading] = useState(false);
  const [dbErrorAlert, setDbErrorAlert] = useState(false);
  
  // Bot settings state
  const [botConfig, setBotConfig] = useState({
    status: "disconnected",
    qr_code: "",
    reminder_minutes_a: 30,
    reminder_minutes_b: 10,
    enable_reminders: true,
    enable_confirmations: true,
  });

  // Test flow state
  const [testPhone, setTestPhone] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const supabase = createClient();

  const fetchBotConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_config")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          setDbErrorAlert(true);
        }
        return;
      }

      if (data) {
        setDbErrorAlert(false);
        setBotConfig({
          status: data.status || "disconnected",
          qr_code: data.qr_code || "",
          reminder_minutes_a: data.reminder_minutes_a ?? 30,
          reminder_minutes_b: data.reminder_minutes_b ?? 10,
          enable_reminders: data.enable_reminders !== false,
          enable_confirmations: data.enable_confirmations !== false,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar configurações do WhatsApp:", err);
    }
  };

  useEffect(() => {
    fetchBotConfig();
    const interval = setInterval(() => {
      fetchBotConfig();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("whatsapp_config")
        .upsert({
          id: 1,
          status: botConfig.status,
          qr_code: botConfig.qr_code,
          reminder_minutes_a: botConfig.reminder_minutes_a,
          reminder_minutes_b: botConfig.reminder_minutes_b,
          enable_reminders: botConfig.enable_reminders,
          enable_confirmations: botConfig.enable_confirmations,
          updated_at: new Date().toISOString()
        });

      if (error) {
        alert("Erro ao salvar as configurações: " + error.message);
      } else {
        alert("Configurações salvas com sucesso!");
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao conectar com o banco de dados: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone) {
      setTestResult({ success: false, message: "Insira um número de telefone com DDD válido." });
      return;
    }
    setTestLoading(true);
    setTestResult(null);

    const cleanPhone = testPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setTestResult({ success: false, message: "O número deve conter DDD e pelo menos 8 dígitos." });
      setTestLoading(false);
      return;
    }

    try {
      const { data: newClient, error: clientErr } = await supabase
        .from("clients")
        .upsert({
          name: "Teste Bot WhatsApp",
          phone: cleanPhone,
          notes: "Cliente temporário de teste de integração."
        }, { onConflict: "phone" })
        .select()
        .single();

      if (clientErr) {
        throw new Error("Erro ao cadastrar cliente de teste: " + clientErr.message);
      }

      const { data: newAppt, error: apptErr } = await supabase
        .from("appointments")
        .insert({
          client_id: newClient.id,
          professional_id: 1, // Enzo
          datetime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          status: "Agendado",
          services: [1],
          notes: "Agendamento temporário criado pelo teste da página de configurações."
        })
        .select()
        .single();

      if (apptErr) {
        throw new Error("Erro ao criar agendamento de teste: " + apptErr.message);
      }

      setTestResult({ message: "Agendamento criado! Aguardando o robô enviar a confirmação..." });

      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        if (attempts > 15) {
          clearInterval(pollInterval);
          setTestResult({
            success: false,
            message: "⚠️ O agendamento de teste foi criado no banco de dados, mas o robô não respondeu. Verifique se o processo do bot está ativo e conectado."
          });
          setTestLoading(false);
          return;
        }

        const { data: apptCheck } = await supabase
          .from("appointments")
          .select("status")
          .eq("id", newAppt.id)
          .single();

        if (apptCheck && apptCheck.status === "Confirmado") {
          clearInterval(pollInterval);
          setTestResult({
            success: true,
            message: "🎉 Sucesso total! O robô do WhatsApp interceptou a marcação, enviou a confirmação e atualizou o status para 'Confirmado'."
          });
          setTestLoading(false);
          await supabase.from("appointments").delete().eq("id", newAppt.id);
        }
      }, 2000);

    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Falha ao executar teste." });
      setTestLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (botConfig.status) {
      case "connected":
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Conectado
          </span>
        );
      case "qr_ready":
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Aguardando Leitura
          </span>
        );
      case "connecting":
        return (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            Conectando...
          </span>
        );
      default:
        return (
          <span className="bg-salon-border/30 text-salon-text-secondary border border-salon-border px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-salon-text-secondary" />
            Desconectado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-500">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-salon-text-secondary uppercase tracking-wider font-semibold">Painel de Controle</p>
          <h2 className="text-2xl font-bold">Configurações Gerais</h2>
        </div>
        {activeTab === "whatsapp" && (
          <button
            onClick={handleSaveSettings}
            disabled={loading || dbErrorAlert}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-salon-bg font-semibold px-4 py-2.5 rounded-salon text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Configurações
          </button>
        )}
      </div>

      {dbErrorAlert && (
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-salon p-4 flex gap-3 text-xs text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">Migração Pendente detectada no Supabase!</p>
            <p className="text-rose-200/80 leading-relaxed">
              A tabela de sincronização <code className="bg-rose-500/20 px-1 rounded font-mono">whatsapp_config</code> não foi encontrada no banco de dados. 
              Por favor, execute o script SQL incluído no <strong>Plano de Integração</strong> no SQL Editor do seu Supabase para ativar esta funcionalidade.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation Sidebar settings */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-4 space-y-2 h-fit text-salon-text-primary">
          {[
            { id: "perfil", label: "Perfil da Barbearia", icon: User },
            { id: "whatsapp", label: "Integração WhatsApp", icon: MessageSquare },
            { id: "funcionamento", label: "Horário de Funcionamento", icon: Clock },
            { id: "seguranca", label: "Segurança & Acessos", icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "perfil" || item.id === "whatsapp") {
                    setActiveTab(item.id as any);
                  } else {
                    alert("Aviso: Essa seção de configurações está sendo implementada.");
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
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
          
          {activeTab === "perfil" && (
            <div className="space-y-6">
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
          )}

          {activeTab === "whatsapp" && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-salon-border/50 pb-3">
                <h3 className="text-sm font-bold">Automação de WhatsApp (Lembretes)</h3>
                {getStatusBadge()}
              </div>

              {botConfig.status === "qr_ready" && botConfig.qr_code && (
                <div className="bg-salon-bg border border-salon-border rounded-salon p-6 text-center space-y-4">
                  <p className="text-xs font-semibold text-primary">Escaneie o QR Code abaixo com o WhatsApp do Estabelecimento</p>
                  <div className="p-3 bg-white rounded-lg inline-block shadow-md">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(botConfig.qr_code)}`} 
                      alt="WhatsApp QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-[10px] text-salon-text-secondary max-w-sm mx-auto leading-relaxed">
                    Abra o WhatsApp no seu celular, vá em <strong>Aparelhos Conectados</strong> e selecione <strong>Conectar um Aparelho</strong>.
                  </p>
                </div>
              )}

              {botConfig.status === "connected" && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-salon p-4 flex gap-3 text-xs text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold">Robô conectado com sucesso!</p>
                    <p className="text-emerald-200/80 mt-0.5">O sistema está ativamente ouvindo as marcações de agendamento e enviando os disparos automáticos.</p>
                  </div>
                </div>
              )}

              {(botConfig.status === "disconnected" || botConfig.status === "connecting") && (
                <div className="bg-salon-bg border border-salon-border rounded-salon p-4 text-xs text-salon-text-secondary leading-relaxed">
                  {botConfig.status === "connecting" ? (
                    <p className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      Inicializando o robô e abrindo navegador interno... Isso pode levar alguns segundos.
                    </p>
                  ) : (
                    <p className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      O robô está atualmente desligado ou sem sessão ativa. Inicie a execução do bot no terminal (<code className="bg-salon-surface border border-salon-border px-1 rounded font-mono">npm run bot</code>) para gerar o QR Code.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-salon-text-secondary">Regras de Automação</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3.5 bg-salon-bg border border-salon-border rounded-lg cursor-pointer hover:border-primary/45 transition-all">
                    <span className="text-xs font-semibold">Enviar Lembretes de Agenda</span>
                    <input 
                      type="checkbox"
                      checked={botConfig.enable_reminders}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, enable_reminders: e.target.checked }))}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-salon-bg border border-salon-border rounded-lg cursor-pointer hover:border-primary/45 transition-all">
                    <span className="text-xs font-semibold">Confirmar Marcações na Hora</span>
                    <input 
                      type="checkbox"
                      checked={botConfig.enable_confirmations}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, enable_confirmations: e.target.checked }))}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-salon-text-secondary mb-2">Tempo de Lembrete Padrão (Minutos)</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number"
                        value={botConfig.reminder_minutes_a}
                        onChange={(e) => setBotConfig(prev => ({ ...prev, reminder_minutes_a: Math.max(1, parseInt(e.target.value) || 0) }))}
                        className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-all"
                      />
                      <span className="text-xs text-salon-text-secondary">min antes</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-salon-text-secondary mb-2">Tempo de Lembrete Emergencial (Minutos)</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number"
                        value={botConfig.reminder_minutes_b}
                        onChange={(e) => setBotConfig(prev => ({ ...prev, reminder_minutes_b: Math.max(1, parseInt(e.target.value) || 0) }))}
                        className="w-full px-3.5 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-all"
                      />
                      <span className="text-xs text-salon-text-secondary">min antes</span>
                    </div>
                    <span className="text-[10px] text-salon-text-secondary leading-relaxed mt-1 block">
                      Usado caso a reserva seja marcada com menos tempo que o tempo padrão configurado.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-salon-border/40 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-salon-text-secondary">Testar Conexão de Disparo</h4>
                
                <div className="bg-salon-bg border border-salon-border rounded-salon p-4 space-y-4">
                  <p className="text-[11px] text-salon-text-secondary leading-relaxed">
                    Você pode simular um agendamento rápido inserindo seu número do WhatsApp abaixo. O painel criará um registro fictício no banco e o robô deverá interceptar e enviar a confirmação instantaneamente.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text"
                      placeholder="DDD + Número (ex: 11999999999)"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      disabled={testLoading || botConfig.status !== "connected"}
                      className="flex-1 px-3.5 py-2.5 bg-salon-surface border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendTest}
                      disabled={testLoading || botConfig.status !== "connected"}
                      className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-salon-bg font-semibold px-4 py-2.5 rounded-salon text-xs transition-all flex items-center justify-center gap-2"
                    >
                      {testLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      Disparar Mensagem de Teste
                    </button>
                  </div>

                  {testResult && (
                    <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                      testResult.success === true 
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                        : testResult.success === false
                        ? "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                        : "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                    }`}>
                      {testResult.message}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
