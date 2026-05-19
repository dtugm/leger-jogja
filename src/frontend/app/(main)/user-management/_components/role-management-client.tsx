"use client";

import { UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import DeleteConfirmDialog from "@/components/delete-confirm-dialog";
import Pagination from "@/components/pagination";
import SearchInput from "@/components/search";
import StatCards from "@/components/stat-cards";
import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";
import UserTable, { type User } from "@/components/user-management/user-table";
import { UserApi } from "@/services/api/user.api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiPagination } from "@/types/api";

import UserForm, {
type UserFormData,
} from "../../../../components/user-management/user-form";

interface Props {
initialUsers: User[];
initialPagination: ApiPagination;
}

export default function RoleManagementClient({
initialUsers,
initialPagination,
}: Props) {
const currentUser = useAuthStore((state) => state.user);
const isSuperAdmin = currentUser?.role === "super_admin";
const router = useRouter();
const searchParams = useSearchParams();
const [isPending, startTransition] = useTransition();
const users = initialUsers;
const pagination = initialPagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? "",
);
const [editTarget, setEditTarget] = useState<User | null>(null);
const [addOpen, setAddOpen] = useState(false);
const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

const isFirstRender = useRef(true);
const searchParamsRef = useRef(searchParams);
useEffect(() => {
  searchParamsRef.current = searchParams;
}, [searchParams]);

const pushParams = useCallback(
  (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    Object.entries(patch).forEach(([k, v]: [string, string | number | undefined]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
      else params.delete(k);
    });
    startTransition(() => router.push(`?${params.toString()}`));
  },
  [router],
);

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  const timer = setTimeout(() => {
    pushParams({ search: searchValue || undefined, page: 1 });
  }, 400);
  return () => clearTimeout(timer);
}, [searchValue, pushParams]);

async function handleEditSubmit(data: UserFormData) {
    if (!editTarget) return;
    const res = await UserApi.update(editTarget.id, {
    fullname: data.fullname,
    username: data.username,
    email: data.email,
    role: data.role,
    ...(data.password ? { password: data.password } : {}),
    });

    if (!res.success) {
    if (res.statusCode === 409) throw { status: 409 };
    return;
    }

    setEditTarget(null);
    router.refresh();
}

async function handleAddSubmit(data: UserFormData) {
    const res = await UserApi.create({
    fullname: data.fullname,
    username: data.username,
    email: data.email,
    role: data.role,
    password: data.password!,
    });

    if (!res.success) {
    if (res.statusCode === 409) throw { status: 409 };
    return;
    }

    setAddOpen(false);
    router.refresh();
}

async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const res = await UserApi.delete(deleteTarget.id);
    if (!res.success) return;
    setDeleteTarget(null);
    router.refresh();
    }

return (
    <>
    <StatCards
        stats={[
        { value: pagination.total, label: "Total Users", color: "green" },
        //  CATATANSSS DELLA: Data per role ini cm bisa di 1 halaman (kalo yang total bisa semua halaman)
        // hmm perlu endpoint GET /users/stats dari BE deh buat dapetin jumlah per role hehe trims
        {
            value: users.filter((u) => u.role === "super_admin").length,
            label: "Superadmin",
            color: "blue",
        },
        {
            value: users.filter((u) => u.role === "admin").length,
            label: "Admin",
            color: "yellow",
        },
        {
            value: users.filter((u) => u.role === "user").length,
            label: "Guest",
            color: "gray",
        },
        ]}
    />

    <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <SearchInput
            placeholder="Search users..."
            value={searchValue}
            onChange={setSearchValue}
            className={`flex-1 transition-opacity ${isPending ? "opacity-50" : ""}`}
        />
        {isSuperAdmin && (
        <button
            onClick={() => setAddOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors whitespace-nowrap"
        >
            <UserPlus className="h-4 w-4" />
            Add User
        </button>
        )}
    </div>

    <UserTable
        users={users}
        label={`User Accounts (${pagination.total} users)`}
        onEdit={isSuperAdmin ? (user) => setEditTarget(user) : undefined}
        onDelete={isSuperAdmin ? (user) => setDeleteTarget(user) : undefined}
    />
    <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => pushParams({ page: p })}
        />

    <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
    >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-2xl p-6">
        <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-semibold">
            Edit User
            </DialogTitle>
        </DialogHeader>
        {editTarget && (
            <UserForm
            initialData={editTarget}
            onCancel={() => setEditTarget(null)}
            onSubmit={handleEditSubmit}
            submitLabel="Save Changes"
            isEdit
            />
        )}
        </DialogContent>
    </Dialog>

    <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-2xl p-6">
        <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-semibold">
            Add User
            </DialogTitle>
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
            <span className="font-medium text-foreground">
                {deleteTarget.fullname}
            </span>{" "}
            will be permanently removed from the system.
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
