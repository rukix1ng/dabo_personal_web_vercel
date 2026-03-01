"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, X, Save } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

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
    video_link: string | null;
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
        video_link: "",
    });

    // Fetch invitations
    const fetchInvitations = async () => {
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
    };

    useEffect(() => {
        fetchInvitations();
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
        if (!confirm("确定要删除这个邀请报告吗？")) return;

        try {
            const res = await fetch(`/api/admin/invitations/${id}`, {
                method: "DELETE",
            });

            if (res.status === 401) {
                router.push("/admin/login");
                return;
            }

            if (res.ok) {
                await fetchInvitations();
                setSuccessMessage("删除成功");
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
            event_time: invitation.event_time ? invitation.event_time.substring(0, 16) : "",
            image: invitation.image || "",
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
            video_link: "",
        });
        setEditingId(null);
        setShowForm(false);
        setActiveTab("zh");
        setValidationErrors([]);
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
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === "zh"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                中文
                            </button>
                            <button
                                onClick={() => setActiveTab("en")}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === "en"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setActiveTab("ja")}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
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
                                            标题（中文）*
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title_zh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title_zh: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            )}

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
                                    folder="invitations"
                                    label="图片"
                                />

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Bilibili BV号
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.video_link}
                                        onChange={(e) =>
                                            setFormData({ ...formData, video_link: e.target.value })
                                        }
                                        placeholder="例如：BV1xx411c7mD"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        请输入 Bilibili 视频的 BV 号，例如：BV1xx411c7mD
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSubmitting ? "提交中..." : (editingId ? "更新" : "创建")}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    取消
                                </button>
                            </div>
                        </form>
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
                                        未找到邀请报告。点击"添加邀请报告"创建一个。
                                    </td>
                                </tr>
                            ) : (
                                invitations.map((invitation, index) => (
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
                                                <div className="text-xs text-muted-foreground">
                                                    {invitation.speaker_institution_zh}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {invitation.event_time
                                                ? new Date(invitation.event_time).toLocaleString("zh-CN")
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
