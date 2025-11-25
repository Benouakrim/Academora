import prisma from '../database/prisma.js';

// Track a view for an article
export async function trackArticleView(articleId, userId = null, metadata = {}) {
  try {
    // Check if this session already has a view for this article
    if (metadata.sessionId) {
      const existingView = await prisma.articleView.findFirst({
        where: {
          articleId,
          sessionId: metadata.sessionId,
        },
        orderBy: { viewedAt: 'desc' },
      });

      // If view exists and we have a duration update, update the existing view
      if (existingView && metadata.duration !== null && metadata.duration !== undefined) {
        // Note: duration_seconds may need to be added to schema
        // For now, just return existing view
        return existingView;
      }

      // If view exists but no duration update, return the existing view (don't create duplicate)
      if (existingView) {
        return existingView;
      }
    }

    // Create new view only if it doesn't exist
    const view = await prisma.articleView.create({
      data: {
        articleId,
        userId: userId || null,
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null,
        referrer: metadata.referrer || null,
        sessionId: metadata.sessionId || null,
        // Note: duration_seconds may need to be added to schema
      },
    });

    return view;
  } catch (error) {
    console.error('Error tracking article view:', error);
    throw error;
  }
}

// Get view statistics for a specific article
export async function getArticleViewStats(articleId, timeRange = '30d') {
  try {
    let dateFilter = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      case '1y':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 30);
    }

    const views = await prisma.articleView.findMany({
      where: {
        articleId,
        viewedAt: { gte: dateFilter },
      },
      orderBy: { viewedAt: 'desc' },
    });

    const totalViews = views.length;
    const uniqueViews = new Set(views.map(v => v.userId || v.ipAddress)).size;
    const uniqueUsers = new Set(views.filter(v => v.userId).map(v => v.userId)).size;
    // Note: avgDuration calculation needs duration_seconds field in schema

    // Calculate views per day for chart data
    const viewsByDay = {};
    views.forEach(view => {
      const day = view.viewedAt.toISOString().split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    return {
      totalViews,
      uniqueViews,
      uniqueUsers,
      avgDuration: 0, // Placeholder until duration_seconds is added
      viewsByDay: Object.entries(viewsByDay).map(([date, count]) => ({ date, views: count })),
      recentViews: views.slice(0, 10), // Last 10 views
    };
  } catch (error) {
    console.error('Error fetching article view stats:', error);
    throw error;
  }
}

// Get hot articles based on view velocity (views per time)
export async function getHotArticlesByVelocity(currentArticleSlug = null, limit = 6, timeRange = '7d') {
  try {
    let dateFilter = new Date();
    
    switch (timeRange) {
      case '1d':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case '3d':
        dateFilter.setDate(dateFilter.getDate() - 3);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    // Get articles with view counts in the specified time range
    // Note: article_analytics table may need to be replaced with direct view counting
    // For now, we'll use articles and count views manually
    const articles = await prisma.article.findMany({
      where: {
        published: true,
        createdAt: { gte: dateFilter },
        ...(currentArticleSlug ? { slug: { not: currentArticleSlug } } : {}),
      },
      include: {
        views: {
          where: {
            viewedAt: { gte: dateFilter },
          },
        },
      },
      take: limit * 2, // Get more to filter
    });

    // Calculate view velocity (views per day since creation)
    const articlesWithVelocity = articles.map(article => {
      const daysSinceCreation = Math.max(1, Math.ceil((new Date() - article.createdAt) / (1000 * 60 * 60 * 24)));
      const viewCount = article.views?.length || 0;
      const viewVelocity = viewCount / daysSinceCreation;
      
      return {
        ...article,
        viewVelocity: Math.round(viewVelocity * 100) / 100,
        daysSinceCreation,
        total_views: viewCount,
      };
    });

    // Sort by view velocity
    return articlesWithVelocity
      .sort((a, b) => b.viewVelocity - a.viewVelocity)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching hot articles by velocity:', error);
    return [];
  }
}

// Get overall analytics for dashboard
export async function getOverallAnalytics(timeRange = '30d') {
  try {
    let dateFilter = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 30);
    }

    // Get top performing articles
    const topArticles = await prisma.article.findMany({
      where: {
        published: true,
        createdAt: { gte: dateFilter },
      },
      include: {
        views: {
          where: {
            viewedAt: { gte: dateFilter },
          },
        },
      },
      orderBy: { viewCount: 'desc' },
      take: 10,
    });

    // Calculate stats for top articles
    const articlesWithStats = topArticles.map(article => ({
      ...article,
      total_views: article.views?.length || 0,
      unique_views: new Set(article.views?.map(v => v.userId || v.ipAddress)).size,
    }));

    // Get category performance
    const allArticles = await prisma.article.findMany({
      where: {
        published: true,
        createdAt: { gte: dateFilter },
      },
      include: {
        views: {
          where: {
            viewedAt: { gte: dateFilter },
          },
        },
      },
    });

    // Aggregate by category
    const categoryStats = {};
    allArticles.forEach(article => {
      if (!categoryStats[article.category]) {
        categoryStats[article.category] = {
          category: article.category,
          totalViews: 0,
          uniqueViews: 0,
          articleCount: 0,
        };
      }
      const views = article.views?.length || 0;
      const uniqueViews = new Set(article.views?.map(v => v.userId || v.ipAddress)).size;
      categoryStats[article.category].totalViews += views;
      categoryStats[article.category].uniqueViews += uniqueViews;
      categoryStats[article.category].articleCount += 1;
    });

    // Get total stats
    const totalStats = {
      totalArticles: articlesWithStats.length,
      totalViews: articlesWithStats.reduce((sum, article) => sum + (article.total_views || 0), 0),
      totalUniqueViews: articlesWithStats.reduce((sum, article) => sum + (article.unique_views || 0), 0),
      avgViewsPerArticle: articlesWithStats.length > 0 ? Math.round(articlesWithStats.reduce((sum, article) => sum + (article.total_views || 0), 0) / articlesWithStats.length) : 0,
    };

    // Get daily views trend
    const dailyViews = await prisma.articleView.findMany({
      where: {
        viewedAt: { gte: dateFilter },
      },
      select: {
        viewedAt: true,
      },
      orderBy: { viewedAt: 'asc' },
    });

    const viewsByDay = {};
    dailyViews.forEach(view => {
      const day = view.viewedAt.toISOString().split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    return {
      topArticles: articlesWithStats || [],
      categoryStats: Object.values(categoryStats).sort((a, b) => b.totalViews - a.totalViews),
      totalStats,
      dailyViews: Object.entries(viewsByDay).map(([date, views]) => ({ date, views })),
    };
  } catch (error) {
    console.error('Error fetching overall analytics:', error);
    throw error;
  }
}

// Get article performance comparison
export async function getArticlePerformanceComparison(articleIds, timeRange = '30d') {
  try {
    let dateFilter = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 30);
    }

    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
        published: true,
      },
      include: {
        views: {
          where: {
            viewedAt: { gte: dateFilter },
          },
        },
      },
    });

    return articles.map(article => ({
      ...article,
      total_views: article.views?.length || 0,
      unique_views: new Set(article.views?.map(v => v.userId || v.ipAddress)).size,
    }));
  } catch (error) {
    console.error('Error fetching article performance comparison:', error);
    throw error;
  }
}

// Update hot scores for all articles (should be run periodically)
export async function updateHotScores() {
  try {
    // Note: hot_score may need to be added to schema
    // For now, this is a placeholder - hot scoring can be calculated on-the-fly
    const articles = await prisma.article.findMany({
      where: { published: true },
      include: {
        views: {
          where: {
            viewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
      },
    });

    // Calculate hot scores manually (placeholder - would need schema update to store)
    return articles.map(article => ({
      ...article,
      hot_score: article.views?.length || 0,
    }));
  } catch (error) {
    console.error('Error updating hot scores:', error);
    throw error;
  }
}

// Reset views for a specific article
export async function resetArticleViews(articleId) {
  try {
    // Delete all views for this article
    await prisma.articleView.deleteMany({
      where: { articleId },
    });

    // Reset view count (hot_score may need schema update)
    const article = await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: 0 },
    });

    return { success: true, message: 'Article views reset successfully', data: article };
  } catch (error) {
    console.error('Error resetting article views:', error);
    throw error;
  }
}

// Reset all article views
export async function resetAllArticleViews() {
  try {
    // Delete all article views
    await prisma.articleView.deleteMany({});

    // Reset all view counts
    await prisma.article.updateMany({
      data: { viewCount: 0 },
    });

    return { success: true, message: 'All article views reset successfully', data: [] };
  } catch (error) {
    console.error('Error resetting all article views:', error);
    throw error;
  }
}
