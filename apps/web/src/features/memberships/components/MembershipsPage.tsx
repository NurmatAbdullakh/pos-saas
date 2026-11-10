import { useState } from "react";
import { Mail, MoreHorizontal, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { useMemberships, useMembershipMutations } from "../hooks/useMemberships";
import { useWorkspaceStore } from "../../workspace/store/workspace.store";
import { PageHeader } from "../../../shared/components/PageHeader";
import { EmptyState } from "../../../shared/components/EmptyState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { Button } from "../../../shared/components/ui/button";
import { Dialog } from "../../../shared/components/ui/dialog";
import { MemberForm } from "./MemberForm";
import type { BusinessMember, MemberRole } from "../types/membership.types";

const roleMeta: Record<MemberRole, { label: string; description: string; classes: string }> = {
  owner: { label: "Owner", description: "Full business access", classes: "bg-violet-50 text-violet-700" },
  manager: { label: "Manager", description: "Manage stores and operations", classes: "bg-sky-50 text-sky-700" },
  cashier: { label: "Cashier", description: "Products and sales access", classes: "bg-amber-50 text-amber-700" },
};

export function MembershipsPage({ accessToken, currentUserId }: { accessToken: string; currentUserId: string }) {
  const businessId = useWorkspaceStore((state) => state.selectedBusinessId) ?? "";
  const { data: members = [], isLoading, error } = useMemberships(accessToken, businessId);
  const mutations = useMembershipMutations(accessToken, businessId);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<BusinessMember | null>(null);
  const [search, setSearch] = useState("");

  const filtered = members.filter((member) => [member.name, member.email].some((value) => value.toLowerCase().includes(search.toLowerCase())));
  async function addMember(values: { name: string; email: string; password: string; role: MemberRole }) {
    await mutations.create.mutateAsync(values);
    setFormOpen(false);
  }
  async function removeMember() {
    if (!deleting) return;
    await mutations.remove.mutateAsync(deleting.id);
    setDeleting(null);
  }

  return (
    <div>
      <PageHeader eyebrow="Workspace access" title="Team members" description="Invite people and control what they can access." action={<Button onClick={() => setFormOpen(true)} disabled={!businessId}><Plus className="size-4" /> Add member</Button>} />
      {!businessId ? <EmptyState title="Select a business first" description="Choose a business from the workspace switcher to manage its team." icon={<Users className="size-5" />} /> : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {(["owner", "manager", "cashier"] as const).map((role) => (
              <div key={role} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-700">{roleMeta[role].label}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${roleMeta[role].classes}`}>{members.filter((member) => member.role === role).length}</span></div>
                <p className="mt-1 text-xs text-slate-500">{roleMeta[role].description}</p>
              </div>
            ))}
          </div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">{members.length} team {members.length === 1 ? "member" : "members"}</p>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email…" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 sm:max-w-xs" />
          </div>
          {isLoading ? <LoadingState label="Loading team members…" /> : error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}. You may not have permission to view team members.</div> : filtered.length === 0 ? (
            <EmptyState title={search ? "No team members found" : "Build your team"} description={search ? "Try another name or email." : "Invite managers and cashiers so your team can work in the same business workspace."} icon={<Users className="size-5" />} action={!search ? <Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> Add first member</Button> : undefined} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_180px_56px] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid">
                <span>Member</span><span>Email</span><span>Role</span><span />
              </div>
              <div className="divide-y divide-slate-100">
                {filtered.map((member) => {
                  const isSelf = member.user_id === currentUserId;
                  const role = roleMeta[member.role];
                  return (
                    <div key={member.id} className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_180px_56px] md:items-center md:gap-4 md:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{member.name.slice(0, 1).toUpperCase()}</div>
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{member.name} {isSelf && <span className="ml-1 text-[10px] font-medium text-slate-400">(You)</span>}</p><p className="mt-0.5 text-xs text-slate-400 md:hidden">{member.email}</p></div>
                      </div>
                      <p className="hidden truncate text-sm text-slate-500 md:block">{member.email}</p>
                      <div className="flex items-center gap-2">
                        {member.role === "owner" ? <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${role.classes}`}><ShieldCheck className="size-3.5" /> Owner</span> : (
                          <select aria-label={`Role for ${member.name}`} value={member.role} disabled={mutations.updateRole.isPending || isSelf} onChange={(event) => void mutations.updateRole.mutateAsync({ id: member.id, role: event.target.value as MemberRole })} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-400">
                            <option value="manager">Manager</option><option value="cashier">Cashier</option>
                          </select>
                        )}
                      </div>
                      <div className="flex justify-end">
                        {!isSelf && member.role !== "owner" && <Button variant="ghost" size="icon" aria-label={`Remove ${member.name}`} className="text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => setDeleting(member)}><Trash2 className="size-4" /></Button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
      <Dialog open={formOpen} onOpenChange={setFormOpen} title="Add team member" description="Create a team account and assign access to this business.">
        <MemberForm isPending={mutations.create.isPending} onSubmit={addMember} onCancel={() => setFormOpen(false)} />
      </Dialog>
      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="Remove team member?" description={`${deleting?.name ?? "This member"} will lose access to this business.`}>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" disabled={mutations.remove.isPending} onClick={() => void removeMember()}>{mutations.remove.isPending ? "Removing…" : "Remove member"}</Button>
        </div>
      </Dialog>
      {(mutations.create.error || mutations.updateRole.error || mutations.remove.error) && <p role="alert" className="mt-4 text-sm text-rose-600">{(mutations.create.error || mutations.updateRole.error || mutations.remove.error)?.message}</p>}
    </div>
  );
}
