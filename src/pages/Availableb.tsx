import React, { useState, useEffect } from 'react';
import type { BookData } from '../types';
import { Link } from 'react-router-dom';

function Availableb(): React.JSX.Element {
  const [books, setBooks] = useState<BookData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchBooks = async (search: string = ''): Promise<void> => {
    const token = localStorage.getItem('jwtToken');
    try {
      // TAILORED: Routed to /api/books to map directly to the backend's query logic
      const response = await fetch(`/api/book/all?search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data: BookData[] = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Failed to load books:', error);
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
      // TAILORED: Corrected port to 8080 and URL mapping to match backend model parameter
      const response = await fetch(`/api/book/delete/${isbn}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Book deleted");
        fetchBooks(searchQuery); 
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || data.message || 'Unauthorized delete request'}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <>
      <h1 className="head1">Book Dashboard</h1>
      <div className="roam">
              {/* Uniformly scales navigation parameters to match system routing structures */}
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
            {books.map((book) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Availableb;
