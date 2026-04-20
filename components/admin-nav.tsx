"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelsTopLeft, FileText, Presentation, Newspaper, Home } from "lucide-react";

interface AdminNavProps {
    username: string;
}

export function AdminNav({ username }: AdminNavProps) {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card/30">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="border-b border-border px-6 py-5">
                    <h1 className="text-xl font-bold text-foreground">管理面板</h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        欢迎，{username}
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4">
                    <Link
                        href="/admin/invitations"
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                            pathname === "/admin/invitations" || pathname.startsWith("/admin/invitations/")
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                    >
                        {(pathname === "/admin/invitations" || pathname.startsWith("/admin/invitations/")) && (
                            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <Presentation className="h-5 w-5" />
                        邀请报告管理
                    </Link>
                    <Link
                        href="/admin/news"
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                            pathname === "/admin/news" || pathname.startsWith("/admin/news/")
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                    >
                        {(pathname === "/admin/news" || pathname.startsWith("/admin/news/")) && (
                            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <PanelsTopLeft className="h-5 w-5" />
                        {"\u9996\u9875\u65b0\u95fb\u7ba1\u7406"}
                    </Link>
                    <Link
                        href="/admin/news-columns"
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                            pathname === "/admin/news-columns" || pathname.startsWith("/admin/news-columns/")
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                    >
                        {(pathname === "/admin/news-columns" || pathname.startsWith("/admin/news-columns/")) && (
                            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <Newspaper className="h-5 w-5" />
                        新闻专栏管理
                    </Link>
                    <Link
                        href="/admin/papers"
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                            pathname === "/admin/papers" || pathname.startsWith("/admin/papers/")
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                    >
                        {(pathname === "/admin/papers" || pathname.startsWith("/admin/papers/")) && (
                            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <FileText className="h-5 w-5" />
                        合作论文管理
                    </Link>
                </nav>

                {/* Back to Frontend */}
                <div className="border-t border-border p-4">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                        data-testid="back-to-frontend"
                    >
                        <Home className="h-5 w-5" />
                        返回前台
                    </a>
                </div>
            </div>
        </aside>
    );
}
