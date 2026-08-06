"use client";

import { useState } from "react";
import {
  FiCheck,
  FiLock,
  FiPlus,
  FiShield,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { useToast } from "@/context/ToastProvider";
import { roles, type Role } from "@/lib/data/admin";
import { cn } from "@/lib/utils";

const modules = ["Dashboard", "Products", "Orders", "Customers", "Reviews", "Coupons", "Inventory", "Blog", "Reports", "Settings"];
const perms = ["view", "create", "update", "delete"];
const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent-strong",
  info: "bg-info/10 text-info",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/10 text-success",
  secondary: "bg-muted text-muted-foreground",
};

const emptyPermissions = Object.fromEntries(modules.map((m) => [m, ["view"]]));

export default function AdminRolesPage() {
  const { toast, success, error } = useToast();
  const [rolesList, setRolesList] = useState<Role[]>(roles);
  const [editing, setEditing] = useState<Role | null>(null);
  const [matrix, setMatrix] = useState<Record<string, string[]>>(emptyPermissions);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "" });

  const totalMembers = rolesList.reduce((sum, r) => sum + r.members, 0);

  const openMatrix = (role: Role) => {
    setEditing(role);
    setMatrix(JSON.parse(JSON.stringify(role.permissions)));
  };

  const togglePerm = (module: string, perm: string) => {
    setMatrix((prev) => {
      const current = prev[module] ?? [];
      const next = current.includes(perm)
        ? current.filter((p) => p !== perm)
        : [...current, perm];
      return { ...prev, [module]: next };
    });
  };

  const saveMatrix = () => {
    if (!editing) return;
    setRolesList((prev) =>
      prev.map((r) =>
        r.id === editing.id ? { ...r, permissions: matrix } : r
      )
    );
    success("Permissions updated", `${editing.name} permissions have been saved.`);
    setEditing(null);
  };

  const createRole = () => {
    if (!draft.name.trim()) {
      error("Name required", "Enter a role name to continue.");
      return;
    }
    const role: Role = {
      id: `rl-${String(Date.now())}`,
      name: draft.name.trim(),
      description: draft.description.trim() || "Custom role with default view access.",
      members: 0,
      color: "info",
      permissions: JSON.parse(JSON.stringify(emptyPermissions)),
    };
    setRolesList((prev) => [...prev, role]);
    success("Role created", `${role.name} has been added.`);
    setDraft({ name: "", description: "" });
    setCreateOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setRolesList((prev) => prev.filter((r) => r.id !== deleting.id));
    toast("info", "Role deleted", `${deleting.name} has been removed.`);
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Roles & Permissions"
        subtitle="Manage team roles and module-level access controls."
        breadcrumb={[{ label: "Roles & Permissions" }]}
        actions={
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            leftIcon={<FiPlus className="h-4 w-4" aria-hidden />}
          >
            New role
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total roles"
          value={String(rolesList.length)}
          change="+2 this year"
          up
          icon={<FiShield className="h-5 w-5" aria-hidden />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Team members"
          value={String(totalMembers)}
          change="+3.1%"
          up
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          iconClassName="bg-info/10 text-info"
        />
        <StatCard
          label="Modules protected"
          value={String(modules.length)}
          change="All secured"
          up
          icon={<FiLock className="h-5 w-5" aria-hidden />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          label="Custom roles"
          value={String(rolesList.filter((r) => !["Super Admin", "Admin"].includes(r.name)).length)}
          change="Editable"
          up
          icon={<FiCheck className="h-5 w-5" aria-hidden />}
          iconClassName="bg-accent/15 text-accent-strong"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rolesList.map((role) => (
          <Card key={role.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold",
                  colorMap[role.color] ?? "bg-muted text-muted-foreground"
                )}
              >
                {role.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </span>
              <Badge variant="secondary">
                {role.members} {role.members === 1 ? "member" : "members"}
              </Badge>
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">{role.name}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{role.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {Object.entries(role.permissions)
                .filter(([, p]) => p.includes("update") || p.includes("delete"))
                .slice(0, 4)
                .map(([module]) => (
                  <span
                    key={module}
                    className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {module}
                  </span>
                ))}
            </div>
            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => openMatrix(role)}
              >
                Edit permissions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Delete ${role.name}`}
                onClick={() => setDeleting(role)}
              >
                <FiTrash2 className="h-4 w-4 text-destructive" aria-hidden />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit permissions — ${editing?.name}`}
        subtitle="Toggle access for each module. The Super Admin role is fully locked."
        size="xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4 font-semibold">Module</th>
                {perms.map((p) => (
                  <th key={p} className="px-2 py-3 text-center font-semibold capitalize">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modules.map((module) => {
                const locked = editing?.name === "Super Admin";
                return (
                  <tr key={module}>
                    <td className="py-3 pr-4 font-medium text-foreground">{module}</td>
                    {perms.map((perm) => {
                      const checked = (matrix[module] ?? []).includes(perm);
                      const disabled = locked || (perm === "view" && (matrix[module] ?? []).length === 1 && checked);
                      return (
                        <td key={perm} className="px-2 py-3 text-center">
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => togglePerm(module, perm)}
                            aria-label={`${perm} ${module}`}
                            className={cn(
                              "mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                              checked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:bg-muted",
                              disabled && "cursor-not-allowed opacity-40"
                            )}
                          >
                            {checked && <FiCheck className="h-3.5 w-3.5" aria-hidden />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={saveMatrix}>
            Save changes
          </Button>
        </div>
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create role"
        subtitle="Define a new role with default view-only access."
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Role name
            </label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Content Manager"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="What can this role do?"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={createRole}>
              Create role
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete role"
        description={`Delete "${deleting?.name}"? Team members assigned this role will lose access until reassigned.`}
        confirmLabel="Delete role"
        variant="destructive"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
