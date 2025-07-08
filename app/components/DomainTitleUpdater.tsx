import { useEffect, useRef } from 'react';
import { useDomainConfigContext } from '~/contexts/DomainConfigContext';

export function DomainTitleUpdater() {
  const { config, loading } = useDomainConfigContext();
  const observerRef = useRef<MutationObserver | null>(null);
  
  useEffect(() => {
    if (!loading && (config.title || config.favicon)) {
      const updateTitle = () => {
        if (config.title && config.title !== 'Buy It') {
          const titleTag = document.querySelector('title');
          if (titleTag) {
            const currentTitle = titleTag.textContent || '';
            
            // Replace "Buy It" with domain title in existing titles
            if (currentTitle.includes('Buy It')) {
              titleTag.textContent = currentTitle.replace(/Buy It/g, config.title);
            }
          }
          
          // Update apple mobile web app title
          const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
          if (appleTitle) {
            appleTitle.setAttribute('content', config.title);
          }
        }
      };
      
      // Initial update
      updateTitle();
      
      // Update favicons
      const updateFavicons = () => {
        if (config.favicon) {
          // Update all favicon types with the universal PNG
          const allFavicons = document.querySelectorAll('link[rel="icon"]');
          allFavicons.forEach(favicon => {
            favicon.setAttribute('href', config.favicon!);
          });
          
          // Update Apple Touch Icon
          const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
          if (appleTouchIcon) {
            appleTouchIcon.setAttribute('href', config.favicon);
          }
        }
      };
      
      // Update favicons
      updateFavicons();
      
      // Watch for title changes
      observerRef.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.target.nodeName === 'TITLE') {
            updateTitle();
          }
        });
      });
      
      const titleElement = document.querySelector('title');
      if (titleElement) {
        observerRef.current.observe(titleElement, {
          childList: true,
          characterData: true,
          subtree: true
        });
      }
      
      // Also observe the head for new title elements
      observerRef.current.observe(document.head, {
        childList: true,
        subtree: true
      });
      
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [config.title, config.favicon, loading]);
  
  return null;
}