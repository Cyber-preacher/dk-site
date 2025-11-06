---
title: "Callouts & Code Demo"
slug: "callouts-and-code-demo"
date: "2025-11-05"
tags: ["demo","markdown","code"]
links: []
excerpt: "Testing [!NOTE] callouts and highlighted code blocks."
---

> [!NOTE]
> This is a **NOTE** callout. It should render as a glassy panel with a neon left border.

> [!WARNING]
> This is a **WARNING** callout. Useful for risky steps.

### TypeScript block
```ts
export function add(a: number, b: number) {
  return a + b;
}
console.log(add(2, 3));
Inline code like const x = 1 should have a subtle pill background.

See [[Second note]] for a backlink test.
