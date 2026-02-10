// components/Markdown.tsx
"use client";

import React, { type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import remarkCallouts from "@/lib/remarkCallouts";

type MarkdownProps = {
  source: string;
  // Optional future use for WikiLinks, etc.
  slugMap?: Record<string, string>;
};

// Precise typing for the custom code renderer
type CodeRendererProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export default function Markdown({ source }: MarkdownProps) {
  return (
    <div className="prose">
      <ReactMarkdown
        // remark (Markdown → mdast)
        remarkPlugins={[remarkGfm, remarkCallouts]}
        // rehype (mdast → hast → html)
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          [rehypeHighlight, { ignoreMissing: true }],
        ]}
        components={{
          code({ inline, className, children, ...props }: CodeRendererProps) {
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
