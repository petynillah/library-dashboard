import React, { useState, useEffect } from 'react'; 
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import type { BookData } from '../types'; 

function Updateb(): React.JSX.Element { 
  const [searchParams] = useSearchParams(); 
  const navigate = useNavigate(); 
  const isbnParam = searchParams.get('isbn') || ''; 

  const [formData, setFormData] = useState<BookData>({ 
    book_title: '', 
    author: '', 
    isbn_number: isbnParam, 
    category: '', 
    reading_level: '', 
    sub_category: '' 
  }); 

  // FIX 1: Use GET instead of PUT on component mount to securely load the existing details
  useEffect(() => { 
    if (!isbnParam) return; 

    const fetchBookDetails = async (): Promise<void> => { 
      const token = localStorage.getItem('jwtToken'); 
      try { 
        // Note the change to /api/book/details or your correct GET endpoint
        const response = await fetch(`/api/book/details/${encodeURIComponent(isbnParam)}`, { 
          method: 'GET', 
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        }); 

        if (response.ok) { 
          const data = await response.json(); 
          
          // FIX 2: Safely handles both single object and wrapper array/object returns
          const targetBook = Array.isArray(data) 
            ? data.find(b => b.isbn_number === isbnParam) 
            : (data.book || data.data || data);

          if (targetBook) { 
            setFormData(targetBook); 
          } 
        } else {
          console.error('Server responded with an error status');
        }
      } catch (error) { 
        console.error('Failed to load book data:', error); 
      } 
    }; 

    fetchBookDetails(); 
  }, [isbnParam]); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
  }; 

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => { 
    e.preventDefault(); 
    const token = localStorage.getItem('jwtToken'); 
    try { 
      const response = await fetch(`/api/book/update/${encodeURIComponent(isbnParam)}`, { 
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }, 
        body: JSON.stringify(formData) 
      }); 

      const data = await response.json(); 
      if (response.ok) { 
        alert(data.message || "Book updated successfully!"); 
        navigate('/availablebk'); 
      } else { 
        alert(`Error: ${data.error || data.message || 'Failed to update'}`); 
      } 
    } catch (error) { 
      console.error('Update request failed:', error); 
    } 
  }; 

  const handleDelete = async (): Promise<void> => { 
    if (!isbnParam) return; 
    if (!window.confirm("Are you sure you want to permanently delete this book?")) return; 

    const token = localStorage.getItem('jwtToken'); 
    try { 
      const response = await fetch(`/api/book/delete/${encodeURIComponent(isbnParam)}`, { 
        method: 'DELETE', 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      }); 

      if (response.ok) { 
        alert("Book successfully removed."); 
        navigate('/availablebk'); 
      } else { 
        const data = await response.json(); 
        alert(`Error: ${data.error || data.message || 'Failed to delete'}`); 
      } 
    } catch (error) { 
      console.error('Delete request failed:', error); 
    } 
  }; 

  return ( 
    <div> 
      <h1 className="head1">Book Dashboard</h1> 
      <h2 className="head2">Update Book</h2> 
      {isbnParam ? ( 
        <form className="form" onSubmit={handleUpdate}> 
          <div className="form-row"> 
            <label>Book title</label> 
            <input type="text" name="book_title" value={formData.book_title} onChange={handleChange} required /> 
          </div> 
          <div className="form-row"> 
            <label>Author</label> 
            <input type="text" name="author" value={formData.author} onChange={handleChange} required /> 
          </div> 
          <div className="form-row"> 
            <label>ISBN Number (Read-Only)</label> 
            <input type="text" name="isbn_number" value={formData.isbn_number} readOnly disabled /> 
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
            <input type="text" name="sub_category" value={formData.sub_category || ''} onChange={handleChange} /> 
          </div> 
          <div className="button"> 
            <button type="submit">Update</button> 
            <button type="button" onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button> 
          </div> 
        </form> 
      ) : ( 
        <p style={{ textAlign: 'center', color: 'red' }}>No valid ISBN provided. Please select a book from the dashboard.</p> 
      )} 
    </div> 
  ); 
} 

export default Updateb;
