import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import type { BorrowData } from '../types';

interface BookSuggestion {
  book_title: string;
  isbn_number: string;
  author?: string;
}

interface StudentSuggestion {
  id: string;
  student_id: string;
  name: string;
}

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
  const [studentLookupStatus, setStudentLookupStatus] = useState<string>('');
  const [titleSuggestions, setTitleSuggestions] = useState<BookSuggestion[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState<boolean>(false);
  const [nameSuggestions, setNameSuggestions] = useState<StudentSuggestion[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState<boolean>(false);
  const skipTitleLookup = useRef<boolean>(false);
  const skipIdLookup = useRef<boolean>(false);
  const skipNameLookup = useRef<boolean>(false);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setBorrowForm((prev) => ({ ...prev, borrow_date: todayStr }));
  }, []);

  // ISBN -> title auto-fill
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

  // Title -> ISBN suggestions
  useEffect(() => {
    if (skipTitleLookup.current) {
      skipTitleLookup.current = false;
      return;
    }
    if (borrowForm.book_title.trim().length < 2) {
      setTitleSuggestions([]);
      setShowTitleSuggestions(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get(`/book/all?search=${encodeURIComponent(borrowForm.book_title)}`);
        const results: BookSuggestion[] = Array.isArray(response.data) ? response.data : [];
        setTitleSuggestions(results.slice(0, 6));
        setShowTitleSuggestions(results.length > 0);
      } catch (err: unknown) {
        console.error("Title search error:", err);
        setTitleSuggestions([]);
        setShowTitleSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [borrowForm.book_title]);

  // Student ID -> student name auto-fill (exact match)
  useEffect(() => {
    if (skipIdLookup.current) {
      skipIdLookup.current = false;
      return;
    }
    if (borrowForm.student_id.trim().length < 3) {
      setStudentLookupStatus('');
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setStudentLookupStatus('Searching for student...');
      try {
        const response = await api.get(`/student/all?search=${encodeURIComponent(borrowForm.student_id)}`);
        const results: StudentSuggestion[] = response.data?.data || [];
        const exactMatch = results.find(
          s => s.student_id.trim().toUpperCase() === borrowForm.student_id.trim().toUpperCase()
        );

        if (exactMatch) {
          setBorrowForm(prev => ({ ...prev, student_name: exactMatch.name }));
          setStudentLookupStatus('✅ Student found!');
        } else {
          setStudentLookupStatus('❌ No matching student ID.');
        }
      } catch (err: unknown) {
        console.error("Student ID lookup error:", err);
        setStudentLookupStatus('⚠️ Could not verify student ID automatically.');
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [borrowForm.student_id]);

  // Student name -> student ID suggestions
  useEffect(() => {
    if (skipNameLookup.current) {
      skipNameLookup.current = false;
      return;
    }
    if (borrowForm.student_name.trim().length < 2) {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get(`/student/all?search=${encodeURIComponent(borrowForm.student_name)}`);
        const results: StudentSuggestion[] = response.data?.data || [];
        setNameSuggestions(results.slice(0, 6));
        setShowNameSuggestions(results.length > 0);
      } catch (err: unknown) {
        console.error("Student name search error:", err);
        setNameSuggestions([]);
        setShowNameSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [borrowForm.student_name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setBorrowForm({ ...borrowForm, [name]: value });
  };

  const handleSelectTitleSuggestion = (book: BookSuggestion): void => {
    skipTitleLookup.current = true;
    setBorrowForm(prev => ({ ...prev, book_title: book.book_title, isbn_number: book.isbn_number }));
    setShowTitleSuggestions(false);
    setTitleSuggestions([]);
  };

  const handleSelectNameSuggestion = (student: StudentSuggestion): void => {
    skipNameLookup.current = true;
    skipIdLookup.current = true;
    setBorrowForm(prev => ({ ...prev, student_name: student.name, student_id: student.student_id }));
    setShowNameSuggestions(false);
    setNameSuggestions([]);
    setStudentLookupStatus('✅ Student found!');
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
      setStudentLookupStatus('');
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
          <input
            type="text"
            name="student_id"
            value={borrowForm.student_id}
            onChange={handleChange}
            placeholder="Student ID (e.g. STU123)"
            required
          />
          {studentLookupStatus && <small style={{ display: 'block', margin: '4px 0 0 10px', color: '#666', fontStyle: 'italic' }}>{studentLookupStatus}</small>}
        </div>
        <div className="form-row" style={{ position: 'relative' }}>
          <label>Student name</label>
          <input
            type="text"
            name="student_name"
            value={borrowForm.student_name}
            onChange={handleChange}
            onFocus={() => { if (nameSuggestions.length > 0) setShowNameSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowNameSuggestions(false), 150)}
            placeholder="Student Name"
            autoComplete="off"
            required
          />
          {showNameSuggestions && nameSuggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              listStyle: 'none',
              margin: '2px 0 0 0',
              padding: '4px 0',
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}>
              {nameSuggestions.map((student) => (
                <li
                  key={student.id}
                  onMouseDown={() => handleSelectNameSuggestion(student)}
                  style={{ padding: '8px 12px', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <strong>{student.name}</strong>
                  <br />
                  <small style={{ color: '#999' }}>ID: {student.student_id}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-row">
          <label>ISBN number</label>
          <input type="text" name="isbn_number" value={borrowForm.isbn_number} onChange={handleChange} placeholder="Type ISBN Number..." required />
          {lookupStatus && <small style={{ display: 'block', margin: '4px 0 0 10px', color: '#666', fontStyle: 'italic' }}>{lookupStatus}</small>}
        </div>
        <div className="form-row" style={{ position: 'relative' }}>
          <label>Book title</label>
          <input
            type="text"
            name="book_title"
            value={borrowForm.book_title}
            onChange={handleChange}
            onFocus={() => { if (titleSuggestions.length > 0) setShowTitleSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 150)}
            placeholder="Book Title"
            autoComplete="off"
            required
          />
          {showTitleSuggestions && titleSuggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              listStyle: 'none',
              margin: '2px 0 0 0',
              padding: '4px 0',
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}>
              {titleSuggestions.map((book) => (
                <li
                  key={book.isbn_number}
                  onMouseDown={() => handleSelectTitleSuggestion(book)}
                  style={{ padding: '8px 12px', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <strong>{book.book_title}</strong>
                  {book.author && <span style={{ color: '#888' }}> — {book.author}</span>}
                  <br />
                  <small style={{ color: '#999' }}>ISBN: {book.isbn_number}</small>
                </li>
              ))}
            </ul>
          )}
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