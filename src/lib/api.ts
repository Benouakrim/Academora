// API client for Express.js backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Helper function to set auth token in localStorage
export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

// Helper function to get current user from localStorage
export function getCurrentUser(): any | null {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Helper function to set current user in localStorage
export function setCurrentUser(user: any | null): void {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

// Generic fetch function with auth
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: response.status === 0 || response.status >= 500 
          ? 'Server is not responding. Make sure the backend server is running on port 3001.' 
          : `HTTP error! status: ${response.status}` 
      }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors (server not running, CORS, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to API at ${API_URL}. Make sure the backend server is running on port 3001.`);
    }
    throw error;
  }
}

// Auth API
export const authAPI = {
  async signup(email: string, password: string) {
    const data = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
      setCurrentUser(data.user);
    }
    return data;
  },

  async login(email: string, password: string) {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
      setCurrentUser(data.user);
    }
    return data;
  },

  async getCurrentUser() {
    return fetchAPI('/auth/me');
  },

  logout() {
    setAuthToken(null);
    setCurrentUser(null);
  },
  
  async forgotPassword(email: string) {
    return fetchAPI('/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email: string, token: string, newPassword: string) {
    return fetchAPI('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ email, token, password: newPassword }),
    });
  },
};

// Blog API
export const blogAPI = {
  async getArticles() {
    return fetchAPI('/blog');
  },

  async getArticle(slug: string) {
    return fetchAPI(`/blog/${slug}`);
  },
};

// Admin API
export const adminAPI = {
  async getAllArticles() {
    return fetchAPI('/admin/articles');
  },

  async getArticleById(id: string) {
    return fetchAPI(`/admin/articles/${id}`);
  },

  async createArticle(articleData: any) {
    return fetchAPI('/admin/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  },

  async updateArticle(id: string, articleData: any) {
    return fetchAPI(`/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData),
    });
  },

  async deleteArticle(id: string) {
    return fetchAPI(`/admin/articles/${id}`, {
      method: 'DELETE',
    });
  },

  async getUsers() {
    return fetchAPI('/admin/users');
  },
};

// Upload API
export const uploadAPI = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `HTTP error! status: ${response.status}` 
        }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to API at ${API_URL}. Make sure the backend server is running on port 3001.`);
      }
      throw error;
    }
  },

  async deleteImage(filename: string) {
    return fetchAPI(`/upload/image/${filename}`, {
      method: 'DELETE',
    });
  },
};

// Orientation API
export const orientationAPI = {
  async getResources() {
    return fetchAPI('/orientation');
  },

  async getResourcesByCategory(category: string) {
    return fetchAPI(`/orientation/category/${category}`);
  },

  async getResource(category: string, slug: string) {
    return fetchAPI(`/orientation/${category}/${slug}`);
  },
};
