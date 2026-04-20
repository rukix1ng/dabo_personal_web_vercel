"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Edit, Plus, Save, Search, Trash2, X } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { buildInternalLinkValue, parseInternalLinkValue, type NewsLinkType } from "@/lib/news-links";
import { Pagination } from "@/components/pagination";

interface NewsItem {
  id: number;
  title_en: string;
  title_zh: string;
  title_ja: string;
  link_type: NewsLinkType;
  link_value: string | null;
  news_date: string | null;
  image: string | null;
  show_in_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface InternalOption {
  id: number;
  title_zh: string;
}

interface NewsPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface NewsFormData {
  title_en: string;
  title_zh: string;
  title_ja: string;
  link_type: NewsLinkType;
  link_value: string;
  news_date: string;
  image: string;
  show_in_featured: boolean;
}

type ToastState = {
  type: "success" | "error" | "warning";
  title?: string;
  lines: string[];
} | null;

const initialFormData: NewsFormData = {
  title_en: "",
  title_zh: "",
  title_ja: "",
  link_type: "none",
  link_value: "",
  news_date: "",
  image: "",
  show_in_featured: false,
};

const PAGE_SIZE = 10;

export default function HomepageNewsManagementPage() {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [invitations, setInvitations] = useState<InternalOption[]>([]);
  const [newsColumns, setNewsColumns] = useState<InternalOption[]>([]);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [pagination, setPagination] = useState<NewsPagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingWasFeatured, setEditingWasFeatured] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"zh" | "en" | "ja">("zh");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [internalLinkMenuOpen, setInternalLinkMenuOpen] = useState(false);
  const [internalLinkSearch, setInternalLinkSearch] = useState("");
  const [treeOpen, setTreeOpen] = useState<"invitation" | "news_column" | null>("invitation");
  const [formData, setFormData] = useState<NewsFormData>(initialFormData);

  const featuredCountExcludingEditing = Math.max(0, featuredCount - (editingWasFeatured ? 1 : 0));

  const selectedInternalOptionLabel = useMemo(() => {
    const parsed = parseInternalLinkValue(formData.link_value);
    if (!parsed) return "";

    const options = parsed.kind === "invitation" ? invitations : newsColumns;
    const matched = options.find((item) => item.id === parsed.id);
    if (!matched) return "";

    return `${parsed.kind === "invitation" ? "邀请报告" : "新闻专栏"} / ${matched.title_zh}`;
  }, [formData.link_value, invitations, newsColumns]);

  const normalizedInternalLinkSearch = internalLinkSearch.trim().toLowerCase();

  const filteredInvitations = useMemo(() => {
    if (!normalizedInternalLinkSearch) return invitations;
    return invitations.filter((item) => item.title_zh.toLowerCase().includes(normalizedInternalLinkSearch));
  }, [invitations, normalizedInternalLinkSearch]);

  const filteredNewsColumns = useMemo(() => {
    if (!normalizedInternalLinkSearch) return newsColumns;
    return newsColumns.filter((item) => item.title_zh.toLowerCase().includes(normalizedInternalLinkSearch));
  }, [newsColumns, normalizedInternalLinkSearch]);

  const fetchNewsItems = useCallback(async (page = 1) => {
    try {
      const res = await fetch(`/api/admin/news?page=${page}&pageSize=${PAGE_SIZE}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        setError("获取首页新闻失败");
        setNewsItems([]);
        return;
      }

      const data = await res.json();
      setNewsItems(data.newsItems || []);
      setInvitations(data.internalOptions?.invitations || []);
      setNewsColumns(data.internalOptions?.newsColumns || []);
      setFeaturedCount(Number(data.featuredCount || 0));
      setPagination(
        data.pagination || {
          page,
          pageSize: PAGE_SIZE,
          totalItems: 0,
          totalPages: 1,
        }
      );
      setError("");
    } catch (fetchError) {
      console.error("获取首页新闻出错:", fetchError);
      setError("获取首页新闻出错");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchNewsItems();
  }, [fetchNewsItems]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setEditingWasFeatured(false);
    setShowForm(false);
    setActiveTab("zh");
    setTreeOpen("invitation");
    setInternalLinkMenuOpen(false);
    setInternalLinkSearch("");
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showToast = (nextToast: ToastState) => {
    setToast(nextToast);
  };

  const handleEdit = (newsItem: NewsItem) => {
    const parsed = parseInternalLinkValue(newsItem.link_value);
    setEditingId(newsItem.id);
    setEditingWasFeatured(newsItem.show_in_featured);
    setFormData({
      title_en: newsItem.title_en,
      title_zh: newsItem.title_zh,
      title_ja: newsItem.title_ja,
      link_type: newsItem.link_type || "none",
      link_value: newsItem.link_value || "",
      news_date: newsItem.news_date || "",
      image: newsItem.image || "",
      show_in_featured: newsItem.show_in_featured,
    });
    setTreeOpen(parsed?.kind || "invitation");
    setShowForm(true);
    setInternalLinkSearch("");
    setInternalLinkMenuOpen(false);
  };

  const setLinkType = (nextType: NewsLinkType) => {
    setFormData((prev) => ({
      ...prev,
      link_type: nextType,
      link_value: nextType === prev.link_type ? prev.link_value : "",
    }));
    if (nextType !== "internal") {
      setInternalLinkMenuOpen(false);
      setInternalLinkSearch("");
    } else {
      setTreeOpen("invitation");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: string[] = [];
    if (!formData.title_zh.trim()) errors.push("请填写中文标题");
    if (!formData.title_en.trim()) errors.push("请填写英文标题");
    if (!formData.title_ja.trim()) errors.push("请填写日文标题");
    if (!formData.news_date.trim()) errors.push("请填写新闻日期");
    if (formData.link_type === "external" && !formData.link_value.trim()) {
      errors.push("请填写外部链接地址");
    }
    if (formData.link_type === "internal" && !parseInternalLinkValue(formData.link_value)) {
      errors.push("请选择内部跳转目标");
    }
    if (formData.show_in_featured && !formData.image.trim()) {
      errors.push("展示在图片模块中的新闻必须上传图片");
    }
    if (formData.show_in_featured && featuredCountExcludingEditing >= 3) {
      errors.push("图片模块最多只能展示 3 条新闻");
    }

    if (errors.length > 0) {
      showToast({
        type: "error",
        title: "请完善以下内容",
        lines: errors,
      });
      scrollToTop();
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingId ? "/api/admin/news/" + editingId : "/api/admin/news";
      const method = editingId ? "PUT" : "POST";
      const payload = {
        ...formData,
        link_value: formData.link_type === "none" ? null : formData.link_value.trim(),
        news_date: formData.news_date.trim(),
        image: formData.image.trim() || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast({
          type: "error",
          title: "保存失败",
          lines: [data.error || "保存失败，请稍后重试"],
        });
        scrollToTop();
        return;
      }

      await fetchNewsItems(pagination.page);
      showToast({
        type: "success",
        lines: [editingId ? "首页新闻已更新" : "首页新闻已创建"],
      });
      resetForm();
      scrollToTop();
    } catch (submitError) {
      console.error("保存首页新闻出错:", submitError);
      showToast({
        type: "error",
        title: "保存失败",
        lines: ["保存失败，请稍后重试"],
      });
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await fetch("/api/admin/news/" + deleteConfirmId, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast({
          type: "error",
          title: "删除失败",
          lines: [data.error || "删除失败，请稍后重试"],
        });
        return;
      }

      const nextTotalItems = Math.max(0, pagination.totalItems - 1);
      const nextTotalPages = Math.max(1, Math.ceil(nextTotalItems / pagination.pageSize));
      const targetPage = Math.min(pagination.page, nextTotalPages);
      await fetchNewsItems(targetPage);
      showToast({
        type: "success",
        lines: ["首页新闻已删除"],
      });
      setDeleteConfirmId(null);
      scrollToTop();
    } catch (deleteError) {
      console.error("删除首页新闻出错:", deleteError);
      showToast({
        type: "error",
        title: "删除失败",
        lines: ["删除失败，请稍后重试"],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div ref={topRef} />

      <div className="pointer-events-none fixed left-1/2 top-4 z-[120] flex w-full max-w-3xl -translate-x-1/2 flex-col gap-3 px-4">
        {toast && (
          <div
            className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
              toast.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                : toast.type === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {toast.title && <div className="text-sm font-medium">{toast.title}</div>}
            <ul className={`${toast.title ? "mt-2" : ""} space-y-1 text-sm`}>
              {toast.lines.map((item, index) => (
                <li key={`${item}-${index}`}>{toast.title ? `- ${item}` : item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">首页新闻管理</h1>
          <p className="mt-2 text-muted-foreground">
            管理首页新闻列表，并控制哪些新闻展示在带图片模块中。
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          添加首页新闻
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        当前图片模块已选择 {featuredCount} / 3 条新闻。
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? "编辑首页新闻" : "添加首页新闻"}
              </h2>
              <button
                onClick={resetForm}
                className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6 flex gap-2 border-b border-border">
              {[
                { key: "zh", label: "中文" },
                { key: "en", label: "English" },
                { key: "ja", label: "日本語" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "zh" | "en" | "ja")}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === "zh" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    新闻标题（中文）*
                  </label>
                  <input
                    type="text"
                    value={formData.title_zh}
                    onChange={(e) => setFormData({ ...formData, title_zh: e.target.value })}
                    placeholder=""
                    
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {activeTab === "en" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    News Title (English)*
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder=""
                    
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {activeTab === "ja" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    ニュースタイトル（日本語）*
                  </label>
                  <input
                    type="text"
                    value={formData.title_ja}
                    onChange={(e) => setFormData({ ...formData, title_ja: e.target.value })}
                    placeholder=""
                    
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground">通用信息</h3>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    跳转类型
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { value: "none", label: "不跳转" },
                      { value: "external", label: "外部链接" },
                      { value: "internal", label: "内部链接" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setLinkType(item.value as NewsLinkType)}
                        className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                          formData.link_type === item.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground hover:border-primary/40"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.link_type === "external" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      外部链接地址
                    </label>
                    <input
                      type="url"
                      value={formData.link_value}
                      onChange={(e) => setFormData({ ...formData, link_value: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                {formData.link_type === "internal" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      内部链接树型选择
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setInternalLinkMenuOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <span className={selectedInternalOptionLabel ? "text-foreground" : "text-muted-foreground"}>
                          {selectedInternalOptionLabel || "请选择一个内部详情页"}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            internalLinkMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {internalLinkMenuOpen && (
                        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                          <div className="border-b border-border p-3">
                            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <input
                                type="text"
                                value={internalLinkSearch}
                                onChange={(e) => setInternalLinkSearch(e.target.value)}
                                placeholder="搜索内部页面"
                                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                              />
                            </div>
                          </div>

                          <div className="max-h-80 overflow-y-auto p-2">
                            {[
                              {
                                key: "invitation" as const,
                                label: "邀请报告",
                                items: filteredInvitations,
                              },
                              {
                                key: "news_column" as const,
                                label: "新闻专栏",
                                items: filteredNewsColumns,
                              },
                            ].map((group) => {
                              const hasSearch = Boolean(normalizedInternalLinkSearch);
                              const isOpen = hasSearch ? true : treeOpen === group.key;
                              const hasItems = group.items.length > 0;

                              return (
                                <div key={group.key} className="mb-1 last:mb-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      !hasSearch &&
                                      setTreeOpen((prev) => (prev === group.key ? null : group.key))
                                    }
                                    className="flex w-full items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-left text-sm font-medium text-foreground"
                                  >
                                    {isOpen ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span>{group.label}</span>
                                  </button>

                                  {isOpen && (
                                    <div className="mt-1 space-y-1 pl-6">
                                      {hasItems ? (
                                        group.items.map((item) => {
                                          const value = buildInternalLinkValue(group.key, item.id);
                                          const selected = formData.link_value === value;
                                          return (
                                            <button
                                              key={value}
                                              type="button"
                                              onClick={() => {
                                                setFormData({
                                                  ...formData,
                                                  link_type: "internal",
                                                  link_value: value,
                                                });
                                                setInternalLinkMenuOpen(false);
                                              }}
                                              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                                selected
                                                  ? "bg-primary/10 text-primary"
                                                  : "text-foreground hover:bg-muted/40"
                                              }`}
                                            >
                                              <span className="mr-2 text-muted-foreground">└</span>
                                              <span>{item.title_zh}</span>
                                            </button>
                                          );
                                        })
                                      ) : (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                          {hasSearch ? "没有匹配项" : "暂无可选项"}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    新闻日期*
                  </label>
                  <input
                    type="date"
                    value={formData.news_date}
                    onChange={(e) => setFormData({ ...formData, news_date: e.target.value })}
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  folder="homepage-news"
                  label="新闻图片"
                />

                <label className="flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3">
                  <input
                    type="checkbox"
                    checked={formData.show_in_featured}
                    onChange={(e) =>
                      setFormData({ ...formData, show_in_featured: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">展示在图片模块中</div>
                    <div className="text-xs text-muted-foreground">
                      勾选后会出现在首页带图片新闻区。该区域最多展示 3 条，且必须上传图片。
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="flex-1 cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "提交中..." : editingId ? "更新" : "创建"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-foreground">确认删除</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              确定要删除这条首页新闻吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  标题（中文）
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  日期
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  跳转类型
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  图片模块
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {newsItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    还没有首页新闻，点击“添加首页新闻”开始创建。
                  </td>
                </tr>
              ) : (
                newsItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{item.title_zh}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.news_date || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.link_type === "external"
                        ? "外部链接"
                        : item.link_type === "internal"
                          ? "内部链接"
                          : "不跳转"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.show_in_featured ? "是" : "否"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="cursor-pointer rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="cursor-pointer rounded-lg p-2 text-red-600 transition-colors hover:bg-red-500/10"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalItems > 0 ? (
          <div className="border-t border-border px-6 py-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.pageSize}
              onPageChange={(page) => {
                if (page === pagination.page) return;
                setLoading(true);
                void fetchNewsItems(page);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
