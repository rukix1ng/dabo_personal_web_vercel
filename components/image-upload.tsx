"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    onUploaded?: (result: { url: string; url_en?: string; warnings?: string[] }) => void;
    extraUrls?: Array<{ label: string; value: string }>;
    folder?: string;
    label?: string;
    required?: boolean;
}

export function ImageUpload({
    value,
    onChange,
    onUploaded,
    extraUrls = [],
    folder = "uploads",
    label = "图片",
    required = false,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [previewSrc, setPreviewSrc] = useState(value);

    useEffect(() => {
        setPreviewSrc(value);
    }, [value]);

    const handlePreviewError = () => {
        const fallback = extraUrls.find((u) => u.value && u.value !== previewSrc)?.value;
        if (fallback) setPreviewSrc(fallback);
    };
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            setError("只支持 JPG、PNG、GIF、WebP 格式的图片");
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError("图片大小不能超过 5MB");
            return;
        }

        setError("");
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", folder);

            const res = await fetch("/api/upload/image", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "上传失败");
            }

            const data = await res.json();
            onChange(data.url);
            onUploaded?.(data);
            setWarning(Array.isArray(data.warnings) ? data.warnings.join("；") : "");
        } catch (err) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "上传失败，请重试");
            setWarning("");
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = () => {
        onChange("");
        setError("");
        setWarning("");
        setPreviewSrc("");
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {value ? (
                <div className="relative group">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                        {previewSrc ? (
                            <Image
                                src={previewSrc}
                                alt="Uploaded image"
                                fill
                                className="object-contain"
                                onError={handlePreviewError}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                <span className="text-sm text-muted-foreground">暂无图片</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        title="删除图片"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {extraUrls
                        .filter((item) => item.value)
                        .map((item) => (
                            <div key={item.label} className="mt-1 text-xs text-muted-foreground break-all">
                                <span className="font-medium">{item.label}：</span>
                                {item.value}
                            </div>
                        ))}
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 transition-colors hover:border-primary hover:bg-muted"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="mt-2 text-sm text-muted-foreground">上传中...</p>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm font-medium text-foreground">
                                点击上传图片
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                支持 JPG、PNG、GIF、WebP，最大 5MB
                            </p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {!error && warning && (
                <p className="text-sm text-amber-600 dark:text-amber-400">{warning}</p>
            )}

            {!value && (
                <>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="或直接输入图片URL"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {extraUrls
                        .filter((item) => item.value)
                        .map((item) => (
                            <div key={item.label} className="text-xs text-muted-foreground break-all">
                                <span className="font-medium">{item.label}：</span>
                                {item.value}
                            </div>
                        ))}
                </>
            )}
        </div>
    );
}
