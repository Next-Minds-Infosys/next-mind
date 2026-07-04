"use client";

import { Menu } from "lucide-react";
import { UserMenu } from "./user-menu";

interface TopbarProps {
  onToggleSidebar: () => void;
  userName: string;
  userEmail: string;
}

export function Topbar({ onToggleSidebar, userName, userEmail }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
      <button
        className="text-gray-500 hover:text-gray-800 lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={22} />
      </button>
      <div className="hidden lg:block" />
      <UserMenu userName={userName} userEmail={userEmail} />
    </header>
  );
}
