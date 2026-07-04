import { prisma } from "@/lib/db";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusSelect } from "@/components/admin/status-select";
import { updateContactStatus } from "./actions";

export default async function AdminContactsPage() {
  const contacts = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Contact Submissions</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Course Interest</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium text-gray-900">{contact.name}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>{contact.phone ?? "—"}</TableCell>
              <TableCell>{contact.courseInterest ?? "—"}</TableCell>
              <TableCell className="max-w-xs truncate" title={contact.message}>
                {contact.message}
              </TableCell>
              <TableCell>
                <StatusSelect id={contact.id} status={contact.status} onUpdate={updateContactStatus} />
              </TableCell>
              <TableCell>{contact.createdAt.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
