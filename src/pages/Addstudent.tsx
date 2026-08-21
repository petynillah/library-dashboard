import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Define explicit local types in line with your standard practices
interface StudentData {
  name: string;
  gender: string;
  age: string;
  educationLevel: string;
  institution: string;
  password: string;
}

function Addstudent(): React.JSX.Element {
  const [formData, setFormData] = useState<StudentData>({
    name: '',
    gender: '',
    age: '',
    educationLevel: '',
    institution: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert("Authentication token missing. Please log out and log back in.");
      return;
    }

    // Mapped to the backend's expected snake_case field names
    // (education_level / institution_name), not the frontend's camelCase state keys.
    const payload = {
      name: formData.name?.trim(),
      gender: formData.gender?.trim(),
      age: formData.age?.trim(),
      education_level: formData.educationLevel?.trim(),
      institution_name: formData.institution?.trim(),
      password: formData.password
    };

    try {
      const response = await fetch('/api/student/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Student added to database successfully!');
        setFormData({ name: '', gender: '', age: '', educationLevel: '', institution: '', password: '' });
      } else {
        alert(`Database Error: ${data.error || data.message || 'Failed to insert student records.'}`);
      }
    } catch (error) {
      console.error('Network request failed:', error);
      alert('Could not reach the server. Please verify your backend server is running.');
    }
  };

  return (
    <div>
      <h1 className="head1">student dashboard</h1>
      <div className="roam">
        <Link to="/allstudents">view all students</Link>
        <Link to="/allstudents">update student</Link>
        <Link to="/allstudents">delete student</Link>
      </div>
      <h2 className="head2">new student</h2>
      
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="name">student name</label>
          <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label htmlFor="gender">gender</label>
          <input id="gender" type="text" name="gender" value={formData.gender} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label htmlFor="age">age</label>
          <input id="age" type="text" name="age" value={formData.age} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label htmlFor="educationLevel">education level</label>
          <input id="educationLevel" type="text" name="educationLevel" value={formData.educationLevel} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label htmlFor="institution">school/institution</label>
          <input id="institution" type="text" name="institution" value={formData.institution} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label htmlFor="password">password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Create account password"
          />
        </div>
        <div className="button">
          <button type="submit">add student</button>
        </div>
      </form>
    </div>
  );
}

export default Addstudent;