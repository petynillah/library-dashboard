import React, { useState, useEffect } from 'react'; 
import { Link, useLocation } from 'react-router-dom';
import type { ReturnFormData } from '../types'; 

interface ActiveLoan {
  student_id: string;
  student_name: string;
  book_title: string;
  isbn_number: string;
  borrow_date: string;
}

function Returnborr(): React.JSX.Element { 
  const location = useLocation();
  const [searchId, setSearchId] = useState<string>(''); 
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [formData, setFormData] = useState<ReturnFormData>({ 
    student_id: '', 
    student_name: '', 
    book_title: '', 
    isbn_number: '', 
    borrow_date: '', 
    return_date: '' 
  }); 
  const [message, setMessage] = useState<string>(''); 
  const token = localStorage.getItem('jwtToken'); 

  // If we arrived here from "Active Out" on the Borrowedb page, the record is
  // already known — populate the form immediately, no search needed.
  useEffect(() => {
    const incoming = location.state as ActiveLoan | undefined;
    if (incoming && incoming.isbn_number) {
      setFormData({
        student_id: incoming.student_id,
        student_name: incoming.student_name,
        book_title: incoming.book_title,
        isbn_number: incoming.isbn_number,
        borrow_date: incoming.borrow_date ? incoming.borrow_date.split('T')[0] : '',
        return_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [location.state]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => { 
    e.preventDefault(); 
    if (!searchId) return; 

    setFormData({ student_id: '', student_name: '', book_title: '', isbn_number: '', borrow_date: '', return_date: '' });
    setActiveLoans([]);

    try { 
      const response = await fetch(`/api/book/borrowed/${encodeURIComponent(searchId)}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      }); 
      const data = await response.json(); 
      if (!response.ok) throw new Error(data.message || data.error || 'No active lending entry found'); 

      const loans: ActiveLoan[] = Array.isArray(data) ? data : []; 

      if (loans.length === 0) {
        setMessage('No active loans found for this student.');
        return;
      }

      // Only one active loan — populate the form immediately, no selection needed
      if (loans.length === 1) {
        handleSelectLoan(loans[0]);
        return;
      }

      // Multiple active loans — let staff pick which one to return
      setActiveLoans(loans);
      setMessage('');
    } catch (err: any) { 
      setMessage(err.message); 
    } 
  }; 

  const handleSelectLoan = (loan: ActiveLoan): void => {
    setFormData({
      student_id: loan.student_id,
      student_name: loan.student_name,
      book_title: loan.book_title,
      isbn_number: loan.isbn_number,
      borrow_date: loan.borrow_date ? loan.borrow_date.split('T')[0] : '',
      return_date: new Date().toISOString().split('T')[0]
    });
    setActiveLoans([]);
    setMessage('');
  };

  const handleReturnSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => { 
    e.preventDefault(); 
    if (!formData.student_id) {
      setMessage("Please search and select a borrowed book record first.");
      return;
    }
    try { 
      const response = await fetch('/api/book/borrowed/return', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }, 
        body: JSON.stringify(formData) 
      }); 
      const data = await response.json(); 
      if (!response.ok) throw new Error(data.message || data.error || 'Could not commit data'); 
      
      alert(data.message || "Book successfully marked as returned!"); 
      setSearchId('');
      setActiveLoans([]);
      setFormData({ student_id: '', student_name: '', book_title: '', isbn_number: '', borrow_date: '', return_date: '' }); 
      setMessage('');
    } catch (err: any) { 
      setMessage(err.message); 
    } 
  }; 

  return ( 
    <div> 
      <h1 className="head1">Borrow Dashboard</h1> 
      <div className="roam"> 
        <Link to="/borrowedbook">view all borrowed books</Link> 
        <Link to="/borrowbook">borrow another</Link> 
      </div> 

      <div className="search" style={{ marginBottom: '20px' }}> 
        <form className="search-bar" onSubmit={handleSearch}> 
          <label style={{ marginRight: '10px' }}>Student ID </label> 
          <input 
            type="text" 
            value={searchId} 
            onChange={(e) => setSearchId(e.target.value)} 
            placeholder="Type Student ID..."
            required 
          /> 
          <button type="submit" style={{ marginLeft: '10px' }}>Search</button> 
        </form> 
      </div> 
      {message && (
        <p className="status" style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>
          {message}
        </p>
      )} 

      {activeLoans.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '0 10px' }}>
          <h3 style={{ marginBottom: '10px' }}>This student has multiple active loans — select one to return:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>ISBN Number</th>
                <th>Borrow Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.map((loan) => (
                <tr key={loan.isbn_number}>
                  <td>{loan.book_title}</td>
                  <td>{loan.isbn_number}</td>
                  <td>{loan.borrow_date ? loan.borrow_date.split('T')[0] : 'N/A'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleSelectLoan(loan)}
                      style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="head2">Return Book</h2> 
      
      <form className="form" onSubmit={handleReturnSubmit}> 
        <div className="form-row"> 
          <label>Student ID</label> 
          <input type="text" value={formData.student_id || ''} readOnly disabled placeholder="Not Loaded" /> 
        </div> 
        <div className="form-row"> 
          <label>Student Name</label> 
          <input type="text" value={formData.student_name || ''} readOnly disabled placeholder="Not Loaded" /> 
        </div> 
        <div className="form-row"> 
          <label>Book Title</label> 
          <input type="text" value={formData.book_title || ''} readOnly disabled placeholder="Not Loaded" /> 
        </div> 
        <div className="form-row"> 
          <label>ISBN Number</label> 
          <input type="text" value={formData.isbn_number || ''} readOnly disabled placeholder="Not Loaded" /> 
        </div> 
        <div className="form-row"> 
          <label>Borrow Date</label> 
          <input type="date" value={formData.borrow_date || ''} readOnly disabled /> 
        </div> 
        <div className="form-row"> 
          <label>Return Date</label> 
          <input 
            type="date" 
            name="return_date"
            value={formData.return_date || ''} 
            onChange={(e) => setFormData({ ...formData, return_date: e.target.value })} 
            required 
          /> 
        </div> 

        <div className="button" > 
          <button 
            type="submit" 
            className="linkb" 
            style={{ cursor: formData.student_id ? 'pointer' : 'not-allowed' }}
            disabled={!formData.student_id}
          >
            Process Return
          </button> 
        </div> 
      </form> 

      
    </div> 
  ); 
} 

export default Returnborr;