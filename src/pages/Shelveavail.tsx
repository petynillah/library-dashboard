import React, { useEffect, useState } from "react";
import { GrUpdate } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import api from '../api';


interface ShelfItem {
  shelf_number: string;
  shelf_category: string;
  book_category: string;
}

function Shelveavail(): React.JSX.Element {
  const [shelves, setShelves] = useState<ShelfItem[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const navigate = useNavigate();

  const fetchShelves = async (searchQuery: string = ""): Promise<void> => {
    try {
      // Clean query parameter execution leveraging your centralized baseURL
      const response = await api.get<ShelfItem[]>(`/shelves?search=${encodeURIComponent(searchQuery)}`);
      setShelves(response.data);
    } catch (err: unknown) {
      console.error("Error fetching shelves:", err);
    }
  };

  useEffect(() => {
    fetchShelves();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchShelves(searchInput);
  };

  const handleDelete = async (shelfNumber: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete shelf #${shelfNumber}?`)) return;
    try {
      const response = await api.delete(`/shelves/${encodeURIComponent(shelfNumber)}`);
      alert(response.data.message || "Shelf entry removed.");
      fetchShelves(searchInput);
    } catch (err: unknown) {
      if (api.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to remove shelf.");
      } else {
        alert("An unexpected network anomaly occurred.");
      }
    }
  };

  return (
    <>
      <h1 className="head1">shelving dashboard</h1>
      <div className="roam" style={{ marginBottom: "20px" }}>
        <Link to="/addshelf">add shelf</Link>
        <Link to="/shelfavailable">view available shelves</Link>
      </div>
      <div className="search">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <label htmlFor="search-input" style={{ marginRight: '10px' }}>Search for a specific shelf</label>
          <input id="search-input" type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search shelves..." />
          <button type="submit" style={{ marginLeft: "8px", cursor: "pointer" }}>Search</button>
        </form>
      </div>
      <h2 className="head2">available shelves</h2>
      <div className="table-part">
        <table>
          <thead>
            <tr>
              <th>shelf number</th>
              <th>shelf category</th>
              <th>book category</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {shelves.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>No structural shelf tracking indexes available.</td>
              </tr>
            ) : (
              shelves.map((shelf) => (
                <tr key={shelf.shelf_number}>
                  <td>{shelf.shelf_number}</td>
                  <td>{shelf.shelf_category}</td>
                  <td>{shelf.book_category}</td>
                  <td className="status">
                    <button onClick={() => handleDelete(shelf.shelf_number)} style={{ background: "none", border: "none", cursor: "pointer", marginRight: "10px", color: "#dc3545" }}>
                      <MdDelete size={18} />
                    </button>
                    <button onClick={() => navigate(`/updateshelf/${encodeURIComponent(shelf.shelf_number)}`)} style={{ background: "none", border: "none", cursor: "pointer", color: "#28a745" }}>
                      <GrUpdate size={16} />
                    </button>
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

export default Shelveavail;
