import { useState } from "react";
import { Building2, MoreHorizontal, Pencil, Plus, Store, Trash2 } from "lucide-react";
import { useBusinesses, useBusinessMutations } from "../hooks/useBusinesses";
import { useWorkspaceStore } from "../../workspace/store/workspace.store";
import { PageHeader } from "../../../shared/components/PageHeader";
import { EmptyState } from "../../../shared/components/EmptyState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { Button } from "../../../shared/components/ui/button";
import { Dialog } from "../../../shared/components/ui/dialog";
import { BusinessForm } from "./BusinessForm";
import type { Business } from "../types/business.types";

interface BusinessesPageProps {
  accessToken: string;
  userId: string;
}

export function BusinessesPage({ accessToken, userId }: BusinessesPageProps) {
  const { data: businesses = [], isLoading, error } = useBusinesses(accessToken);
  const mutations = useBusinessMutations(accessToken);
  const setSelectedBusinessId = useWorkspaceStore((state) => state.setSelectedBusinessId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Business | null>(null);
  const [deleting, setDeleting] = useState<Business | null>(null);
  const [search, setSearch] = useState("");

  const filtered = businesses.filter((business) => business.name.toLowerCase().includes(search.toLowerCase()));
  const isPending = mutations.create.isPending || mutations.update.isPending;

  async function save(values: { name: string }) {
    if (editing) {
      await mutations.update.mutateAsync({ id: editing.id, input: values });
    } else {
      const created = await mutations.create.mutateAsync(values);
      setSelectedBusinessId(created.id);
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function removeBusiness() {
    if (!deleting) return;
    await mutations.remove.mutateAsync(deleting.id);
    if (useWorkspaceStore.getState().selectedBusinessId === deleting.id) setSelectedBusinessId(null);
    setDeleting(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Workspace settings"
        title="Businesses"
        description="Manage the businesses connected to your POS workspace."
        action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="size-4" /> Add business</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">{businesses.length} {businesses.length === 1 ? "business" : "businesses"} in your workspace</p>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search businesses…" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 sm:max-w-xs" />
      </div>

      {isLoading ? <LoadingState label="Loading businesses…" /> : error ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title={search ? "No matching businesses" : "Start with your first business"} description={search ? "Try another search term." : "Create a business to organize stores, team members and day-to-day operations."} action={!search ? <Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> Create business</Button> : undefined} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((business) => {
            const isOwner = business.created_by === userId;
            return (
              <article key={business.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Building2 className="size-5" /></div>
                  <div className="flex items-center gap-1">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isOwner ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{isOwner ? "Owner" : "Member"}</span>
                    {isOwner && (
                      <div className="relative">
                        <details className="group/menu">
                          <summary aria-label={`Actions for ${business.name}`} className="grid size-8 cursor-pointer list-none place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal className="size-4" /></summary>
                          <div className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                            <button onClick={() => { setEditing(business); setFormOpen(true); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Pencil className="size-3.5" /> Edit</button>
                            <button onClick={() => setDeleting(business)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"><Trash2 className="size-3.5" /> Delete</button>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
                <h2 className="mt-5 truncate font-display text-lg font-bold text-slate-950">{business.name}</h2>
                <p className="mt-1 text-xs text-slate-500">Business workspace</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-2 text-xs text-slate-500"><Store className="size-3.5" /> Manage locations</span>
                  <Button variant="subtle" size="sm" onClick={() => setSelectedBusinessId(business.id)}>Open workspace</Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit business" : "Create a business"} description="Keep your business details clear and recognizable.">
        <BusinessForm key={editing?.id ?? "new"} initialName={editing?.name} isPending={isPending} onSubmit={save} onCancel={() => setFormOpen(false)} />
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="Delete business?" description={`This will remove “${deleting?.name ?? ""}” and its workspace relationship. This action cannot be undone.`}>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" disabled={mutations.remove.isPending} onClick={() => void removeBusiness()}>{mutations.remove.isPending ? "Deleting…" : "Delete business"}</Button>
        </div>
      </Dialog>
      {(mutations.create.error || mutations.update.error || mutations.remove.error) && <p role="alert" className="mt-4 text-sm text-rose-600">{(mutations.create.error || mutations.update.error || mutations.remove.error)?.message}</p>}
    </div>
  );
}
