import { Post } from "@/db";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { PostForm } from "./post-form";
import { PostRowActions } from "./post-actions";

export default async function AdminBlogPage() {
  const posts = await Post.findAll({ order: [["createdAt", "DESC"]] });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Blog</h1>
        <p className="mt-1 text-sm text-gray-500">
          Published posts appear on the public site at /blog.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div>
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
                    <PostRowActions
                      post={{
                        id: p.id,
                        title: p.title,
                        excerpt: p.excerpt ?? "",
                        contentMd: p.contentMd,
                        category: p.category ?? "",
                        emoji: p.emoji ?? "",
                        readTime: p.readTime ?? "",
                        authorName: p.authorName ?? "",
                        featured: p.featured,
                        published: p.published,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {posts.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              No posts yet — write one on the right.
            </p>
          )}
        </div>

        <aside className="h-fit rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
          <h2 className="mb-4 font-semibold text-gray-900">New post</h2>
          <PostForm />
        </aside>
      </div>
    </div>
  );
}
