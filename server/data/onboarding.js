import supabase from '../database/supabase.js';

export async function upsertUserOnboarding(userId, accountType, answers, metadata = {}) {
  const payload = {
    user_id: userId,
    account_type: accountType,
    answers,
    updated_at: new Date().toISOString(),
    ...('created_at' in metadata ? { created_at: metadata.created_at } : {}),
  };

  const { data, error } = await supabase
    .from('user_onboarding')
    .upsert(payload, { onConflict: 'user_id', ignoreDuplicates: false })
    .select('user_id, account_type, answers, created_at, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserOnboarding(userId) {
  const { data, error } = await supabase
    .from('user_onboarding')
    .select('user_id, account_type, answers, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

