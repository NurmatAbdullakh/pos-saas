import { useEffect } from "react";
import { Building2, Store, Users } from "lucide-react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { useBusinesses } from "../hooks/useBusinesses";
import { useWorkspaceStore } from "../../workspace/store/workspace.store";
import { LoadingState } from "../../../shared/components/LoadingState";
import { EmptyState } from "../../../shared/components/EmptyState";

interface BusinessWorkspacePageProps {
  accessToken: string;
}

export function BusinessWorkspacePage({ accessToken }: BusinessWorkspacePageProps) {
  const { businessId = "" } = useParams<{ businessId: string }>();
  const { data: businesses = [], isLoading, error } = useBusinesses(accessToken);
  const selectedBusinessId = useWorkspaceStore((state) => state.selectedBusinessId);
  const setSelectedBusinessId = useWorkspaceStore((state) => state.setSelectedBusinessId);
  const business = businesses.find((item) => item.id === businessId);

  useEffect(() => {
    if (businessId && selectedBusinessId !== businessId) {
      setSelectedBusinessId(businessId);
    }
  }, [businessId, selectedBusinessId, setSelectedBusinessId]);

  if (isLoading || selectedBusinessId !== businessId) {
    return <LoadingState label="Opening business workspace…" />;
  }

  if (error) {
    return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}</div>;
  }

  if (!business) {
    return (
      <EmptyState
        title="Business not found"
        description="This business may have been deleted or you may not have access to it."
        icon={<Building2 className="size-5" />}
      />
    );
  }

  const tabs = [
    { to: `/businesses/${businessId}`, label: "Overview", end: true, icon: Building2 },
    { to: `/businesses/${businessId}/stores`, label: "Stores", icon: Store },
    { to: `/businesses/${businessId}/members`, label: "Team members", icon: Users },
  ];

  return (
    <section>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600">Business workspace</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{business.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Manage this business, its locations and team members in one place.</p>
        <nav aria-label="Business sections" className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {tabs.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </section>
  );
}
