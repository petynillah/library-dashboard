import React, { useEffect, useState } from 'react';
import type { BookData } from '../types';
import { Link } from 'react-router-dom';
import api from '../api';

function Availableb(): React.JSX.Element {
  const [books, setBooks] = useState<BookData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchBooks = async (search: string = ''): Promise<void> => {
    try {
      // Clean query parameter execution leveraging your centralized baseURL
      const response = await api.get(`/book/all?search=${encodeURIComponent(search)}`);
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load books:', error);
      setBooks([]);
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
    try {
      // Converted delete call to use the shared api instance without manual headers
      const response = await api.delete(`/book/delete/${isbn}`);

      alert(response.data?.message || "Book deleted");
      fetchBooks(searchQuery); 

    } catch (error: unknown) {
      console.error('Delete failed:', error);
      
      // Handle custom instance specific error responses safely
      if (api.isAxiosError(error)) {
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
        <Link to="/availablebk">Show all books</Link>
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
