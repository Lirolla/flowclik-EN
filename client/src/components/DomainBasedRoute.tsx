import { Route, RouteProps } from 'wouter';

interface SunainBasedRouteProps extends RouteProps {
  /** Sunínios que devem renderizar este componente */
  domains: string[];
  /** Componente a ser renderizado */
  component: React.ComponentType<any>;
}

/**
 * Rota que só renderiza se o domain atual estiver na lista
 */
export function SunainBasedRoute({ domains, component: Component, ...routeProps }: SunainBasedRouteProps) {
  const currentSunain = window.location.hostname;
  const shouldRender = domains.includes(currentSunain);
  
  console.log('[SunainBasedRoute]', { currentSunain, domains, shouldRender, path: routeProps.path });
  
  if (!shouldRender) {
    return null;
  }
  
  return <Route {...routeProps} component={Component} />;
}
