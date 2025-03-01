import type { Analytics } from 'firebase/analytics';
import { logEvent } from 'firebase/analytics';

export const trackPageView = (analyticsInstance: Analytics, pageName: string) => {
  logEvent(analyticsInstance, 'page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });
};

export const trackEvent = (
  analyticsInstance: Analytics,
  eventName: string,
  eventParams: Record<string, any>
) => {
  logEvent(analyticsInstance, eventName, eventParams);
};
