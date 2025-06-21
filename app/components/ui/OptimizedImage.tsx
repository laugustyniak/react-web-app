import React, { useState, useCallback, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}

const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  loading = 'lazy',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMiAxMkM5Ljc5IDEyIDggMTAuMjEgOCA4UzkuNzkgNSAxMiA1UzE2IDYuNzkgMTYgOVMxNC4yMSAxMiAxMiAxMloiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTIwLjU5IDEzLjQxTDE4IDE2TDE0LjU5IDEyLjU5TDEzLjQxIDEzLjQxTDE2IDE2TDE4IDIwSDZMMTMuNDEgMTMuNDFMMTIgMTJMOC41OSA4LjU5TDcuNDEgOS40MUwxMCAxMkw2IDE2SDE4TDIwLjU5IDEzLjQxWiIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K',
  onLoad,
  onError,
  onClick
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setImageSrc(placeholder);
    onError?.();
  }, [onError, placeholder]);

  const handleImageIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !isLoaded && !hasError) {
        setImageSrc(src);
      }
    });
  }, [src, isLoaded, hasError]);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (loading === 'eager') {
      setImageSrc(src);
      return;
    }

    const img = document.querySelector(`[data-src="${src}"]`) as HTMLImageElement;
    if (!img) return;

    const observer = new IntersectionObserver(handleImageIntersection, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, loading, handleImageIntersection]);

  return (
    <img
      data-src={src}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-70'} ${className}`}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      onClick={onClick}
      decoding="async"
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;