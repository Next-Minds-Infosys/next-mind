import { EnterpriseInquiry } from "@/db/models";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusSelect } from "@/components/admin/status-select";
import { updateEnterpriseInquiryStatus } from "./actions";

export default async function AdminEnterpriseInquiriesPage() {
  const inquiries = await EnterpriseInquiry.findAll({
    order: [["createdAt", "DESC"]],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Enterprise Inquiries</h1>
        <p className="text-sm text-gray-500 mt-1">
          Corporate training requests from the enterprise page
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact Name</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Org Type</TableHead>
            <TableHead>Team Size</TableHead>
            <TableHead>Training Interests</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map((inquiry) => (
            <TableRow key={inquiry.id}>
              <TableCell className="font-medium text-gray-900">{inquiry.name}</TableCell>
              <TableCell>{inquiry.orgName}</TableCell>
              <TableCell>{inquiry.email}</TableCell>
              <TableCell>{inquiry.phone ?? "—"}</TableCell>
              <TableCell>{inquiry.orgType ?? "—"}</TableCell>
              <TableCell>{inquiry.teamSize ?? "—"}</TableCell>
              <TableCell
                className="max-w-xs truncate"
                title={inquiry.trainingInterests ?? undefined}
              >
                {inquiry.trainingInterests ?? "—"}
              </TableCell>
              <TableCell>
                <StatusSelect
                  id={inquiry.id}
                  status={inquiry.status}
                  onUpdate={updateEnterpriseInquiryStatus}
                />
              </TableCell>
              <TableCell>{inquiry.createdAt.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
