import type { ReactNode } from "react";
import { Building2 } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
        {icon ?? <Building2 className="size-5" />}
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
