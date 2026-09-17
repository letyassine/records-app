interface LoadingProps {
  label?: string;
}

function Loading({ label = "Loading…" }: LoadingProps) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-12 text-slate-500"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default Loading;
