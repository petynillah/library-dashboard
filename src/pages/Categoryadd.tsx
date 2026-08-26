import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// ==========================================
// TYPESCRIPT SCHEMAS & INTERFACES
// ==========================================
interface CategoryForm {
  category_name: string;
  reading_level: string;
  category_subject: string;
}

// The backend no longer restricts these values — enforcing them here instead.
// Update these two arrays if the allowed set ever changes.
const CATEGORY_NAME_OPTIONS = ["fiction", "non-fiction"];
const READING_LEVEL_OPTIONS = ["junior", "senior", "adult"];

// ==========================================
// MAIN COMPONENT MODULE
// ==========================================
function Categoryadd(): React.JSX.Element {
  const [formData, setFormData] = useState<CategoryForm>({
    category_name: "",
    reading_level: "",
    category_subject: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setErrorMessage("Authentication token missing. Please log out and back in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`/api/categories`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      alert(response.data?.message || "Category successfully synchronized.");
      setFormData({ category_name: "", reading_level: "", category_subject: "" });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        const statusCode = err.response?.status;

        if (statusCode === 401) {
          setErrorMessage("Your session expired. Please log out and back in.");
        } else if (statusCode === 403) {
          setErrorMessage("Action Denied: You do not have permission to create categories.");
        } else {
          setErrorMessage(errorData?.message || "Failed to create category record.");
        }
      } else {
        setErrorMessage("Network anomaly encountered during registry submission.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="head1">Category Dashboard</h1>
      
      <div className="roam">
        <Link to="/addcategory" className="btn-link">Add Category</Link>
        <Link to="/allcat" className="btn-link">View All Categories</Link>
      </div>

      <div className="form-card">
        <h2 className="head2">Add Category</h2>
        
        {errorMessage && <div className="error-banner" style={{ color: "red", marginBottom: "15px" }}>⚠️ {errorMessage}</div>}
        
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="category_name">Category Name</label>
            <select
              id="category_name"
              name="category_name"
              value={formData.category_name}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="" disabled>Select category</option>
              {CATEGORY_NAME_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="reading_level">Reading Level</label>
            <select
              id="reading_level"
              name="reading_level"
              value={formData.reading_level}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="" disabled>Select reading level</option>
              {READING_LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="category_subject">Category Subject</label>
            <input 
              id="category_subject" 
              type="text" 
              name="category_subject" 
              value={formData.category_subject} 
              onChange={handleChange} 
              disabled={loading} 
              required 
            />
          </div>

          <div className="button">
            <button type="submit" disabled={loading}>
              {loading ? "Saving Record..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Categoryadd;