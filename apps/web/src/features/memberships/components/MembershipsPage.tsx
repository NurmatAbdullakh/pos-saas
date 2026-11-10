import { useState } from "react";
import { Search, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useMemberships, useMembershipMutations } from "../hooks/useMemberships";
import { useWorkspaceStore } from "../../workspace/store/workspace.store";
import { PageHeader } from "../../../shared/components/PageHeader";
import { EmptyState } from "../../../shared/components/EmptyState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { Button } from "../../../shared/components/ui/button";
import { Dialog } from "../../../shared/components/ui/dialog";
import { MemberForm } from "./MemberForm";
import type { BusinessMember, MemberRole } from "../types/membership.types";

interface MembershipsPageProps {
  accessToken: string;
  currentUserId: string;
}

const roleLabels: Record<MemberRole, string> = {
  owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
};

export function MembershipsPage({ accessToken, currentUserId }: MembershipsPageProps) {
  const businessId = useWorkspaceStore((state) => state.selectedBusinessId) ?? "";
  const {
    data: members = [],
    isLoading,
    error,
  } = useMemberships(accessToken, businessId);
  const mutations = useMembershipMutations(accessToken, businessId);
  const currentMember = members.find((member) => member.user_id === currentUserId);
  const canManageMembers = currentMember?.role === "owner";

  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<BusinessMember | null>(null);
  const [search, setSearch] = useState("");

  const filteredMembers = members.filter((member) => {
    const query = search.trim().toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  });

  async function addMember(values: {
    name: string;
    email: string;
    password: string;
    role: "manager" | "cashier";
  }) {
    try {
      await mutations.create.mutateAsync(values);
      setFormOpen(false);
    } catch {
      // Keep the dialog open and show the API error in MemberForm.
    }
  }

  async function changeRole(memberId: string, role: MemberRole) {
    try {
      await mutations.updateRole.mutateAsync({ id: memberId, role });
    } catch {
      // The mutation error is displayed above the member list.
    }
  }

  async function removeMember() {
    if (!deleting) return;

    try {
      await mutations.remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // Keep the confirmation dialog open so the API error remains visible.
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Business access"
        title="Team members"
        description="Manage who can access this business and what they are allowed to do."
        action={
          canManageMembers ? (
            <Button
              onClick={() => {
                mutations.create.reset();
                setFormOpen(true);
              }}
              disabled={!businessId}
            >
              <UserPlus className="size-4" />
              Add member
            </Button>
          ) : undefined
        }
      />

      {!businessId ? (
        <EmptyState
          title="Select a business first"
          description="Choose a business from the workspace switcher to view its team."
          icon={<Users className="size-5" />}
        />
      ) : isLoading ? (
        <LoadingState label="Loading team members…" />
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error.message}
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {members.length} {members.length === 1 ? "member" : "members"}
              {!canManageMembers && " · View only"}
            </p>
            <label className="relative block w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search team members"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>
          </div>

          {mutations.updateRole.error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {mutations.updateRole.error.message}
            </p>
          )}

          {filteredMembers.length === 0 ? (
            <EmptyState
              title={search ? "No team members found" : "No team members yet"}
              description={
                search
                  ? "Try another name or email address."
                  : "Add people to your business and assign them the right access role."
              }
              icon={<Users className="size-5" />}
              action={
                !search && canManageMembers ? (
                  <Button onClick={() => setFormOpen(true)}>
                    <UserPlus className="size-4" />
                    Add first member
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-3">
              {filteredMembers.map((member) => {
                const isCurrentUser = member.user_id === currentUserId;
                const isOwner = member.role === "owner";
                const canEditMember =
                  canManageMembers && !isCurrentUser && !isOwner;

                return (
                  <article
                    key={member.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
                        {member.name.trim().slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-sm font-semibold text-slate-900">
                            {member.name}
                          </h2>
                          {isCurrentUser && (
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                              You
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      {canEditMember ? (
                        <label className="sr-only" htmlFor={`role-${member.id}`}>
                          Role for {member.name}
                        </label>
                      ) : null}
                      {canEditMember ? (
                        <select
                          id={`role-${member.id}`}
                          aria-label={`Role for ${member.name}`}
                          value={member.role}
                          disabled={mutations.updateRole.isPending}
                          onChange={(event) =>
                            void changeRole(
                              member.id,
                              event.target.value as MemberRole,
                            )
                          }
                          className="h-9 min-w-32 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50"
                        >
                          <option value="manager">Manager</option>
                          <option value="cashier">Cashier</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            isOwner
                              ? "bg-amber-50 text-amber-700"
                              : member.role === "manager"
                                ? "bg-sky-50 text-sky-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isOwner && <ShieldCheck className="size-3.5" />}
                          {roleLabels[member.role]}
                        </span>
                      )}

                      {canEditMember && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          aria-label={`Remove ${member.name}`}
                          title="Remove member"
                          onClick={() => {
                            mutations.remove.reset();
                            setDeleting(member);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Add a team member"
        description="Create an account and give this person access to the selected business."
      >
        <MemberForm
          isPending={mutations.create.isPending}
          error={mutations.create.error?.message}
          onSubmit={addMember}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Remove team member?"
        description={`Remove “${deleting?.name ?? ""}” from this business? Their user account will not be deleted.`}
      >
        {mutations.remove.error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
          >
            {mutations.remove.error.message}
          </p>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={mutations.remove.isPending}
            onClick={() => void removeMember()}
          >
            {mutations.remove.isPending ? "Removing…" : "Remove member"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
