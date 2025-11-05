import supabase from '../database/supabase.js';

// Get all resources
export async function getResources() {
  try {
    const { data, error } = await supabase
      .from('orientation_resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

// Get resources by category
export async function getResourcesByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('orientation_resources')
      .select('*')
      .eq('category', category)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

// Get resource by slug and category
export async function getResourceBySlug(category, slug) {
  try {
    const { data, error } = await supabase
      .from('orientation_resources')
      .select('*')
      .eq('category', category)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    throw error;
  }
}
