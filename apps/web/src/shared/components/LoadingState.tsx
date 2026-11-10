export function LoadingState({ label = "Loading your workspace…" }: { label?: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
      <span className="size-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      {label}
    </div>
  );
}
