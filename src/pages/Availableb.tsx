import React, { useState, useEffect } from 'react';
import type { BookData } from '../types';
import { Link } from 'react-router-dom';
import axios from 'axios'; // 1. Added Axios import
import api from '../api' // 2. Added APP_URLS base string

function Availableb(): React.JSX.Element {
  const [books, setBooks] = useState<BookData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchBooks = async (search: string = ''): Promise<void> => {
    const token = localStorage.getItem('jwtToken');
    try {
      // 3. Converted fetch to Axios GET using APP_URLS and added missing leading slash
      const response = await api.get<BookData[]>(
        `/api/book/all?search=${encodeURIComponent(search)}`, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Safeguard: Ensure the parsed dataset evaluates as a flat array
      setBooks(Array.isArray(response.data) ? response.data : []);
      
    } catch (error) {
      console.error('Failed to load books:', error);
      setBooks([]); // Set empty array on failure so .map() doesn't crash
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchBooks(searchQuery);
  };

  const handleDelete = async (isbn: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    const token = localStorage.getItem('jwtToken');
    try {
      // 4. Converted fetch to Axios DELETE using APP_URLS base path
      const response = await api.delete(`/api/book/delete/${isbn}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert(response.data?.message || "Book deleted");
      fetchBooks(searchQuery); 

    } catch (error: unknown) {
      console.error('Delete failed:', error);
      
      // 5. Handle Axios specific error payload mapping
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.error || error.response?.data?.message;
        alert(`Error: ${serverMessage || 'Unauthorized delete request'}`);
      } else {
        alert("An unexpected network anomaly stopped the request.");
      }
    }
  };

  return (
    <>
      <h1 className="head1">Book Dashboard</h1>
      <div className="roam">
        <Link to='/addbook'>add book</Link>
      </div>
      <div className="search">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <label>Search for a book</label>
          <input type="text" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
          <button type="submit">Search</button>
        </form>
      </div>
      <h2 className="head2">All Books</h2>
      <div className="table-part">
        <table>
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Author</th>
              <th>ISBN Number</th>
              <th>Category</th>
              <th>Sub-category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                  No available book listings found.
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.isbn_number}>
                  <td>{book.book_title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn_number}</td>
                  <td>{book.category}</td>
                  <td>{book.sub_category || '-'}</td>
                  <td className="status">
                    <button onClick={() => handleDelete(book.isbn_number)} className="linkb">Delete</button>
                    <Link to={`/updatebook?isbn=${book.isbn_number}`}><button className="linkb">Update</button></Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Availableb;
