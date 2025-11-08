import supabase from '../database/supabase.js';

const baseSelect = `
  id,
  title,
  description,
  video_url,
  embed_code,
  thumbnail_url,
  position,
  is_active,
  created_at,
  updated_at
`;

export async function listPublicSiteVideos() {
  const { data, error } = await supabase
    .from('site_videos')
    .select(baseSelect)
    .eq('is_active', true)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function listAllSiteVideos() {
  const { data, error } = await supabase
    .from('site_videos')
    .select(baseSelect)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createSiteVideo(payload) {
  const insertPayload = {
    title: payload.title,
    description: payload.description ?? null,
    video_url: payload.video_url ?? null,
    embed_code: payload.embed_code ?? null,
    thumbnail_url: payload.thumbnail_url ?? null,
    position: payload.position ?? 0,
    is_active: payload.is_active ?? true,
  };

  const { data, error } = await supabase
    .from('site_videos')
    .insert(insertPayload)
    .select(baseSelect)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateSiteVideo(id, payload) {
  const updatePayload = {};

  if (payload.title !== undefined) updatePayload.title = payload.title;
  if (payload.description !== undefined) updatePayload.description = payload.description;
  if (payload.video_url !== undefined) updatePayload.video_url = payload.video_url;
  if (payload.embed_code !== undefined) updatePayload.embed_code = payload.embed_code;
  if (payload.thumbnail_url !== undefined) updatePayload.thumbnail_url = payload.thumbnail_url;
  if (payload.position !== undefined) updatePayload.position = payload.position;
  if (payload.is_active !== undefined) updatePayload.is_active = payload.is_active;

  const { data, error } = await supabase
    .from('site_videos')
    .update(updatePayload)
    .eq('id', id)
    .select(baseSelect)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

export async function deleteSiteVideo(id) {
  const { error } = await supabase
    .from('site_videos')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
}


