import { Route, RouteProps } from 'wouter';

interface DomainBasedRouteProps extends RouteProps {
  /** Domínios que devem renderizar este componente */
  domains: string[];
  /** Componente a ser renderizado */
  component: React.ComponentType<any>;
}

/**
 * Rota que só renderiza se o domínio atual estiver na lista
 */
export function DomainBasedRoute({ domains, component: Component, ...routeProps }: DomainBasedRouteProps) {
  const currentDomain = window.location.hostname;
  const shouldRender = domains.includes(currentDomain);
  
  console.log('[DomainBasedRoute]', { currentDomain, domains, shouldRender, path: routeProps.path });
  
  if (!shouldRender) {
    return null;
  }
  
  return <Route {...routeProps} component={Component} />;
}
