import LandingPage from './LandingPage';
import Home from './Home';

/**
 * Componente raiz que decide qual page renderizar baseado no domain
 */
export default function RootPage() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // FlowClik se: domain flowclik.with OR route starts with /venda
  const isFlowClik = 
    hostname === 'flowclik.com' || 
    hostname === 'www.flowclik.com' ||
    pathname.startsWith('/venda');
  
  console.log('[RootPage] hostname:', hostname, 'pathname:', pathname, 'isFlowClik:', isFlowClik);
  
  if (isFlowClik) {
    return <LandingPage />;
  }
  
  return <Home />;
}
