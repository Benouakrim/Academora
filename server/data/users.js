import supabase from '../database/supabase.js';
import bcrypt from 'bcrypt';

export async function createUser(email, password, role = 'user') {
  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          role: role || 'user', // Default to 'user' role
        },
      ])
      .select('id, email, role, created_at')
      .single();

    if (error) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505') {
        throw new Error('User already exists');
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function listUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      // If no rows found, return null
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

export async function findUserById(id) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .eq('id', id)
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

export async function verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password);
}

export async function updatePasswordByEmail(email, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email)
      .select('id, email, role, created_at')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}
