# Sitemap缓存策略说明

## 工作原理

### ISR（增量静态再生成）缓存

```typescript
export const revalidate = 300; // 5分钟
```

**这意味着：**

1. **首次访问**：第一次有人访问 `/sitemap.xml` 时，会查询数据库并生成sitemap
2. **缓存期内**：接下来5分钟内的所有访问都直接返回缓存的sitemap，**不会查询数据库**
3. **缓存过期后**：
   - 第一个请求仍然返回旧的缓存版本（保证快速响应）
   - 后台触发重新生成（查询数据库）
   - 新版本生成后，后续请求使用新版本

## 为什么选择5分钟？

### 与页面缓存保持一致

项目中所有动态页面都使用相同的缓存策略：

```typescript
// app/[locale]/papers/page.tsx
export const revalidate = 300;

// app/[locale]/forum/page.tsx
export const revalidate = 300;

// app/[locale]/achievements/page.tsx
export const revalidate = 300;

// app/sitemap.ts
export const revalidate = 300; // 保持一致！
```

**一致性的重要性：**
- ✅ 数据库更新后，5分钟内页面和sitemap都会同步更新
- ✅ 搜索引擎能及时发现新内容
- ✅ 避免sitemap和实际页面不一致的情况
- ✅ 用户体验更好（新内容快速可见）

### 实际场景

**场景：你发布了一篇新论文**

```
00:00 - 在数据库中添加新论文
00:05 - papers页面显示新论文 ✅
00:05 - sitemap包含新论文URL ✅
00:10 - Google爬虫访问sitemap，发现新URL ✅
00:15 - Google开始索引新论文页面 ✅
```

**如果sitemap是24小时缓存：**
```
00:00 - 在数据库中添加新论文
00:05 - papers页面显示新论文 ✅
24:00 - sitemap才包含新论文URL ❌
24:05 - Google才能发现新URL ❌
```

## 性能优势

### 数据库查询频率
- **无缓存**：每次访问都查询 = 可能每分钟数十次
- **有缓存（5分钟）**：最多每5分钟查询1次 = 每天最多288次

### 查询优化

```sql
-- 只查询必要字段，减少数据传输
SELECT id, updated_at FROM papers ORDER BY id;
SELECT id, updated_at FROM invitation ORDER BY id;
SELECT id, updated_at FROM news_column ORDER BY id;
```

**优化点：**
- 只查询2个字段（id, updated_at）
- 使用主键排序（利用数据库索引）
- 不查询大字段（title, content等）
- 查询时间通常 < 50ms

### 实际负载分析

假设sitemap每分钟被访问10次：

```
无缓存：
- 10次/分钟 × 60分钟 × 24小时 = 14,400次查询/天
- 每次查询 ~50ms
- 总查询时间：720秒/天

有缓存（5分钟）：
- 最多288次查询/天
- 每次查询 ~50ms
- 总查询时间：14.4秒/天

性能提升：50倍 🚀
```

而且由于查询已优化（只查id和updated_at），每次查询非常快，对数据库压力很小。

## 实际场景分析

### 场景1：正常访问（低流量）
```
时间轴：
00:00 - 用户A访问 → 查询数据库 → 生成sitemap → 缓存
00:02 - Google爬虫访问 → 直接返回缓存 ✓
00:04 - 用户B访问 → 直接返回缓存 ✓
00:05 - 缓存过期
00:06 - 用户C访问 → 返回旧缓存 + 后台重新生成
00:07 - 新版本生成完成

数据库查询次数：每5分钟1次
```

### 场景2：高流量
```
假设每分钟10次访问：
00:00 - 首次访问 → 查询数据库
00:01-00:04 - 40次访问 → 全部返回缓存 ✓
00:05 - 缓存过期
00:05 - 第41次访问 → 返回旧缓存 + 后台重新生成
00:06-00:09 - 40次访问 → 返回新缓存 ✓

数据库查询次数：每5分钟1次（无论访问多少次）
```

### 场景3：数据库更新
```
00:00 - 数据库添加新论文
00:01 - 用户访问papers页面 → 显示旧内容（缓存）
00:05 - papers页面缓存过期 → 显示新论文 ✓
00:05 - sitemap缓存过期 → 包含新论文URL ✓
00:10 - Google爬虫访问 → 发现新URL ✓

最大延迟：5分钟（可接受）
```

## 缓存时间对比

### 不同缓存时间的权衡

| 缓存时间 | 数据库查询/天 | 内容新鲜度 | 适用场景 |
|---------|-------------|----------|---------|
| 无缓存 | 14,400+ | 实时 | 不推荐（性能差） |
| 1分钟 | 1,440 | 很新鲜 | 实时新闻网站 |
| **5分钟** | **288** | **新鲜** | **学术网站（推荐）** |
| 1小时 | 24 | 较新鲜 | 企业官网 |
| 24小时 | 1 | 不够新鲜 | 静态网站 |

### 为什么5分钟是最佳选择？

✅ **优点：**
- 与页面缓存一致，避免不同步
- 新内容5分钟内可被搜索引擎发现
- 数据库压力很小（每天288次查询）
- 查询已优化，每次 < 50ms
- 用户体验好

❌ **如果用24小时：**
- 新内容要等24小时才能被索引
- 与页面缓存不一致（页面5分钟，sitemap 24小时）
- 可能导致404错误（页面存在但sitemap没有）

## 手动刷新缓存

如果需要立即更新sitemap（比如发布了重要内容），有两种方式：

### 方式1：使用On-Demand Revalidation API

创建一个API路由：

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // 验证权限（使用token或其他方式）
  const token = request.headers.get('authorization');
  if (token !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 重新验证sitemap
  revalidatePath('/sitemap.xml');

  return Response.json({ revalidated: true, now: Date.now() });
}
```

使用方式：
```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer your-secret-token"
```

### 方式2：在管理后台添加按钮

在添加/编辑内容后自动触发：

```typescript
// 在admin页面的提交函数中
async function handleSubmit() {
  // 保存数据到数据库
  await saveToDatabase(data);

  // 立即刷新sitemap缓存
  await fetch('/api/revalidate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.REVALIDATE_TOKEN}`,
    },
  });

  alert('内容已发布，sitemap已更新！');
}
```

### 方式3：重新部署
```bash
npm run build
# 重新部署后sitemap会重新生成
```

## 监控建议

### 添加日志监控

```typescript
async function getDynamicIds() {
  const startTime = Date.now();
  try {
    console.log('[Sitemap] Starting database query...');

    const papers = await query<DbRecord>('SELECT id, updated_at FROM papers ORDER BY id');
    const invitations = await query<DbRecord>('SELECT id, updated_at FROM invitation ORDER BY id');
    const newsColumns = await query<DbRecord>('SELECT id, updated_at FROM news_column ORDER BY id');

    const duration = Date.now() - startTime;
    console.log(`[Sitemap] Query completed in ${duration}ms`);
    console.log(`[Sitemap] Found ${papers.length} papers, ${invitations.length} invitations, ${newsColumns.length} news columns`);

    return { papers, invitations, newsColumns };
  } catch (error) {
    console.error('[Sitemap] Database query failed:', error);
    return { papers: [], invitations: [], newsColumns: [] };
  }
}
```

## 总结

✅ **5分钟缓存的优势：**
- 与页面缓存保持一致（避免不同步）
- 新内容快速被搜索引擎发现（5分钟内）
- 数据库压力很小（每天288次查询，每次 < 50ms）
- 响应速度快（缓存期内直接返回）
- 用户体验好（内容新鲜）

✅ **适合的场景：**
- ✅ 学术网站（你的项目）
- ✅ 博客网站
- ✅ 新闻网站
- ✅ 任何需要及时更新的内容网站

❌ **不适合的场景：**
- 完全静态的网站（可以用更长的缓存时间）
- 内容几乎不更新的网站（可以用24小时）

对于你的学术网站来说，**5分钟缓存是最佳选择**，因为它完美平衡了性能和内容新鲜度。
