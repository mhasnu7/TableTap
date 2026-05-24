export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Check local storage for manual override
    const manualUrl = localStorage.getItem('tabletap_base_url');
    if (manualUrl) return manualUrl;
    
    // Default to the current origin
    return window.location.origin;
  }
  // For server-side, fallback to env or LAN IP
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.31.93:3000';
};
