"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-salon-bg flex">
      {/* Navigation sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content viewport */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Bottom navigation for mobile devices */}
      <BottomNavigation onMenuOpen={() => setSidebarOpen(true)} />
    </div>
  );
}
