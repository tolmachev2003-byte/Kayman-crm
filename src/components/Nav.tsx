"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { href: "/schedule", label: "Расписание", icon: "📅" },
  { href: "/templates", label: "Шаблоны", icon: "📋" },
  { href: "/clients", label: "Посетители", icon: "👥" },
  { href: "/tasks", label: "Задачи", icon: "✅" },
  { href: "/settings", label: "Настройки", icon: "⚙️" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r min-h-screen p-4 fixed left-0 top-0">
        <h1 className="text-lg font-bold mb-6 px-2">🏊 Kayman</h1>
        <nav className="flex-1 space-y-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                pathname.startsWith(t.href)
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-500 mt-4 px-3"
        >
          Выйти
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex z-50">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs ${
              pathname.startsWith(t.href)
                ? "text-blue-600 font-medium"
                : "text-gray-400"
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
