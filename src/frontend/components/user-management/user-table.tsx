"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";

import Table, { ColumnDef } from "@/components/table";

export type Role       = "Admin" | "Superadmin" | "Guest";
export type UserStatus = "Active" | "Inactive";

export interface User {
  id:        string;
  name:      string;
  username:  string;
  email:     string;
  role:      Role;
  status:    UserStatus;
  createdAt: string;
  updatedAt: string;
}

const AVATAR_PALETTES = [
  "bg-blue-400", "bg-green-500", "bg-yellow-400", "bg-rose-400",
  "bg-purple-400", "bg-orange-400", "bg-teal-400", "bg-pink-400",
];

function getAvatarColor(name: string): string {
  const idx =
    name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const roleBadge: Record<Role, string> = {
  Superadmin: "bg-[var(--color-danger)]/10  text-[var(--color-danger)]",
  Admin:      "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  Guest:      "bg-[var(--color-info)]/10    text-[var(--color-info)]",
};

function buildColumns(
  onEdit:   (user: User) => void,
  onDelete: (user: User) => void,
): ColumnDef<User>[] {
  return [
    {
      key: "id",
      label: "ID",
      sortIcon: "both",
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">{row.id}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortIcon: "both",
      render: (row) => (
        <span className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(row.name)}`}
          >
            {getInitials(row.name)}
          </span>
          <span className="flex flex-col">
            <span className="font-medium text-foreground leading-tight">{row.name}</span>
            <span className="text-xs text-muted-foreground">{row.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: "username",
      label: "Username",
      sortIcon: "both",
      render: (row) => (
        <span className="text-sm text-foreground">{row.username}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      filterOptions: ["Admin", "Superadmin", "Guest"],
      render: (row) => (
        <span
          className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${roleBadge[row.role]}`}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      sortIcon: "both",
      render: (row) => (
        <span className="flex items-center gap-1.5 text-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {row.createdAt}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated At",
      sortIcon: "both",
      render: (row) => (
        <span className="flex items-center gap-1.5 text-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {row.updatedAt}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <span className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(row); }}
            className="flex items-center gap-1.5 rounded-lg border border-blue-400 px-3 py-1 text-xs font-medium text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(row); }}
            className="flex items-center gap-1.5 rounded-lg border border-rose-400 px-3 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </span>
      ),
    },
  ];
}

interface UserTableProps {
  users:    User[];
  label?:   string;
  onEdit:   (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({ users, label, onEdit, onDelete }: UserTableProps) {
  const columns = buildColumns(onEdit, onDelete);
  return (
    <Table
      columns={columns}
      data={users}
      label={label}
      keyExtractor={(row) => row.id}
    />
  );
}