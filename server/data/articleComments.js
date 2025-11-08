import supabase from '../database/supabase.js';

const userSelectColumns =
  'id, email, username, full_name, avatar_url, given_name, family_name';

function mapCommentRow(row) {
  if (!row) return row;
  const author = row.author || row.users || null;
  return {
    id: row.id,
    article_id: row.article_id,
    user_id: row.user_id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_deleted: row.is_deleted ?? false,
    author: author
      ? {
          id: author.id,
          email: author.email,
          username: author.username,
          full_name: author.full_name,
          avatar_url: author.avatar_url,
          given_name: author.given_name,
          family_name: author.family_name,
        }
      : null,
  };
}

export async function listArticleComments(articleId) {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .select(
        `
          id,
          article_id,
          user_id,
          content,
          created_at,
          updated_at,
          is_deleted,
          author:users!article_comments_user_id_fkey (
            ${userSelectColumns}
          )
        `
      )
      .eq('article_id', articleId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(mapCommentRow);
  } catch (error) {
    throw error;
  }
}

export async function createArticleComment({ articleId, userId, content }) {
  try {
    const insertPayload = {
      article_id: articleId,
      user_id: userId,
      content,
    };

    const { data, error } = await supabase
      .from('article_comments')
      .insert(insertPayload)
      .select(
        `
          id,
          article_id,
          user_id,
          content,
          created_at,
          updated_at,
          is_deleted,
          author:users!article_comments_user_id_fkey (
            ${userSelectColumns}
          )
        `
      )
      .single();

    if (error) {
      throw error;
    }

    return mapCommentRow(data);
  } catch (error) {
    throw error;
  }
}

export async function findArticleCommentById(commentId) {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .select(
        `
          id,
          article_id,
          user_id,
          content,
          created_at,
          updated_at,
          is_deleted,
          author:users!article_comments_user_id_fkey (
            ${userSelectColumns}
          )
        `
      )
      .eq('id', commentId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapCommentRow(data) : null;
  } catch (error) {
    throw error;
  }
}

export async function softDeleteArticleComment({ commentId }) {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .select(
        `
          id,
          article_id,
          user_id,
          content,
          created_at,
          updated_at,
          is_deleted
        `
      )
      .single();

    if (error) {
      throw error;
    }

    return mapCommentRow(data);
  } catch (error) {
    throw error;
  }
}


