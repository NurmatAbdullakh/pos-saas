import { useEffect } from "react";
import { Building2, ChevronDown, LayoutDashboard, LogOut, Store, Users } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Brand } from "../../../shared/components/Brand";
import { Button } from "../../../shared/components/ui/button";
import { LoadingState } from "../../../shared/components/LoadingState";
import { useBusinesses } from "../../businesses/hooks/useBusinesses";
import { useWorkspaceStore } from "../store/workspace.store";
import type { AuthUser } from "../../auth/types/auth.types";

export interface WorkspaceOutletContext {
  accessToken: string;
  user: AuthUser;
}

interface WorkspaceLayoutProps {
  accessToken: string;
  user: AuthUser;
  isSigningOut: boolean;
  onLogout: () => void;
}

const navigation = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/businesses", label: "Businesses", icon: Building2 },
  { to: "/stores", label: "Stores", icon: Store },
  { to: "/team", label: "Team members", icon: Users },
];

export function WorkspaceLayout({ accessToken, user, isSigningOut, onLogout }: WorkspaceLayoutProps) {
  const { data: businesses = [], isLoading } = useBusinesses(accessToken);
  const selectedBusinessId = useWorkspaceStore((state) => state.selectedBusinessId);
  const setSelectedBusinessId = useWorkspaceStore((state) => state.setSelectedBusinessId);
  const location = useLocation();
  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId);

  useEffect(() => {
    if (isLoading) return;
    if (!businesses.length) {
      if (selectedBusinessId) setSelectedBusinessId(null);
      return;
    }
    if (!businesses.some((business) => business.id === selectedBusinessId)) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId, setSelectedBusinessId]);

  const navLinks = navigation.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) =>
      `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`
    }>
      <Icon className="size-[17px]" /><span>{label}</span>
    </NavLink>
  ));

  return (
    <div className="workspace-shell min-h-screen bg-[#f7f8fc] text-slate-900 lg:flex">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">
        <div className="px-2"><Brand /></div>
        <div className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</div>
        <nav className="mt-3 flex flex-col gap-1">{navLinks}</nav>
        <div className="mt-auto rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{user.name.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{user.name}</p><p className="truncate text-[11px] text-slate-500">{user.email}</p></div>
          </div>
          <Button variant="ghost" className="mt-3 h-8 w-full justify-start px-2 text-xs" onClick={onLogout} disabled={isSigningOut}><LogOut className="size-3.5" /> {isSigningOut ? "Signing out…" : "Sign out"}</Button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 lg:hidden"><Brand /></div>
            <div className="hidden min-w-0 items-center gap-2 text-xs text-slate-400 lg:flex"><span>Workspace</span><span>/</span><span className="font-semibold text-slate-700">{navigation.find((item) => item.to === location.pathname)?.label ?? "Overview"}</span></div>
            <div className="ml-auto flex items-center gap-3">
              <label className="relative flex min-w-0 items-center">
                <Building2 className="pointer-events-none absolute left-3 size-4 text-slate-400" />
                <select aria-label="Select business" value={selectedBusinessId ?? ""} onChange={(event) => setSelectedBusinessId(event.target.value || null)} disabled={isLoading || businesses.length === 0} className="h-10 max-w-[190px] appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 sm:max-w-[240px]">
                  {businesses.length === 0 ? <option value="">No business yet</option> : businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-slate-400" />
              </label>
              <div className="hidden size-9 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 sm:grid">{user.name.slice(0, 1).toUpperCase()}</div>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Sign out" onClick={onLogout} disabled={isSigningOut}><LogOut className="size-4" /></Button>
            </div>
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto pb-0.5 lg:hidden">{navLinks}</nav>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-9">
          <Outlet context={{ accessToken, user } satisfies WorkspaceOutletContext} />
        </main>
        <footer className="border-t border-slate-200/70 px-6 py-4 text-center text-[11px] text-slate-400">POS SaaS <span className="mx-1.5 text-slate-300">·</span> Your business, in control</footer>
      </div>
    </div>
  );
}
