import PageHeader from "@/components/page-header";
import type { User } from "@/components/user-management/user-table";

import RoleManagementClient from "./_components/role-management-client";

// ganti API call yakkk
const USERS: User[] = [
{ id: "USR-001", name: "Andi Prasetyo",    username: "andipr",          email: "andipr@gmail.com",          role: "Admin",      status: "Active",   createdAt: "2026-01-15", updatedAt: "2026-03-10" },
{ id: "USR-002", name: "Sri Rahayu",       username: "srirahayu",       email: "srirahayu@gmail.com",        role: "Superadmin", status: "Active",   createdAt: "2026-01-20", updatedAt: "2026-03-18" },
{ id: "USR-003", name: "Mutia Putri",      username: "mutiaputr",       email: "mutiaputr@gmail.com",        role: "Guest",      status: "Active",   createdAt: "2026-01-10", updatedAt: "2026-02-28" },
{ id: "USR-004", name: "Amelia Inka",      username: "meliainkar",      email: "meliainkar@gmail.com",       role: "Superadmin", status: "Active",   createdAt: "2026-01-22", updatedAt: "2026-03-22" },
{ id: "USR-005", name: "Fransiskus Amber", username: "fransiskusamber", email: "fransiskusamber@gmail.com",  role: "Guest",      status: "Active",   createdAt: "2026-01-28", updatedAt: "2026-01-28" },
{ id: "USR-006", name: "Kainama Anyelir",  username: "kainamanyellr",   email: "kainamanyellr@gmail.com",    role: "Guest",      status: "Inactive", createdAt: "2026-01-18", updatedAt: "2026-02-05" },
{ id: "USR-007", name: "Sira Malaka",      username: "siramalaka",      email: "siramalaka@gmail.com",       role: "Guest",      status: "Active",   createdAt: "2026-01-25", updatedAt: "2026-03-01" },
{ id: "USR-008", name: "Bubin Paimane",    username: "bubinpaimane",    email: "bubinpaimane@gmail.com",     role: "Guest",      status: "Active",   createdAt: "2026-01-12", updatedAt: "2026-02-14" },
{ id: "USR-009", name: "Piduna Yaila",     username: "pidunayaila",     email: "pidunayaila@gmail.com",      role: "Guest",      status: "Active",   createdAt: "2026-01-08", updatedAt: "2026-03-05" },
{ id: "USR-010", name: "Sasa Marsha",      username: "sasamarsha",      email: "sasamarsha@gmail.com",       role: "Admin",      status: "Inactive", createdAt: "2026-01-30", updatedAt: "2026-02-20" },
];

export default function RoleManagementPage() {
return (
    <div className="mx-auto w-[90%] py-6 sm:py-8 xl:max-w-[80%]">
    <PageHeader
        title="Role Management"
        subtitle="Manage user accounts and access roles"
    />
    <RoleManagementClient initialUsers={USERS} />
    </div>
);
}