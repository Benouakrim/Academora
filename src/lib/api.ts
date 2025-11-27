// API client for Express.js backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get Clerk auth token (for use in components with useAuth hook)
export async function getClerkToken(): Promise<string | null> {
  try {
    // This will be called from components that have access to Clerk's useAuth hook
    // For now, we'll try to use the Clerk SDK if available
    const { useAuth } = await import('@clerk/clerk-react');
    // Note: This is a placeholder - actual usage should be in components with useAuth hook
    return null;
  } catch {
    return null;
  }
}

// Legacy helpers for backward compatibility (deprecated - use Clerk)
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getCurrentUser(): unknown {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function setCurrentUser(user: unknown): void {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

// Generic fetch function with auth
// Now supports Clerk tokens passed via headers
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Merge headers - prioritize explicitly passed headers
  const inputHeaders = (options.headers as Record<string, string>) || {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...inputHeaders,
  };

  // If Authorization header is explicitly provided, use it and skip auto-retrieval
  if (headers['Authorization']) {
    // Remove X-Clerk-Token if it exists (internal use only)
    delete headers['X-Clerk-Token'];
  } else {
    // No explicit Authorization header - try to get token
    const clerkToken = headers['X-Clerk-Token'];
    const token = clerkToken || getAuthToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Attempt automatic Clerk session token retrieval if still no auth header
    if (!headers['Authorization'] && typeof window !== 'undefined') {
      try {
        const clerkGlobal: any = (window as any).Clerk;
        if (clerkGlobal?.session) {
          // Note: session.getToken() doesn't support skipCache option
          // This is a fallback when getToken() from useAuth() is not available
          const autoToken = await clerkGlobal.session.getToken();
          if (autoToken) {
            headers['Authorization'] = `Bearer ${autoToken}`;
          }
        }
      } catch (autoErr) {
        // Silent – fallback to unauthenticated request / legacy token
        console.warn('Clerk auto-token retrieval failed (non-blocking).', (autoErr as Error)?.message);
      }
    }
    
    // Remove X-Clerk-Token from headers if it exists (internal use only)
    delete headers['X-Clerk-Token'];
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        error:
          response.status === 0 || response.status >= 500
            ? 'Server is not responding. Make sure the backend server is running on port 3001.'
            : `HTTP error! status: ${response.status}`,
        code: 'UNKNOWN',
        status: response.status,
      }));
      if (errorBody && !errorBody.message) {
        errorBody.message = errorBody.error || 'Request failed';
      }
      throw errorBody;
    }

    return response.json();
  } catch (error: unknown) {
    // Handle network errors (server not running, CORS, etc.)
    if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to API at ${API_URL}. Make sure the backend server is running on port 3001.`);
    }
    throw error;
  }
}

// Auth API
export const authAPI = {
  async signup(identifier: string, password: string, extra?: Record<string, unknown>) {
    const payload: Record<string, unknown> = {
      password,
      ...(extra || {}),
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(identifier)) {
      payload.email = identifier;
    } else {
      payload.phone = identifier;
    }
    payload.identifier = identifier;

    const data = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
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

export const onboardingAPI = {
  async submit(payload: { accountType: string; answers: Record<string, string>; metadata?: Record<string, unknown> }) {
    try {
      return await fetchAPI('/onboarding', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn('Onboarding submission failed, continuing with local fallback.', error);
      return { ok: false, error };
    }
  },
};

// Blog API
export const blogAPI = {
  async getArticles(category?: string) {
    const url = category ? `/blog?category=${encodeURIComponent(category)}` : '/blog';
    return fetchAPI(url);
  },

  async getArticle(slug: string) {
    return fetchAPI(`/blog/${slug}`);
  },

  async getComments(slug: string) {
    return fetchAPI(`/blog/${slug}/comments`);
  },

  async addComment(slug: string, content: string) {
    return fetchAPI(`/blog/${slug}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async deleteComment(slug: string, commentId: string) {
    return fetchAPI(`/blog/${slug}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminAPI = {
  async getAllArticles() {
    return fetchAPI('/admin/articles');
  },
  
  // Taxonomy Admin
  async listTaxonomies() {
    return fetchAPI('/admin/taxonomies');
  },
  async createTaxonomy(payload: { key: string; name: string; description?: string; sort_order?: number }) {
    return fetchAPI('/admin/taxonomies', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateTaxonomy(id: string, payload: { name?: string; description?: string; sort_order?: number }) {
    return fetchAPI(`/admin/taxonomies/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async deleteTaxonomy(id: string) {
    return fetchAPI(`/admin/taxonomies/${id}`, { method: 'DELETE' });
  },
  async listTerms(taxonomyKey?: string) {
    const url = taxonomyKey ? `/admin/taxonomy-terms?taxonomy=${encodeURIComponent(taxonomyKey)}` : '/admin/taxonomy-terms';
    return fetchAPI(url);
  },
  async createTerm(payload: { taxonomy_id: string; name: string; slug: string; description?: string; color?: string; sort_order?: number }) {
    return fetchAPI('/admin/taxonomy-terms', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateTerm(id: string, payload: { name?: string; slug?: string; description?: string; color?: string; sort_order?: number }) {
    return fetchAPI(`/admin/taxonomy-terms/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async deleteTerm(id: string) {
    return fetchAPI(`/admin/taxonomy-terms/${id}`, { method: 'DELETE' });
  },

  async getArticleById(id: string) {
    return fetchAPI(`/admin/articles/${id}`);
  },

  async createArticle(articleData: Record<string, unknown>) {
    return fetchAPI('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  },

  async updateArticle(id: string, articleData: Record<string, unknown>) {
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

  async getFeatureUsage(params?: { userId?: string; featureKey?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.featureKey) searchParams.set('featureKey', params.featureKey);
    const qs = searchParams.toString();
    return fetchAPI(`/admin/features/usage${qs ? `?${qs}` : ''}`);
  },

  async resetFeatureUsage(payload: { user_id: string; feature_key: string }) {
    return fetchAPI('/admin/features/usage/reset', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async setFeatureOverride(payload: { user_id: string; feature_key: string; access_level?: string; limit_value?: number | null }) {
    return fetchAPI('/admin/features/overrides', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteFeatureOverride(payload: { user_id: string; feature_key: string }) {
    return fetchAPI('/admin/features/overrides', {
      method: 'DELETE',
      body: JSON.stringify(payload),
    });
  },

  // Categories
  async getAllCategories(type?: string) {
    const url = type ? `/admin/categories?type=${encodeURIComponent(type)}` : '/admin/categories';
    return fetchAPI(url);
  },

  async getCategoryById(id: string) {
    return fetchAPI(`/admin/categories/${id}`);
  },

  async createCategory(categoryData: { 
    name: string; 
    slug: string; 
    type?: string;
    description?: string;
    icon?: string;
    color?: string;
    sort_order?: number;
  }) {
    return fetchAPI('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  async updateCategory(id: string, categoryData: { 
    name?: string; 
    slug?: string;
    type?: string;
    description?: string;
    icon?: string;
    color?: string;
    sort_order?: number;
  }) {
    return fetchAPI(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  async deleteCategory(id: string) {
    return fetchAPI(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Upload API
export const uploadAPI = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to API at ${API_URL}. Make sure the backend server is running on port 3001.`);
      }
      throw error;
    }
  },

  async deleteImage(publicIdOrUrl: string) {
    // Support both public_id and full Cloudinary URL
    const encodedId = encodeURIComponent(publicIdOrUrl);
    return fetchAPI(`/upload/image/${encodedId}`, {
      method: 'DELETE',
    });
  },

  async uploadVideo(file: File) {
    const formData = new FormData();
    formData.append('video', file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}/upload/video`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Cloudinary returns videoUrl, normalize to imageUrl format for consistency
      return {
        ...result,
        imageUrl: result.videoUrl || result.imageUrl, // Support both
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to API at ${API_URL}. Make sure the backend server is running on port 3001.`);
      }
      throw error;
    }
  },
};

export const videosAPI = {
  async listPublic() {
    return fetchAPI('/videos');
  },
  async listAdmin() {
    return fetchAPI('/admin/videos');
  },
  async create(video: {
    title: string;
    description?: string;
    video_url?: string;
    embed_code?: string;
    thumbnail_url?: string;
    position?: number;
    is_active?: boolean;
  }) {
    return fetchAPI('/admin/videos', {
      method: 'POST',
      body: JSON.stringify(video),
    });
  },
  async update(id: string, video: {
    title?: string;
    description?: string;
    video_url?: string;
    embed_code?: string;
    thumbnail_url?: string;
    position?: number;
    is_active?: boolean;
  }) {
    return fetchAPI(`/admin/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(video),
    });
  },
  async remove(id: string) {
    return fetchAPI(`/admin/videos/${id}`, {
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

// Matching API
export const matchingAPI = {
  async getMatches(criteria: Record<string, unknown>) {
    return fetchAPI('/matching/matches', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  },
};

// Compare API
export const compareAPI = {
  async getUniversities() {
    return fetchAPI('/compare');
  },
  async getDetailedComparison(universityIds: string[]) {
    return fetchAPI('/compare/detailed', {
      method: 'POST',
      body: JSON.stringify({ university_ids: universityIds }),
    });
  },
  async getComparisonWithPredictions(universityIds: string[]) {
    return fetchAPI('/compare/with-predictions', {
      method: 'POST',
      body: JSON.stringify({ university_ids: universityIds }),
    });
  },
  async analyzeUniversities(universityIds: string[]) {
    return fetchAPI('/compare/analyze', {
      method: 'POST',
      body: JSON.stringify({ university_ids: universityIds }),
    });
  },
  // Saved Comparisons
  async saveComparison(name: string, universityIds: string[], description?: string) {
    return fetchAPI('/compare/saved', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        university_ids: universityIds, 
        description 
      }),
    });
  },
  async getSavedComparisons(options?: {
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    favorites_only?: boolean;
  }) {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.sort_by) params.append('sort_by', options.sort_by);
    if (options?.sort_order) params.append('sort_order', options.sort_order);
    if (options?.favorites_only) params.append('favorites_only', 'true');
    
    const query = params.toString();
    return fetchAPI(`/compare/saved${query ? `?${query}` : ''}`);
  },
  async getSavedComparisonById(id: string) {
    return fetchAPI(`/compare/saved/${id}`);
  },
  async updateSavedComparison(id: string, updates: {
    name?: string;
    description?: string;
    university_ids?: string[];
  }) {
    return fetchAPI(`/compare/saved/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteSavedComparison(id: string) {
    return fetchAPI(`/compare/saved/${id}`, {
      method: 'DELETE',
    });
  },
  async toggleFavorite(id: string) {
    return fetchAPI(`/compare/saved/${id}/favorite`, {
      method: 'POST',
    });
  },
};

export const accessAPI = {
  async getUsage(featureKey: string) {
    return fetchAPI(`/access/usage/${encodeURIComponent(featureKey)}`);
  },
};

// Referrals API
export const referralsAPI = {
  async getMyCode() {
    return fetchAPI('/referrals/my-code');
  },
  async getMyReferrals() {
    return fetchAPI('/referrals/my-referrals');
  },
  async getMyRewards() {
    return fetchAPI('/referrals/my-rewards');
  },
  async validate(code: string) {
    return fetchAPI(`/referrals/validate/${encodeURIComponent(code)}`);
  },
};

// User Preferences API
export const userPreferencesAPI = {
  async getPreferences() {
    return fetchAPI('/user-preferences');
  },
  async savePreferences(prefs: {
    weight_tuition?: number;
    weight_location?: number;
    weight_ranking?: number;
    weight_program?: number;
    weight_language?: number;
  }) {
    return fetchAPI('/user-preferences', {
      method: 'POST',
      body: JSON.stringify(prefs),
    });
  },
};

// Saved Matches API
export const savedMatchesAPI = {
  async list() {
    return fetchAPI('/saved-matches');
  },
  async isSaved(universityId: string) {
    return fetchAPI(`/saved-matches/check/${universityId}`);
  },
  async save(universityId: string, note?: string) {
    return fetchAPI('/saved-matches', {
      method: 'POST',
      body: JSON.stringify({ university_id: universityId, note }),
    });
  },
  async unsave(universityId: string) {
    return fetchAPI(`/saved-matches/${universityId}`, {
      method: 'DELETE',
    });
  },
};

// Public Universities API (no auth required)
export const universitiesAPI = {
  async getUniversities() {
    return fetchAPI('/universities');
  },
  async getUniversityBySlug(slug: string) {
    return fetchAPI(`/universities/${slug}`);
  },
};

// Reviews API
export const reviewsAPI = {
  async list(universityId: string) {
    return fetchAPI(`/reviews/university/${universityId}`)
  },
  async upsert(universityId: string, rating: number, comment?: string) {
    return fetchAPI(`/reviews/university/${universityId}` , {
      method: 'POST',
      body: JSON.stringify({ rating, comment })
    })
  },
  async remove(universityId: string) {
    return fetchAPI(`/reviews/university/${universityId}`, { method: 'DELETE' })
  }
}

// Public University Groups API (no auth required)
export const universityGroupsAPI = {
  async getGroups() {
    return fetchAPI('/university-groups');
  },
  async getGroupBySlug(slug: string) {
    return fetchAPI(`/university-groups/${slug}`);
  },
};

// Admin University Groups CRUD API
export const adminUniversityGroupsAPI = {
  async getGroups() {
    return fetchAPI('/admin/university-groups');
  },
  async getGroupById(id: string) {
    return fetchAPI(`/admin/university-groups/${id}`);
  },
  async createGroup(data: Record<string, unknown>) {
    return fetchAPI('/admin/university-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateGroup(id: string, data: Record<string, unknown>) {
    return fetchAPI(`/admin/university-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteGroup(id: string) {
    return fetchAPI(`/admin/university-groups/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admin University CRUD API
export const adminUniversityAPI = {
  async getUniversities() {
    return fetchAPI('/admin/universities');
  },
  async getUniversityById(id: string) {
    return fetchAPI(`/admin/universities/${id}`);
  },
  async createUniversity(data: Record<string, unknown>) {
    return fetchAPI('/admin/universities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateUniversity(id: string, data: Record<string, unknown>) {
    return fetchAPI(`/admin/universities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteUniversity(id: string) {
    return fetchAPI(`/admin/universities/${id}`, {
      method: 'DELETE',
    });
  },
};

// User Profile API
export const profileAPI = {
  async getProfile() {
    return fetchAPI('/profile');
  },
  async updateProfile(data: Record<string, unknown>) {
    return fetchAPI('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async updatePassword(currentPassword: string, newPassword: string) {
    return fetchAPI('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Users Sync API (self-healing trigger)
export const usersAPI = {
  async sync(token?: string) {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined
    return fetchAPI('/users/sync', { 
      method: 'POST',
      headers 
    })
  },
  async dualSync(payload: Record<string, unknown>, token?: string) {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined
    return fetchAPI('/users/dual-sync', { 
      method: 'POST', 
      body: JSON.stringify(payload),
      headers
    })
  },
};

// Financial profile API
export const financialProfileAPI = {
  async getProfile() {
    return fetchAPI('/profile/financial');
  },
  async updateProfile(data: Record<string, unknown>) {
    return fetchAPI('/profile/financial', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async predictAid(universityId: string, universityData?: Record<string, unknown>) {
    return fetchAPI('/profile/financial/predict', {
      method: 'POST',
      body: JSON.stringify({
        university_id: universityId,
        university_data: universityData,
      }),
    });
  },
  async predictAidBatch(universityIds: string[]) {
    return fetchAPI('/profile/financial/predict-batch', {
      method: 'POST',
      body: JSON.stringify({
        university_ids: universityIds,
      }),
    });
  },
};

// Saved Items API
export const savedItemsAPI = {
  async getSavedItems(type?: string) {
    const url = type ? `/saved-items?type=${type}` : '/saved-items';
    return fetchAPI(url);
  },
  async getSavedItemsCount() {
    return fetchAPI('/saved-items/count');
  },
  async checkIfSaved(type: string, id: string) {
    return fetchAPI(`/saved-items/check/${type}/${id}`);
  },
  async saveItem(type: string, id: string, data?: Record<string, unknown>) {
    return fetchAPI('/saved', {
      method: 'POST',
      body: JSON.stringify({ item_type: type, item_id: id, item_data: data }),
    });
  },
  async unsaveItem(type: string, id: string) {
    return fetchAPI(`/saved-items/${type}/${id}`, {
      method: 'DELETE',
    });
  },
};

// University Claims API
export const universityClaimsAPI = {
    async createClaimRequest(data: Record<string, unknown>) {
    return fetchAPI('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async getMyClaimRequests() {
    return fetchAPI('/university-claims/my-requests');
  },
  async getMyClaims() {
    return fetchAPI('/university-claims/my-claims');
  },
  async getClaimRequest(id: string) {
    return fetchAPI(`/university-claims/request/${id}`);
  },
};

// Admin University Claims API
export const adminUniversityClaimsAPI = {
  async getClaimRequests(status?: string) {
    const url = status ? `/admin/university-claims?status=${status}` : '/admin/university-claims';
    return fetchAPI(url);
  },
  async getClaimRequest(id: string) {
    return fetchAPI(`/admin/university-claims/${id}`);
  },
  async updateClaimRequestStatus(id: string, status: string, adminNotes?: string) {
    return fetchAPI(`/admin/university-claims/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
  },
  async updateClaimStatus(id: string, status: string) {
    return fetchAPI(`/admin/university-claims/claim/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Admin Analytics API
export const adminAnalyticsAPI = {
  async overview() {
    return fetchAPI('/admin/analytics/overview');
  },
  async registrationsLast7() {
    return fetchAPI('/admin/analytics/registrations/last7');
  },
};

// Public Users API
export const usersPublicAPI = {
  async getPublicProfile(usernameOrId: string) {
    return fetchAPI(`/users/${usernameOrId}`);
  },
};

// Profile Sections API (authenticated)
export const profileSectionsAPI = {
  async list(kind: 'experiences'|'education'|'projects'|'certifications') {
    return fetchAPI(`/profile-sections/${kind}`);
  },
  async create(kind: 'experiences'|'education'|'projects'|'certifications', payload: Record<string, unknown>) {
    return fetchAPI(`/profile-sections/${kind}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async update(kind: 'experiences'|'education'|'projects'|'certifications', id: string, payload: Record<string, unknown>) {
    return fetchAPI(`/profile-sections/${kind}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async remove(kind: 'experiences'|'education'|'projects'|'certifications', id: string) {
    return fetchAPI(`/profile-sections/${kind}/${id}`, { method: 'DELETE' });
  },
};

// Static Pages API (public)
export const staticPagesAPI = {
  async getPage(slug: string) {
    return fetchAPI(`/pages/${slug}`);
  },
  async getNavbarPages() {
    return fetchAPI('/pages/navbar/list');
  },
};

// Admin Static Pages API
export const adminStaticPagesAPI = {
  async getAllPages() {
    return fetchAPI('/admin/pages');
  },
  async getPage(slug: string) {
    return fetchAPI(`/admin/pages/${slug}`);
  },
  async updatePage(slug: string, data: { 
    title: string; 
    content: string; 
    meta_title?: string; 
    meta_description?: string;
    status?: 'published' | 'draft';
    visibility_areas?: string[];
    sort_order?: number;
  }) {
    return fetchAPI(`/admin/pages/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deletePage(slug: string) {
    return fetchAPI(`/admin/pages/${slug}`, {
      method: 'DELETE',
    });
  },
};

// Notifications API
export const notificationsAPI = {
  async list() {
    return fetchAPI('/notifications');
  },
  async unreadCount() {
    return fetchAPI('/notifications/unread/count');
  },
  async markRead(id: string) {
    return fetchAPI(`/notifications/${id}/read`, { method: 'POST' });
  },
  async markAllRead() {
    return fetchAPI('/notifications/read-all', { method: 'POST' });
  },
};

// Micro-Content API
export const microContentAPI = {
  async getMicroContent(universityId: string) {
    return fetchAPI(`/universities/${universityId}/micro-content`);
  },

  async getMicroContentItem(id: string) {
    return fetchAPI(`/micro-content/${id}`);
  },

  async createMicroContent(data: Record<string, unknown>) {
    return fetchAPI('/micro-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMicroContent(id: string, data: Record<string, unknown>) {
    return fetchAPI(`/micro-content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMicroContent(id: string) {
    return fetchAPI(`/micro-content/${id}`, {
      method: 'DELETE',
    });
  },

  async getAllMicroContent() {
    return fetchAPI('/admin/micro-content');
  },
};

// Localized Content API
export const localizedContentAPI = {
  async getLocalizedContent(contentType: string, languageCode: string, entityId?: string) {
    const params = new URLSearchParams({
      content_type: contentType,
      language_code: languageCode,
    });
    
    if (entityId) {
      params.append('entity_id', entityId);
    }
    
    return fetchAPI(`/localized-content?${params.toString()}`);
  },

  async getLocalizedContentItem(id: string) {
    return fetchAPI(`/localized-content/${id}`);
  },

  async createLocalizedContent(data: Record<string, unknown>) {
    return fetchAPI('/localized-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLocalizedContent(id: string, data: Record<string, unknown>) {
    return fetchAPI(`/localized-content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteLocalizedContent(id: string) {
    return fetchAPI(`/localized-content/${id}`, {
      method: 'DELETE',
    });
  },

  async getAllLocalizedContent() {
    return fetchAPI('/admin/localized-content');
  },

  async getLanguageStats() {
    return fetchAPI('/admin/localized-content/stats');
  },

  async submitForReview(id: string) {
    return fetchAPI(`/localized-content/${id}/submit`, {
      method: 'POST',
    });
  },

  async approveContent(id: string) {
    return fetchAPI(`/admin/localized-content/${id}/approve`, {
      method: 'POST',
    });
  },

  async rejectContent(id: string, reason: string) {
    return fetchAPI(`/admin/localized-content/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Advanced Analytics API
export const advancedAnalyticsAPI = {
  async overview(filters?: Record<string, unknown>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return fetchAPI(`/admin/analytics/advanced/overview?${params.toString()}`);
  },

  async getUserAnalytics(filters?: Record<string, unknown>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return fetchAPI(`/admin/analytics/advanced/users?${params.toString()}`);
  },

  async getUniversityAnalytics(filters?: Record<string, unknown>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return fetchAPI(`/admin/analytics/advanced/universities?${params.toString()}`);
  },

  async getEngagementAnalytics(filters?: Record<string, unknown>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return fetchAPI(`/admin/analytics/advanced/engagement?${params.toString()}`);
  },

  async getConversionAnalytics(filters?: Record<string, unknown>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return fetchAPI(`/admin/analytics/advanced/conversions?${params.toString()}`);
  },

  async getContentAnalytics(filters?: Record<string, unknown>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return fetchAPI(`/admin/analytics/advanced/content?${params.toString()}`);
  },

  async getTimeSeriesData(metric: string, filters?: Record<string, unknown>) {
    const params = new URLSearchParams({ metric });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return fetchAPI(`/admin/analytics/advanced/timeseries?${params.toString()}`);
  },

  async exportData(type: string, format: string, filters?: Record<string, unknown>) {
    const params = new URLSearchParams({ type, format });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return fetchAPI(`/admin/analytics/advanced/export?${params.toString()}`);
  },

  async getRealTimeMetrics() {
    return fetchAPI('/admin/analytics/advanced/realtime');
  },
};

export const api = {
  get(endpoint: string) {
    return fetchAPI(endpoint);
  },
  post(endpoint: string, body: unknown) {
    return fetchAPI(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  put(endpoint: string, body: unknown) {
    return fetchAPI(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  delete(endpoint: string) {
    return fetchAPI(endpoint, { method: 'DELETE' });
  },
};