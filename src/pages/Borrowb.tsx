import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // FIXED: Imported Link Component
import type { BorrowData } from '../types';
import { APP_URLS } from '../Appurl';

function Borrowb(): React.JSX.Element {
  const [borrowForm, setBorrowForm] = useState<BorrowData>({
    student_id: '',
    student_name: '',
    book_title: '',
    isbn_number: '',
    borrow_date: ''
  });
  const [message, setMessage] = useState<string>('');
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
      const token = localStorage.getItem('jwtToken');
      setLookupStatus('Searching for book...');
      try {
        const response = await fetch(`${APP_URLS}/api/book/details/${encodeURIComponent(borrowForm.isbn_number)}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const targetBook = Array.isArray(data) ? data[0] : (data.book || data.data || data);
          if (targetBook && targetBook.book_title) {
            setBorrowForm(prev => ({ ...prev, book_title: targetBook.book_title }));
            setLookupStatus('✅ Book details loaded!');
          } else {
            setLookupStatus('❌ Book title not found in database.');
          }
        } else {
          setLookupStatus('❌ Unknown ISBN. Enter title manually.');
        }
      } catch (err) {
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
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch(`${APP_URLS}/api/book/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(borrowForm)
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || 'Server rejected request');
        } catch {
          throw new Error(`Route mismatch or Server error (${response.status}).`);
        }
      }

      const data = await response.json();
      setMessage(data.message || "Book issued successfully!");
      setLookupStatus('');
      const todayStr = new Date().toISOString().split('T')[0];
      setBorrowForm({ student_id: '', student_name: '', book_title: '', isbn_number: '', borrow_date: todayStr });
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1 className="head1">Borrow Dashboard</h1>
      {/* FIXED: Changed <a> to <Link> to keep SPA application state from breaking */}
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
            <p style={{ marginTop: '10px', color: message.includes('failed') || message.includes('error') || message.includes('Route') ? 'red' : 'green' }}>
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default Borrowb;
