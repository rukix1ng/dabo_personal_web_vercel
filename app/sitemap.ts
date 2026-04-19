import { MetadataRoute } from 'next';
import { publicLocales } from '@/lib/i18n';
import { query } from '@/lib/db';
import { getAbsoluteUrl } from '@/lib/site-url';

// 启用ISR缓存：每24小时重新生成一次sitemap
// 这是业界标准做法，因为：
// 1. 搜索引擎通常每天只访问sitemap 1-2次
// 2. 大幅减少数据库查询（从每天288次降到1次）
// 3. Sitemap更新延迟对SEO影响很小
export const revalidate = 86400; // 24小时 = 86400秒

interface DbRecord {
  id: number;
  updated_at?: string;
  created_at?: string;
}

async function getDynamicIds() {
  try {
    // 只查询id和updated_at字段，减少数据传输量
    // 使用索引字段（id）排序，提高查询性能
    const papers = await query<DbRecord>('SELECT id, updated_at FROM papers ORDER BY id');

    const invitations = await query<DbRecord>('SELECT id, updated_at FROM invitation ORDER BY id');

    const newsColumns = await query<DbRecord>('SELECT id, updated_at FROM news_column ORDER BY id');

    return {
      papers: papers || [],
      invitations: invitations || [],
      newsColumns: newsColumns || [],
    };
  } catch (error) {
    console.error('Error fetching dynamic IDs for sitemap:', error);
    // 如果数据库查询失败，返回空数组，至少保证静态页面的sitemap可用
    return {
      papers: [],
      invitations: [],
      newsColumns: [],
    };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
    { path: '/papers', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/forum', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/achievements', changeFrequency: 'weekly' as const, priority: 0.9 },
  ];

  // Get dynamic content IDs
  const { invitations, newsColumns } = await getDynamicIds();

  const routes: MetadataRoute.Sitemap = [];

  // Generate routes for each locale
  for (const locale of publicLocales) {
    // Static pages
    for (const page of staticPages) {
      routes.push({
        url: getAbsoluteUrl(`/${locale}${page.path}`),
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            publicLocales.map((l) => [l, getAbsoluteUrl(`/${l}${page.path}`)])
          ),
        },
      });
    }

    // Forum detail pages (invitations)
    for (const invitation of invitations) {
      routes.push({
        url: getAbsoluteUrl(`/${locale}/forum/${invitation.id}`),
        lastModified: invitation.updated_at ? new Date(invitation.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            publicLocales.map((l) => [l, getAbsoluteUrl(`/${l}/forum/${invitation.id}`)])
          ),
        },
      });
    }

    // Achievement detail pages (news columns)
    for (const newsColumn of newsColumns) {
      routes.push({
        url: getAbsoluteUrl(`/${locale}/achievements/${newsColumn.id}`),
        lastModified: newsColumn.updated_at ? new Date(newsColumn.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            publicLocales.map((l) => [l, getAbsoluteUrl(`/${l}/achievements/${newsColumn.id}`)])
          ),
        },
      });
    }
  }

  return routes;
}
