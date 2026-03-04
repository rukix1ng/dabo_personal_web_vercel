"use client";

import { ExternalLink } from "lucide-react";
import { ImagePreview } from "@/components/image-preview";

interface Paper {
    id: string;
    title: string;
    authors: string[];
    journal: string;
    journalName: string | null;
    date: string;
    url: string;
    image: string | null;
    description: string | null;
    sponsorLink: string | null;
}

interface PapersPageClientProps {
    locale: string;
    papers: {
        title: string;
        description: string;
        noResults: string;
        sponsorLabel: string;
    };
    mockPapers: Paper[];
}

export function PapersPageClient({ locale, papers, mockPapers }: PapersPageClientProps) {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-2">
                <div className="h-8 w-1.5 bg-primary rounded-full" />
                <h1 className="text-2xl font-bold text-foreground sm:text-2xl">
                    {papers.title}
                </h1>
            </div>

            {mockPapers.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">{papers.noResults}</p>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-border">
                    {mockPapers.map((paper, index) => (
                        <article
                            key={paper.id}
                            className="group flex flex-col sm:flex-row gap-4 py-6 transition-colors hover:bg-muted/30"
                        >
                            {/* Image Container */}
                            {paper.image && (
                                <div className="w-full sm:w-48 lg:w-56 shrink-0">
                                    <ImagePreview
                                        src={paper.image}
                                        alt={paper.title}
                                        className="w-full h-auto rounded-lg transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Content Area */}
                            <div className="flex flex-1 flex-col gap-2">
                                <div className="flex items-start gap-2">
                                    {paper.url && paper.url !== '#' ? (
                                        <a
                                            href={paper.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-bold text-foreground hover:text-primary transition-colors inline-flex items-start gap-2 group/link"
                                        >
                                            <span>{paper.title}</span>
                                            <ExternalLink className="w-4 h-4 mt-1 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                                        </a>
                                    ) : (
                                        <h3 className="text-lg font-bold text-foreground">
                                            {paper.title}
                                        </h3>
                                    )}
                                    {paper.journalName && (
                                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-primary flex-shrink-0 mt-1">
                                            {paper.journalName}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 text-sm">
                                    {paper.authors.length > 0 && paper.authors[0] && (
                                        <p className="text-muted-foreground">
                                            {paper.authors.join(", ")}
                                        </p>
                                    )}
                                    {paper.journal && (
                                        <div className="text-muted-foreground flex items-center gap-1">
                                            <span>{papers.sponsorLabel}：</span>
                                            {paper.sponsorLink && paper.sponsorLink !== '#' ? (
                                                <a
                                                    href={paper.sponsorLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary underline hover:text-primary/80 transition-colors font-medium"
                                                >
                                                    {paper.journal}
                                                </a>
                                            ) : (
                                                <span className="font-medium">{paper.journal}</span>
                                            )}
                                        </div>
                                    )}
                                    {paper.description && (
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {paper.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
