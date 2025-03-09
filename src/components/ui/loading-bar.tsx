"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Create a unique key for the current route
    const routeKey = pathname + searchParams.toString();
    
    // Start loading animation
    setLoading(true);
    setProgress(0);
    
    let progressInterval: NodeJS.Timeout;
    let completeTimeout: NodeJS.Timeout;
    
    // Start progress animation
    progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prevProgress + (90 - prevProgress) * 0.1;
      });
    }, 100);
    
    // Complete the loading after a short delay
    completeTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      
      // Hide the loading bar after completion
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }, 500);
    
    // Cleanup function
    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div
        className="h-full bg-[#F39C12] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
} 