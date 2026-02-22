/**
 * RootRouter - Roteamento inteligente baseado em domínio
 * 
 * flowclik.com → Landing page FlowClik
 * *.flowclik.com → Home do site do fotógrafo
 * localhost → Home do site do fotógrafo (desenvolvimento)
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
interface RootRouterProps {
  landingPage: React.ComponentType;
  photographerHome: React.ComponentType;
}
export default function RootRouter({ landingPage: LandingPage, photographerHome: PhotographerHome }: RootRouterProps) {
  const [location] = useLocation();
  const [isMainDomain, setIsMainDomain] = useState(false);
  useEffect(() => {
    const hostname = window.location.hostname;
    
    // flowclik.com (sem subdomínio) = Landing page
    // *.flowclik.com (com subdomínio) = Site do fotógrafo
    // localhost = Site do fotógrafo (desenvolvimento)
    
    // Domínios principais (sem subdomínio) = Landing page
    const mainDomains = [
      'flowclik.com',
      'www.flowclik.com',
      'flowclik.com',
      'www.flowclik.com',
      'lightcyan-butterfly-621782.hostingersite.com' // Domínio temporário Hostinger
    ];
    
    if (mainDomains.includes(hostname)) {
      setIsMainDomain(true);
    } else {
      setIsMainDomain(false);
    }
  }, []);
  // Rota raiz (/)
  if (location === '/') {
    return isMainDomain ? <LandingPage /> : <PhotographerHome />;
  }
  // Outras rotas não são tratadas aqui
  return null;
}
