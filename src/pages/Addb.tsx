import React, { useState } from 'react';
import type { BookData } from '../types';
import { Link } from 'react-router-dom';
import api from '../api'; // Import your pre-configured centralized Axios instance

function Addb(): React.JSX.Element {
  const [formData, setFormData] = useState<BookData>({
    book_title: '',
    author: '',
    isbn_number: '',
    category: '',
    reading_level: '',
    sub_category: ''
  });

  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);

    // Format and trim data safely for database submission
    const payload = {
      book_title: formData.book_title?.trim(),
      author: formData.author?.trim(),
      isbn_number: formData.isbn_number?.trim(),
      category: formData.category?.trim(),
      reading_level: formData.reading_level?.trim(),
      sub_category: formData.sub_category?.trim() || null
    };

    try {
      // FIXED: Swapped raw fetch out for your global Axios client instance
      // Note: No manual authorization headers or stringify formatting needed!
      const response = await api.post('/book/add', payload);

      // Axios automatically parses JSON payloads into response.data
      alert(response.data?.message || 'Book added to library database successfully!');
      
      // Clear form inputs for the next catalog entry
      setFormData({
        book_title: '', author: '', isbn_number: '', category: '', reading_level: '', sub_category: ''
      });
    } catch (error: any) {
      console.error('API submission failed:', error);
      
      // Capture detailed error responses sent back from the Express backend
      const serverMessage = error.response?.data?.message || error.response?.data?.error;
      alert(`Database Error: ${serverMessage || 'Could not save book record.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="head1">Book Dashboard</h1>
      <div className="roam">              
        <Link to="/availablebk">Show all books</Link>
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
          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding book...' : 'Add book'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Addb;
