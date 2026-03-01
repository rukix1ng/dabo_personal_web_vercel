"use client";

import { useState } from "react";
import Image from "next/image";

type FeaturedNews = {
  id: number;
  title: string;
  date: string;
  image: string;
  description: string;
};

type NewsItem = {
  title: string;
  date: string;
};

type ProjectNewsProps = {
  featured: readonly FeaturedNews[];
  list: readonly NewsItem[];
};

export function ProjectNews({ featured, list }: ProjectNewsProps) {
  const [selectedNews, setSelectedNews] = useState(featured[0]);

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
            <button
              key={news.id}
              onClick={() => setSelectedNews(news)}
              className={`group flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-left transition-all ${
                selectedNews.id === news.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/40 hover:bg-card/60"
              }`}
            >
              <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                {news.title}
              </h3>
              <p className="text-sm text-muted-foreground">{news.description}</p>
              <span className="text-xs text-muted-foreground">{news.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* News List Section */}
      <div className="flex flex-col gap-3 pt-4">
        {list.map((item, index) => (
          <div
            key={index}
            className="group flex cursor-pointer items-center justify-between gap-4 border-b border-border/30 pb-3 last:border-b-0 last:pb-0 transition-all hover:border-primary/40"
          >
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-primary transition-all group-hover:scale-125" />
              <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                {item.title}
              </span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
