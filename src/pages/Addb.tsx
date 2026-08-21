import React, { useState } from 'react';
import type { BookData } from '../types';
import { Link } from 'react-router-dom';

function Addb(): React.JSX.Element {
  const [formData, setFormData] = useState<BookData>({
    book_title: '',
    author: '',
    isbn_number: '',
    category: '',
    reading_level: '',
    sub_category: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();
  const token = localStorage.getItem('jwtToken');

  // Guard clause if token is missing entirely
  if (!token) {
    alert("Authentication token missing. Please log out and log back in.");
    return;
  }

  // Format data safely for database entry
  const payload = {
  book_title: formData.book_title?.trim(),
  author: formData.author?.trim(),
  isbn_number: formData.isbn_number?.trim(),
  category: formData.category?.trim(),
  reading_level: formData.reading_level?.trim(),
  sub_category: formData.sub_category?.trim() || null
};


  try {
    const response = await fetch('/api/book/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Sends authorization header just like your backend expects
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message || 'Book added to library database successfully!');
      
      // Clear form inputs for the next entry
      setFormData({
        book_title: '', author: '', isbn_number: '', category: '', reading_level: '', sub_category: ''
      });
    } else {
      // Backend caught an error or rejected due to a bad token
      alert(`Database Error: ${data.error || data.message || 'Failed to insert book records.'}`);
    }
  } catch (error) {
    console.error('Network request failed:', error);
    alert('Could not reach the server. Please verify your backend server is running on port 8080.');
  }
};

  return (
    <div>
      <h1 className="head1">Book Dashboard</h1>
      <div className="roam">              
              <Link to="/availablebk" >Show all books</Link>
            </div>
      <h2 className="head2">Add Book</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Book title</label>
          <input type="text" name="book_title" value={formData.book_title} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label>Author</label>
          <input type="text" name="author" value={formData.author} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label>ISBN Number</label>
          <input type="text" name="isbn_number" value={formData.isbn_number} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label>Category</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label>Reading level</label>
          <input type="text" name="reading_level" value={formData.reading_level} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label>Sub-category</label>
          <input type="text" name="sub_category" value={formData.sub_category} onChange={handleChange} />
        </div>
        <div className="button">
          <button type="submit">Add book</button>
        </div>
      </form>
    </div>
  );
}

export default Addb;
