import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";


// ==========================================
// TYPESCRIPT SCHEMAS & INTERFACES
// ==========================================
interface UpdateForm {
  category_name: string;
  reading_level: string;
  category_subject: string;
}

// The backend no longer restricts these values — enforcing them here instead.
const CATEGORY_NAME_OPTIONS = ["fiction", "non-fiction"];
const READING_LEVEL_OPTIONS = ["junior", "senior","adult"];

// ==========================================
// MAIN COMPONENT MODULE
// ==========================================
function Updatecat(): React.JSX.Element {
  // Route now keys off category_id — the real unique identifier
  const { category_id } = useParams<{ category_id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UpdateForm>({
    category_name: "",
    reading_level: "",
    category_subject: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryDetails = async (): Promise<void> => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setErrorMessage("Authentication token missing. Please log out and back in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);
        
        if (!category_id) {
          throw new Error("Routing parameter mapping validation failed.");
        }

        const response = await axios.get(`/categories/${category_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFormData({
          category_name: response.data?.category_name || "",
          reading_level: response.data?.reading_level || "",
          category_subject: response.data?.category_subject || "",
        });
      } catch (err: unknown) {
        console.error("Fetch details error:", err);
        alert("Target category index data could not be recovered. Returning to dashboard.");
        navigate("/allcat");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [category_id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setErrorMessage("Authentication token missing. Action rejected.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.put(
        `/categories/${category_id ?? ''}`, 
        formData, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      alert(response.data?.message || "Reconfiguration sync successful.");
      navigate("/allcat");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || "Reconfiguration error occurred on the database layer.");
      } else {
        setErrorMessage("An unexpected network anomaly occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="head1">category dashboard</h1>
      
      <div className="roam">
        <Link to="/addcategory">add category</Link>
        <Link to="/allcat">view all categories</Link>
      </div>
      
      <div className="form-card">
        <h2 className="head2">update category</h2>
        
        {errorMessage && <div className="error-banner" style={{ color: "red", marginBottom: "15px" }}>⚠️ {errorMessage}</div>}
        
        {loading ? (
          <div style={{ padding: "20px 0" }}>Loading current category definitions...</div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="category_name">category name</label>
              <select
                id="category_name"
                name="category_name"
                value={formData.category_name}
                onChange={handleChange}
                disabled={submitting}
                required
              >
                <option value="" disabled>Select category</option>
                {CATEGORY_NAME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="reading_level">reading level</label>
              <select
                id="reading_level"
                name="reading_level"
                value={formData.reading_level}
                onChange={handleChange}
                disabled={submitting}
                required
              >
                <option value="" disabled>Select reading level</option>
                {READING_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="category_subject">category subject</label>
              <input 
                id="category_subject"
                type="text" 
                name="category_subject" 
                value={formData.category_subject} 
                onChange={handleChange} 
                disabled={submitting}
                required 
              />
            </div>
            
            <div className="button">
              <button type="submit" disabled={submitting}>
                {submitting ? "Updating Database..." : "update category"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Updatecat;