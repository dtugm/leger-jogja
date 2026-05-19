import PageHeader from "@/components/page-header";
import type { UserRole } from "@/services/api/user.api";
import { UserApi } from "@/services/api/user.api";
import type { ApiPagination } from "@/types/api";

import RoleManagementClient from "./_components/role-management-client"; 

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string; search?: string; role?: string }>;
}

export default async function RoleManagementPage({ searchParams }: PageProps) {
    const p = await searchParams;

    const res = await UserApi.getAll({
        page:   Number(p.page)  || 1,
        limit:  Number(p.limit) || 10,
        search: p.search,
        role:   p.role as UserRole | undefined,
    });

    const users = res.success ? res.data : [];
    const pagination: ApiPagination = res.pagination ?? {
        page: 1, limit: 10, total: 0, totalPages: 1,
    };

    return (
        <div className="mx-auto w-[90%] py-6 sm:py-8 xl:max-w-[80%]">
        <PageHeader
            title="Role Management"
            subtitle="Manage user accounts and access roles"
        />
        <RoleManagementClient initialUsers={users} initialPagination={pagination} />
        </div>
    );
}