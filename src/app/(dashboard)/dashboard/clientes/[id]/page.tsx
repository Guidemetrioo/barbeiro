"use client";

import { useState } from "react";
import { useAura, Client, ChemRecord, ColorRecord } from "@/context/AuraContext";
import {
  ArrowLeft,
  Scissors,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  User,
  Heart,
  Plus,
  Star,
  Trash,
  Upload,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const clientId = parseInt(params.id);
  const {
    clients,
    appointments,
    services,
    professionals,
    updateClientHair,
    addChemicalHistory,
    addColorHistory,
    addBeforeAfterPhoto,
    addAppointment,
  } = useAura();

  const client = clients.find((c) => c.id === clientId);

  // Edit Hair Info States
  const [isEditingHair, setIsEditingHair] = useState(false);
  const [hairType, setHairType] = useState(client?.hair_type || "");
  const [hairLength, setHairLength] = useState(client?.hair_length || "");
  const [hairCondition, setHairCondition] = useState(client?.hair_condition || "");
  const [generalNotes, setGeneralNotes] = useState(client?.notes || "");

  // Add History Record Modals/States
  const [isAddingChem, setIsAddingChem] = useState(false);
  const [chemProcedure, setChemProcedure] = useState("");
  const [chemProduct, setChemProduct] = useState("");
  const [chemResult, setChemResult] = useState("");

  const [isAddingColor, setIsAddingColor] = useState(false);
  const [colorBrand, setColorBrand] = useState("");
  const [colorNumber, setColorNumber] = useState("");
  const [colorOx, setColorOx] = useState("");
  const [colorRatio, setColorRatio] = useState("");
  const [colorPause, setColorPause] = useState("");
  const [colorNotes, setColorNotes] = useState("");

  // Before After Mock Upload States
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoBefore, setPhotoBefore] = useState("");
  const [photoAfter, setPhotoAfter] = useState("");

  if (!client) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-salon-error mx-auto" />
        <h3 className="text-lg font-bold">Cliente não encontrado</h3>
        <Link href="/dashboard/clientes" className="text-primary hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar para a lista
        </Link>
      </div>
    );
  }

  // Calculations
  const clientAppts = appointments.filter((a) => a.client_id === client.id);
  const completedAppts = clientAppts.filter((a) => a.status === "Concluído");

  const totalSpent = completedAppts.reduce((acc, appt) => {
    let total = appt.price_override || 0;
    if (total === 0) {
      appt.services.forEach((sId) => {
        const svc = services.find((s) => s.id === sId);
        if (svc) total += svc.price;
      });
    }
    return acc + total;
  }, 0);

  // Return Programmed Suggestion Date
  // Calculate dynamically: if last service was coloring/bleaching: suggest in 45 days. If cut: 30 days. Default: 60 days.
  const getSuggestedReturnDate = () => {
    if (completedAppts.length === 0) return { date: "Hoje", days: 0 };
    const sorted = [...completedAppts].sort((a, b) => b.datetime.localeCompare(a.datetime));
    const lastAppt = sorted[0];
    const lastDate = new Date(lastAppt.datetime);
    
    // Check if any coloring or chemical treatment
    const hasChemical = lastAppt.services.some(sId => [3, 4, 5].includes(sId));
    const daysToAdd = hasChemical ? 45 : 30;
    
    lastDate.setDate(lastDate.getDate() + daysToAdd);
    return {
      date: lastDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }),
      days: daysToAdd,
      raw: lastDate.toISOString().split("T")[0]
    };
  };

  const returnSuggest = getSuggestedReturnDate();

  const handleSaveHairInfo = () => {
    updateClientHair(client.id, {
      hair_type: hairType,
      hair_length: hairLength,
      hair_condition: hairCondition,
      notes: generalNotes,
    });
    setIsEditingHair(false);
  };

  const handleAddChem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chemProcedure || !chemProduct) return;
    addChemicalHistory(client.id, {
      date: new Date().toISOString().split("T")[0],
      procedure: chemProcedure,
      product: chemProduct,
      result: chemResult,
    });
    setIsAddingChem(false);
    setChemProcedure("");
    setChemProduct("");
    setChemResult("");
  };

  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorBrand || !colorNumber) return;
    addColorHistory(client.id, {
      date: new Date().toISOString().split("T")[0],
      brand: colorBrand,
      number: colorNumber,
      oxidant: colorOx,
      ratio: colorRatio,
      pause_time: colorPause,
      notes: colorNotes,
    });
    setIsAddingColor(false);
    setColorBrand("");
    setColorNumber("");
    setColorOx("");
    setColorRatio("");
    setColorPause("");
    setColorNotes("");
  };

  const handlePhotoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoBefore || !photoAfter) return;
    addBeforeAfterPhoto(client.id, photoBefore, photoAfter);
    setIsUploadingPhoto(false);
    setPhotoBefore("");
    setPhotoAfter("");
  };

  const handleQuickBookReturn = () => {
    // Generate return appointment
    addAppointment({
      client_id: client.id,
      professional_id: 2, // default Carol
      datetime: `${returnSuggest.raw}T10:00:00.000Z`,
      status: "Agendado",
      services: [1], // Default Cut
      products: [],
      notes: "Agendamento de retorno automático sugerido pelo sistema.",
    });
    router.push("/dashboard/agenda");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Back button and profile header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-border/50 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/clientes"
            className="p-2 border border-salon-border rounded-lg bg-salon-surface hover:text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
              <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase">
                Ficha nº {client.id}
              </span>
            </div>
            <p className="text-salon-text-secondary text-sm mt-1">
              Ficha cadastral e histórico técnico capilar.
            </p>
          </div>
        </div>

        {/* Action Suggest Return */}
        {returnSuggest.days > 0 && (
          <button
            onClick={handleQuickBookReturn}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-salon-bg font-bold px-4 py-2.5 rounded-salon text-xs transition-all shadow-[0_0_15px_rgba(201,169,110,0.15)]"
          >
            <Calendar className="w-4 h-4" />
            Agendar Retorno ({returnSuggest.date})
          </button>
        )}
      </div>

      {/* Grid: 3 Columns (Overview stats, hair specs, before/after) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Box 1: Personal Info & Stats */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6">
          <h3 className="text-sm font-bold border-b border-salon-border/50 pb-3 flex items-center gap-2 text-primary">
            <User className="w-4 h-4" />
            Dados Pessoais
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-salon-text-secondary" />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-salon-text-secondary">Telefone</p>
                <p className="font-semibold mt-0.5">{client.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-salon-text-secondary" />
              <div className="overflow-hidden">
                <p className="text-[9px] uppercase tracking-wider text-salon-text-secondary">E-mail</p>
                <p className="font-semibold mt-0.5 truncate">{client.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-salon-text-secondary" />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-salon-text-secondary">Data Nascimento</p>
                <p className="font-semibold mt-0.5">
                  {new Date(client.birthdate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-salon-border/40 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-salon-text-secondary">Total Gasto</p>
                <p className="text-base font-bold text-primary mt-0.5">R$ {totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-salon-text-secondary">Visitas</p>
                <p className="text-base font-bold text-salon-text-primary mt-0.5">{completedAppts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Hair Specifications */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-salon-border/50 pb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
              <Scissors className="w-4 h-4" />
              Ficha de Cabelo &amp; Barba
            </h3>
            <button
              onClick={() => setIsEditingHair(!isEditingHair)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {isEditingHair ? "Cancelar" : "Editar"}
            </button>
          </div>

          {!isEditingHair ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-salon-text-secondary">Tipo de Cabelo / Barba</span>
                <p className="font-semibold text-salon-text-primary mt-0.5">{client.hair_type || "Não preenchido"}</p>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-salon-text-secondary">Comprimento / Estilo</span>
                <p className="font-semibold text-salon-text-primary mt-0.5">{client.hair_length || "Não preenchido"}</p>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-salon-text-secondary">Condição do Cabelo &amp; Barba</span>
                <p className="font-semibold text-salon-text-primary mt-0.5">{client.hair_condition || "Não preenchido"}</p>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-salon-text-secondary">Observações Gerais</span>
                <p className="text-salon-text-secondary mt-1 leading-relaxed">{client.notes || "Sem observações específicas."}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-salon-text-secondary mb-1">Tipo de Cabelo / Barba</label>
                <input
                  type="text"
                  value={hairType}
                  onChange={(e) => setHairType(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-salon-text-secondary mb-1">Comprimento / Estilo</label>
                <input
                  type="text"
                  value={hairLength}
                  onChange={(e) => setHairLength(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-salon-text-secondary mb-1">Condição do Cabelo &amp; Barba</label>
                <input
                  type="text"
                  value={hairCondition}
                  onChange={(e) => setHairCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-salon-text-secondary mb-1">Observações Técnicas</label>
                <textarea
                  value={generalNotes}
                  rows={2}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={handleSaveHairInfo}
                className="w-full py-2 bg-primary text-salon-bg font-bold rounded-lg text-xs hover:bg-primary-hover transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          )}
        </div>

        {/* Box 3: Before & After Photos Gallery */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-salon-border/50 pb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
              <ImageIcon className="w-4 h-4" />
              Galeria Antes &amp; Depois
            </h3>
            <button
              onClick={() => setIsUploadingPhoto(!isUploadingPhoto)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {isUploadingPhoto ? "Voltar" : "Adicionar"}
            </button>
          </div>

          {!isUploadingPhoto ? (
            <div className="space-y-4">
              {client.before_after_photos.length === 0 ? (
                <div className="py-8 text-center text-xs text-salon-text-secondary border border-dashed border-salon-border rounded-lg">
                  Nenhuma foto anexada a este perfil.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {client.before_after_photos.map((photo) => (
                    <div key={photo.id} className="border border-salon-border rounded-lg overflow-hidden relative group">
                      <div className="flex h-20">
                        <img src={photo.before} alt="Antes" className="w-1/2 object-cover border-r border-salon-border" />
                        <img src={photo.after} alt="Depois" className="w-1/2 object-cover" />
                      </div>
                      <div className="bg-salon-bg/80 p-1 text-[9px] text-center border-t border-salon-border text-salon-text-secondary">
                        {photo.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handlePhotoUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-salon-text-secondary mb-1">URL Foto (Antes)</label>
                <input
                  type="text"
                  required
                  placeholder="https://exemplo.com/antes.jpg"
                  value={photoBefore}
                  onChange={(e) => setPhotoBefore(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-salon-text-secondary mb-1">URL Foto (Depois)</label>
                <input
                  type="text"
                  required
                  placeholder="https://exemplo.com/depois.jpg"
                  value={photoAfter}
                  onChange={(e) => setPhotoAfter(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-bg border border-salon-border rounded-lg text-xs text-salon-text-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-primary text-salon-bg font-bold rounded-lg text-xs"
              >
                Adicionar Comparação
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Row: Chemical and Coloring History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Col 1: Chemistry Logs */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-salon-border/50 pb-3">
            <h4 className="text-sm font-bold text-salon-text-primary">Químicas &amp; Selagens</h4>
            <button
              onClick={() => setIsAddingChem(!isAddingChem)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Registro
            </button>
          </div>

          {isAddingChem && (
            <form onSubmit={handleAddChem} className="bg-salon-bg border border-salon-border p-4 rounded-salon space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-salon-text-secondary mb-1">Procedimento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Progressiva"
                    value={chemProcedure}
                    onChange={(e) => setChemProcedure(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-salon-text-secondary mb-1">Produto Utilizado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Wella Blond Studio"
                    value={chemProduct}
                    onChange={(e) => setChemProduct(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-salon-text-secondary mb-1">Resultado / Elasticidade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cabelo íntegro, tom uniforme."
                  value={chemResult}
                  onChange={(e) => setChemResult(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingChem(false)}
                  className="px-3 py-1.5 border border-salon-border rounded text-[10px]"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-3 py-1.5 bg-primary text-salon-bg rounded text-[10px] font-bold">
                  Gravar Registro
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {client.chemicalHistory.length === 0 ? (
              <p className="text-center py-6 text-xs text-salon-text-secondary border border-dashed border-salon-border rounded-lg">
                Sem químicos catalogados nesta ficha.
              </p>
            ) : (
              client.chemicalHistory.map((chem) => (
                <div key={chem.id} className="p-3 bg-salon-bg/40 border border-salon-border/60 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-primary uppercase">{chem.procedure}</span>
                    <span className="text-salon-text-secondary">{new Date(chem.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                  </div>
                  <p className="text-salon-text-primary font-semibold">Produto: <span className="font-normal text-salon-text-secondary">{chem.product}</span></p>
                  <p className="text-salon-text-primary font-semibold">Resultado: <span className="font-normal text-salon-text-secondary">{chem.result}</span></p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 2: Coloring Logs */}
        <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-salon-border/50 pb-3">
            <h4 className="text-sm font-bold text-salon-text-primary">Design de Barba &amp; Pigmentação</h4>
            <button
              onClick={() => setIsAddingColor(!isAddingColor)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Coloração
            </button>
          </div>

          {isAddingColor && (
            <form onSubmit={handleAddColor} className="bg-salon-bg border border-salon-border p-4 rounded-salon space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-salon-text-secondary mb-1">Marca / Linha</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Wella Ilumina"
                    value={colorBrand}
                    onChange={(e) => setColorBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-salon-text-secondary mb-1">Numeração Tinta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 8.3 + 9.0"
                    value={colorNumber}
                    onChange={(e) => setColorNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-salon-text-secondary mb-1">Oxidante (Vol)</label>
                  <input
                    type="text"
                    placeholder="Ex: 20 vol"
                    value={colorOx}
                    onChange={(e) => setColorOx(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-salon-text-secondary mb-1">Proporção Mix</label>
                  <input
                    type="text"
                    placeholder="Ex: 1:1"
                    value={colorRatio}
                    onChange={(e) => setColorRatio(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-salon-text-secondary mb-1">Pausa (min)</label>
                  <input
                    type="text"
                    placeholder="Ex: 35 min"
                    value={colorPause}
                    onChange={(e) => setColorPause(e.target.value)}
                    className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-salon-text-secondary mb-1">Notas Adicionais</label>
                <input
                  type="text"
                  placeholder="Ex: Cobriu cabelos brancos nas têmporas."
                  value={colorNotes}
                  onChange={(e) => setColorNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-salon-surface border border-salon-border rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingColor(false)}
                  className="px-3 py-1.5 border border-salon-border rounded text-[10px]"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-3 py-1.5 bg-primary text-salon-bg rounded text-[10px] font-bold">
                  Gravar Registro
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {client.colorHistory.length === 0 ? (
              <p className="text-center py-6 text-xs text-salon-text-secondary border border-dashed border-salon-border rounded-lg">
                Sem colorações catalogadas.
              </p>
            ) : (
              client.colorHistory.map((col) => (
                <div key={col.id} className="p-3 bg-salon-bg/40 border border-salon-border/60 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-primary uppercase">{col.brand} ({col.number})</span>
                    <span className="text-salon-text-secondary">{new Date(col.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-salon-text-secondary">
                    <span>Ox: {col.oxidant || "-"}</span>
                    <span>Mix: {col.ratio || "-"}</span>
                    <span>Pausa: {col.pause_time || "-"}</span>
                  </div>
                  {col.notes && <p className="text-[10px] text-salon-text-primary italic">Obs: {col.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Box: Appointments timeline history */}
      <div className="bg-salon-surface border border-salon-border rounded-salon p-6 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-salon-text-primary">Histórico de Atendimentos (Timeline)</h4>
          <p className="text-[11px] text-salon-text-secondary">Lista de todos os horários e serviços realizados</p>
        </div>

        <div className="space-y-4">
          {completedAppts.length === 0 ? (
            <p className="text-center py-8 text-xs text-salon-text-secondary border border-dashed border-salon-border rounded-lg">
              Este cliente ainda não possui nenhum atendimento concluído na barbearia.
            </p>
          ) : (
            completedAppts.map((appt) => {
              const prof = professionals.find((p) => p.id === appt.professional_id);
              const apptServices = appt.services.map((sId) => services.find((s) => s.id === sId));
              const time = new Date(appt.datetime).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
              });

              return (
                <div
                  key={appt.id}
                  className="bg-salon-bg/20 border border-salon-border rounded-salon p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary text-xs shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-salon-text-primary">{time}</h5>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {apptServices.map(
                          (s) =>
                            s && (
                              <span
                                key={s.id}
                                className="text-[9px] bg-primary/15 border border-primary/25 text-primary px-2 py-0.5 rounded font-bold uppercase"
                              >
                                {s.name}
                              </span>
                            )
                        )}
                      </div>
                      <p className="text-[10px] text-salon-text-secondary mt-1.5">
                        Profissional: <span className="font-semibold text-salon-text-primary">{prof?.name}</span>
                      </p>
                      {appt.notes && (
                        <p className="text-[10px] text-salon-text-secondary italic mt-1">
                          Notas: {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1.5 border-t sm:border-0 border-salon-border/30 pt-2 sm:pt-0">
                    <span className="text-xs font-bold text-primary">
                      R${" "}
                      {(appt.price_override ||
                        apptServices.reduce((acc, s) => acc + (s ? s.price : 0), 0)
                      ).toFixed(2)}
                    </span>
                    <div className="flex gap-0.5 text-primary">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
