"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Scissors,
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  Package,
  DollarSign,
  CheckSquare,
  Settings,
  LogOut,
  X,
  MessageSquare,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/chat", label: "Chat WhatsApp", icon: MessageSquare },
  { href: "/dashboard/profissionais", label: "Profissionais", icon: Scissors },
  { href: "/dashboard/servicos", label: "Serviços", icon: Sparkles },
  { href: "/dashboard/estoque", label: "Estoque", icon: Package },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/dashboard/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    // Clear mock session
    document.cookie = "aura-mock-session=; Max-Age=0; path=/";
    localStorage.removeItem("aura-mock-role");
    localStorage.removeItem("aura-mock-name");

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const content = (
    <div className="h-full flex flex-col bg-salon-surface border-r border-salon-border/80 w-64 text-salon-text-primary p-6">
      {/* Brand Logo */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary">
            <Scissors className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <h2 className="font-bold tracking-wider text-lg">AURA</h2>
            <p className="text-[9px] tracking-widest text-primary font-semibold uppercase">
              Barber &amp; Co.
            </p>
          </div>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden text-salon-text-secondary hover:text-salon-text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 -mr-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-salon text-sm font-medium transition-all group ${
                isActive
                  ? "bg-primary text-salon-bg shadow-[0_4px_12px_rgba(201,169,110,0.15)] font-semibold"
                  : "text-salon-text-secondary hover:text-salon-text-primary hover:bg-salon-bg"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                  isActive ? "text-salon-bg" : "text-salon-text-secondary group-hover:text-primary"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="pt-6 border-t border-salon-border/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-salon text-sm font-medium text-salon-text-secondary hover:text-salon-error hover:bg-salon-error/10 transition-all group"
        >
          <LogOut className="w-5 h-5 text-salon-text-secondary group-hover:text-salon-error transition-colors" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-20 w-64 h-full">
        {content}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Drawer panel */}
        <aside
          className={`absolute inset-y-0 left-0 w-64 shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
