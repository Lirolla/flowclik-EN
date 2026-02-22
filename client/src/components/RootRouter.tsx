/**
 * RootRouter - Roteamento inteligente baseado em domain
 * 
 * flowclik.com → Landing page FlowClik
 * *.flowclik.com → Home do site do photographer
 * localhost → Home do site do photographer (desenvolvimento)
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
    
    // flowclik.com (sem subdomain) = Landing page
    // *.flowclik.com (com subdomain) = Site do photographer
    // localhost = Site do photographer (desenvolvimento)
    
    // Subscriptions principais (sem subdomain) = Landing page
    const mainDomains = [
      'flowclik.com',
      'www.flowclik.com',
      'flowclik.com',
      'www.flowclik.com',
      'lightcyan-butterfly-621782.hostingersite.com' // Subscription temporário Hostinger
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
  // Others rotas are not tratadas here
  return null;
}
