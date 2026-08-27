import React, { useEffect, useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import type { BorrowedBookItem } from '../types'; 


function Borrowedb(): React.JSX.Element { 
  const navigate = useNavigate();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBookItem[]>([]); 
  const [error, setError] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => { 
    const fetchBorrowedBooks = async (): Promise<void> => { 
      const token = localStorage.getItem('jwtToken'); 
      try { 
        setLoading(true);
        const response = await fetch(`/book/borrowed`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }); 

        if (!response.ok) {
          const errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || 'Failed to populate history');
          } catch {
            throw new Error(`Server returned error (${response.status}). Check network endpoints.`);
          }
        }

        const data = await response.json(); 
        const actualList = Array.isArray(data) ? data : (data.data || data.history || []);
        setBorrowedBooks(actualList); 
        setError('');
      } catch (err: any) { 
        setError(err.message); 
      } finally {
        setLoading(false);
      }
    }; 

    fetchBorrowedBooks(); 
  }, []); 

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return dateString.split('T')[0];
  };

  // Sends the click straight to the return page, pre-loaded with this exact record
  const handleReturnClick = (book: BorrowedBookItem): void => {
    navigate('/returnborrow', {
      state: {
        student_id: book.student_id,
        student_name: book.student_name,
        book_title: book.book_title,
        isbn_number: book.isbn_number,
        borrow_date: book.borrow_date
      }
    });
  };

  return ( 
    <div> 
      <h1 className="head1">Borrow Category</h1> 
      <div className="roam"> 
        <Link to="/borrowbook">borrow another book</Link> 
        <Link to="/returnborrow">return a book</Link> 
      </div> 
      
      <h2 className="head2">List of Borrowed Books</h2> 
      
      {error && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>} 
      
      <div className="table-part"> 
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}> 
           <thead> 
              <tr> 
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Book Title</th> 
                <th>ISBN Number</th> 
                <th>Borrow Date</th> 
                <th>Returned Date</th>
                <th>Status</th> 
              </tr> 
            </thead> 
            <tbody> 
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '15px' }}>Loading transaction records...</td>
                </tr>
              ) : (
                borrowedBooks.map((book, index) => ( 
                  <tr key={`${book.isbn_number}-${index}`}> 
                    <td>{book.student_id}</td>
                    <td>{book.student_name}</td>
                    <td>{book.book_title}</td> 
                    <td>{book.isbn_number}</td> 
                    <td>{formatDate(book.borrow_date)}</td> 
                    <td>{book.return_date ? formatDate(book.return_date) : '—'}</td>
                    <td className="status"> 
                      {book.return_date ? ( 
                        <span style={{ color: 'green', fontWeight: 'bold' }}>Returned</span> 
                      ) : ( 
                        <button
                          onClick={() => handleReturnClick(book)}
                          style={{
                            color: 'orange',
                            fontWeight: 'bold',
                            background: 'none',
                            border: '1px solid orange',
                            borderRadius: '4px',
                            padding: '3px 10px',
                            cursor: 'pointer',
                          }}
                          title="Click to process return for this book"
                        >
                          Active Out
                        </button>
                      )} 
                    </td> 
                  </tr> 
                ))
              )}
              
              {!loading && borrowedBooks.length === 0 && !error && ( 
                <tr> 
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No lending histories logged.</td> 
                </tr> 
              )} 
            </tbody>
        </table> 
      </div> 
    </div> 
  ); 
} 

export default Borrowedb;