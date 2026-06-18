"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAura } from "@/context/AuraContext";
import { Menu, Bell, User, LogOut, ShieldAlert } from "lucide-react";
import { sidebarItems } from "./Sidebar";

interface HeaderProps {
  onMenuOpen: () => void;
}

interface UserProfile {
  name: string;
  role: "admin" | "professional";
  avatar_url?: string;
}

export default function Header({ onMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { notifications, markNotificationRead } = useAura();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  useEffect(() => {
    async function fetchProfile() {
      // Mock profile check
      const mockRole = localStorage.getItem("aura-mock-role");
      const mockName = localStorage.getItem("aura-mock-name");
      if (mockRole && mockName) {
        setProfile({
          name: mockName,
          role: mockRole as any,
        });
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("name, role, avatar_url")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          setProfile(data as UserProfile);
        } else {
          setProfile({
            name: user.email ? user.email.split("@")[0] : "Colaborador",
            role: "professional",
          });
        }
      } catch (e) {
        setProfile({
          name: "Colaborador Mock",
          role: "professional",
        });
      }
    }

    fetchProfile();
  }, [supabase]);

  const activeItem = sidebarItems.find((item) => item.href === pathname);
  const pageTitle = activeItem ? activeItem.label : "Aura Barber";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="h-16 border-b border-salon-border/80 bg-salon-surface/80 backdrop-blur-sm px-6 flex items-center justify-between text-salon-text-primary sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Toggle Button for Mobile */}
        <button
          onClick={onMenuOpen}
          className="md:hidden text-salon-text-secondary hover:text-salon-text-primary transition-colors focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold tracking-wide capitalize">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-full bg-salon-bg border border-salon-border flex items-center justify-center text-salon-text-secondary hover:text-primary transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-salon-bg rounded-full flex items-center justify-center font-bold text-[9px] border-2 border-salon-surface animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-salon-surface border border-salon-border rounded-salon shadow-2xl p-4 z-30 animate-in fade-in-50 slide-in-from-top-2 duration-150">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-salon-border/50">
                <span className="text-sm font-semibold">Notificações</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {unreadCount} Novas
                  </span>
                )}
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-xs text-salon-text-secondary">Nenhuma notificação recente.</p>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                      }}
                      className={`text-left text-xs group block w-full border-b border-salon-border/20 pb-2 last:border-0 last:pb-0 ${
                        notif.read ? "opacity-60" : "opacity-100"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className={`font-semibold group-hover:text-primary transition-colors uppercase text-[10px] tracking-wider ${
                          notif.read ? "text-salon-text-primary" : "text-primary font-bold"
                        }`}>
                          {notif.type}
                        </p>
                        {!notif.read && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-salon-text-secondary mt-0.5 text-[11px] leading-relaxed">
                        {notif.message}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 hover:opacity-95 transition-opacity focus:outline-none"
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold">{profile?.name || "Carregando..."}</p>
              <span className="text-[10px] text-primary uppercase tracking-wider font-semibold flex items-center justify-end gap-1">
                {profile?.role === "admin" && <ShieldAlert className="w-3.5 h-3.5" />}
                {profile?.role === "admin" ? "Administrador" : "Profissional"}
              </span>
            </div>

            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-10 h-10 rounded-full border border-primary/20 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {profile ? getUserInitials(profile.name) : <User className="w-5 h-5" />}
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-salon-surface border border-salon-border rounded-salon shadow-2xl p-2 z-30 animate-in fade-in-50 slide-in-from-top-2 duration-150">
              <div className="md:hidden border-b border-salon-border/50 p-2 mb-1">
                <p className="text-xs font-semibold">{profile?.name}</p>
                <p className="text-[9px] text-primary uppercase tracking-wider font-medium">{profile?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-salon-text-secondary hover:text-salon-error hover:bg-salon-error/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
