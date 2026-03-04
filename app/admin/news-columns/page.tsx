"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, X, Save, Sparkles } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

interface NewsColumn {
    id: number;
    title_en: string;
    content_en: string | null;
    journal_name_en: string | null;
    author_bio_en: string | null;
    title_zh: string;
    content_zh: string | null;
    journal_name_zh: string | null;
    author_bio_zh: string | null;
    title_ja: string;
    content_ja: string | null;
    journal_name_ja: string | null;
    author_bio_ja: string | null;
    publish_date: string;
    series_number: number;
    image: string | null;
    created_at: string;
    updated_at: string;
}

interface NewsColumnFormData {
    title_en: string;
    content_en: string;
    journal_name_en: string;
    author_bio_en: string;
    title_zh: string;
    content_zh: string;
    journal_name_zh: string;
    author_bio_zh: string;
    title_ja: string;
    content_ja: string;
    journal_name_ja: string;
    author_bio_ja: string;
    publish_date: string;
    series_number: string;
    image: string;
}

export default function NewsColumnsManagementPage() {
    const router = useRouter();
    const topRef = useRef<HTMLDivElement>(null);
    const [newsColumns, setNewsColumns] = useState<NewsColumn[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"zh" | "en" | "ja">("zh");
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translateError, setTranslateError] = useState("");
    const [translateSuccess, setTranslateSuccess] = useState("");
    const [translatingFields, setTranslatingFields] = useState<Set<string>>(new Set());
    const [formData, setFormData] = useState<NewsColumnFormData>({
        title_en: "",
        content_en: "",
        journal_name_en: "",
        author_bio_en: "",
        title_zh: "",
        content_zh: "",
        journal_name_zh: "",
        author_bio_zh: "",
        title_ja: "",
        content_ja: "",
        journal_name_ja: "",
        author_bio_ja: "",
        publish_date: "",
        series_number: "",
        image: "",
    });

    // Fetch news columns
    const fetchNewsColumns = async () => {
        try {
            const res = await fetch("/api/admin/news-columns");
            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/admin/login");
                    return;
                } else {
                    setError("获取新闻专栏失败");
                }
                setNewsColumns([]);
                return;
            }
            const data = await res.json();
            setNewsColumns(data.newsColumns || []);
            setError("");
        } catch (error) {
            console.error("获取新闻专栏出错:", error);
            setError("获取新闻专栏出错");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewsColumns();
    }, []);

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent duplicate submissions
        if (isSubmitting) return;

        // Validate required fields
        const errors: string[] = [];
        if (!formData.title_zh.trim()) errors.push("请填写中文标题");
        if (!formData.title_en.trim()) errors.push("请填写英文标题 (Title)");
        if (!formData.title_ja.trim()) errors.push("请填写日文标题 (タイトル)");
        if (!formData.series_number.trim()) errors.push("请填写系列期数");

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors([]);
        setIsSubmitting(true);

        try {
            // Convert month format (YYYY-MM) to full date (YYYY-MM-01) for database
            let publishDateValue: string | null = formData.publish_date;
            if (publishDateValue && publishDateValue.trim() && publishDateValue.match(/^\d{4}-\d{2}$/)) {
                publishDateValue = `${publishDateValue}-01`;
            } else if (!publishDateValue || !publishDateValue.trim()) {
                // Ensure empty strings are converted to null
                publishDateValue = null;
            }

            const payload = {
                ...formData,
                publish_date: publishDateValue,
                series_number: parseInt(formData.series_number),
            };

            const url = editingId
                ? `/api/admin/news-columns/${editingId}`
                : "/api/admin/news-columns";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.status === 401) {
                router.push("/admin/login");
                return;
            }

            if (res.ok) {
                await fetchNewsColumns();
                setSuccessMessage(editingId ? "更新成功" : "创建成功");
                resetForm();
                // Scroll to top to show success message
                topRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        } catch (error) {
            console.error("保存新闻专栏出错:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;

        try {
            const res = await fetch(`/api/admin/news-columns/${deleteConfirmId}`, {
                method: "DELETE",
            });

            if (res.status === 401) {
                router.push("/admin/login");
                return;
            }

            if (res.ok) {
                await fetchNewsColumns();
                setSuccessMessage("删除成功");
                setDeleteConfirmId(null);
                // Scroll to top to show success message
                topRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        } catch (error) {
            console.error("删除新闻专栏出错:", error);
        }
    };

    // Handle edit
    const handleEdit = (newsColumn: NewsColumn) => {
        setEditingId(newsColumn.id);

        // Convert date to month format (YYYY-MM) for the month input
        let publishDateValue = "";
        if (newsColumn.publish_date) {
            // Handle both ISO format (2025-03-31T16:00:00.000Z) and simple date format (2025-03-31)
            const dateStr = newsColumn.publish_date;
            if (dateStr.includes('T')) {
                // ISO format - extract date part and convert to YYYY-MM
                publishDateValue = dateStr.substring(0, 7);
            } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Simple date format (YYYY-MM-DD) - extract YYYY-MM
                publishDateValue = dateStr.substring(0, 7);
            } else if (dateStr.match(/^\d{4}-\d{2}$/)) {
                // Already in YYYY-MM format
                publishDateValue = dateStr;
            }
        }

        setFormData({
            title_en: newsColumn.title_en,
            content_en: newsColumn.content_en || "",
            journal_name_en: newsColumn.journal_name_en || "",
            author_bio_en: newsColumn.author_bio_en || "",
            title_zh: newsColumn.title_zh,
            content_zh: newsColumn.content_zh || "",
            journal_name_zh: newsColumn.journal_name_zh || "",
            author_bio_zh: newsColumn.author_bio_zh || "",
            title_ja: newsColumn.title_ja,
            content_ja: newsColumn.content_ja || "",
            journal_name_ja: newsColumn.journal_name_ja || "",
            author_bio_ja: newsColumn.author_bio_ja || "",
            publish_date: publishDateValue,
            series_number: newsColumn.series_number.toString(),
            image: newsColumn.image || "",
        });
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title_en: "",
            content_en: "",
            journal_name_en: "",
            author_bio_en: "",
            title_zh: "",
            content_zh: "",
            journal_name_zh: "",
            author_bio_zh: "",
            title_ja: "",
            content_ja: "",
            journal_name_ja: "",
            author_bio_ja: "",
            publish_date: "",
            series_number: "",
            image: "",
        });
        setEditingId(null);
        setShowForm(false);
        setActiveTab("zh");
        setValidationErrors([]);
        setTranslateError("");
        setTranslateSuccess("");
    };

    // Handle AI translation
    const handleTranslate = async (fieldName: string, texts: { zh?: string; en?: string; ja?: string }) => {
        setTranslateError("");
        setTranslateSuccess("");
        setIsTranslating(true);

        const filledCount = Object.values(texts).filter(t => t?.trim()).length;
        if (filledCount === 3) {
            console.log(`字段 ${fieldName} 所有语言都已填写，跳过翻译`);
            setIsTranslating(false);
            return;
        }

        setTranslatingFields(prev => new Set(prev).add(fieldName));

        try {
            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts, fieldName }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.debug 
                    ? `${errorData.error}\n调试信息: ${errorData.debug}`
                    : errorData.error;
                throw new Error(errorMessage);
            }

            const data = await res.json();

            if (data.success && data.translations) {
                setFormData((prev) => ({
                    ...prev,
                    ...(data.translations.zh && { [`${fieldName}_zh`]: data.translations.zh }),
                    ...(data.translations.en && { [`${fieldName}_en`]: data.translations.en }),
                    ...(data.translations.ja && { [`${fieldName}_ja`]: data.translations.ja }),
                }));
                setTranslateSuccess("翻译成功！");
                setTimeout(() => setTranslateSuccess(""), 3000);
            } else {
                throw new Error("翻译结果无效");
            }
        } catch (error) {
            console.error("翻译错误:", error);
            setTranslateError(error instanceof Error ? error.message : "翻译失败，请稍后重试");
            setTimeout(() => setTranslateError(""), 10000);
        } finally {
            setTranslatingFields(prev => {
                const newSet = new Set(prev);
                newSet.delete(fieldName);
                return newSet;
            });
            setIsTranslating(false);
        }
    };

    // Translate all fields
    const handleTranslateAll = async () => {
        setTranslateError("");
        setTranslateSuccess("");
        setIsTranslating(true);

        try {
            const fields = [
                { name: "title", zh: formData.title_zh, en: formData.title_en, ja: formData.title_ja },
                { name: "content", zh: formData.content_zh, en: formData.content_en, ja: formData.content_ja },
                { name: "journal_name", zh: formData.journal_name_zh, en: formData.journal_name_en, ja: formData.journal_name_ja },
                { name: "author_bio", zh: formData.author_bio_zh, en: formData.author_bio_en, ja: formData.author_bio_ja },
            ];

            for (const field of fields) {
                const texts: { zh?: string; en?: string; ja?: string } = {};
                if (field.zh?.trim()) texts.zh = field.zh;
                if (field.en?.trim()) texts.en = field.en;
                if (field.ja?.trim()) texts.ja = field.ja;

                if (Object.keys(texts).length > 0) {
                    await handleTranslate(field.name, texts);
                }
            }
        } catch (error) {
            console.error("批量翻译错误:", error);
        } finally {
            setIsTranslating(false);
        }
    };

    // Format date for display
    const formatPublishDate = (dateString: string) => {
        // Handle YYYY-MM format (e.g., "2025-04")
        if (dateString && dateString.match(/^\d{4}-\d{2}$/)) {
            const [year, month] = dateString.split('-');
            return `${year}年${parseInt(month)}月`;
        }
        // Handle full date format for backward compatibility
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return `${year}年${month}月`;
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">新闻专栏管理</h1>
                    <p className="mt-2 text-muted-foreground">
                        管理新闻专栏内容（支持中英日三语）
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    添加新闻专栏
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-600 dark:text-green-400">
                    {successMessage}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl rounded-xl border border-border bg-card p-6 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">
                                {editingId ? "编辑新闻专栏" : "添加新新闻专栏"}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                                <div className="flex items-start gap-2">
                                    <div className="text-red-600 dark:text-red-400 font-medium text-sm">
                                        请完善以下必填项：
                                    </div>
                                </div>
                                <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
                                    {validationErrors.map((error, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <span className="text-red-500">•</span>
                                            {error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Language Tabs */}
                        <div className="mb-6 flex gap-2 border-b border-border">
                            <button
                                onClick={() => setActiveTab("zh")}
                                className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                    activeTab === "zh"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                中文
                            </button>
                            <button
                                onClick={() => setActiveTab("en")}
                                className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                    activeTab === "en"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setActiveTab("ja")}
                                className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                    activeTab === "ja"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                日本語
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Translation Messages */}
                            {translateSuccess && (
                                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-600 dark:text-green-400">
                                    {translateSuccess}
                                </div>
                            )}

                            {translateError && (
                                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                                    {translateError}
                                </div>
                            )}

                            {/* Chinese Fields */}
                            {activeTab === "zh" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            标题（中文）*
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title_zh: e.target.value })
                                            }
                                            placeholder={translatingFields.has('title') && !formData.title_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('title') && !formData.title_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('title') && !formData.title_zh ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            新闻内容（中文）
                                        </label>
                                        <textarea
                                            value={formData.content_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, content_zh: e.target.value })
                                            }
                                            rows={6}
                                            placeholder={translatingFields.has('content') && !formData.content_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('content') && !formData.content_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('content') && !formData.content_zh ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            期刊名称（中文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.journal_name_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, journal_name_zh: e.target.value })
                                            }
                                            placeholder={translatingFields.has('journal_name') && !formData.journal_name_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('journal_name') && !formData.journal_name_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('journal_name') && !formData.journal_name_zh ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            作者简介（中文）
                                        </label>
                                        <textarea
                                            value={formData.author_bio_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, author_bio_zh: e.target.value })
                                            }
                                            rows={4}
                                            placeholder={translatingFields.has('author_bio') && !formData.author_bio_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('author_bio') && !formData.author_bio_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('author_bio') && !formData.author_bio_zh ? 'animate-pulse' : ''}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* English Fields */}
                            {activeTab === "en" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            标题（英文）*
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title_en: e.target.value })
                                            }
                                            placeholder={translatingFields.has('title') && !formData.title_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('title') && !formData.title_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('title') && !formData.title_en ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            新闻内容（英文）
                                        </label>
                                        <textarea
                                            value={formData.content_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, content_en: e.target.value })
                                            }
                                            rows={6}
                                            placeholder={translatingFields.has('content') && !formData.content_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('content') && !formData.content_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('content') && !formData.content_en ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            期刊名称（英文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.journal_name_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, journal_name_en: e.target.value })
                                            }
                                            placeholder={translatingFields.has('journal_name') && !formData.journal_name_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('journal_name') && !formData.journal_name_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('journal_name') && !formData.journal_name_en ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            作者简介（英文）
                                        </label>
                                        <textarea
                                            value={formData.author_bio_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, author_bio_en: e.target.value })
                                            }
                                            rows={4}
                                            placeholder={translatingFields.has('author_bio') && !formData.author_bio_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('author_bio') && !formData.author_bio_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('author_bio') && !formData.author_bio_en ? 'animate-pulse' : ''}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Japanese Fields */}
                            {activeTab === "ja" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            标题（日文）*
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title_ja: e.target.value })
                                            }
                                            placeholder={translatingFields.has('title') && !formData.title_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('title') && !formData.title_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('title') && !formData.title_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            新闻内容（日文）
                                        </label>
                                        <textarea
                                            value={formData.content_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, content_ja: e.target.value })
                                            }
                                            rows={6}
                                            placeholder={translatingFields.has('content') && !formData.content_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('content') && !formData.content_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('content') && !formData.content_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            期刊名称（日文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.journal_name_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, journal_name_ja: e.target.value })
                                            }
                                            placeholder={translatingFields.has('journal_name') && !formData.journal_name_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('journal_name') && !formData.journal_name_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('journal_name') && !formData.journal_name_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            作者简介（日文）
                                        </label>
                                        <textarea
                                            value={formData.author_bio_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, author_bio_ja: e.target.value })
                                            }
                                            rows={4}
                                            placeholder={translatingFields.has('author_bio') && !formData.author_bio_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('author_bio') && !formData.author_bio_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('author_bio') && !formData.author_bio_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* AI Translate Button */}
                            <div className="flex items-center justify-start py-4">
                                <button
                                    type="button"
                                    onClick={handleTranslateAll}
                                    disabled={isTranslating}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
                                >
                                    <Sparkles className={`h-5 w-5 ${isTranslating ? "animate-spin" : ""}`} />
                                    {isTranslating ? "AI 翻译中..." : "AI 一键翻译"}
                                </button>
                            </div>

                            {/* Common Fields */}
                            <div className="space-y-4 border-t border-border pt-4">
                                <h3 className="text-sm font-semibold text-foreground">通用信息</h3>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        发表时间
                                    </label>
                                    <input
                                        type="month"
                                        value={formData.publish_date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, publish_date: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        系列期数 *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.series_number}
                                        onChange={(e) =>
                                            setFormData({ ...formData, series_number: e.target.value })
                                        }
                                        min="1"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    folder="news-columns"
                                    label="图片"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSubmitting ? "提交中..." : (editingId ? "更新" : "创建")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-foreground mb-4">
                            确认删除
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            确定要删除这个新闻专栏吗？此操作无法撤销。
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
                            >
                                取消
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 cursor-pointer"
                            >
                                确认删除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* News Columns Table */}
            <div className="rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    标题（中文）
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    期刊名称
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    发表时间
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    期数
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {newsColumns.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-muted-foreground"
                                    >
                                        未找到新闻专栏。点击&ldquo;添加新闻专栏&rdquo;创建一个。
                                    </td>
                                </tr>
                            ) : (
                                newsColumns.map((newsColumn) => (
                                    <tr
                                        key={newsColumn.id}
                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">
                                                {newsColumn.title_zh}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-muted-foreground">
                                                {newsColumn.journal_name_zh}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {formatPublishDate(newsColumn.publish_date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            第{newsColumn.series_number}期
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(newsColumn)}
                                                    className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 cursor-pointer"
                                                    title="编辑"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(newsColumn.id)}
                                                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-500/10 cursor-pointer"
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
            </div>
        </div>
    );
}
