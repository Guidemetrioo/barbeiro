"use client";

import { useState } from "react";
import { useAura, Task } from "@/context/AuraContext";
import {
  Plus,
  Search,
  User,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  AlertTriangle,
  Play,
  CheckCircle,
} from "lucide-react";

export default function TarefasPage() {
  const { tasks, addTask, moveTask } = useAura();
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("média");
  const [deadline, setDeadline] = useState("Hoje, 19:00");
  const [assigned, setAssigned] = useState("Barbeiro 2");

  const columns = [
    { id: "A fazer", label: "A Fazer", color: "border-t-blue-500", bg: "bg-blue-500/5" },
    { id: "Em andamento", label: "Em Progresso", color: "border-t-salon-alert", bg: "bg-salon-alert/5" },
    { id: "Concluído", label: "Concluídas", color: "border-t-salon-success", bg: "bg-salon-success/5" },
  ] as const;

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addTask({
      title,
      description: desc,
      status: "A fazer",
      priority,
      due_date: deadline,
      assigned_to: assigned,
    });

    setIsModalOpen(false);
    setTitle("");
    setDesc("");
    setDeadline("Hoje, 19:00");
  };

  const handleMove = (id: number, direction: "left" | "right") => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    let newStatus: Task["status"] = task.status;
    if (task.status === "A fazer" && direction === "right") newStatus = "Em andamento";
    else if (task.status === "Em andamento" && direction === "left") newStatus = "A fazer";
    else if (task.status === "Em andamento" && direction === "right") newStatus = "Concluído";
    else if (task.status === "Concluído" && direction === "left") newStatus = "Em andamento";

    moveTask(id, newStatus);
  };

  // Filter tasks by search
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assigned_to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (p: Task["priority"]) => {
    switch (p) {
      case "alta":
        return "bg-salon-error/15 text-salon-error border border-salon-error/25";
      case "média":
        return "bg-salon-alert/15 text-salon-alert border border-salon-alert/25";
      case "baixa":
        return "bg-salon-text-secondary/15 text-salon-text-secondary border border-salon-border";
      default:
        return "bg-salon-border text-salon-text-secondary";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quadro de Tarefas</h2>
          <p className="text-salon-text-secondary text-sm">
            Monitore as rotinas de limpeza, recepção e manutenção da barbearia Aura.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-salon-bg font-bold px-4 py-2.5 rounded-salon text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)]"
        >
          <Plus className="w-4 h-4" />
          Nova Atividade
        </button>
      </div>

      {/* Toolbar Search */}
      <div className="bg-salon-surface border border-salon-border rounded-salon p-4 flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-salon-text-secondary">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por título ou responsável..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary placeholder-salon-text-secondary/50 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`border-t-4 ${col.color} bg-salon-surface border border-salon-border rounded-salon p-5 space-y-4 flex flex-col min-h-[450px]`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-salon-text-primary">{col.label}</h3>
                <span className="text-[10px] bg-salon-bg border border-salon-border/60 text-salon-text-secondary px-2.5 py-0.5 rounded-full font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Task list container */}
              <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[400px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-salon-text-secondary italic">
                    Sem tarefas nesta coluna
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-salon-bg/60 border border-salon-border/80 rounded-salon p-4 space-y-3 hover:border-primary/20 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="text-xs font-bold text-salon-text-primary leading-snug">
                            {t.title}
                          </h4>
                          <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 tracking-wider ${getPriorityColor(t.priority)}`}>
                            {t.priority}
                          </span>
                        </div>
                        {t.description && (
                          <p className="text-[10px] text-salon-text-secondary leading-normal">
                            {t.description}
                          </p>
                        )}
                      </div>

                      {/* Card Footer controls */}
                      <div className="pt-2 border-t border-salon-border/40 flex items-center justify-between text-[10px] text-salon-text-secondary font-semibold">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary/70" />
                          <span>{t.assigned_to}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t.due_date}</span>
                        </div>
                      </div>

                      {/* Action arrows for column transitions */}
                      <div className="flex justify-end gap-1.5 pt-2">
                        {t.status !== "A fazer" && (
                          <button
                            onClick={() => handleMove(t.id, "left")}
                            className="p-1 border border-salon-border rounded bg-salon-surface text-salon-text-secondary hover:text-primary transition-colors"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {t.status !== "Concluído" && (
                          <button
                            onClick={() => handleMove(t.id, "right")}
                            className="p-1 border border-salon-border rounded bg-salon-surface text-salon-text-secondary hover:text-primary transition-colors"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: New Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <form
            onSubmit={handleSaveTask}
            className="bg-salon-surface border border-salon-border rounded-salon p-6 w-full max-w-sm shadow-2xl relative z-10 space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-salon-border/50">
              <h3 className="font-bold text-sm">Criar Nova Tarefa</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-salon-text-secondary hover:text-salon-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-salon-text-secondary mb-1.5">Título da Atividade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Organizar armário de químicos"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-salon-text-secondary mb-1.5">Descrição detalhada</label>
                <textarea
                  placeholder="Ex: Verificar validades e agrupar por numeração de tinta."
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-salon-text-secondary mb-1.5">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task["priority"])}
                    className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary"
                  >
                    {["baixa", "média", "alta"].map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-salon-text-secondary mb-1.5">Responsável</label>
                  <select
                    value={assigned}
                    onChange={(e) => setAssigned(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary"
                  >
                    {["Barbeiro 1", "Barbeiro 2", "Barbeiro 3", "Recepção", "Administrador"].map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-salon-text-secondary mb-1.5">Prazo de Conclusão</label>
                <input
                  type="text"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Ex: Hoje, 19:00"
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary"
                />
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
                Criar Atividade
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
