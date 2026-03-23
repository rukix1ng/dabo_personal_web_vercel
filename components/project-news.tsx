"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type FeaturedNews = {
  id: string;
  title: string;
  date: string;
  image: string;
  href: string;
  external?: boolean;
};

type NewsItem = {
  id: string;
  title: string;
  date: string;
  href: string;
  external?: boolean;
};

type ProjectNewsProps = {
  locale: string;
  featured: readonly FeaturedNews[];
  list: readonly NewsItem[];
};

export function ProjectNews({ locale, featured, list }: ProjectNewsProps) {
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(featured[0]?.id ?? null);
  const selectedNews =
    featured.find((item) => item.id === selectedNewsId) ?? featured[0] ?? null;

  if (featured.length === 0 || !selectedNews) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        暂无项目新闻
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Featured News Section */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image Display */}
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

        {/* Featured News List */}
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
                className="flex flex-col gap-2 text-left w-full cursor-pointer"
              >
                <h3 className="text-base font-bold text-foreground transition-colors hover:text-primary">
                  {news.title}
                </h3>
                <span className="text-xs text-muted-foreground">{news.date}</span>
              </button>
              {news.external ? (
                <a
                  href={news.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline transition-colors w-fit"
                >
                  {locale === "zh" ? "查看更多 →" : locale === "ja" ? "もっと見る →" : "View More →"}
                </a>
              ) : (
                <Link
                  href={news.href}
                  className="text-xs text-primary hover:underline transition-colors w-fit"
                >
                  {locale === "zh" ? "查看更多 →" : locale === "ja" ? "もっと見る →" : "View More →"}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* News List Section */}
      <div className="flex flex-col gap-3 pt-4">
        {list.map((item) => (
          item.external ? (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex cursor-pointer items-center justify-between gap-4 border-b border-border/30 pb-3 last:border-b-0 last:pb-0 transition-all hover:border-primary/40"
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
            className="group flex cursor-pointer items-center justify-between gap-4 border-b border-border/30 pb-3 last:border-b-0 last:pb-0 transition-all hover:border-primary/40"
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
        ))}
      </div>
    </div>
  );
}
