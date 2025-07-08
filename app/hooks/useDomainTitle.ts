import { useEffect } from 'react';
import { useDomainConfigContext } from '~/contexts/DomainConfigContext';

export function useDomainTitle(pageTitle?: string) {
  const { config } = useDomainConfigContext();
  const appTitle = config.title || 'Buy It';
  
  useEffect(() => {
    const title = pageTitle ? `${pageTitle} - ${appTitle}` : appTitle;
    document.title = title;
  }, [pageTitle, appTitle]);
  
  return appTitle;
}