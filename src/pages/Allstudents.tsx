import React, { useState, useEffect } from "react";
import { MdDelete, MdSecurityUpdate } from "react-icons/md";
import { Link } from "react-router-dom";
import { APP_URLS } from "../Appurl";

// Full set of fields your backend returns for a student (password is excluded server-side)
interface Student {
  id: string;
  student_id: string;
  name: string;
  gender: string;
  age: number | string;
  education_level: string;
  institution_name: string;
  role: string;
}

const TOTAL_COLUMNS = 9; // 8 data columns + 1 Status/actions column — keep in sync with <thead> below

function Allstudents(): React.JSX.Element {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchStudents = async (query: string = ''): Promise<void> => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert("Authentication token missing. Please log out and log back in.");
      return;
    }

    try {
      const response = await fetch(`${APP_URLS}/api/student/all?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.data || []);
      } else {
        alert(`Database Error: ${data.error || data.message || 'Failed to fetch student list.'}`);
      }
    } catch (error) {
      console.error('Network request failed:', error);
      alert('Could not reach the server. Please verify your backend server is running.');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchStudents(searchQuery.trim());
  };

  // "view all students" clears any active filter and re-pulls fresh data —
  // needed because a Link to the page you're already on won't remount/refetch on its own.
  const handleViewAllClick = (): void => {
    setSearchQuery('');
    fetchStudents('');
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this student file?")) return;
    
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert("Authentication token missing.");
      return;
    }

    try {
      const response = await fetch(`${APP_URLS}/api/student/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Student profile deleted successfully.");
        setStudents(students.filter(student => student.id !== id));
      } else {
        alert(`Deletion Error: ${data.error || data.message || 'Failed to delete record.'}`);
      }
    } catch (error) {
      console.error('Deletion request failed:', error);
      alert('Could not reach backend servers.');
    }
  };

  return (
    <div>
      <h1 className="head1">students dashboard</h1>
      <div className="roam">
        <Link to="/allstudents" onClick={handleViewAllClick}>view all students</Link>
        <Link to="/addstudent">add student</Link>
      </div>
    
      <div className="search">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <label>Search for a student by id or name</label>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Type search items..."
          /> <button type="submit">Search</button>
         
        </form>
      </div>

      <h2 className="head2">all students</h2>
      <div className="table-part">
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>student id</th>
              <th>name</th>
              <th>gender</th>
              <th>age</th>
              <th>education level</th>
              <th>institution</th>
              <th>role</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.student_id}</td>
                <td>{student.name}</td>
                <td>{student.gender}</td>
                <td>{student.age}</td>
                <td>{student.education_level}</td>
                <td>{student.institution_name}</td>
                <td>{student.role}</td>
                <td className="status">
                  <span onClick={() => handleDelete(student.id)} style={{ cursor: 'pointer', marginRight: '10px' }}>
                    <MdDelete color="red" />
                  </span>
                  <Link to={`/updatestudent/${student.id}`}>
                    <MdSecurityUpdate />
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={TOTAL_COLUMNS} style={{ textAlign: 'center', padding: '15px' }}>
                  No student records match your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Allstudents;