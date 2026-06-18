"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  DollarSign,
  Menu,
} from "lucide-react";

interface BottomNavigationProps {
  onMenuOpen: () => void;
}

export default function BottomNavigation({ onMenuOpen }: BottomNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Início", icon: LayoutDashboard },
    { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/dashboard/clientes", label: "Clientes", icon: Users },
    { href: "/dashboard/financeiro", label: "Caixa", icon: DollarSign },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-salon-surface border-t border-salon-border/80 flex items-center justify-around px-4 z-40 backdrop-blur-md">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
              isActive ? "text-primary" : "text-salon-text-secondary hover:text-salon-text-primary"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </Link>
        );
      })}

      <button
        onClick={onMenuOpen}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-salon-text-secondary hover:text-salon-text-primary transition-colors focus:outline-none"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-medium">Menu</span>
      </button>
    </nav>
  );
}
