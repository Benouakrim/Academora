import { blogAPI, adminAPI } from '../api'

export const BlogService = {
  list: (category?: string) => blogAPI.getArticles(category),
  getBySlug: (slug: string) => blogAPI.getArticle(slug),
  getArticle: (slug: string) => blogAPI.getArticle(slug),
  create: (articleData: any) => adminAPI.createArticle(articleData),
  update: (id: string, articleData: any) => adminAPI.updateArticle(id, articleData),
  remove: (id: string) => adminAPI.deleteArticle(id),
  listComments: (slug: string) => blogAPI.getComments(slug),
  addComment: (slug: string, content: string) => blogAPI.addComment(slug, content),
  deleteComment: (slug: string, commentId: string) => blogAPI.deleteComment(slug, commentId),
}


