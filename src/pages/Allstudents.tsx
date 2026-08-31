import React, { useState, useEffect } from "react";
import { MdDelete, MdSecurityUpdate } from "react-icons/md";
import { Link } from "react-router-dom";
import api from "../api";

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
    try {
      const response = await api.get(`/student/all?search=${encodeURIComponent(query)}`);
      setStudents(response.data?.data || []);
    } catch (error: unknown) {
      console.error('Network request failed:', error);
      if (api.isAxiosError(error)) {
        alert(`Database Error: ${error.response?.data?.error || error.response?.data?.message || 'Failed to fetch student list.'}`);
      } else {
        alert('Could not reach the server. Please verify your backend server is running.');
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchStudents(searchQuery.trim());
  };

  // Clears any active filter and re-pulls the full unfiltered list
  const handleResetSearch = (): void => {
    setSearchQuery('');
    fetchStudents('');
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this student file?")) return;

    try {
      const response = await api.delete(`/student/${id}`);
      alert(response.data?.message || "Student profile deleted successfully.");
      setStudents(students.filter(student => student.id !== id));
    } catch (error: unknown) {
      console.error('Deletion request failed:', error);
      if (api.isAxiosError(error)) {
        alert(`Deletion Error: ${error.response?.data?.error || error.response?.data?.message || 'Failed to delete record.'}`);
      } else {
        alert('Could not reach backend servers.');
      }
    }
  };

  return (
    <div>
      <h1 className="head1">students dashboard</h1>
      <div className="roam">
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
          /> 
          <button type="submit">Search</button>
          <button type="button" onClick={handleResetSearch}>view all students</button>
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