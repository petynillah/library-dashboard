import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Outlet } from 'react-router-dom'; // 👈 1. Added Outlet here

// 👈 2. REMOVED the children interface completely

function SSOGuard(): React.JSX.Element { // 👈 3. REMOVED { children } from here
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  
const hasExchanged = useRef(false);
  useEffect(() => {
    const ticket = searchParams.get('ticket');
    
    if (!ticket) {
      const existingToken = localStorage.getItem('jwtToken');
      if (!existingToken) {
        // No session and no ticket: boot back to the main login application
        window.location.href = 'https://library-login.vercel.app/login/stafflogin'; 
      } else {
        setIsVerifying(false);
      }
      return;
    }
    if (hasExchanged.current) return; // prevent double-fire
  hasExchanged.current = true;

    const finalizeSessionExchange = async () => {
      try {
        const backendURL = import.meta.env.VITE_API_URL || '/api';
        
        const response = await fetch(`${backendURL}/api/auth/exchange-sso-ticket`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket })
        });
        const res = await response.json();

        if (res.success && res.token) {
          // Save the long-term verified session token safely 
          localStorage.setItem('jwtToken', res.token);
          
          // CLEAN UP THE URL INSTANTLY: Remove the ticket query parameter from history
          searchParams.delete('ticket');
          setSearchParams(searchParams, { replace: true });
          
          setIsVerifying(false);
        } else {
          alert('Session authentication failed. Please log in again.');
          window.location.href = 'https://library-login.vercel.app/login/stafflogin';
        }
      } catch (err) {
        console.error("SSO verification handshake dropped:", err);
        setIsVerifying(false);
      }
    };

    finalizeSessionExchange();
  }, [searchParams, setSearchParams]);

  if (isVerifying) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>
        🔄 Verifying Secure Security Handshake Credentials...
      </div>
    );
  }

  // 👈 4. REPLACED return <>{children}</> with this:
  return <Outlet />; 
}

export default SSOGuard;
