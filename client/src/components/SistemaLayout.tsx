import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Bell, MessageSquare, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const SISTEMA_TOKEN_KEY = "flowclik_sistema_token";

function checkSistemaAuth(): boolean {
  const token = localStorage.getItem(SISTEMA_TOKEN_KEY);
  return token === "admin_master_authenticated";
}

function sistemaLogout() {
  localStorage.removeItem(SISTEMA_TOKEN_KEY);
  window.location.href = "/system/login";
}

interface SistemaLayoutProps {
  children: React.ReactNode;
}

export default function SistemaLayout({ children }: SistemaLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authenticated = checkSistemaAuth();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      setLocation("/system/login");
    }
  }, [setLocation]);

  const navItems = [
    {
      title: "Dashboard",
      href: "/system",
      icon: LayoutDashboard,
      active: location === "/system",
    },
    {
      title: "Photographers",
      href: "/system/photographers",
      icon: Users,
      active: location === "/system/photographers",
    },
    {
      title: "Notices",
      href: "/system/notices",
      icon: Bell,
      active: location === "/system/notices",
    },
    {
      title: "Tickets",
      href: "/system/tickets",
      icon: MessageSquare,
      active: location === "/system/tickets",
    },
  ];

  // Verificando autenticação
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Verificando autenticação...</div>
      </div>
    );
  }

  // Not autenticado - will be redirecionado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 flex flex-col fixed left-0 top-0 bottom-0 z-50">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">FlowClik</h1>
          <p className="text-sm text-gray-400 mt-1">Painel Admin Master</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    item.active
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/50"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Botão Sair */}
        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={sistemaLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all justify-start"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair do Sistema</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto ml-64">
        {children}
      </main>
    </div>
  );
}
