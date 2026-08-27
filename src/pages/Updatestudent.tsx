import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

interface StudentData {
  name: string;
  gender: string;
  age: string;
  educationLevel: string;
  institution: string;
  password: string;
}

function Updatestudent(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentData>({
    name: '',
    gender: '',
    age: '',
    educationLevel: '',
    institution: '',
    password: ''
  });

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!id) return;

      try {
        // Corrected path: /student/:id, not /students/:id
        const response = await api.get(`/student/${id}`);
        const data = response.data;
        
        // Backend wraps the record in { success, data }
        const student = data.data;
        setFormData({
          name: student?.name || '',
          gender: student?.gender || '',
          age: student?.age != null ? String(student.age) : '',
          educationLevel: student?.education_level || '',
          institution: student?.institution_name || '',
          password: '' // never pre-filled — only sent if the user chooses to change it
        });
      } catch (err: unknown) {
        console.error('Failed to load profile context:', err);
      }
    };
    fetchStudentDetails();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Mapped to backend field names; password only included if the staff member typed a new one
    const payload: Record<string, string> = {
      name: formData.name?.trim(),
      gender: formData.gender?.trim(),
      age: formData.age?.trim(),
      education_level: formData.educationLevel?.trim(),
      institution_name: formData.institution?.trim(),
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      // Corrected path: /student/:id, not /students/:id
      const response = await api.put(`/student/${id}`, payload);

      alert(response.data?.message || 'Student records updated successfully!');
      navigate('/allstudents');
    } catch (error: unknown) {
      console.error("Student modification syncing failure:", error);
      if (api.isAxiosError(error)) {
        const fallbackMsg = 'Failed to modify student record file.';
        alert(`Update Error: ${error.response?.data?.error || error.response?.data?.message || fallbackMsg}`);
      } else {
        alert('Could not synchronize updates with backend servers.');
      }
    }
  };

  return (
    <div>
      <h1 className="head1">student dashboard</h1>
      <div className="roam">
        <Link to="/allstudents">view all students</Link>
        <Link to="/allstudents">delete student</Link>
      </div>
      <h2 className="head2">update student</h2>
      
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
            placeholder="Leave blank to keep current password"
          />
        </div>
        <div className="button">
          <button type="submit">update student</button>
        </div>
      </form>
    </div>
  );
}

export default Updatestudent;
