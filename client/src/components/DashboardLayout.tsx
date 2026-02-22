import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { TrialExpiredModal } from "./TrialExpiredModal";
import { LayoutDashboard, LogOut, PanelLeft, Users, Image, FolderOpen, Briefcase, Calendar, ShoppingCart, ImageIcon, Settings, ExternalLink, FileText, Camera, Ban, BarChart3, Clapperboard, DollarSign, Heart, MessageSquare, CreditCard, Globe, Lock, Mail } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { toast } from "sonner";

const menuItems = [
  // Dashboard
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  
  // Separador
  { type: "separator" },
  
  // Gestão Principal
  { icon: Users, label: "Clients", path: "/admin/clients" },
  { icon: Calendar, label: "Appointments", path: "/admin/appointments" },
  { icon: FolderOpen, label: "Gallery", path: "/admin/galleries" },
  { icon: Heart, label: "Seleção do Cliente", path: "/admin/selections" },
  { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
  { icon: Mail, label: "Email Marketing", path: "/admin/email-marketing" },
  
  // Separador
  { type: "separator", label: "Sales" },
  
  // Vendas
  { icon: DollarSign, label: "Event Sales", path: "/admin/event-sales", group: "vendas" },
  { icon: ImageIcon, label: "Stock Photos", path: "/admin/stock", group: "vendas" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders", group: "vendas" },
  
  // Separador
  { type: "separator", label: "Settings" },
  
  // Settings
  { icon: Image, label: "Banner", path: "/admin/banner", group: "config" },
  { icon: Briefcase, label: "Services", path: "/admin/services", group: "config" },
  { icon: Camera, label: "Portfolio", path: "/admin/portfolio", group: "config" },
  { icon: FileText, label: "Contracts", path: "/admin/contracts", group: "config" },
  
  // Separador
  { type: "separator", label: "System" },
  
  // Sistema
  { icon: CreditCard, label: "Signature", path: "/admin/subscription", group: "sistema" },
  { icon: Globe, label: "Sunínio", path: "/admin/domain-email", group: "sistema" },
  { icon: MessageSquare, label: "Support", path: "/admin/support", group: "sistema" },
  { icon: Settings, label: "Settings", path: "/admin/settings", group: "sistema" },
  
  // Separador
  { type: "separator" },
  
  // Link Externo
  { icon: ExternalLink, label: "Ver Site", path: "/", external: true },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

type UserData = {
  id: number;
  email: string;
  name: string;
  role: string;
  tenantId: number;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading: authLoading, user: authUser } = useAuth();
  
  // Estado para verificação manual do token
  const [manualUser, setManualUser] = useState<UserData | null>(null);
  const [manualLoading, setManualLoading] = useState(true);
  
  // Verify token manualmente ao carregar
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setManualLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/trpc/customAuth.me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const userData = data?.result?.data?.json;
          if (userData) {
            setManualUser(userData);
          }
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
      setManualLoading(false);
    };
    
    checkToken();
  }, []);
  
  // Usar usuário manual se available, senão usar do useAuth
  const user = manualUser || authUser;
  const loading = manualLoading || (authLoading && !manualUser);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  
  // Hook de verificação do trial
  const { showModal, dismissWarning, isExpired, daysRemaining } = useTrialStatus();
  
  // Wedndo bloqueado, redirecionar para signature
  useEffect(() => {
    if (isExpired && location !== '/admin/subscription') {
      setLocation('/admin/subscription');
    }
  }, [isExpired, location, setLocation]);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    Navigation
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map((item, index) => {
                // Separador
                if (item.type === "separator") {
                  return (
                    <div key={`separator-${index}`} className="my-2">
                      <div className="border-t border-border/50" />
                      {item.label && (
                        <div className="px-3 py-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {item.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                // Item normal
                const isActive = location === item.path;
                const groupClass = item.group ? `group-${item.group}` : "";
                
                // Verify se item está bloqueado (tudo exceto Assinatura quando expired)
                const isLocked = isExpired && item.path !== '/admin/subscription';
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        if (isLocked) {
                          toast.error('Sua conta está suspensa. Regularize sua signature para continuar.');
                          setLocation('/admin/subscription');
                          return;
                        }
                        item.path && setLocation(item.path);
                      }}
                      tooltip={isLocked ? `${item.label} (Bloqueado)` : item.label}
                      className={`h-10 transition-all font-normal ${groupClass} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : item.icon ? (
                        <item.icon
                          className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                        />
                      ) : null}
                      <span className={isLocked ? 'text-muted-foreground line-through' : ''}>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className={`flex-1 p-4 ${isExpired ? "pt-12" : ""}`}>{children}</main>
      </SidebarInset>
      
      {/* Banner de conta suspensa */}
      {isExpired && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 px-4 text-sm font-medium shadow-lg">
          🔒 Sua conta está suspensa. Acesse <button onClick={() => setLocation('/admin/subscription')} className="underline font-bold hover:text-red-100">Assinatura</button> para regularizar.
        </div>
      )}
      
      {/* Modal de aviso de trial (só quando não expirou ainda, faltam poucos days) */}
      {!isExpired && showModal && (
        <TrialExpiredModal 
          isOpen={showModal} 
          daysRemaining={daysRemaining ?? undefined}
          onClose={dismissWarning}
        />
      )}
    </>
  );
}
