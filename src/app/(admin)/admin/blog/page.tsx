import Link from "next/link";
import { Post } from "@/db";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { PostRowActions } from "./post-actions";
import { NewPostButton } from "./new-post-button";

export default async function AdminBlogPage() {
  await requireResource(RESOURCES.BLOG);
  const posts = await Post.findAll({ order: [["createdAt", "DESC"]] });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Published posts appear on the public site at /blog.
          </p>
        </div>
        <NewPostButton />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Post</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <p className="font-medium text-gray-900">
                  {p.emoji} {p.title}
                </p>
                <p className="text-xs text-gray-400">/{p.slug}</p>
              </TableCell>
              <TableCell>{p.category ?? "—"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.published ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                  {p.featured && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Featured
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <PostRowActions id={p.id} title={p.title} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {posts.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No posts yet —{" "}
          <Link href="/admin/blog/new" className="font-medium text-teal-600 hover:text-teal-700">
            write one
          </Link>
          .
        </p>
      )}
    </div>
  );
}
