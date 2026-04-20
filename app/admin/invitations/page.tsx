"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, X, Save, Sparkles } from "lucide-react";
import { StatusAlert } from "@/components/admin/status-alert";
import { ImageUpload } from "@/components/image-upload";
import { formatAdminDateTime, formatDateTimeLocalValue } from "@/lib/date-time";

interface Invitation {
    id: number;
    title_en: string;
    subtitle_en: string | null;
    speaker_en: string;
    speaker_institution_en: string | null;
    abstract_en: string | null;
    title_zh: string;
    subtitle_zh: string | null;
    speaker_zh: string;
    speaker_institution_zh: string | null;
    abstract_zh: string | null;
    title_ja: string;
    subtitle_ja: string | null;
    speaker_ja: string;
    speaker_institution_ja: string | null;
    speaker_institution_link: string | null;
    abstract_ja: string | null;
    event_time: string | null;
    image: string | null;
    image_en: string | null;
    poster: string | null;
    poster_en: string | null;
    video_link: string | null;
    youtube_link: string | null;
    created_at: string;
    updated_at: string;
}

interface InvitationFormData {
    title_en: string;
    subtitle_en: string;
    speaker_en: string;
    speaker_institution_en: string;
    abstract_en: string;
    title_zh: string;
    subtitle_zh: string;
    speaker_zh: string;
    speaker_institution_zh: string;
    abstract_zh: string;
    title_ja: string;
    subtitle_ja: string;
    speaker_ja: string;
    speaker_institution_ja: string;
    speaker_institution_link: string;
    abstract_ja: string;
    event_time: string;
    image: string;
    image_en: string;
    poster: string;
    poster_en: string;
    youtube_link: string;
    video_link: string;
}

export default function InvitationsManagementPage() {
    const router = useRouter();
    const topRef = useRef<HTMLDivElement>(null);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
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
    const [formData, setFormData] = useState<InvitationFormData>({
        title_en: "",
        subtitle_en: "",
        speaker_en: "",
        speaker_institution_en: "",
        abstract_en: "",
        title_zh: "",
        subtitle_zh: "",
        speaker_zh: "",
        speaker_institution_zh: "",
        abstract_zh: "",
        title_ja: "",
        subtitle_ja: "",
        speaker_ja: "",
        speaker_institution_ja: "",
        speaker_institution_link: "",
        abstract_ja: "",
        event_time: "",
        image: "",
        image_en: "",
        poster: "",
        poster_en: "",
        youtube_link: "",
        video_link: "",
    });

    // Fetch invitations
    const fetchInvitations = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/invitations");
            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/admin/login");
                    return;
                } else {
                    setError("获取邀请报告失败");
                }
                setInvitations([]);
                return;
            }
            const data = await res.json();
            setInvitations(data.invitations || []);
            setError("");
        } catch (error) {
            console.error("获取邀请报告出错:", error);
            setError("获取邀请报告出错");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        void fetchInvitations();
    }, [fetchInvitations]);

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
        if (!formData.speaker_zh.trim()) errors.push("请填写中文主讲人");
        if (!formData.title_en.trim()) errors.push("请填写英文标题 (Title)");
        if (!formData.speaker_en.trim()) errors.push("请填写英文主讲人 (Speaker)");
        if (!formData.title_ja.trim()) errors.push("请填写日文标题 (タイトル)");
        if (!formData.speaker_ja.trim()) errors.push("请填写日文主讲人 (講演者)");

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors([]);
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                event_time: formData.event_time || null,
            };

            const url = editingId
                ? `/api/admin/invitations/${editingId}`
                : "/api/admin/invitations";
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
                await fetchInvitations();
                setSuccessMessage(editingId ? "更新成功" : "创建成功");
                resetForm();
                // Scroll to top to show success message
                topRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        } catch (error) {
            console.error("保存邀请报告出错:", error);
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
            const res = await fetch(`/api/admin/invitations/${deleteConfirmId}`, {
                method: "DELETE",
            });

            if (res.status === 401) {
                router.push("/admin/login");
                return;
            }

            if (res.ok) {
                await fetchInvitations();
                setSuccessMessage("删除成功");
                setDeleteConfirmId(null);
                // Scroll to top to show success message
                topRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        } catch (error) {
            console.error("删除邀请报告出错:", error);
        }
    };

    // Handle edit
    const handleEdit = (invitation: Invitation) => {
        setEditingId(invitation.id);
        setFormData({
            title_en: invitation.title_en,
            subtitle_en: invitation.subtitle_en || "",
            speaker_en: invitation.speaker_en,
            speaker_institution_en: invitation.speaker_institution_en || "",
            abstract_en: invitation.abstract_en || "",
            title_zh: invitation.title_zh,
            subtitle_zh: invitation.subtitle_zh || "",
            speaker_zh: invitation.speaker_zh,
            speaker_institution_zh: invitation.speaker_institution_zh || "",
            abstract_zh: invitation.abstract_zh || "",
            title_ja: invitation.title_ja,
            subtitle_ja: invitation.subtitle_ja || "",
            speaker_ja: invitation.speaker_ja,
            speaker_institution_ja: invitation.speaker_institution_ja || "",
            speaker_institution_link: invitation.speaker_institution_link || "",
            abstract_ja: invitation.abstract_ja || "",
            event_time: formatDateTimeLocalValue(invitation.event_time),
            image: invitation.image || "",
            image_en: invitation.image_en || "",
            poster: invitation.poster || "",
            poster_en: invitation.poster_en || "",
            youtube_link: invitation.youtube_link || "",
            video_link: invitation.video_link || "",
        });
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title_en: "",
            subtitle_en: "",
            speaker_en: "",
            speaker_institution_en: "",
            abstract_en: "",
            title_zh: "",
            subtitle_zh: "",
            speaker_zh: "",
            speaker_institution_zh: "",
            abstract_zh: "",
            title_ja: "",
            subtitle_ja: "",
            speaker_ja: "",
            speaker_institution_ja: "",
            speaker_institution_link: "",
            abstract_ja: "",
            event_time: "",
            image: "",
            image_en: "",
            poster: "",
            poster_en: "",
            youtube_link: "",
            video_link: "",
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
                { name: "subtitle", zh: formData.subtitle_zh, en: formData.subtitle_en, ja: formData.subtitle_ja },
                { name: "speaker", zh: formData.speaker_zh, en: formData.speaker_en, ja: formData.speaker_ja },
                { name: "speaker_institution", zh: formData.speaker_institution_zh, en: formData.speaker_institution_en, ja: formData.speaker_institution_ja },
                { name: "abstract", zh: formData.abstract_zh, en: formData.abstract_en, ja: formData.abstract_ja },
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
                    <h1 className="text-3xl font-bold text-foreground">邀请报告管理</h1>
                    <p className="mt-2 text-muted-foreground">
                        管理NIMS邀请报告（支持中英日三语）
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    添加邀请报告
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <StatusAlert variant="error" lines={[error]} />
            )}

            {/* Success Message */}
            {successMessage && (
                <StatusAlert variant="success" lines={[successMessage]} />
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl rounded-xl border border-border bg-card p-6 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">
                                {editingId ? "编辑邀请报告" : "添加新邀请报告"}
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
                            <StatusAlert
                                variant="error"
                                title="请完善以下必填项："
                                lines={validationErrors}
                                className="mb-6"
                            />
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
                                <StatusAlert variant="success" lines={[translateSuccess]} />
                            )}

                            {translateError && (
                                <StatusAlert variant="error" lines={[translateError]} />
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
                                            副标题（中文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subtitle_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, subtitle_zh: e.target.value })
                                            }
                                            placeholder={translatingFields.has('subtitle') && !formData.subtitle_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('subtitle') && !formData.subtitle_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('subtitle') && !formData.subtitle_zh ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            主讲人（中文）*
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.speaker_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, speaker_zh: e.target.value })
                                            }
                                            placeholder={translatingFields.has('speaker') && !formData.speaker_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('speaker') && !formData.speaker_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('speaker') && !formData.speaker_zh ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            主讲人单位（中文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.speaker_institution_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, speaker_institution_zh: e.target.value })
                                            }
                                            placeholder={translatingFields.has('speaker_institution') && !formData.speaker_institution_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('speaker_institution') && !formData.speaker_institution_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('speaker_institution') && !formData.speaker_institution_zh ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            摘要（中文）
                                        </label>
                                        <textarea
                                            value={formData.abstract_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, abstract_zh: e.target.value })
                                            }
                                            rows={4}
                                            placeholder={translatingFields.has('abstract') && !formData.abstract_zh ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('abstract') && !formData.abstract_zh}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('abstract') && !formData.abstract_zh ? 'animate-pulse' : ''}`}
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
                                            副标题（英文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subtitle_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, subtitle_en: e.target.value })
                                            }
                                            placeholder={translatingFields.has('subtitle') && !formData.subtitle_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('subtitle') && !formData.subtitle_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('subtitle') && !formData.subtitle_en ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            主讲人（英文）*
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.speaker_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, speaker_en: e.target.value })
                                            }
                                            placeholder={translatingFields.has('speaker') && !formData.speaker_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('speaker') && !formData.speaker_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('speaker') && !formData.speaker_en ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            主讲人单位（英文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.speaker_institution_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, speaker_institution_en: e.target.value })
                                            }
                                            placeholder={translatingFields.has('speaker_institution') && !formData.speaker_institution_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('speaker_institution') && !formData.speaker_institution_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('speaker_institution') && !formData.speaker_institution_en ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            摘要（英文）
                                        </label>
                                        <textarea
                                            value={formData.abstract_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, abstract_en: e.target.value })
                                            }
                                            rows={4}
                                            placeholder={translatingFields.has('abstract') && !formData.abstract_en ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('abstract') && !formData.abstract_en}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('abstract') && !formData.abstract_en ? 'animate-pulse' : ''}`}
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
                                            副标题（日文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subtitle_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, subtitle_ja: e.target.value })
                                            }
                                            placeholder={translatingFields.has('subtitle') && !formData.subtitle_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('subtitle') && !formData.subtitle_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('subtitle') && !formData.subtitle_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            主讲人（日文）*
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.speaker_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, speaker_ja: e.target.value })
                                            }
                                            placeholder={translatingFields.has('speaker') && !formData.speaker_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('speaker') && !formData.speaker_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('speaker') && !formData.speaker_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            主讲人单位（日文）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.speaker_institution_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, speaker_institution_ja: e.target.value })
                                            }
                                            placeholder={translatingFields.has('speaker_institution') && !formData.speaker_institution_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('speaker_institution') && !formData.speaker_institution_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('speaker_institution') && !formData.speaker_institution_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            摘要（日文）
                                        </label>
                                        <textarea
                                            value={formData.abstract_ja}
                                            onChange={(e) =>
                                                setFormData({ ...formData, abstract_ja: e.target.value })
                                            }
                                            rows={4}
                                            placeholder={translatingFields.has('abstract') && !formData.abstract_ja ? 'AI 正在翻译中...' : ''}
                                            disabled={translatingFields.has('abstract') && !formData.abstract_ja}
                                            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${translatingFields.has('abstract') && !formData.abstract_ja ? 'animate-pulse' : ''}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* AI Translate Button */}
                            <div className="hidden">
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
                                        主讲人单位链接
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.speaker_institution_link}
                                        onChange={(e) =>
                                            setFormData({ ...formData, speaker_institution_link: e.target.value })
                                        }
                                        placeholder="https://..."
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        演讲时间
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.event_time}
                                        onChange={(e) =>
                                            setFormData({ ...formData, event_time: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    onUploaded={({ url, url_en }) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            image: url,
                                            image_en: url_en || prev.image_en,
                                        }))
                                    }
                                    extraUrls={[
                                        { label: "国内七牛云", value: formData.image },
                                        { label: "国外 Supabase", value: formData.image_en },
                                    ]}
                                    folder="invitations"
                                    label="图片"
                                />

                                <ImageUpload
                                    value={formData.poster}
                                    onChange={(url) => setFormData({ ...formData, poster: url })}
                                    onUploaded={({ url, url_en }) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            poster: url,
                                            poster_en: url_en || prev.poster_en,
                                        }))
                                    }
                                    extraUrls={[
                                        { label: "国内七牛云", value: formData.poster },
                                        { label: "国外 Supabase", value: formData.poster_en },
                                    ]}
                                    folder="invitations"
                                    label="海报"
                                />

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        YouTube 链接
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.youtube_link}
                                        onChange={(e) =>
                                            setFormData({ ...formData, youtube_link: e.target.value })
                                        }
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        支持 YouTube watch、youtu.be、embed、shorts 链接
                                    </p>
                                </div>
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
                            确定要删除这个邀请报告吗？此操作无法撤销。
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

            {/* Invitations Table */}
            <div className="rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    标题（中文）
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    主讲人（中文）
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    演讲时间
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invitations.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-muted-foreground"
                                    >
                                        未找到邀请报告。点击&ldquo;添加邀请报告&rdquo;创建一个。
                                    </td>
                                </tr>
                            ) : (
                                invitations.map((invitation) => (
                                    <tr
                                        key={invitation.id}
                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">
                                                {invitation.title_zh}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-muted-foreground">
                                                {invitation.speaker_zh}
                                            </div>
                                            {invitation.speaker_institution_zh && (
                                                invitation.speaker_institution_link ? (
                                                    <a
                                                        href={invitation.speaker_institution_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline cursor-pointer"
                                                    >
                                                        {invitation.speaker_institution_zh}
                                                    </a>
                                                ) : (
                                                    <div className="text-xs text-muted-foreground">
                                                        {invitation.speaker_institution_zh}
                                                    </div>
                                                )
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {invitation.event_time
                                                ? formatAdminDateTime(invitation.event_time)
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(invitation)}
                                                    className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 cursor-pointer"
                                                    title="编辑"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invitation.id)}
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
