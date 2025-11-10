import supabase from '../database/supabase.js';

// Track a view for an article
export async function trackArticleView(articleId, userId = null, metadata = {}) {
  try {
    // Check if this session already has a view for this article
    if (metadata.sessionId) {
      const { data: existingView, error: checkError } = await supabase
        .from('article_views')
        .select('id, duration_seconds')
        .eq('article_id', articleId)
        .eq('session_id', metadata.sessionId)
        .order('viewed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If view exists and we have a duration update, update the existing view
      if (existingView && metadata.duration !== null && metadata.duration !== undefined) {
        const { data: updatedData, error: updateError } = await supabase
          .from('article_views')
          .update({ duration_seconds: metadata.duration })
          .eq('id', existingView.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedData;
      }

      // If view exists but no duration update, return the existing view (don't create duplicate)
      if (existingView) {
        return existingView;
      }
    }

    // Create new view only if it doesn't exist
    const viewData = {
      article_id: articleId,
      user_id: userId,
      ip_address: metadata.ipAddress || null,
      user_agent: metadata.userAgent || null,
      referrer: metadata.referrer || null,
      session_id: metadata.sessionId || null,
      duration_seconds: metadata.duration || null,
    };

    const { data, error } = await supabase
      .from('article_views')
      .insert([viewData])
      .select()
      .single();

    if (error) throw error;
    return data;
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

    const { data, error } = await supabase
      .from('article_views')
      .select('*')
      .eq('article_id', articleId)
      .gte('viewed_at', dateFilter.toISOString())
      .order('viewed_at', { ascending: false });

    if (error) throw error;

    const totalViews = data.length;
    const uniqueViews = new Set(data.map(v => v.user_id || v.ip_address)).size;
    const uniqueUsers = new Set(data.filter(v => v.user_id).map(v => v.user_id)).size;
    const avgDuration = data.filter(v => v.duration_seconds).reduce((sum, v) => sum + v.duration_seconds, 0) / data.filter(v => v.duration_seconds).length || 0;

    // Calculate views per day for chart data
    const viewsByDay = {};
    data.forEach(view => {
      const day = view.viewed_at.split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    return {
      totalViews,
      uniqueViews,
      uniqueUsers,
      avgDuration: Math.round(avgDuration),
      viewsByDay: Object.entries(viewsByDay).map(([date, views]) => ({ date, views })),
      recentViews: data.slice(0, 10), // Last 10 views
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

    // Query to get articles with view counts in the specified time range
    const { data, error } = await supabase
      .from('article_analytics')
      .select('*')
      .eq('published', true)
      .gte('created_at', dateFilter.toISOString())
      .order('hot_score', { ascending: false })
      .limit(limit * 2); // Get more to filter

    if (error) throw error;

    // Filter out current article if specified
    let filteredArticles = data || [];
    if (currentArticleSlug) {
      filteredArticles = filteredArticles.filter(article => article.slug !== currentArticleSlug);
    }

    // Calculate view velocity (views per day since creation)
    const articlesWithVelocity = filteredArticles.map(article => {
      const daysSinceCreation = Math.max(1, Math.ceil((new Date() - new Date(article.created_at)) / (1000 * 60 * 60 * 24)));
      const viewVelocity = article.total_views / daysSinceCreation;
      
      return {
        ...article,
        viewVelocity: Math.round(viewVelocity * 100) / 100,
        daysSinceCreation,
      };
    });

    // Sort by hot score (which already includes recency weighting)
    return articlesWithVelocity
      .sort((a, b) => b.hot_score - a.hot_score)
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
    const { data: topArticles, error: topError } = await supabase
      .from('article_analytics')
      .select('*')
      .eq('published', true)
      .gte('created_at', dateFilter.toISOString())
      .order('total_views', { ascending: false })
      .limit(10);

    if (topError) throw topError;

    // Get category performance
    const { data: categoryData, error: categoryError } = await supabase
      .from('article_analytics')
      .select('category, total_views, unique_views')
      .eq('published', true)
      .gte('created_at', dateFilter.toISOString());

    if (categoryError) throw categoryError;

    // Aggregate by category
    const categoryStats = {};
    categoryData.forEach(article => {
      if (!categoryStats[article.category]) {
        categoryStats[article.category] = {
          category: article.category,
          totalViews: 0,
          uniqueViews: 0,
          articleCount: 0,
        };
      }
      categoryStats[article.category].totalViews += article.total_views;
      categoryStats[article.category].uniqueViews += article.unique_views;
      categoryStats[article.category].articleCount += 1;
    });

    // Get total stats
    const totalStats = {
      totalArticles: topArticles.length,
      totalViews: topArticles.reduce((sum, article) => sum + article.total_views, 0),
      totalUniqueViews: topArticles.reduce((sum, article) => sum + article.unique_views, 0),
      avgViewsPerArticle: topArticles.length > 0 ? Math.round(topArticles.reduce((sum, article) => sum + article.total_views, 0) / topArticles.length) : 0,
    };

    // Get daily views trend
    const { data: dailyViews, error: dailyError } = await supabase
      .from('article_views')
      .select('viewed_at')
      .gte('viewed_at', dateFilter.toISOString())
      .order('viewed_at', { ascending: true });

    if (dailyError) throw dailyError;

    const viewsByDay = {};
    dailyViews.forEach(view => {
      const day = view.viewed_at.split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    return {
      topArticles: topArticles || [],
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

    const { data, error } = await supabase
      .from('article_analytics')
      .select('*')
      .in('id', articleIds)
      .eq('published', true);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching article performance comparison:', error);
    throw error;
  }
}

// Update hot scores for all articles (should be run periodically)
export async function updateHotScores() {
  try {
    // Update hot scores based on recent view activity
    const { data, error } = await supabase
      .from('articles')
      .update({
        hot_score: supabase.raw(`
          COALESCE(
            (
              SELECT SUM(
                CASE 
                  WHEN viewed_at >= NOW() - INTERVAL '1 day' THEN 3.0
                  WHEN viewed_at >= NOW() - INTERVAL '3 days' THEN 2.0
                  WHEN viewed_at >= NOW() - INTERVAL '7 days' THEN 1.0
                  ELSE 0.5
                END
              )
              FROM article_views 
              WHERE article_id = articles.id 
              AND viewed_at >= NOW() - INTERVAL '7 days'
            ), 0
          )
        `)
      })
      .eq('published', true)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating hot scores:', error);
    throw error;
  }
}

// Reset views for a specific article
export async function resetArticleViews(articleId) {
  try {
    // Delete all views for this article
    const { error: deleteError } = await supabase
      .from('article_views')
      .delete()
      .eq('article_id', articleId);

    if (deleteError) throw deleteError;

    // Reset view count and hot score
    const { data, error: updateError } = await supabase
      .from('articles')
      .update({ view_count: 0, hot_score: 0 })
      .eq('id', articleId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { success: true, message: 'Article views reset successfully', data };
  } catch (error) {
    console.error('Error resetting article views:', error);
    throw error;
  }
}

// Reset all article views
export async function resetAllArticleViews() {
  try {
    // Delete all article views
    const { error: deleteError } = await supabase
      .from('article_views')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) throw deleteError;

    // Reset all view counts and hot scores
    const { data, error: updateError } = await supabase
      .from('articles')
      .update({ view_count: 0, hot_score: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    if (updateError) throw updateError;

    return { success: true, message: 'All article views reset successfully', data };
  } catch (error) {
    console.error('Error resetting all article views:', error);
    throw error;
  }
}
