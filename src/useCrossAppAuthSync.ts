import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * Custom React Hook to safely execute cross-app authorization 
 * token hand-offs between domain-isolated Vercel systems.
 */
export function useCrossAppAuthSync(): boolean {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Local state flag to signal to Layout Guards that localStorage is synced and safe
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  useEffect(() => {
    // 1. Scan the active URL parameters for an incoming hand-off token string
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      try {
        // 2. Clone it safely into this application's domain-isolated storage vault
        localStorage.setItem('jwtToken', decodeURIComponent(tokenFromUrl));
        
        // 3. Remove the token parameters from our query dictionary tracking list
        searchParams.delete('token');
        
        // 4. Instantly strip the sensitive token out of the visible browser address bar
        // Changes /bookdash?token=ey... back to /bookdash smoothly without a full page reload!
        navigate(
          {
            pathname: window.location.pathname,
            search: searchParams.toString(),
          },
          { replace: true }
        );
        
        // Signal that token hand-off synchronization completed successfully
        setIsAuthReady(true);
      } catch (error) {
        console.error("Critical: Failed to save or decode cross-app parameter token payload:", error);
        setIsAuthReady(false);
      }
    } else {
      // 5. FALLBACK GATE: If no token is in the URL, verify if a session already exists locally
      const existingToken = localStorage.getItem('jwtToken');
      if (existingToken) {
        setIsAuthReady(true);
      } else {
        // No session token located anywhere. Let the layout know sync state is unresolved
        setIsAuthReady(false);
      }
    }
  }, [searchParams, navigate]);

  return isAuthReady;
}
