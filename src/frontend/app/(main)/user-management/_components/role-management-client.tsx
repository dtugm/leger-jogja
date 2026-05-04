"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";

import DeleteConfirmDialog from "@/components/delete-confirm-dialog";
import SearchInput from "@/components/search";
import StatCards from "@/components/stat-cards";
import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";
import UserTable, { type User } from "@/components/user-management/user-table";

import UserForm, { type UserFormData } from "../../../../components/user-management/user-form";

export default function RoleManagementClient({ initialUsers }: { initialUsers: User[] }) {
const [users, setUsers]               = useState<User[]>(initialUsers);
const [query, setQuery]               = useState("");
const [editTarget, setEditTarget]     = useState<User | null>(null);
const [addOpen, setAddOpen]           = useState(false);
const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

const filtered    = users.filter(
    (u) =>
    u.name.toLowerCase().includes(query.toLowerCase())     ||
    u.username.toLowerCase().includes(query.toLowerCase()) ||
    u.id.toLowerCase().includes(query.toLowerCase())       ||
    u.email.toLowerCase().includes(query.toLowerCase()),
);
const superadmins = filtered.filter((u) => u.role === "Superadmin").length;
const admins      = filtered.filter((u) => u.role === "Admin").length;
const guests      = filtered.filter((u) => u.role === "Guest").length;

async function handleEditSubmit(data: UserFormData) {
    if (!editTarget) return;
    setUsers((prev) => prev.map((u) => (u.id === editTarget.id ? { ...u, ...data } : u)));
    setEditTarget(null);
}

async function handleAddSubmit(data: UserFormData) {
  // tar ganti API call
  const emailExists = users.some((u) => u.email === data.email);
  if (emailExists) throw { status: 409 };

  const newId = `USR-${String(users.length + 1).padStart(3, "0")}`;
  const today = new Date().toISOString().split("T")[0];
  setUsers((prev) => [{ ...data, id: newId, createdAt: today, updatedAt: today }, ...prev]);
  setAddOpen(false);
}

function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
}

return (
    <>
    <StatCards stats={[
    { value: filtered.length, label: "Total Users", color: "green" },
    { value: superadmins,     label: "Superadmin",  color: "blue" },
    { value: admins,          label: "Admin",       color: "yellow" },
    { value: guests,          label: "Guest",       color: "gray" },
    ]} />

    <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <SearchInput
        placeholder="Search users..."
        value={query}
        onChange={setQuery}
        className="flex-1"
        />
        <button
        onClick={() => setAddOpen(true)}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors whitespace-nowrap"
        >
        <UserPlus className="h-4 w-4" />
        Add User
        </button>
    </div>

    <UserTable
        users={filtered}
        label={`User Accounts (${filtered.length} users)`}
        onEdit={(user) => setEditTarget(user)}
        onDelete={(user) => setDeleteTarget(user)}
    />

    <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-2xl p-6">
        <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-semibold">Edit User</DialogTitle>
        </DialogHeader>
        {editTarget && (
            <UserForm
            initialData={editTarget}
            onCancel={() => setEditTarget(null)}
            onSubmit={handleEditSubmit}
            submitLabel="Save Changes"
            />
        )}
        </DialogContent>
    </Dialog>

    <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-2xl p-6">
        <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-semibold">Add User</DialogTitle>
        </DialogHeader>
        <UserForm
            onCancel={() => setAddOpen(false)}
            onSubmit={handleAddSubmit}
            submitLabel="Add User"
        />
        </DialogContent>
    </Dialog>

    <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Remove this user?"
        description={
        deleteTarget && (
            <>
            <span className="font-medium text-foreground">{deleteTarget.name}</span>
            {" "}will be permanently removed from the system.
            </>
        )
        }
        confirmLabel="Remove"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
    />
    </>
);
}