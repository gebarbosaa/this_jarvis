export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-border bg-transparent px-4 py-8 text-center text-sm text-ink-faint">
      {text}
    </div>
  );
}
