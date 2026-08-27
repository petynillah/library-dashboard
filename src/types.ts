import api from "./api"; // 1. Import your central interceptor instance instead of raw axios

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
    return_date: string | null;
}

export interface CategoryForm {
  category_name: string;
  reading_level: string;
  category_subject: string;
}

// 2. Removed getAuthHeaders completely — the "api" request interceptor attaches the token automatically now!

export const categoryService = {
  // Fetch all categories for your view
  getAll: async () => {
    // 3. Changed "axios" to "api"
    const response = await api.get("/categories");
    return response.data;
  },

  // Create a new category
  create: async (data: CategoryForm) => {
    // 3. Changed "axios" to "api"
    const response = await api.post("/categories", data);
    return response.data;
  },

  // Delete a category
  delete: async (id: string | number) => {
    // 3. Changed "axios" to "api"
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};
