import PageHeader from "@/components/page-header";
import { UserApi } from "@/services/api/user.api";

import RoleManagementClient from "./_components/role-management-client";

export default async function RoleManagementPage() {
  const res = await UserApi.getAll();
  const users = res.success ? res.data : [];

    return (
        <div className="mx-auto w-[90%] py-6 sm:py-8 xl:max-w-[80%]">
        <PageHeader
            title="Role Management"
            subtitle="Manage user accounts and access roles"
        />
        <RoleManagementClient initialUsers={users} />
        </div>
    );
}