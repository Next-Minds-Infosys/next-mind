import { User } from "@/db";
import { getSession } from "@/lib/auth";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { RoleSelect } from "./role-select";
import { CreateUser } from "./create-user";
import { UserRowActions } from "./user-actions";

export default async function AdminUsersPage() {
  const session = await getSession();
  const users = await User.findAll({ order: [["createdAt", "DESC"]] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Everyone who has registered. Set a role to grant access to the instructor or admin
          portal.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <p className="font-medium text-gray-900">{u.name ?? "—"}</p>
                {u.id === session?.user.id && (
                  <p className="text-xs text-gray-400">that&apos;s you</p>
                )}
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <RoleSelect userId={u.id} role={u.role} disabled={u.id === session?.user.id} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-gray-500">
                {u.createdAt.toLocaleDateString()}
              </TableCell>
              <TableCell>
                <UserRowActions
                  user={{ id: u.id, name: u.name, email: u.email }}
                  isSelf={u.id === session?.user.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
          </Table>
          {users.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">No users yet.</p>
          )}
        </div>

        <aside className="h-fit rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
          <h2 className="font-semibold text-gray-900">Create an account</h2>
          <p className="mb-4 mt-1 text-sm text-gray-500">
            Generates a password and optionally emails it to them.
          </p>
          <CreateUser />
        </aside>
      </div>
    </div>
  );
}
