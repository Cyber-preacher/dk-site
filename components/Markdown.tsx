// components/Markdown.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import Link from "next/link";

function linkifyWiki(md: string, slugMap: Record<string, string>) {
  return md.replace(/\[\[([^\]]+)\]\]/g, (_, body) => {
    const [targetRaw, labelRaw] = String(body).split("|").map(s => s.trim());
    const key = targetRaw.toLowerCase();
    const slug = slugMap[key] || targetRaw.toLowerCase().replace(/\s+/g, "-");
    const label = labelRaw || targetRaw;
    return `[${label}](/notes/${slug})`;
  });
}

export default function Markdown({
  source,
  slugMap,
}: {
  source: string;
  slugMap: Record<string, string>;
}) {
  const transformed = React.useMemo(() => linkifyWiki(source, slugMap), [source, slugMap]);

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }], rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            const internal = href.startsWith("/") || href.startsWith("#");
            if (internal) return <Link href={href}>{children}</Link>;
            return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
          },
        }}
      >
        {transformed}
      </ReactMarkdown>
    </div>
  );
}
