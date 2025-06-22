// Canvas/hooks/useSessionInspirations.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { SessionInspiration } from '../components/SessionInspirations';

export function useSessionInspirations() {
  const [sessionInspirations, setSessionInspirations] = useState<SessionInspiration[]>([]);

  const addSessionInspiration = useCallback((
    imageData: string,
    prompt: string,
    negativePrompt: string,
    canvasSnapshot?: string
  ) => {
    const newInspiration: SessionInspiration = {
      id: `session-inspiration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageData,
      timestamp: new Date(),
      prompt,
      negativePrompt,
      canvasSnapshot
    };

    setSessionInspirations(prev => [newInspiration, ...prev]);
    toast.success('New inspiration added to session');
    
    return newInspiration.id;
  }, []);

  const deleteSessionInspiration = useCallback((id: string) => {
    setSessionInspirations(prev => prev.filter(inspiration => inspiration.id !== id));
    toast.success('Session inspiration deleted');
  }, []);

  const clearAllSessionInspirations = useCallback(() => {
    if (sessionInspirations.length === 0) return;
    
    if (window.confirm(`Are you sure you want to clear all ${sessionInspirations.length} session inspirations? This cannot be undone.`)) {
      setSessionInspirations([]);
      toast.success('All session inspirations cleared');
    }
  }, [sessionInspirations.length]);

  const downloadSessionInspiration = useCallback((inspiration: SessionInspiration) => {
    // The download logic is handled in the component, but we can log it here for analytics
    console.log(`Downloaded session inspiration: ${inspiration.id}`);
  }, []);

  return {
    sessionInspirations,
    addSessionInspiration,
    deleteSessionInspiration,
    clearAllSessionInspirations,
    downloadSessionInspiration
  };
}