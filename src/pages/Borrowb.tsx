import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import type { BorrowData } from '../types';

function Borrowb(): React.JSX.Element {
  const [borrowForm, setBorrowForm] = useState<BorrowData>({
    student_id: '',
    student_name: '',
    book_title: '',
    isbn_number: '',
    borrow_date: ''
  });
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [lookupStatus, setLookupStatus] = useState<string>('');

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setBorrowForm((prev) => ({ ...prev, borrow_date: todayStr }));
  }, []);

  useEffect(() => {
    if (borrowForm.isbn_number.length < 10) {
      setLookupStatus('');
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLookupStatus('Searching for book...');
      try {
        const response = await api.get(`/book/details/${encodeURIComponent(borrowForm.isbn_number)}`);
        const data = response.data;
        const targetBook = Array.isArray(data) ? data[0] : (data.book || data.data || data);
        
        if (targetBook && targetBook.book_title) {
          setBorrowForm(prev => ({ ...prev, book_title: targetBook.book_title }));
          setLookupStatus('✅ Book details loaded!');
        } else {
          setLookupStatus('❌ Book title not found in database.');
        }
      } catch (err: unknown) {
        console.error("ISBN details verification error:", err);
        setLookupStatus('⚠️ Could not verify ISBN automatically.');
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [borrowForm.isbn_number]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setBorrowForm({ ...borrowForm, [name]: value });
  };

  const handleBorrowSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    
    try {
      const response = await api.post(`/book/borrow`, borrowForm);
      
      setMessage(response.data?.message || "Book issued successfully!");
      setIsError(false);
      setLookupStatus('');
      const todayStr = new Date().toISOString().split('T')[0];
      setBorrowForm({ student_id: '', student_name: '', book_title: '', isbn_number: '', borrow_date: todayStr });
    } catch (err: unknown) {
      console.error("Borrow transaction submission error:", err);
      setIsError(true);
      if (api.isAxiosError(err)) {
        const serverReason = err.response?.data?.message || err.response?.data?.error || err.response?.data;
        setMessage(typeof serverReason === 'string' ? serverReason : 'Server rejected the borrow request.');
      } else if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unexpected architectural network error occurred.');
      }
    }
  };

  return (
    <div>
      <h1 className="head1">Borrow Dashboard</h1>
      <div className="roam">
        <Link to="/borrowedbook">view all borrowed books</Link>
        <Link to="/returnborrow">return book</Link>
      </div>

      <h2 className="head2">Borrow Book</h2>
      <form className="form" onSubmit={handleBorrowSubmit}>
        <div className="form-row">
          <label>Student id</label>
          <input type="text" name="student_id" value={borrowForm.student_id} onChange={handleChange} placeholder="Student ID (e.g. STU123)" required />
        </div>
        <div className="form-row">
          <label>Student name</label>
          <input type="text" name="student_name" value={borrowForm.student_name} onChange={handleChange} placeholder="Student Name" required />
        </div>
        <div className="form-row">
          <label>ISBN number</label>
          <input type="text" name="isbn_number" value={borrowForm.isbn_number} onChange={handleChange} placeholder="Type ISBN Number..." required />
          {lookupStatus && <small style={{ display: 'block', margin: '4px 0 0 10px', color: '#666', fontStyle: 'italic' }}>{lookupStatus}</small>}
        </div>
        <div className="form-row">
          <label>Book title</label>
          <input type="text" name="book_title" value={borrowForm.book_title} onChange={handleChange} placeholder="Book Title" required />
        </div>
        <div className="form-row">
          <label>Borrow date</label>
          <input type="date" name="borrow_date" value={borrowForm.borrow_date} onChange={handleChange} required />
        </div>
        <div className="button" >
          <button type="submit">Issue Book</button>
          {message && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px 14px', 
              borderRadius: '4px', 
              backgroundColor: isError ? '#ffebee' : '#e8f5e9', 
              color: isError ? '#c62828' : '#2e7d32',
              border: `1px solid ${isError ? '#ef9a9a' : '#a5d6a7'}`,
              fontWeight: isError ? 'bold' : 'normal'
            }}>
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default Borrowb;
