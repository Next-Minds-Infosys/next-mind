"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AdminShellProps {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function AdminShell({ userName, userEmail, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          userName={userName}
          userEmail={userEmail}
        />
        <main className="mx-auto max-w-6xl p-6">{children}</main>
      </div>
    </div>
  );
}
