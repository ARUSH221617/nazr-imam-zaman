"use client";

import dynamic from "next/dynamic";

const MarkdownEditorInner = dynamic(
  () => import("./MarkdownEditorInner").then((mod) => mod.MarkdownEditorInner),
  {
    ssr: false,
  },
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return <MarkdownEditorInner value={value} onChange={onChange} />;
}

