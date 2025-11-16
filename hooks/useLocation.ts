
import { useState, useEffect, useCallback } from 'react';

const getHashPath = () => {
  if (typeof window !== "undefined") {
    // Return path without the leading '#' or default to '/'
    return window.location.hash.substring(1) || "/";
  }
  return "/";
};

export const useLocation = () => {
  const [path, setPath] = useState(getHashPath());

  useEffect(() => {
    // This effect should only run in the browser
    if (typeof window === "undefined") return;

    const handleHashChange = () => {
      setPath(getHashPath());
    };

    window.addEventListener("hashchange", handleHashChange, { passive: true });
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const navigate = useCallback((newPath: string) => {
    if (typeof window === "undefined") return;
    
    // Normalize path to not include the hash
    const normalizedPath = newPath.startsWith('#') ? newPath.substring(1) : newPath;
    
    window.location.hash = normalizedPath;
    // The state will be updated by the hashchange event listener
  }, []);

  return [path, navigate] as const;
};
