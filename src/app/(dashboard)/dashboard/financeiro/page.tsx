"use client";

import { useEffect, useState } from "react";
import { useAura, FinancialEntry } from "@/context/AuraContext";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Calendar,
  X,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function FinanceiroPage() {
  const { financialEntries, professionals, addTransaction, updateProfessional } = useAura();
  const [mounted, setMounted] = useState(false);
  const [isCashOpen, setIsCashOpen] = useState(true);

  // Add Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transType, setTransType] = useState<"Entrada" | "Saída">("Entrada");
  const [transDesc, setTransDesc] = useState("");
  const [transAmount, setTransAmount] = useState("");
  const [transMethod, setTransMethod] = useState<FinancialEntry["payment_method"]>("Pix");

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntries = financialEntries.filter((e) => e.date.startsWith(todayStr));

  const initialCashOpen = 200.00; // Caixa de abertura fixo
  const totalEntries = todayEntries
    .filter((e) => e.type === "Entrada")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExits = todayEntries
    .filter((e) => e.type === "Saída")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = initialCashOpen + totalEntries - totalExits;

  // Formas de pagamento distribution for PieChart
  const getMethodData = () => {
    const methods = { Pix: 0, Crédito: 0, Débito: 0, Dinheiro: 0, Misto: 0 };
    financialEntries
      .filter((e) => e.type === "Entrada")
      .forEach((e) => {
        if (e.payment_method) {
          methods[e.payment_method] += e.amount;
        }
      });

    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  };

  const methodColors = {
    Pix: "#C9A96E",      // primary gold
    Crédito: "#4CAF50",  // success green
    Débito: "#2196F3",   // blue
    Dinheiro: "#9C27B0", // purple
    Misto: "#FF9800",    // alert orange
  };

  // Ticket médio calculation
  const totalCompletedServices = financialEntries.filter(
    (e) => e.type === "Entrada" && e.category === "Serviço"
  );
  const avgTicket = totalCompletedServices.length > 0
    ? totalCompletedServices.reduce((acc, curr) => acc + curr.amount, 0) / totalCompletedServices.length
    : 0;

  // 30 Days Revenue Line Chart mock data points ending with today's revenue
  const last30DaysRevenue = [
    { date: "18 Mai", receita: 450 },
    { date: "22 Mai", receita: 780 },
    { date: "26 Mai", receita: 950 },
    { date: "30 Mai", receita: 1100 },
    { date: "03 Jun", receita: 620 },
    { date: "07 Jun", receita: 1300 },
    { date: "11 Jun", receita: 1250 },
    { date: "15 Jun", receita: 1480 },
    { date: "Hoje", receita: totalEntries || 680 },
  ];

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transDesc || !transAmount) return;

    addTransaction({
      type: transType,
      category: transType === "Entrada" ? "Produto" : "Despesa",
      amount: parseFloat(transAmount),
      description: transDesc,
      date: new Date().toISOString(),
      payment_method: transType === "Entrada" ? transMethod : undefined,
    });

    setIsModalOpen(false);
    setTransDesc("");
    setTransAmount("");
  };

  const handlePayCommission = (profId: number, amount: number) => {
    if (amount <= 0) return;

    // 1. Add Cash Flow Outflow
    const prof = professionals.find((p) => p.id === profId);
    addTransaction({
      type: "Saída",
      category: "Despesa",
      amount: amount,
      description: `Pagamento comissão - ${prof?.name || "Profissional"}`,
      date: new Date().toISOString(),
    });

    // 2. Reset professional commission in state
    updateProfessional(profId, {
      commissionEarnedThisMonth: 0,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão Financeira</h2>
          <p className="text-salon-text-secondary text-sm">
            Acompanhe o fechamento de caixa, as taxas operacionais e pagamentos da equipe.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Cash box toggler */}
          <button
            onClick={() => setIsCashOpen(!isCashOpen)}
            className={`flex items-center gap-2 border px-4 py-2 rounded-salon text-xs font-semibold transition-all ${
              isCashOpen
                ? "bg-salon-success/15 border-salon-success/30 text-salon-success"
                : "bg-salon-surface border-salon-border text-salon-text-secondary hover:text-salon-text-primary"
            }`}
          >
            {isCashOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isCashOpen ? "Caixa Aberto" : "Caixa Fechado"}
          </button>

          <button
            onClick={() => {
              setTransType("Entrada");
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-salon-bg font-bold px-4 py-2.5 rounded-salon text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)]"
          >
            Lançar Movimento
          </button>
        </div>
      </div>

      {/* Caixa do Dia grid indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-2">
          <span className="text-xs text-salon-text-secondary font-medium uppercase tracking-wider">Abertura de Caixa</span>
          <h3 className="text-2xl font-bold text-salon-text-primary">R$ {initialCashOpen.toFixed(2)}</h3>
          <p className="text-[10px] text-salon-text-secondary">Gaveta inicial às 08:00</p>
        </div>

        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-2">
          <span className="text-xs text-salon-text-secondary font-medium uppercase tracking-wider">Entradas Hoje</span>
          <h3 className="text-2xl font-bold text-salon-success">+ R$ {totalEntries.toFixed(2)}</h3>
          <p className="text-[10px] text-salon-text-secondary">{todayEntries.filter(e => e.type === "Entrada").length} recebimentos</p>
        </div>

        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-2">
          <span className="text-xs text-salon-text-secondary font-medium uppercase tracking-wider">Saídas Hoje</span>
          <h3 className="text-2xl font-bold text-salon-error">- R$ {totalExits.toFixed(2)}</h3>
          <p className="text-[10px] text-salon-text-secondary">{todayEntries.filter(e => e.type === "Saída").length} despesas</p>
        </div>

        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-2">
          <span className="text-xs text-salon-text-secondary font-medium uppercase tracking-wider">Saldo Líquido Caixa</span>
          <h3 className="text-2xl font-bold text-primary">R$ {currentBalance.toFixed(2)}</h3>
          <p className="text-[10px] text-salon-text-secondary">Saldo em tempo real na gaveta</p>
        </div>
      </div>

      {/* Central Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Line Chart: 30 days evolution */}
        <div className="lg:col-span-2 bg-salon-surface border border-salon-border rounded-salon p-6 space-y-4">
          <div>
            <h4 className="text-base font-bold">Evolução do Faturamento (Últimos 30 dias)</h4>
            <p className="text-xs text-salon-text-secondary font-medium">Histórico acumulado mensal</p>
          </div>

          <div className="h-64 w-full pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last30DaysRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "12px" }}
                    labelStyle={{ color: "#F5F5F5", fontWeight: "bold" }}
                    itemStyle={{ color: "#C9A96E" }}
                    formatter={(value: any) => [`R$ ${value}`, "Faturamento"]}
                  />
                  <Line type="monotone" dataKey="receita" stroke="#C9A96E" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-salon-bg rounded-lg animate-pulse" />
            )}
          </div>
        </div>

        {/* Pie Chart: Payment Method distribution */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold">Métodos de Recebimento</h4>
            <p className="text-xs text-salon-text-secondary font-medium">Distribuição percentual do faturamento</p>
          </div>

          <div className="h-44 w-full relative">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getMethodData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getMethodData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(methodColors)[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `R$ ${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-salon-bg rounded-lg animate-pulse" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] text-salon-text-secondary font-semibold">
            {getMethodData().map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: methodColors[entry.name as keyof typeof methodColors] }}
                />
                <span className="truncate">{entry.name}: R${entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Detailed entries log & Commissions pay table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Caixa diário detailed entries log */}
        <div className="lg:col-span-2 bg-salon-surface border border-salon-border rounded-salon overflow-hidden text-xs">
          <div className="p-4 border-b border-salon-border bg-salon-bg/20">
            <h4 className="font-bold">Movimentações do Dia</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-salon-border bg-salon-bg/30 text-salon-text-secondary font-semibold uppercase tracking-wider">
                  <th className="p-3">Descrição / Cliente</th>
                  <th className="p-3 text-center">Método</th>
                  <th className="p-3 text-center">Bruto</th>
                  <th className="p-3 text-center">Taxas</th>
                  <th className="p-3 text-right">Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-border/50 text-salon-text-secondary">
                {todayEntries.map((e) => {
                  const gross = e.amount;
                  const net = e.net_amount || gross;
                  const fee = gross - net;

                  return (
                    <tr key={e.id} className="hover:bg-salon-bg/10 transition-colors">
                      <td className="p-3 font-semibold text-salon-text-primary">
                        {e.description}
                      </td>
                      <td className="p-3 text-center">
                        {e.payment_method ? (
                          <span className="px-2 py-0.5 bg-salon-bg border border-salon-border rounded text-[9px] font-bold uppercase tracking-wide">
                            {e.payment_method}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-center font-semibold text-salon-text-primary">
                        R$ {gross.toFixed(2)}
                      </td>
                      <td className="p-3 text-center font-medium text-salon-error">
                        {fee > 0 ? `- R$ ${fee.toFixed(2)}` : "-"}
                      </td>
                      <td className={`p-3 text-right font-bold ${e.type === "Entrada" ? "text-salon-success" : "text-salon-error"}`}>
                        R$ {net.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commissions payout table */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6">
          <div>
            <h4 className="text-base font-bold">Comissões Acumuladas</h4>
            <p className="text-xs text-salon-text-secondary font-medium">Repasses prontos para pagamento no período</p>
          </div>

          <div className="space-y-4">
            {professionals.map((prof) => (
              <div
                key={prof.id}
                className="bg-salon-bg border border-salon-border rounded-salon p-4 space-y-3"
              >
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px]">
                      {prof.name.split(" ")[0][0]}
                    </div>
                    <span>{prof.name}</span>
                  </div>
                  <span className="text-salon-success">
                    R$ {prof.commissionEarnedThisMonth.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={prof.commissionEarnedThisMonth <= 0}
                    onClick={() => handlePayCommission(prof.id, prof.commissionEarnedThisMonth)}
                    className="w-full py-1.5 bg-primary text-salon-bg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded text-[10px] transition-all"
                  >
                    Pagar Repasse
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal: Manual Outflow/Inflow Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <form
            onSubmit={handleAddTransaction}
            className="bg-salon-surface border border-salon-border rounded-salon p-6 w-full max-w-sm shadow-2xl relative z-10 space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-salon-border/50">
              <h3 className="font-bold text-sm">Lançar Fluxo de Caixa</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-salon-text-secondary hover:text-salon-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransType("Entrada")}
                  className={`py-2 px-3 border rounded-lg text-xs font-semibold transition-all ${
                    transType === "Entrada" ? "bg-salon-success border-salon-success text-salon-bg" : "bg-salon-bg border-salon-border text-salon-text-secondary"
                  }`}
                >
                  Entrada (Receita)
                </button>
                <button
                  type="button"
                  onClick={() => setTransType("Saída")}
                  className={`py-2 px-3 border rounded-lg text-xs font-semibold transition-all ${
                    transType === "Saída" ? "bg-salon-error border-salon-error text-salon-bg" : "bg-salon-bg border-salon-border text-salon-text-secondary"
                  }`}
                >
                  Saída (Despesa)
                </button>
              </div>

              <div>
                <label className="block text-salon-text-secondary mb-1.5">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Venda Pomada Matte ou Pagamento Sabesp"
                  value={transDesc}
                  onChange={(e) => setTransDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-salon-text-secondary mb-1.5">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={transAmount}
                    onChange={(e) => setTransAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                  />
                </div>
                {transType === "Entrada" && (
                  <div>
                    <label className="block text-salon-text-secondary mb-1.5">Forma Recebimento</label>
                    <select
                      value={transMethod}
                      onChange={(e) => setTransMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                    >
                      {["Pix", "Crédito", "Débito", "Dinheiro"].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-salon-border/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-salon-border rounded-salon text-xs font-semibold text-salon-text-secondary"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-salon-bg hover:bg-primary-hover font-bold rounded-salon text-xs"
              >
                Confirmar Lancamento
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
