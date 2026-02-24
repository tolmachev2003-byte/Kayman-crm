"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Client, Booking, Task, Trainer } from "@/lib/types";
import { CLIENT_STATUSES, SUBSCRIPTION_TYPES } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [taskText, setTaskText] = useState("");
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split("T")[0]);

  async function loadData() {
    const [c, b, t, tr] = await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase.from("bookings").select("*, trainers(name)").eq("client_id", id).order("date", { ascending: false }).limit(50),
      supabase.from("tasks").select("*").eq("client_id", id).order("due_date"),
      supabase.from("trainers").select("*").is("archived_at", null),
    ]);
    setClient(c.data);
    setBookings(b.data || []);
    setTasks(t.data || []);
    setTrainers(tr.data || []);
    if (c.data) {
      setForm({
        child_full_name: c.data.child_full_name || "",
        parent_name: c.data.parent_name || "",
        parent_phone: c.data.parent_phone || "",
        birth_date: c.data.birth_date || "",
        subscription_type: c.data.subscription_type || "",
        comment: c.data.comment || "",
        status: c.data.status || "записался",
        assigned_trainer_id: c.data.assigned_trainer_id || "",
      });
    }
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleSave() {
    await supabase.from("clients").update({
      ...form,
      parent_name: form.parent_name || null,
      parent_phone: form.parent_phone || null,
      birth_date: form.birth_date || null,
      subscription_type: form.subscription_type || null,
      comment: form.comment || null,
      assigned_trainer_id: form.assigned_trainer_id || null,
    }).eq("id", id);
    setEditing(false);
    loadData();
  }

  async function handleArchive() {
    if (!confirm("Архивировать клиента?")) return;
    await supabase.from("clients").update({ archived_at: new Date().toISOString() }).eq("id", id);
    router.push("/clients");
  }

  async function handleAddTask() {
    if (!taskText.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("tasks").insert({
      user_id: user.id,
      client_id: id,
      due_date: taskDate,
      text: taskText.trim(),
    });
    setTaskText("");
    loadData();
  }

  async function toggleTask(taskId: string, current: string) {
    await supabase.from("tasks").update({ status: current === "open" ? "done" : "open" }).eq("id", taskId);
    loadData();
  }

  if (!client) return <p className="text-gray-400">Загрузка...</p>;

  function upd(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div className="max-w-2xl">
      <Link href="/clients" className="text-sm text-blue-500 hover:underline">← Все посетители</Link>

      <div className="bg-white border rounded-xl p-4 mt-3">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-xl font-bold">{client.child_full_name}</h1>
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="text-sm text-blue-500 hover:underline">
              {editing ? "Отмена" : "Ред."}
            </button>
            <button onClick={handleArchive} className="text-sm text-red-400 hover:underline">Архив</button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-2">
            <input value={form.child_full_name} onChange={(e) => upd("child_full_name", e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="ФИО ребёнка" />
            <input value={form.parent_name} onChange={(e) => upd("parent_name", e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="Родитель" />
            <input value={form.parent_phone} onChange={(e) => upd("parent_phone", e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="Телефон" />
            <input type="date" value={form.birth_date} onChange={(e) => upd("birth_date", e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" />
            <select value={form.subscription_type} onChange={(e) => upd("subscription_type", e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm">
              <option value="">Абонемент</option>
              {SUBSCRIPTION_TYPES.map((s) => <option key={s} value={s}>{s} зан.</option>)}
            </select>
            <select value={form.status} onChange={(e) => upd("status", e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm">
              {CLIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.assigned_trainer_id} onChange={(e) => upd("assigned_trainer_id", e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm">
              <option value="">Тренер</option>
              {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <textarea value={form.comment} onChange={(e) => upd("comment", e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" rows={2} placeholder="Комментарий" />
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">Сохранить</button>
          </div>
        ) : (
          <div className="text-sm space-y-1 text-gray-600">
            <p>👨‍👩‍👦 Родитель: {client.parent_name || "—"}</p>
            <p>📞 {client.parent_phone || "—"}</p>
            <p>🎂 {client.birth_date || "—"}</p>
            <p>🎫 Абонемент: {client.subscription_type ? `${client.subscription_type} зан.` : "—"}</p>
            <p>📊 Статус: {client.status}</p>
            {client.comment && <p>💬 {client.comment}</p>}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="mt-6">
        <h2 className="font-semibold mb-2">✅ Задачи</h2>
        <div className="flex gap-2 mb-3">
          <input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Новая задача..." className="flex-1 border rounded px-3 py-1.5 text-sm" />
          <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="border rounded px-2 py-1.5 text-sm" />
          <button onClick={handleAddTask} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm">+</button>
        </div>
        {tasks.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 p-2 border rounded mb-1 ${t.status === "done" ? "opacity-50" : ""}`}>
            <button onClick={() => toggleTask(t.id, t.status)} className="text-lg">
              {t.status === "done" ? "☑️" : "⬜"}
            </button>
            <div className="flex-1 text-sm">
              <span className={t.status === "done" ? "line-through" : ""}>{t.text}</span>
              <span className="text-gray-400 ml-2">{t.due_date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings history */}
      <div className="mt-6">
        <h2 className="font-semibold mb-2">📅 История записей ({bookings.length})</h2>
        <div className="space-y-1">
          {bookings.map((b) => (
            <div key={b.id} className={`text-sm p-2 border rounded flex justify-between ${b.archived_at ? "opacity-40 line-through" : ""}`}>
              <span>{b.date} {b.time_slot} — {(b.trainers as any)?.name}</span>
              <span className="text-gray-400">{b.client_type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
