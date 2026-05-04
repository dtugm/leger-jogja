import type { Role } from "./user-table";

const roleStyle: Record<Role, string> = {
  Admin:      "bg-amber-100  text-amber-600  dark:bg-amber-950  dark:text-amber-400",
  Superadmin: "bg-rose-100   text-rose-600   dark:bg-rose-950   dark:text-rose-400",
  Guest:      "bg-blue-100   text-blue-600   dark:bg-blue-950   dark:text-blue-400",
};

export default function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${roleStyle[role]}`}>
      {role}
    </span>
  );
}