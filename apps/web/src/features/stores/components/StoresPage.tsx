import { useState } from "react";
import { MapPin, Pencil, Plus, Store as StoreIcon, Trash2 } from "lucide-react";
import { useStores, useStoreMutations } from "../hooks/useStores";
import { useMemberships } from "../../memberships/hooks/useMemberships";
import { useWorkspaceStore } from "../../workspace/store/workspace.store";
import { PageHeader } from "../../../shared/components/PageHeader";
import { EmptyState } from "../../../shared/components/EmptyState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { Button } from "../../../shared/components/ui/button";
import { Dialog } from "../../../shared/components/ui/dialog";
import { StoreForm } from "./StoreForm";
import type { Store } from "../types/store.types";

export function StoresPage({ accessToken, currentUserId }: { accessToken: string; currentUserId: string }) {
  const businessId = useWorkspaceStore((state) => state.selectedBusinessId) ?? "";
  const { data: stores = [], isLoading, error } = useStores(accessToken, businessId);
  const mutations = useStoreMutations(accessToken, businessId);
  const { data: members = [] } = useMemberships(accessToken, businessId);
  const currentMember = members.find((member) => member.user_id === currentUserId);
  const canManageStores = currentMember?.role === "owner" || currentMember?.role === "manager";
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [deleting, setDeleting] = useState<Store | null>(null);
  const [search, setSearch] = useState("");

  const filtered = stores.filter((store) => store.name.toLowerCase().includes(search.toLowerCase()));
  async function save(values: { name: string }) {
    try {
      if (editing) await mutations.update.mutateAsync({ id: editing.id, input: values });
      else await mutations.create.mutateAsync(values);
      setFormOpen(false);
      setEditing(null);
    } catch {
      // The mutation error is rendered inside the open dialog.
    }
  }
  async function removeStore() {
    if (!deleting) return;
    try {
      await mutations.remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // Keep the confirmation dialog open so the user can read the error.
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Business operations" title="Stores" description="Organize branches and locations under your selected business." action={<Button onClick={() => { setEditing(null); setFormOpen(true); }} disabled={!businessId || !canManageStores} title={!canManageStores ? "Only owners and managers can manage stores" : undefined}><Plus className="size-4" /> Add store</Button>} />
      {!businessId ? <EmptyState title="Select a business first" description="Choose a business from the workspace switcher to manage its stores." icon={<StoreIcon className="size-5" />} /> : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">{stores.length} {stores.length === 1 ? "location" : "locations"}</p>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stores…" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 sm:max-w-xs" />
          </div>
          {isLoading ? <LoadingState label="Loading stores…" /> : error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}</div> : filtered.length === 0 ? (
            <EmptyState title={search ? "No stores found" : "Add your first store"} description={search ? "Try a different search term." : "Create locations for your business. You can add a main branch, warehouse or any other location."} icon={<MapPin className="size-5" />} action={!search && canManageStores ? <Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> Add store</Button> : undefined} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((store, index) => (
                <article key={store.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="grid size-11 place-items-center rounded-xl bg-sky-50 text-sky-700"><StoreIcon className="size-5" /></div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">Location {String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h2 className="mt-5 truncate font-display text-lg font-bold text-slate-950">{store.name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="size-3.5" /> Business location</p>
                  {canManageStores && <div className="mt-5 flex justify-end gap-1 border-t border-slate-100 pt-3">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(store); setFormOpen(true); }}><Pencil className="size-3.5" /> Edit</Button>
                    <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setDeleting(store)}><Trash2 className="size-3.5" /> Delete</Button>
                  </div>}
                </article>
              ))}
            </div>
          )}
        </>
      )}
      <Dialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit store" : "Add a store"} description="Give this location a clear name.">
        <StoreForm key={editing?.id ?? "new"} initialName={editing?.name} isPending={mutations.create.isPending || mutations.update.isPending} error={(mutations.create.error || mutations.update.error)?.message} onSubmit={save} onCancel={() => setFormOpen(false)} />
      </Dialog>
      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="Delete store?" description={`Delete “${deleting?.name ?? ""}” from this business?`}>
        {mutations.remove.error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{mutations.remove.error.message}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" disabled={mutations.remove.isPending} onClick={() => void removeStore()}>{mutations.remove.isPending ? "Deleting…" : "Delete store"}</Button>
        </div>
      </Dialog>
      {(mutations.create.error || mutations.update.error || mutations.remove.error) && <p role="alert" className="mt-4 text-sm text-rose-600">{(mutations.create.error || mutations.update.error || mutations.remove.error)?.message}</p>}
    </div>
  );
}
