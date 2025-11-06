// lib/remarkCallouts.ts
// Transforms blockquotes starting with [!NOTE] / [!TIP] / [!INFO] / [!WARNING] / [!CAUTION] / [!QUOTE]
// into <div class="callout callout-{kind}">…</div>
export default function remarkCallouts() {
  return (tree: any) => {
    function walk(node: any) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child);
      }
      if (
        node.type === "blockquote" &&
        Array.isArray(node.children) &&
        node.children[0]?.type === "paragraph" &&
        Array.isArray(node.children[0].children) &&
        node.children[0].children[0]?.type === "text"
      ) {
        const firstText: string = node.children[0].children[0].value || "";
        const m = /^\s*\[\!(NOTE|TIP|INFO|WARNING|CAUTION|QUOTE)\]\s*/i.exec(firstText);
        if (!m) return;
        const kind = m[1].toLowerCase();

        // Strip the marker from the first text node
        node.children[0].children[0].value = firstText.replace(/^\s*\[\!.*?\]\s*/, "");

        // Convert blockquote → div.callout.callout-{kind}
        node.data = node.data || {};
        node.data.hName = "div";
        node.data.hProperties = {
          ...(node.data.hProperties || {}),
          className: ["callout", `callout-${kind}`],
        };
      }
    }
    walk(tree);
  };
}
