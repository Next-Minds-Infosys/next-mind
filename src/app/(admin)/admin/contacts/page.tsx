import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusSelect } from "@/components/admin/status-select";
import { DeleteRow } from "@/components/admin/delete-row-button";
import { updateContactStatus, deleteContact } from "./actions";
import { ContactSubmission } from "@/db";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";

export default async function AdminContactsPage() {
  await requireResource(RESOURCES.CONTACTS);
  const contacts = await ContactSubmission.findAll({
    order: [["createdAt", "DESC"]],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Contact Submissions</h1>
        <p className="text-sm text-gray-500 mt-1">Free counselling and contact form messages</p>
      </div>
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
            <TableHead></TableHead>
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
                <StatusSelect
                  id={contact.id}
                  status={contact.status}
                  onUpdate={updateContactStatus}
                />
              </TableCell>
              <TableCell>{contact.createdAt.toLocaleDateString()}</TableCell>
              <TableCell>
                <DeleteRow id={contact.id} label={contact.name} action={deleteContact} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
