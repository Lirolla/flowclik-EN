import { Link, useLocation } from "wouter";
import { Home, MessageSquare, Image, CreditCard, FileText, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

interface ClientLayoutProps {
  children: React.ReactNode;
  appointmentId?: number;
}

export function ClientLayout({ children, appointmentId }: ClientLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { href: `/client/dashboard/${appointmentId}`, label: "Dashboard", icon: Home },
    { href: `/client/gallery/${appointmentId}`, label: "Gallery", icon: Image },
    { href: `/client/chat/${appointmentId}`, label: "Chat", icon: MessageSquare },
    { href: `/client/payments/${appointmentId}`, label: "Payments", icon: CreditCard },
    { href: `/client/contract/${appointmentId}`, label: "Contract", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-red-600">FlowClik</h1>
              <p className="text-sm text-gray-400">Client Panel</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">{user?.name}</span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <a className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
                      isActive
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-400">
          <p>© 2024 FlowClik. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
