import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom React Hook to execute secure cross-app authorization token hand-offs.
 * Instantly extracts, caches, and permanently purges tokens from the visible address bar.
 */
export function useCrossAppAuthSync(): boolean {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation(); // Captures the current structural path name (e.g., /borrowbook)
  
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  useEffect(() => {
    // 1. Grab the token passed over from the Staff Login app domain
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      try {
        // 2. Clone it securely inside this application's domain-isolated localStorage vault
        localStorage.setItem('jwtToken', decodeURIComponent(tokenFromUrl));
        
        // 3. Delete the token payload key out of our query parameter dictionary list
        searchParams.delete('token');
        
        // 4. THE ABSOLUTE SECURITY PURGE METHOD:
        // Re-construct the exact current view pathway without appending the token parameter string
        const remainingQueryParameters = searchParams.toString();
        const cleanDestinationUrl = `${location.pathname}${
          remainingQueryParameters ? `?${remainingQueryParameters}` : ''
        }`;

        // Force React Router to push a history state override.
        // This instantly rewrites the address bar to a clean string parameter path layout!
        // Changes /borrowbook?token=ey... to just /borrowbook in less than a millisecond!
        navigate(cleanDestinationUrl, { replace: true });
        
        setIsAuthReady(true);
      } catch (error) {
        console.error("Critical: Failed to save or wipe cross-app token parameter payload:", error);
        setIsAuthReady(false);
      }
    } else {
      // 5. FALLBACK GATEWAY: If no token exists in the URL, confirm if a local cache remains valid
      const existingToken = localStorage.getItem('jwtToken');
      if (existingToken) {
        setIsAuthReady(true);
      } else {
        setIsAuthReady(false);
      }
    }
  }, [searchParams, navigate, location.pathname]);

  return isAuthReady;
}
