import React, { useEffect, useState } from "react";
import { MdDelete, MdSecurityUpdate } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api"; // 👈 shared instance — baseURL + interceptors already configured

// ==========================================
// TYPESCRIPT SCHEMAS & INTERFACES
// ==========================================
interface CategoryItem {
  category_id: number;
  category_name: string;
  reading_level: string;
  category_subject: string;
}

// ==========================================
// MAIN COMPONENT MODULE
// ==========================================
function Allcat(): React.JSX.Element {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCategories = async (): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await api.get<CategoryItem[]>("/categories");
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err: unknown) {
      console.error("Error fetching categories:", err);
      setErrorMessage("Failed to pull updated inventory catalogs from server registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Now targets category_id, the true unique identifier — category_name/category_subject can repeat
  const handleDelete = async (categoryId: number, label: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete "${label}"?`)) return;
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      alert(response.data?.message || "Category removed successfully.");
      fetchCategories();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to delete category");
      } else {
        alert("An unexpected error occurred during record execution.");
      }
    }
  };

  return (
    <>
      <h1 className="head1">category dashboard</h1>
      <div className="roam">
        <Link to="/addcategory">add category</Link>
        <Link to="/allcat">view all categories</Link>
      </div>

      <h2 className="head2">update category</h2>

      {errorMessage && <div className="error-banner" style={{ color: "red", padding: "10px" }}>⚠️ {errorMessage}</div>}
      {loading && <div style={{ padding: "10px" }}>Querying active metadata registers...</div>}

      {!loading && (
        <div className="table-part">
          <table>
            <thead>
              <tr>
                <th>category</th>
                <th>reading level</th>
                <th>category subject</th>
                <th>status</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                    No available category matrix found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.category_id}>
                    <td>{cat.category_name}</td>
                    <td>{cat.reading_level}</td>
                    <td>{cat.category_subject}</td>
                    <td className="status">
                      <button
                        onClick={() => handleDelete(cat.category_id, cat.category_name)}
                        style={{ cursor: 'pointer', marginRight: '8px' }}
                        title="Delete Category"
                      >
                        <MdDelete />
                      </button>
                      <button
                        onClick={() => navigate(`/updatecat/${cat.category_id}`)}
                        style={{ cursor: 'pointer' }}
                        title="Update Category"
                      >
                        <MdSecurityUpdate />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Allcat;