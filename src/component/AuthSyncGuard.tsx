import React from 'react';
import { Outlet } from 'react-router-dom';
import { useCrossAppAuthSync } from '../useCrossAppAuthSync';

export function AuthSyncGuard(): React.JSX.Element {
  // Runs the sync hook ONCE globally for whatever URL path the user lands on
  const isAuthReady = useCrossAppAuthSync();

  // If the token is still syncing from the URL parameters, block the child pages
  if (!isAuthReady) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#555', fontSize: '18px' }}>Verifying library staff credentials...</p>
      </div>
    );
  }

  // Once synced successfully, render the target child page component seamlessly
  return <Outlet />;
}
