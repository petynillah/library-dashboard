import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import api from '../api';

interface ShelfForm {
  shelf_number: string;
  shelf_category: string;
  book_category: string;
}

interface CategoryOption {
  category_id: number;
  category_subject: string;
}

function Addshelf(): React.JSX.Element {
  const [formData, setFormData] = useState<ShelfForm>({
    shelf_number: "",
    shelf_category: "",
    book_category: "",
  });
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  // book_category must match an existing category_subject, so pull the live list
  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      try {
        const response = await api.get<CategoryOption[]>(`/categories`);

        // SAFEGUARD: Ensure data is an array before executing filtering methods
        const rawData = response.data;
        const dataArray = Array.isArray(rawData) ? rawData : [];

        // De-duplicate by category_subject in case multiple rows share a subject
        const seen = new Set<string>();
        const unique = dataArray.filter((cat) => {
          if (!cat.category_subject || seen.has(cat.category_subject)) return false;
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await api.post(`/shelves`, formData);
      alert(response.data.message || "Shelf added successfully!");
      setFormData({ shelf_number: "", shelf_category: "", book_category: "" });
    } catch (err: unknown) {
      if (api.isAxiosError(err)) {
        alert(err.response?.data?.message || "An error occurred.");
      } else {
        alert("An unexpected network anomaly occurred.");
      }
    }
  };

  return (
    <>
      <h1 className="head1">shelving dashboard</h1>
      <div className="roam">
        <Link to="/shelfavailable">view available shelves</Link>
      </div>
      <h2 className="head2">add a shelf</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="shelf_number">shelf number</label>
          <input
            id="shelf_number"
            type="text"
            name="shelf_number"
            value={formData.shelf_number}
            onChange={handleChange}
            placeholder="e.g. A1"
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
            <IoAddCircleOutline /> add shelf
          </button>
        </div>
      </form>
    </>
  );
}

export default Addshelf;
