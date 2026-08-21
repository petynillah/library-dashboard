
export interface BookData {
    book_title: string;
    author: string;
    isbn_number: string;
    category: string;
    reading_level: string;
    sub_category: string;
    status?: string;
}

export interface BorrowData {
    student_id: string | '';
    student_name: string;
    book_title: string;
    isbn_number: string;
    borrow_date: string;
}


export interface ReturnFormData extends BorrowData {
    return_date: string;
}

export interface BorrowedBookItem {
    book_title: string;
    student_id: string | ''
    student_name: string;
    author: string;
    isbn_number: string;
    category: string;
    sub_category: string;
    borrow_date: string;
    return_date: string | null; // null means it hasn't been returned yet
}

import axios from "axios";

export interface CategoryForm {
  category_name: string;
  reading_level: string;
  category_subject: string;
}

// Automatically grabs token on demand to prevent stale state issues
const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  };
};

export const categoryService = {
  // Fetch all categories for your "/dashboard/allcat" view
  getAll: async () => {
    const response = await axios.get("/api/categories", getAuthHeaders());
    return response.data;
  },

  // Create a new category
  create: async (data: CategoryForm) => {
    const response = await axios.post("/api/categories", data, getAuthHeaders());
    return response.data;
  },

  // Delete a category
  delete: async (id: string | number) => {
    const response = await axios.delete(`/api/categories/${id}`, getAuthHeaders());
    return response.data;
  },
};
