import prisma from '../database/prisma.js';

function mapCommentRow(row) {
  if (!row) return row;
  const author = row.user || null;
  return {
    id: row.id,
    article_id: row.articleId,
    user_id: row.userId,
    content: row.content,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    is_deleted: row.deletedAt ? true : false,
    author: author
      ? {
          id: author.id,
          email: author.email,
          username: author.username,
          full_name: `${author.firstName || ''} ${author.lastName || ''}`.trim(),
          avatar_url: author.avatarUrl,
          given_name: author.firstName,
          family_name: author.lastName,
        }
      : null,
  };
}

export async function listArticleComments(articleId) {
  try {
    const comments = await prisma.articleComment.findMany({
      where: {
        articleId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map(mapCommentRow);
  } catch (error) {
    throw error;
  }
}

export async function createArticleComment({ articleId, userId, content }) {
  try {
    const comment = await prisma.articleComment.create({
      data: {
        articleId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return mapCommentRow(comment);
  } catch (error) {
    throw error;
  }
}

export async function findArticleCommentById(commentId) {
  try {
    const comment = await prisma.articleComment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return comment ? mapCommentRow(comment) : null;
  } catch (error) {
    throw error;
  }
}

export async function softDeleteArticleComment({ commentId }) {
  try {
    const comment = await prisma.articleComment.update({
      where: { id: commentId },
      data: {
        deletedAt: new Date(),
      },
    });

    return mapCommentRow(comment);
  } catch (error) {
    throw error;
  }
}
