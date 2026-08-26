import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import axios from "axios";
import { APP_URLS } from "../Appurl";

interface UpdateShelfForm {
  shelf_number: string;
  shelf_category: string;
  book_category: string;
}

interface CategoryOption {
  category_id: number;
  category_subject: string;
}

function Updateshelf(): React.JSX.Element {
  // shelf_number in the URL is the CURRENT identifier — the form value below can change it (rename)
  const { shelf_number } = useParams<{ shelf_number: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateShelfForm>({
    shelf_number: "",
    shelf_category: "",
    book_category: "",
  });
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      const token = localStorage.getItem("jwtToken");
      try {
        const response = await axios.get<CategoryOption[]>(`${APP_URLS}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const seen = new Set<string>();
        const unique = response.data.filter((cat) => {
          if (seen.has(cat.category_subject)) return false;
          seen.add(cat.category_subject);
          return true;
        });
        setCategoryOptions(unique);
      } catch (err: unknown) {
        console.error("Error fetching category subjects:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchShelfDetails = async (): Promise<void> => {
      const token = localStorage.getItem("jwtToken");
      try {
        setLoading(true);
        const response = await axios.get(`${APP_URLS}/api/shelves/${encodeURIComponent(shelf_number || '')}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData({
          shelf_number: response.data.shelf_number,
          shelf_category: response.data.shelf_category,
          book_category: response.data.book_category,
        });
      } catch (err: unknown) {
        alert("Target structural shelf details could not be loaded.");
        navigate("/shelfavailable");
      } finally {
        setLoading(false);
      }
    };

    if (shelf_number) fetchShelfDetails();
  }, [shelf_number, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");
    try {
      // shelf_number in the URL stays the lookup key; formData.shelf_number carries the (possibly renamed) value
      const response = await axios.put(`${APP_URLS}/api/shelves/${encodeURIComponent(shelf_number || '')}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.message || "Shelf reconfigured successfully.");
      navigate("/shelfavailable");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Adjustment error.");
      }
    }
  };

  return (
    <>
      <h1 className="head1">shelving dashboard</h1>
      <div className="roam">
        <Link to="/addshelf" style={{ marginRight: "15px" }}>add shelf</Link>
        <Link to="/shelfavailable">view available shelves</Link>
      </div>
      <h2 className="head2">update shelf: #{shelf_number}</h2>
      {loading ? (
        <div style={{ padding: "20px 0" }}>Loading current shelf details...</div>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="shelf_number">shelf number</label>
            <input
              id="shelf_number"
              type="text"
              name="shelf_number"
              value={formData.shelf_number}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="shelf_category">shelf category</label>
            <input
              id="shelf_category"
              type="text"
              name="shelf_category"
              value={formData.shelf_category}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="book_category">book category</label>
            <select
              id="book_category"
              name="book_category"
              value={formData.book_category}
              onChange={handleChange}
              disabled={loadingCategories}
              required
            >
              <option value="" disabled>
                {loadingCategories ? "Loading categories..." : "Select a book category"}
              </option>
              {categoryOptions.map((cat) => (
                <option key={cat.category_id} value={cat.category_subject}>
                  {cat.category_subject}
                </option>
              ))}
            </select>
          </div>
          <div className="button">
            <button type="submit">
              <IoAddCircleOutline /> update shelf
            </button>
          </div>
        </form>
      )}
    </>
  );
}

export default Updateshelf;