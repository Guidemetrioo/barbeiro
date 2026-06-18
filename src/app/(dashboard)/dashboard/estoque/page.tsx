"use client";

import { useState } from "react";
import { useAura, Product } from "@/context/AuraContext";
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  Search,
  Calendar,
  DollarSign,
  Tag,
  X,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function EstoquePage() {
  const { products, addProduct, updateProductStock } = useAura();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "alerta" | "zerado">("todos");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"entrada" | "saida" | "novo">("entrada");
  const [selectedProdId, setSelectedProdId] = useState<number>(1);

  // Form States
  const [newProdName, setNewProdName] = useState("");
  const [newProdCat, setNewProdCat] = useState("Cabelo");
  const [newProdMin, setNewProdMin] = useState("5");
  const [newProdCost, setNewProdCost] = useState("50");
  const [newProdQty, setNewProdQty] = useState("10");
  const [newProdExpiry, setNewProdExpiry] = useState("2027-12-31");

  const [qtyChange, setQtyChange] = useState("1");

  const categories = ["Todos", "Cabelo", "Coloração", "Finalizadores", "Descartáveis"];

  const getStockStatus = (prod: Product) => {
    if (prod.stock_quantity === 0) return "zerado";
    if (prod.stock_quantity <= prod.min_stock) return "alerta";
    return "ok";
  };

  const isNearExpiry = (dateStr: string) => {
    const expiry = new Date(dateStr).getTime();
    const thirtyDaysFromNow = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
    return expiry < thirtyDaysFromNow;
  };

  const handleOpenTransaction = (type: "entrada" | "saida", prodId: number) => {
    setModalType(type);
    setSelectedProdId(prodId);
    setQtyChange("1");
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setModalType("novo");
    setNewProdName("");
    setNewProdCat("Cabelo");
    setNewProdMin("5");
    setNewProdCost("45");
    setNewProdQty("10");
    setNewProdExpiry("2027-12-31");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === "novo") {
      if (!newProdName || !newProdQty) return;
      addProduct({
        name: newProdName,
        category: newProdCat,
        stock_quantity: parseInt(newProdQty),
        min_stock: parseInt(newProdMin),
        unit_cost: parseFloat(newProdCost),
        expiry_date: newProdExpiry,
      });
    } else {
      const multiplier = modalType === "entrada" ? 1 : -1;
      const change = parseInt(qtyChange) * multiplier;
      updateProductStock(selectedProdId, change);
    }
    setIsModalOpen(false);
  };

  // Filter Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || prod.category === activeCategory;
    
    const status = getStockStatus(prod);
    const matchesStatus =
      filterStatus === "todos" ||
      (filterStatus === "alerta" && status === "alerta") ||
      (filterStatus === "zerado" && status === "zerado");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estoque &amp; Almoxarifado</h2>
          <p className="text-salon-text-secondary text-sm">
            Monitore insumos profissionais e produtos para revenda direta no balcão.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-salon-bg font-bold px-4 py-2.5 rounded-salon text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)]"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Produto
        </button>
      </div>

      {/* Toolbar filters */}
      <div className="bg-salon-surface border border-salon-border rounded-salon p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Category & Status Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Status filters */}
          <div className="bg-salon-bg border border-salon-border rounded-salon p-0.5 flex">
            {(["todos", "alerta", "zerado"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  filterStatus === status
                    ? "bg-primary text-salon-bg"
                    : "text-salon-text-secondary hover:text-salon-text-primary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="bg-salon-bg border border-salon-border rounded-lg text-xs px-3 py-2 text-salon-text-primary focus:outline-none focus:border-primary"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-salon-text-secondary">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar insumo ou produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary placeholder-salon-text-secondary/50 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-salon-surface border border-salon-border rounded-salon overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-salon-border bg-salon-bg/30 text-salon-text-secondary font-semibold uppercase tracking-wider">
                <th className="p-4">Produto</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-center">Quantidade</th>
                <th className="p-4 text-center">Mínimo</th>
                <th className="p-4">Custo Un.</th>
                <th className="p-4">Validade</th>
                <th className="p-4 text-right">Movimentar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-salon-border/50">
              {filteredProducts.map((prod) => {
                const status = getStockStatus(prod);
                const nearExp = isNearExpiry(prod.expiry_date);

                return (
                  <tr key={prod.id} className="hover:bg-salon-bg/10 transition-colors">
                    <td className="p-4 font-bold text-salon-text-primary">
                      <div className="space-y-1">
                        <p>{prod.name}</p>
                        {nearExp && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-salon-error/10 text-salon-error px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Validade Próxima
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] bg-salon-bg border border-salon-border text-salon-text-secondary px-2.5 py-1 rounded-full font-bold uppercase">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-bold text-sm ${
                        status === "zerado" ? "text-salon-error" : status === "alerta" ? "text-salon-alert" : "text-salon-text-primary"
                      }`}>
                        {prod.stock_quantity}
                      </span>
                    </td>
                    <td className="p-4 text-center text-salon-text-secondary font-medium">
                      {prod.min_stock}
                    </td>
                    <td className="p-4 font-semibold text-salon-text-primary">
                      R$ {prod.unit_cost.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-salon-text-secondary font-medium ${nearExp ? "text-salon-error" : ""}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(prod.expiry_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleOpenTransaction("entrada", prod.id)}
                          className="p-1.5 border border-salon-border rounded bg-salon-bg hover:text-salon-success hover:border-salon-success/30 transition-all"
                          title="Entrada de Estoque"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenTransaction("saida", prod.id)}
                          className="p-1.5 border border-salon-border rounded bg-salon-bg hover:text-salon-error hover:border-salon-error/30 transition-all"
                          title="Saída Manual"
                          disabled={prod.stock_quantity === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Inventory Transaction / Create Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <form
            onSubmit={handleSave}
            className="bg-salon-surface border border-salon-border rounded-salon p-6 w-full max-w-sm shadow-2xl relative z-10 space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-salon-border/50">
              <h3 className="font-bold text-sm">
                {modalType === "entrada" && "Registrar Entrada de Estoque"}
                {modalType === "saida" && "Registrar Saída Manual"}
                {modalType === "novo" && "Cadastrar Novo Produto"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-salon-text-secondary hover:text-salon-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === "novo" ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-salon-text-secondary mb-1.5">Nome do Insumo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tonalizante Wella 60g"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-salon-text-secondary mb-1.5">Categoria</label>
                    <select
                      value={newProdCat}
                      onChange={(e) => setNewProdCat(e.target.value)}
                      className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary"
                    >
                      {["Cabelo", "Coloração", "Finalizadores", "Descartáveis"].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-salon-text-secondary mb-1.5">Validade</label>
                    <input
                      type="date"
                      required
                      value={newProdExpiry}
                      onChange={(e) => setNewProdExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-salon-text-secondary mb-1.5">Quantidade</label>
                    <input
                      type="number"
                      required
                      value={newProdQty}
                      onChange={(e) => setNewProdQty(e.target.value)}
                      className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-salon-text-secondary mb-1.5">Mínimo</label>
                    <input
                      type="number"
                      required
                      value={newProdMin}
                      onChange={(e) => setNewProdMin(e.target.value)}
                      className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-salon-text-secondary mb-1.5">Custo (R$)</label>
                    <input
                      type="number"
                      required
                      value={newProdCost}
                      onChange={(e) => setNewProdCost(e.target.value)}
                      className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Entry/Exit transactions
              <div className="space-y-4 text-xs">
                <div className="bg-salon-bg border border-salon-border/60 rounded-lg p-3">
                  <span className="text-[10px] text-salon-text-secondary block font-medium uppercase">Produto</span>
                  <span className="font-bold text-salon-text-primary mt-1 block">
                    {products.find((p) => p.id === selectedProdId)?.name}
                  </span>
                </div>

                <div>
                  <label className="block text-salon-text-secondary mb-1.5">
                    {modalType === "entrada" ? "Quantidade a Adicionar" : "Quantidade a Retirar"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={qtyChange}
                    onChange={(e) => setQtyChange(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

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
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
