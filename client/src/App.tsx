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
// LAZY LOADING - Load pages on demand
// ============================================================================

// Landing & Marketing
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CadastroSaaS = lazy(() => import('./pages/CadastroSaaS'));
const Docs = lazy(() => import('./pages/DocsNew'));
const TuemsOfService = lazy(() => import('./pages/TuemosDeServico'));
const PrivacyPolicy = lazy(() => import('./pages/PoliticaDePrivacy'));
const RefundPolicy = lazy(() => import('./pages/PoliticaDeRefund'));
const AboutUs = lazy(() => import('./pages/SobreNos'));
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

// System (Super Admin)
const SistemaLogin = lazy(() => import('./pages/sistema/SistemaLogin'));
const SistemaDashboard = lazy(() => import('./pages/sistema/SistemaDashboard'));
const SistemaTickets = lazy(() => import('./pages/sistema/SistemaTickets'));
const SistemaFotografos = lazy(() => import('./pages/sistema/SistemaFotografos'));
const SistemaAvisos = lazy(() => import('./pages/sistema/SistemaAvisos'));

// Client Area
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const ClientGalleryAuth = lazy(() => import('./pages/ClientGalleryAuth'));
const ClientFinalAlbumView = lazy(() => import('./pages/ClientFinalAlbumView'));
const ClientChat = lazy(() => import('./pages/ClientChat'));
const ClientPayments = lazy(() => import('./pages/ClientPayments'));
const ClientContract = lazy(() => import('./pages/ClientContract'));
const ClienteAcesso = lazy(() => import('./pages/ClienteAcesso'));

// Public Site
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FotosStock = lazy(() => import('./pages/FotosStock'));
const Galleries = lazy(() => import('./pages/Galleries'));
const VideoPage = lazy(() => import('./pages/VideoPage'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));

// Public Pages
const PublicGalleries = lazy(() => import('./pages/PublicGalleries'));
const PublicGalleryView = lazy(() => import('./pages/PublicGalleryView'));
const SharedAlbum = lazy(() => import('./pages/SharedAlbum'));
const ClientFinalAlbum = lazy(() => import('./pages/ClientFinalAlbum'));
const GalleryCompra = lazy(() => import('./pages/GalleryCompra'));
const Cart = lazy(() => import('./pages/Cart'));
const OrderStatus = lazy(() => import('./pages/OrderStatus'));

// ============================================================================
// GLOBAL COMPONENTS (Loaded immedaytely)
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
  // Auto scroll to top when navigating between pages
  useScrollToTop();

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* ================================================================
            ROOT - SMART ROUTING
            flowclik.com → Landing page
            *.flowclik.com → Photographer's home
            ================================================================ */}
        <Route path="/">
          {() => <RootRouter landingPage={LandingPage} photographerHome={Home} />}
        </Route>
        <Route path="/register" component={CadastroSaaS} />
        <Route path="/login" component={Login} />
        <Route path="/docs" component={Docs} />
        <Route path="/terms-of-service" component={TuemsOfService} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/refund-policy" component={RefundPolicy} />
        <Route path="/about-us" component={AboutUs} />

        {/* ================================================================
            ADMIN - PHOTOGRAPHER'S DASHBOARD
            ================================================================ */}
        <Route path="/admin" component={AdminDashboard} />
        
        {/* Galleries */}
        <Route path="/admin/galleries" component={AdminCollections} />
        <Route path="/admin/galleries/:id/upload" component={AdminGalleryUpload} />
        <Route path="/admin/galleries/:id/final-album" component={AdminFinalAlbum} />
        
        {/* Clients */}
        <Route path="/admin/clients" component={AdminClients} />
        <Route path="/admin/client/:email" component={AdminClientDetails} />
        
        {/* Appointments */}
        <Route path="/admin/appointments" component={AdminAppointments} />
        <Route path="/admin/statistics" component={AdminAppointmentStats} />
        <Route path="/admin/gallery/:appointmentId" component={AdminSessionGallery} />
        <Route path="/admin/selections" component={AdminPhotoSelections} />
        
        {/* Sales */}
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/event-sales" component={AdminEventoVendas} />
        <Route path="/admin/leads" component={AdminLeads} />
        
        {/* Content */}
        <Route path="/admin/banner" component={AdminBanner} />
        <Route path="/admin/services" component={AdminServices} />
        <Route path="/admin/portfolio" component={AdminPortfolio} />
        <Route path="/admin/stock" component={AdminStock} />
        <Route path="/admin/videos" component={AdminVideos} />
        <Route path="/admin/contracts" component={AdminContracts} />
        
        {/* Communication */}
        <Route path="/admin/messages" component={AdminMessages} />
        <Route path="/admin/email-marketing" component={AdminEmailMarketing} />
        
        {/* Settings */}
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/domain-email" component={lazy(() => import("./pages/admin/AdminSunainEmail"))} />
        <Route path="/admin/subscription" component={AdminSubscription} />
        <Route path="/admin/support" component={AdminSupport} />

        {/* ================================================================
            SYSTEM - SAAS ADMIN (Super Admin)
            ================================================================ */}
        <Route path="/system/login" component={SistemaLogin} />
        <Route path="/system" component={SistemaDashboard} />
        <Route path="/system/tickets" component={SistemaTickets} />
        <Route path="/system/photographers" component={SistemaFotografos} />
        <Route path="/system/notices" component={SistemaAvisos} />

        {/* ================================================================
            CLIENT AREA (Photographer's clients)
            ================================================================ */}
        <Route path="/client-access" component={ClienteAcesso} />
        <Route path="/client/dashboard/:id" component={ClientDashboard} />
        <Route path="/client/gallery/:id" component={ClientGalleryAuth} />
        <Route path="/client/final-album/:id" component={ClientFinalAlbumView} />
        <Route path="/client/chat/:id" component={ClientChat} />
        <Route path="/client/payments/:id" component={ClientPayments} />
        <Route path="/client/contract/:id" component={ClientContract} />

        {/* ================================================================
            PHOTOGRAPHER'S PUBLIC SITE (Production)
            Routes at root level
            ================================================================ */}
        <Route path="/services" component={Services} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/stock-photos" component={FotosStock} />
        <Route path="/video" component={VideoPage} />
        <Route path="/book" component={BookAppointment} />

        {/* ================================================================
            PUBLIC PAGES (Galleries, Albums)
            ================================================================ */}
        <Route path="/galleries" component={PublicGalleries} />
        <Route path="/gallery/:slug" component={PublicGalleryView} />
        <Route path="/gallery-shop/:slug" component={GalleryCompra} />
        <Route path="/order/:id" component={OrderStatus} />
        <Route path="/cart" component={Cart} />
        <Route path="/final-album/:slug" component={ClientFinalAlbum} />
        <Route path="/shared-album/:slug" component={SharedAlbum} />

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
              {/* Global components */}
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
