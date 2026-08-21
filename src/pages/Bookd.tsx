import React from 'react';
import { Link } from 'react-router-dom';

// Simple helper function to manually decode payload strings from your stored JWT
const getUserRoleFromToken = (): string | null => {
  const token = localStorage.getItem('jwtToken');
  if (!token) return null;
  try {
    // Splitting token to access the middle payload part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.role; // Matches your backend token configuration layer
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

function Bookd(): React.JSX.Element {
  const userRole = getUserRoleFromToken();

  // TAILORED: Adjusted permissions to include 'staff' to match authorizeRoles('staff', 'admin')
  const isAuthorizedToEdit = userRole === 'admin' || userRole === 'staff' || userRole === 'librarian';

  return (
    <>
      <h1 className="head1">Book Dashboard</h1>
      <div className="cards">
        {/* Everyone can view available books */}
        <Link to='/availablebk' style={{ width: "50%" }}>
          Show all available books
        </Link>
        <Link to='/addbook' >
          add book
        </Link>
        <Link to='/updatebook' >
          update book
        </Link>
        <Link to='/availablebk' >
          delete book
        </Link>

        {/* Conditional structural rendering: Matches backend middleware access control rules */}
        {isAuthorizedToEdit && (
          <>
            {/*<Link to='/dashboard/addbook'>Add book</Link>
            <Link to='/dashboard/updatebook'>Update book</Link>*/}
          </>
        )}
      </div>
    </>
  );
}

export default Bookd;
