import React, { useState, useEffect } from 'react'; 
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import type { BookData } from '../types'; 
import { APP_URLS } from '../Appurl';
import axios from 'axios'; // 1. Added Axios import

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

  // Use GET on component mount to load the existing details
  useEffect(() => { 
    if (!isbnParam) return; 

    const fetchBookDetails = async (): Promise<void> => { 
      const token = localStorage.getItem('jwtToken'); 
      try { 
        // 2. Converted native fetch to Axios GET
        const response = await axios.get(`${APP_URLS}/api/book/details/${encodeURIComponent(isbnParam)}`, { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        }); 

        // Axios natively parses JSON data into response.data
        const rawData = response.data; 
        
        // Safely handles both single object and wrapper array/object returns
        const targetBook = Array.isArray(rawData) 
          ? rawData.find(b => b.isbn_number === isbnParam) 
          : (rawData.book || rawData.data || rawData);

        if (targetBook) { 
          setFormData(targetBook); 
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
      // 3. Converted native fetch to Axios PUT
      const response = await axios.put(`${APP_URLS}/api/book/update/${encodeURIComponent(isbnParam)}`, formData, { 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      }); 

      alert(response.data?.message || "Book updated successfully!"); 
      navigate('/availablebk'); 
    } catch (error: unknown) { 
      console.error('Update request failed:', error); 
      
      // Axios error data validation mapping
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.error || error.response?.data?.message;
        alert(`Error: ${serverMessage || 'Failed to update'}`);
      } else {
        alert("An unexpected network exception occurred.");
      }
    } 
  }; 

  const handleDelete = async (): Promise<void> => { 
    if (!isbnParam) return; 
    if (!window.confirm("Are you sure you want to permanently delete this book?")) return; 

    const token = localStorage.getItem('jwtToken'); 
    try { 
      // 4. Converted native fetch to Axios DELETE
      const response = await axios.delete(`${APP_URLS}/api/book/delete/${encodeURIComponent(isbnParam)}`, { 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      }); 

      alert(response.data?.message || "Book successfully removed."); 
      navigate('/availablebk'); 
    } catch (error: unknown) { 
      console.error('Delete request failed:', error); 
      
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.error || error.response?.data?.message;
        alert(`Error: ${serverMessage || 'Failed to delete'}`);
      } else {
        alert("An unexpected network exception occurred.");
      }
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
