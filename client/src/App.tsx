import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { FontLoader } from "./components/FontLoader";
import { useSiteConfig } from "./hooks/useSiteConfig";

// ============================================================================
// LAZY LOADING - Carrega páginas sob demanda
// ============================================================================

// Landing & Marketing
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CadastroSaaS = lazy(() => import('./pages/CadastroSaaS'));
const Docs = lazy(() => import('./pages/DocsNew'));
const TermosDeServico = lazy(() => import('./pages/TermosDeServico'));
const PoliticaDePrivacidade = lazy(() => import('./pages/PoliticaDePrivacidade'));
const PoliticaDeReembolso = lazy(() => import('./pages/PoliticaDeReembolso'));
const SobreNos = lazy(() => import('./pages/SobreNos'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin Dashboard
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCollections = lazy(() => import('./pages/admin/AdminCollections'));
const AdminGalleryUpload = lazy(() => import('./pages/admin/AdminGalleryUpload'));
const AdminClients = lazy(() => import('./pages/AdminClients'));
const AdminClientDetails = lazy(() => import('./pages/admin/AdminClientDetails'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminAppointmentStats = lazy(() => import('./pages/admin/AdminAppointmentStats'));
const AdminSessionGallery = lazy(() => import('./pages/admin/AdminSessionGallery'));
const AdminPhotoSelections = lazy(() => import('./pages/admin/AdminPhotoSelections'));
const AdminFinalAlbum = lazy(() => import('./pages/admin/AdminFinalAlbum'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminEventoVendas = lazy(() => import('./pages/admin/AdminEventoVendas'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminStock = lazy(() => import('./pages/admin/AdminStock'));
const AdminBanner = lazy(() => import('./pages/admin/AdminBanner'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminPortfolio = lazy(() => import('./pages/admin/AdminPortfolio'));
const AdminContracts = lazy(() => import('./pages/admin/AdminContracts'));
const AdminVideos = lazy(() => import('./pages/AdminVideos'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminSubscription = lazy(() => import('./pages/admin/AdminSubscription'));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'));
const AdminEmailMarketing = lazy(() => import('./pages/admin/AdminEmailMarketing'));

// Sistema (Super Admin)
const SistemaLogin = lazy(() => import('./pages/sistema/SistemaLogin'));
const SistemaDashboard = lazy(() => import('./pages/sistema/SistemaDashboard'));
const SistemaTickets = lazy(() => import('./pages/sistema/SistemaTickets'));
const SistemaFotografos = lazy(() => import('./pages/sistema/SistemaFotografos'));
const SistemaAvisos = lazy(() => import('./pages/sistema/SistemaAvisos'));

// Área do Cliente
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const ClientGalleryAuth = lazy(() => import('./pages/ClientGalleryAuth'));
const ClientFinalAlbumView = lazy(() => import('./pages/ClientFinalAlbumView'));
const ClientChat = lazy(() => import('./pages/ClientChat'));
const ClientPayments = lazy(() => import('./pages/ClientPayments'));
const ClientContract = lazy(() => import('./pages/ClientContract'));
const ClienteAcesso = lazy(() => import('./pages/ClienteAcesso'));

// Site Público
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FotosStock = lazy(() => import('./pages/FotosStock'));
const Galleries = lazy(() => import('./pages/Galleries'));
const VideoPage = lazy(() => import('./pages/VideoPage'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));

// Páginas Públicas
const PublicGalleries = lazy(() => import('./pages/PublicGalleries'));
const PublicGalleryView = lazy(() => import('./pages/PublicGalleryView'));
const SharedAlbum = lazy(() => import('./pages/SharedAlbum'));
const ClientFinalAlbum = lazy(() => import('./pages/ClientFinalAlbum'));
const GaleriaCompra = lazy(() => import('./pages/GaleriaCompra'));
const Cart = lazy(() => import('./pages/Cart'));
const OrderStatus = lazy(() => import('./pages/OrderStatus'));

// ============================================================================
// COMPONENTES GLOBAIS (Carregados imediatamente)
// ============================================================================
import { WhatsAppButton } from './components/WhatsAppButton';
import { CartButton } from './components/CartButton';
import ThemeWrapper from './components/ThemeWrapper';
import { useScrollToTop } from './hooks/useScrollToTop';
import RootRouter from './components/RootRouter';

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function Router() {
  // Scroll automático para o topo ao navegar entre páginas
  useScrollToTop();

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* ================================================================
            RAIZ - ROTEAMENTO INTELIGENTE
            flowclik.com → Landing page
            *.flowclik.com → Home do fotógrafo
            ================================================================ */}
        <Route path="/">
          {() => <RootRouter landingPage={LandingPage} photographerHome={Home} />}
        </Route>
        <Route path="/cadastro" component={CadastroSaaS} />
        <Route path="/login" component={Login} />
        <Route path="/docs" component={Docs} />
        <Route path="/termos-de-servico" component={TermosDeServico} />
        <Route path="/politica-de-privacidade" component={PoliticaDePrivacidade} />
        <Route path="/politica-de-reembolso" component={PoliticaDeReembolso} />
        <Route path="/sobre-nos" component={SobreNos} />

        {/* ================================================================
            ADMIN - DASHBOARD DO FOTÓGRAFO
            ================================================================ */}
        <Route path="/admin" component={AdminDashboard} />
        
        {/* Galerias */}
        <Route path="/admin/galerias" component={AdminCollections} />
        <Route path="/admin/galerias/:id/upload" component={AdminGalleryUpload} />
        <Route path="/admin/galerias/:id/album-final" component={AdminFinalAlbum} />
        
        {/* Clientes */}
        <Route path="/admin/clientes" component={AdminClients} />
        <Route path="/admin/cliente/:email" component={AdminClientDetails} />
        
        {/* Agendamentos */}
        <Route path="/admin/agendamentos" component={AdminAppointments} />
        <Route path="/admin/estatisticas" component={AdminAppointmentStats} />
        <Route path="/admin/galeria/:appointmentId" component={AdminSessionGallery} />
        <Route path="/admin/selecoes" component={AdminPhotoSelections} />
        
        {/* Vendas */}
        <Route path="/admin/pedidos" component={AdminOrders} />
        <Route path="/admin/vendas-eventos" component={AdminEventoVendas} />
        <Route path="/admin/leads" component={AdminLeads} />
        
        {/* Conteúdo */}
        <Route path="/admin/banner" component={AdminBanner} />
        <Route path="/admin/servicos" component={AdminServices} />
        <Route path="/admin/portfolio" component={AdminPortfolio} />
        <Route path="/admin/stock" component={AdminStock} />
        <Route path="/admin/videos" component={AdminVideos} />
        <Route path="/admin/contratos" component={AdminContracts} />
        
        {/* Comunicação */}
        <Route path="/admin/mensagens" component={AdminMessages} />
        <Route path="/admin/email-marketing" component={AdminEmailMarketing} />
        
        {/* Configurações */}
        <Route path="/admin/configuracoes" component={AdminSettings} />
        <Route path="/admin/dominio-email" component={lazy(() => import("./pages/admin/AdminDomainEmail"))} />
        <Route path="/admin/assinatura" component={AdminSubscription} />
        <Route path="/admin/suporte" component={AdminSupport} />

        {/* ================================================================
            SISTEMA - ADMIN DO SAAS (Super Admin)
            ================================================================ */}
        <Route path="/sistema/login" component={SistemaLogin} />
        <Route path="/sistema" component={SistemaDashboard} />
        <Route path="/sistema/tickets" component={SistemaTickets} />
        <Route path="/sistema/fotografos" component={SistemaFotografos} />
        <Route path="/sistema/avisos" component={SistemaAvisos} />

        {/* ================================================================
            ÁREA DO CLIENTE (Clientes dos fotógrafos)
            ================================================================ */}
        <Route path="/cliente-acesso" component={ClienteAcesso} />
        <Route path="/cliente/dashboard/:id" component={ClientDashboard} />
        <Route path="/cliente/galeria/:id" component={ClientGalleryAuth} />
        <Route path="/cliente/album-final/:id" component={ClientFinalAlbumView} />
        <Route path="/cliente/chat/:id" component={ClientChat} />
        <Route path="/cliente/pagamentos/:id" component={ClientPayments} />
        <Route path="/cliente/contrato/:id" component={ClientContract} />

        {/* ================================================================
            SITE PÚBLICO DO FOTÓGRAFO (Produção Real)
            Rotas na raiz - sem mais /site/*
            ================================================================ */}
        <Route path="/servicos" component={Services} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/sobre" component={About} />
        <Route path="/contato" component={Contact} />
        <Route path="/fotos-stock" component={FotosStock} />
        <Route path="/video" component={VideoPage} />
        <Route path="/agendar" component={BookAppointment} />

        {/* ================================================================
            PÁGINAS PÚBLICAS (Galerias, Álbuns)
            ================================================================ */}
        <Route path="/galerias" component={PublicGalleries} />
        <Route path="/galeria/:slug" component={PublicGalleryView} />
        <Route path="/galeria-compra/:slug" component={GaleriaCompra} />
        <Route path="/pedido/:id" component={OrderStatus} />
              <Route path="/carrinho" component={Cart} />
        <Route path="/album-final/:slug" component={ClientFinalAlbum} />
        <Route path="/album-compartilhavel/:slug" component={SharedAlbum} />

        {/* ================================================================
            404 - NOT FOUND
            ================================================================ */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const { font } = useSiteConfig();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <CartProvider>
          <ThemeWrapper>
            <TooltipProvider>
              <FontLoader font={font} />
              <Toaster />
              <Router />
              {/* Componentes globais */}
              <WhatsAppButton />
              <CartButton />
            </TooltipProvider>
          </ThemeWrapper>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
