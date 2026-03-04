"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, X, Save, Sparkles } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

interface Paper {
    id: number;
    title_en: string;
    title_zh: string;
    title_ja: string;
    author: string | null;
    journal_name: string | null;
    image: string | null;
    description_en: string | null;
    description_zh: string | null;
    description_ja: string | null;
    paper_link: string | null;
    sponsor_en: string | null;
    sponsor_zh: string | null;
    sponsor_ja: string | null;
    sponsor_link: string | null;
    created_at: string;
    updated_at: string;
}

interface PaperFormData {
    title_en: string;
    title_zh: string;
    title_ja: string;
    author: string;
    journal_name: string;
    image: string;
    description_en: string;
    description_zh: string;
    description_ja: string;
    paper_link: string;
    sponsor_en: string;
    sponsor_zh: string;
    sponsor_ja: string;
    sponsor_link: string;
}

export default function PapersManagementPage() {
    const router = useRouter();
    const topRef = useRef<HTMLDivElement>(null);
    const [papers, setPapers] = useState<Paper[]>([]);
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
    const [formData, setFormData] = useState<PaperFormData>({
        title_en: "",
        title_zh: "",
        title_ja: "",
        author: "",
        journal_name: "",
        image: "",
        description_en: "",
        description_zh: "",
        description_ja: "",
        paper_link: "",
        sponsor_en: "",
        sponsor_zh: "",
        sponsor_ja: "",
        sponsor_link: "",
    });

    // Fetch papers
    const fetchPapers = async () => {
        try {
            const res = await fetch("/api/admin/papers");
            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/admin/login");
                    return;
                } else {
                    setError("获取论文失败");
                }
                setPapers([]);
                return;
            }
            const data = await res.json();
            setPapers(data.papers || []);
            setError("");
        } catch (error) {
            console.error("获取论文出错:", error);
            setError("获取论文出错");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPapers();
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

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors([]);
        setIsSubmitting(true);

        try {
            const url = editingId
                ? `/api/admin/papers/${editingId}`
                : "/api/admin/papers";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.status === 401) {
                router.push("/admin/login");
                return;
            }

            if (res.ok) {
                await fetchPapers();
                setSuccessMessage(editingId ? "更新成功" : "创建成功");
                resetForm();
                topRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        } catch (error) {
            console.error("保存论文出错:", error);
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
            const res = await fetch(`/api/admin/papers/${deleteConfirmId}`, {
                method: "DELETE",
            });

            if (res.status === 401) {
                router.push("/admin/login");
                return;
            }

            if (res.ok) {
                await fetchPapers();
                setSuccessMessage("删除成功");
                setDeleteConfirmId(null);
                topRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        } catch (error) {
            console.error("删除论文出错:", error);
        }
    };

    // Handle edit
    const handleEdit = (paper: Paper) => {
        setEditingId(paper.id);
        setFormData({
            title_en: paper.title_en,
            title_zh: paper.title_zh,
            title_ja: paper.title_ja,
            author: paper.author || "",
            journal_name: paper.journal_name || "",
            image: paper.image || "",
            description_en: paper.description_en || "",
            description_zh: paper.description_zh || "",
            description_ja: paper.description_ja || "",
            paper_link: paper.paper_link || "",
            sponsor_en: paper.sponsor_en || "",
            sponsor_zh: paper.sponsor_zh || "",
            sponsor_ja: paper.sponsor_ja || "",
            sponsor_link: paper.sponsor_link || "",
        });
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title_en: "",
            title_zh: "",
            title_ja: "",
            author: "",
            journal_name: "",
            image: "",
            description_en: "",
            description_zh: "",
            description_ja: "",
            paper_link: "",
            sponsor_en: "",
            sponsor_zh: "",
            sponsor_ja: "",
            sponsor_link: "",
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

        // 检查是否所有语言都已填写，如果是则跳过
        const filledCount = Object.values(texts).filter(t => t?.trim()).length;
        if (filledCount === 3) {
            console.log(`字段 ${fieldName} 所有语言都已填写，跳过翻译`);
            setIsTranslating(false);
            return;
        }

        // 标记正在翻译的字段
        setTranslatingFields(prev => new Set(prev).add(fieldName));

        try {
            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts, fieldName }),
            });

            console.log('Response status:', res.status, res.statusText);

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Error response:', errorData);
                const errorMessage = errorData.debug 
                    ? `${errorData.error}\n调试信息: ${errorData.debug}`
                    : errorData.error;
                throw new Error(errorMessage);
            }

            const data = await res.json();
            console.log('Success response:', data);

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
            // 移除正在翻译的标记
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
                { name: "description", zh: formData.description_zh, en: formData.description_en, ja: formData.description_ja },
                { name: "sponsor", zh: formData.sponsor_zh, en: formData.sponsor_en, ja: formData.sponsor_ja },
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
                    <h1 className="text-3xl font-bold text-foreground">合作论文管理</h1>
                    <p className="mt-2 text-muted-foreground">
                        管理合作论文内容（支持中英日三语）
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    添加合作论文
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
                                {editingId ? "编辑合作论文" : "添加新合作论文"}
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
                            {/* Chinese Fields */}
                            {activeTab === "zh" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            论文标题（中文）*
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
                                            论文介绍（中文）
                                        </label>
                                        <textarea
                                            value={formData.description_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description_zh: e.target.value })
                                            }
                                            rows={6}
                                            placeholder={translatingFields.has('description') && !formData.description_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('description') && !formData.description_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('description') && !formData.description_zh ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            赞助企业（中文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.sponsor_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, sponsor_zh: e.target.value })
                                            }
                                            placeholder={translatingFields.has('sponsor') && !formData.sponsor_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('sponsor') && !formData.sponsor_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('sponsor') && !formData.sponsor_zh ? 'animate-pulse' : ''}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* English Fields */}
                            {activeTab === "en" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            论文标题（英文）*
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
                                            论文介绍（英文）
                                        </label>
                                        <textarea
                                            value={formData.description_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description_en: e.target.value })
                                            }
                                            rows={6}
                                            placeholder={translatingFields.has('description') && !formData.description_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('description') && !formData.description_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('description') && !formData.description_en ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            赞助企业（英文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.sponsor_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, sponsor_en: e.target.value })
                                            }
                                            placeholder={translatingFields.has('sponsor') && !formData.sponsor_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('sponsor') && !formData.sponsor_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('sponsor') && !formData.sponsor_en ? 'animate-pulse' : ''}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Japanese Fields */}
                            {activeTab === "ja" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            论文标题（日文）*
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
                                            论文介绍（日文）
                                        </label>
                                        <textarea
                                            value={formData.description_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description_ja: e.target.value })
                                            }
                                            rows={6}
                                            placeholder={translatingFields.has('description') && !formData.description_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('description') && !formData.description_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('description') && !formData.description_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            赞助企业（日文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.sponsor_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, sponsor_ja: e.target.value })
                                            }
                                            placeholder={translatingFields.has('sponsor') && !formData.sponsor_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('sponsor') && !formData.sponsor_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('sponsor') && !formData.sponsor_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>
                                </div>
                            )}

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
                                        论文作者
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) =>
                                            setFormData({ ...formData, author: e.target.value })
                                        }
                                        placeholder="作者姓名"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        期刊名称
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.journal_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, journal_name: e.target.value })
                                        }
                                        placeholder="期刊名称"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        论文链接
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.paper_link}
                                        onChange={(e) =>
                                            setFormData({ ...formData, paper_link: e.target.value })
                                        }
                                        placeholder="https://..."
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        赞助企业链接
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.sponsor_link}
                                        onChange={(e) =>
                                            setFormData({ ...formData, sponsor_link: e.target.value })
                                        }
                                        placeholder="https://..."
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    folder="papers"
                                    label="论文图片"
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
                            确定要删除这篇合作论文吗？此操作无法撤销。
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

            {/* Papers Table */}
            <div className="rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    标题（中文）
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    作者
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    赞助企业
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {papers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-muted-foreground"
                                    >
                                        未找到合作论文。点击&ldquo;添加合作论文&rdquo;创建一个。
                                    </td>
                                </tr>
                            ) : (
                                papers.map((paper) => (
                                    <tr
                                        key={paper.id}
                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                    >
                                        <td className="px-6 py-4">
                                            {paper.paper_link ? (
                                                <a
                                                    href={paper.paper_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-primary hover:underline cursor-pointer"
                                                >
                                                    {paper.title_zh}
                                                </a>
                                            ) : (
                                                <div className="font-medium text-foreground">
                                                    {paper.title_zh}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-muted-foreground">
                                                {paper.author || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {paper.sponsor_link ? (
                                                <a
                                                    href={paper.sponsor_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline cursor-pointer"
                                                >
                                                    {paper.sponsor_zh || "-"}
                                                </a>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">
                                                    {paper.sponsor_zh || "-"}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(paper)}
                                                    className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 cursor-pointer"
                                                    title="编辑"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(paper.id)}
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
