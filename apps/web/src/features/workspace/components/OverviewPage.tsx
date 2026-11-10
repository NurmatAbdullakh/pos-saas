import { ArrowUpRight, Building2, MapPin, Users, WalletCards } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { PageHeader } from "../../../shared/components/PageHeader";
import { EmptyState } from "../../../shared/components/EmptyState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { Button } from "../../../shared/components/ui/button";
import { useBusinesses } from "../../businesses/hooks/useBusinesses";
import { useStores } from "../../stores/hooks/useStores";
import { useMemberships } from "../../memberships/hooks/useMemberships";
import { useWorkspaceStore } from "../store/workspace.store";
import type { WorkspaceOutletContext } from "./WorkspaceLayout";

export function OverviewPage() {
  const { accessToken, user } = useOutletContext<WorkspaceOutletContext>();
  const selectedBusinessId = useWorkspaceStore((state) => state.selectedBusinessId) ?? "";
  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses(accessToken);
  const { data: stores = [], isLoading: storesLoading } = useStores(accessToken, selectedBusinessId);
  const { data: members = [], isLoading: membersLoading } = useMemberships(accessToken, selectedBusinessId);
  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId);

  if (businessesLoading) return <LoadingState label="Preparing your workspace…" />;

  if (!businesses.length) {
    return (
      <div className="mx-auto max-w-2xl pt-8">
        <div className="mb-7 text-center"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600">Welcome to POS SaaS</p><h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950">Let’s set up your workspace</h1><p className="mt-2 text-sm text-slate-500">Create your first business to start organizing stores and inviting your team.</p></div>
        <EmptyState title="Your business starts here" description="A workspace keeps your branches, team and POS operations organized in one place." icon={<Building2 className="size-5" />} action={<Link to="/businesses" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">Create your first business <ArrowUpRight className="size-4" /></Link>} />
      </div>
    );
  }

  const stats = [
    { label: "Businesses", value: businesses.length, note: "Workspaces you belong to", icon: Building2, tint: "bg-indigo-50 text-indigo-600", href: "/businesses" },
    { label: "Stores", value: storesLoading ? "—" : stores.length, note: "Locations in this business", icon: MapPin, tint: "bg-sky-50 text-sky-700", href: "/stores" },
    { label: "Team members", value: membersLoading ? "—" : members.length, note: "People with workspace access", icon: Users, tint: "bg-amber-50 text-amber-700", href: "/team" },
  ];

  return (
    <div>
      <PageHeader eyebrow="Workspace overview" title={`Good to see you, ${user.name.split(" ")[0]}.`} description="Here’s what’s happening across your POS workspace." />
      <section className="mb-7 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-indigo-900/10 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div><p className="text-xs font-semibold text-indigo-100">CURRENT BUSINESS</p><h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">{selectedBusiness?.name ?? "Select a business"}</h2><p className="mt-1 text-sm text-indigo-100/80">Your operations, team and locations in one place.</p></div>
          <Link to="/businesses" className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/25">Manage business <ArrowUpRight className="size-4" /></Link>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, note, icon: Icon, tint, href }) => (
          <Link key={label} to={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">{label}</span><span className={`grid size-10 place-items-center rounded-xl ${tint}`}><Icon className="size-5" /></span></div>
            <p className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
            <div className="mt-1 flex items-center justify-between"><span className="text-xs text-slate-400">{note}</span><ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-indigo-600" /></div>
          </Link>
        ))}
      </div>
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2"><WalletCards className="size-4 text-indigo-600" /><h2 className="text-sm font-bold text-slate-900">Quick actions</h2></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[{ label: "Add another business", href: "/businesses", icon: Building2 }, { label: "Create a store", href: "/stores", icon: MapPin }, { label: "Invite team member", href: "/team", icon: Users }].map(({ label, href, icon: Icon }) => <Link key={label} to={href} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-100 hover:bg-indigo-50/50 hover:text-indigo-700"><span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon className="size-4" /></span>{label}<ArrowUpRight className="ml-auto size-4 text-slate-300" /></Link>)}
        </div>
      </section>
    </div>
  );
}
