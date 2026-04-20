"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type FeaturedNews = {
  id: string;
  title: string;
  date: string;
  image: string;
  href?: string;
  external?: boolean;
};

type NewsItem = {
  id: string;
  title: string;
  date: string;
  href?: string;
  external?: boolean;
};

type ProjectNewsProps = {
  locale: string;
  featured: readonly FeaturedNews[];
  list: readonly NewsItem[];
  totalListItems: number;
  pageSize: number;
};

type NewsListApiResponse = {
  items?: NewsItem[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export function ProjectNews({
  locale,
  featured,
  list,
  totalListItems,
  pageSize,
}: ProjectNewsProps) {
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(featured[0]?.id ?? null);
  const [listItems, setListItems] = useState<NewsItem[]>([...list]);
  const [currentPage, setCurrentPage] = useState(() => Math.max(1, Math.ceil(list.length / pageSize)));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(list.length < totalListItems);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const selectedNews =
    featured.find((item) => item.id === selectedNewsId) ?? featured[0] ?? null;
  const viewMoreLabel =
    locale === "zh" ? "查看更多 →" : locale === "ja" ? "もっと見る →" : "View More →";

  useEffect(() => {
    setListItems([...list]);
    setCurrentPage(Math.max(1, Math.ceil(list.length / pageSize)));
    setHasMore(list.length < totalListItems);
  }, [list, pageSize, totalListItems]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetch(
        `/api/news?locale=${encodeURIComponent(locale)}&page=${nextPage}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error("Failed to load more news");
      }

      const data = (await response.json()) as NewsListApiResponse;
      const nextItems = data.items || [];

      setListItems((prev) => [...prev, ...nextItems]);
      setCurrentPage(data.pagination?.page ?? nextPage);
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (error) {
      console.error("Failed to load more homepage news:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, locale, pageSize]);

  useEffect(() => {
    if (!hasMore) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "160px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (featured.length === 0 && listItems.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        暂无项目新闻
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {featured.length > 0 && selectedNews ? (
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-lg ring-1 ring-border">
            {selectedNews.image ? (
              <Image
                src={selectedNews.image}
                alt={selectedNews.title}
                fill
                className="object-cover transition-all duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-sm text-muted-foreground">暂无图片</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {featured.map((news) => (
              <div
                key={news.id}
                className={`flex flex-col gap-2 rounded-lg border p-4 transition-all ${
                  selectedNews.id === news.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/40 hover:bg-card/60"
                }`}
              >
                <button
                  onClick={() => setSelectedNewsId(news.id)}
                  className="flex w-full cursor-pointer flex-col gap-2 text-left"
                >
                  <h3 className="text-base font-bold text-foreground transition-colors hover:text-primary">
                    {news.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">{news.date}</span>
                </button>

                {news.href ? (
                  news.external ? (
                    <a
                      href={news.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit text-xs text-primary transition-colors hover:underline"
                    >
                      {viewMoreLabel}
                    </a>
                  ) : (
                    <Link
                      href={news.href}
                      className="w-fit text-xs text-primary transition-colors hover:underline"
                    >
                      {viewMoreLabel}
                    </Link>
                  )
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-4">
        {listItems.map((item) =>
          item.href ? (
            item.external ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex cursor-pointer items-center justify-between gap-4 border-b border-border/30 pb-3 transition-all last:border-b-0 last:pb-0 hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary transition-all group-hover:scale-125" />
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className="group flex cursor-pointer items-center justify-between gap-4 border-b border-border/30 pb-3 transition-all last:border-b-0 last:pb-0 hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary transition-all group-hover:scale-125" />
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>
              </Link>
            )
          ) : (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 border-b border-border/30 pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-sm font-medium text-foreground">{item.title}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>
            </div>
          )
        )}

        {hasMore ? (
          <div className="pt-3">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={isLoadingMore}
              className="w-full cursor-pointer rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingMore
                ? locale === "zh"
                  ? "加载中..."
                  : locale === "ja"
                    ? "読み込み中..."
                    : "Loading..."
                : locale === "zh"
                  ? "加载更多"
                  : locale === "ja"
                    ? "もっと見る"
                    : "Load More"}
            </button>
          </div>
        ) : null}

        {hasMore ? <div ref={loadMoreRef} className="h-1 w-full" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
