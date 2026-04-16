import React from 'react';
import LazyLoad from 'react-lazyload';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  height?: number | string;
  width?: number | string;
  className?: string;
  placeholderClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  height = 200,
  width = '100%',
  className,
  placeholderClassName,
  ...props
}) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <LazyLoad 
      height={height} 
      offset={100} 
      once 
      placeholder={
        <Skeleton 
          className={cn("w-full h-full", placeholderClassName)} 
          style={{ height, width }} 
        />
      }
    >
      <div className="relative overflow-hidden" style={{ height, width }}>
        {!loaded && (
          <Skeleton 
            className={cn("absolute inset-0 w-full h-full", placeholderClassName)} 
          />
        )}
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500", 
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setLoaded(true)}
          {...props}
        />
      </div>
    </LazyLoad>
  );
};
