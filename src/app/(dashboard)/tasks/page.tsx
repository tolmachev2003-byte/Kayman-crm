"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";
import Link from "next/link";

export default function TasksPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "done">("open");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    let q = supabase.from("tasks").select("*, clients(child_full_name)").order("due_date");
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [filter]);

  async function toggleTask(id: string, current: string) {
    await supabase.from("tasks").update({ status: current === "open" ? "done" : "open" }).eq("id", id);
    loadData();
  }

  const today = new Date().toISOString().split("T")[0];

  const overdue = tasks.filter((t) => t.status === "open" && t.due_date < today);
  const todayTasks = tasks.filter((t) => t.due_date === today);
  const upcoming = tasks.filter((t) => t.status === "open" && t.due_date > today);
  const done = tasks.filter((t) => t.status === "done");

  function Section({ title, items, color }: { title: string; items: Task[]; color: string }) {
    if (!items.length) return null;
    return (
      <div className="mb-6">
        <h2 className={`font-semibold mb-2 ${color}`}>{title} ({items.length})</h2>
        {items.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 p-3 bg-white border rounded-lg mb-1 ${t.status === "done" ? "opacity-50" : ""}`}>
            <button onClick={() => toggleTask(t.id, t.status)} className="text-xl flex-shrink-0">
              {t.status === "done" ? "☑️" : "⬜"}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${t.status === "done" ? "line-through" : ""}`}>{t.text}</p>
              <p className="text-xs text-gray-400">
                {t.due_date}
                {t.clients && (
                  <Link href={`/clients/${t.client_id}`} className="text-blue-500 ml-2 hover:underline">
                    → {(t.clients as any).child_full_name}
                  </Link>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">✅ Задачи</h1>
        <div className="flex gap-1">
          {(["open", "all", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs ${filter === f ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}
            >
              {f === "open" ? "Открытые" : f === "done" ? "Готовые" : "Все"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Загрузка...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400">Нет задач. Создайте задачу в карточке клиента.</p>
      ) : (
        <>
          <Section title="🔴 Просроченные" items={overdue} color="text-red-600" />
          <Section title="📌 Сегодня" items={todayTasks} color="text-blue-600" />
          <Section title="📅 Ближайшие" items={upcoming} color="text-gray-700" />
          {filter === "all" && <Section title="✅ Выполненные" items={done} color="text-green-600" />}
        </>
      )}
    </div>
  );
}
