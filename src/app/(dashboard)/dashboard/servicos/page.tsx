"use client";

import { useState } from "react";
import { useAura, Service } from "@/context/AuraContext";
import {
  Plus,
  Search,
  Clock,
  Sparkles,
  DollarSign,
  Tag,
  Percent,
  X,
  Edit,
  Trash,
} from "lucide-react";

export default function ServicosPage() {
  const { services, addService, updateService } = useAura();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Service["category"]>("Corte");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("120");
  const [commission, setCommission] = useState("40");

  const categories = ["Todos", "Corte", "Barba", "Coloração", "Tratamento", "Estética"];

  const getCategoryColor = (cat: Service["category"]) => {
    switch (cat) {
      case "Corte":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "Barba":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "Coloração":
        return "bg-primary/10 border-primary/20 text-primary";
      case "Tratamento":
        return "bg-purple-500/10 border-purple-500/20 text-purple-400";
      case "Unhas":
        return "bg-pink-500/10 border-pink-500/20 text-pink-400";
      case "Estética":
        return "bg-teal-500/10 border-teal-500/20 text-teal-400";
      default:
        return "bg-salon-text-secondary/10 border-salon-border text-salon-text-secondary";
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setName("");
    setCategory("Corte");
    setDuration("40");
    setPrice("70");
    setCommission("40");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingService(svc);
    setName(svc.name);
    setCategory(svc.category);
    setDuration(svc.duration_minutes.toString());
    setPrice(svc.price.toString());
    setCommission(
      svc.commission_rate ? (svc.commission_rate * 100).toString() : "40"
    );
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !duration) return;

    const rate = parseFloat(commission) / 100;

    if (editingService) {
      updateService(editingService.id, {
        name,
        category,
        duration_minutes: parseInt(duration),
        price: parseFloat(price),
        commission_rate: rate,
      });
    } else {
      addService({
        name,
        category,
        duration_minutes: parseInt(duration),
        price: parseFloat(price),
        commission_rate: rate,
      });
    }
    setIsModalOpen(false);
  };

  // Filter and search services
  const filteredServices = services.filter((svc) => {
    const matchesSearch = svc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || svc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Catálogo de Serviços</h2>
          <p className="text-salon-text-secondary text-sm">
            Gerencie o menu de tratamentos, preços cobrados e taxas de repasse.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-salon-bg font-bold px-4 py-2.5 rounded-salon text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)]"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Serviço
        </button>
      </div>

      {/* Toolbar Categories & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-primary border-primary text-salon-bg"
                  : "bg-salon-surface border-salon-border text-salon-text-secondary hover:text-salon-text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-salon-text-secondary">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome do serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-salon-surface border border-salon-border rounded-lg text-xs text-salon-text-primary placeholder-salon-text-secondary/50 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Services Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((svc) => (
          <div
            key={svc.id}
            className="bg-salon-surface border border-salon-border rounded-salon p-6 flex flex-col justify-between space-y-4 hover:border-primary/20 transition-all"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getCategoryColor(svc.category)}`}>
                  {svc.category}
                </span>

                <div className="flex gap-1.5 text-salon-text-secondary">
                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="p-1 border border-salon-border rounded hover:text-primary transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h4 className="text-sm font-bold text-salon-text-primary">{svc.name}</h4>
            </div>

            <div className="pt-3 border-t border-salon-border/40 grid grid-cols-3 gap-2 text-xs">
              <div className="space-y-1">
                <span className="text-[9px] text-salon-text-secondary block font-medium uppercase">Duração</span>
                <span className="font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-salon-text-secondary" />
                  {svc.duration_minutes} min
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-salon-text-secondary block font-medium uppercase">Preço</span>
                <span className="font-bold text-primary">R$ {svc.price.toFixed(2)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-salon-text-secondary block font-medium uppercase">Comissão</span>
                <span className="font-semibold text-salon-text-primary">
                  {svc.commission_rate ? `${svc.commission_rate * 100}%` : "40%"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add/Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <form
            onSubmit={handleSave}
            className="bg-salon-surface border border-salon-border rounded-salon p-6 w-full max-w-sm shadow-2xl relative z-10 space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-salon-border/50">
              <h3 className="font-bold text-sm">
                {editingService ? "Editar Serviço" : "Cadastrar Novo Serviço"}
              </h3>
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
                <label className="block text-salon-text-secondary mb-1.5">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Escova Progressiva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-salon-text-secondary mb-1.5">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Service["category"])}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                >
                  {(["Corte", "Barba", "Coloração", "Tratamento", "Estética"] as const).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-salon-text-secondary mb-1.5">Preço (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-salon-text-secondary mb-1.5">Duração (min)</label>
                  <input
                    type="number"
                    required
                    placeholder="60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-salon-text-secondary mb-1.5">Comissão (%)</label>
                  <input
                    type="number"
                    required
                    placeholder="40"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                  />
                </div>
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
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
