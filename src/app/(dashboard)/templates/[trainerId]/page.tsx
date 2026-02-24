"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Template, TemplateAssignment, Trainer, Client } from "@/lib/types";
import { DAY_NAMES_FULL, generateTimeSlots, getWeekDates, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function TrainerTemplatePage({ params }: { params: Promise<{ trainerId: string }> }) {
  const { trainerId } = use(params);
  const supabase = createClient();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assignments, setAssignments] = useState<TemplateAssignment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState("");

  // Add interval form
  const [addDay, setAddDay] = useState(0);
  const [addStart, setAddStart] = useState("08:00");
  const [addEnd, setAddEnd] = useState("12:00");

  // Add assignment form
  const [assignDay, setAssignDay] = useState(0);
  const [assignTime, setAssignTime] = useState("08:00");
  const [assignClient, setAssignClient] = useState("");

  async function loadData() {
    const [t, tpl, asgn, c] = await Promise.all([
      supabase.from("trainers").select("*").eq("id", trainerId).single(),
      supabase.from("templates").select("*").eq("trainer_id", trainerId).order("day_of_week").order("start_time"),
      supabase.from("template_assignments").select("*, clients(child_full_name)").eq("trainer_id", trainerId).order("day_of_week").order("time_slot"),
      supabase.from("clients").select("*").is("archived_at", null).order("child_full_name"),
    ]);
    setTrainer(t.data);
    setTemplates(tpl.data || []);
    setAssignments(asgn.data || []);
    setClients(c.data || []);
  }

  useEffect(() => { loadData(); }, [trainerId]);

  async function addInterval() {
    await supabase.from("templates").insert({
      trainer_id: trainerId,
      day_of_week: addDay,
      start_time: addStart,
      end_time: addEnd,
    });
    loadData();
  }

  async function removeInterval(id: string) {
    await supabase.from("templates").delete().eq("id", id);
    loadData();
  }

  async function addAssignment() {
    if (!assignClient) return;
    await supabase.from("template_assignments").upsert({
      trainer_id: trainerId,
      day_of_week: assignDay,
      time_slot: assignTime,
      client_id: assignClient,
    }, { onConflict: "trainer_id,day_of_week,time_slot" });
    loadData();
  }

  async function removeAssignment(id: string) {
    await supabase.from("template_assignments").delete().eq("id", id);
    loadData();
  }

  async function generateWeek() {
    setGenerating(true);
    setMsg("");
    const weekDates = getWeekDates(0);
    let created = 0;

    // For each template interval, create empty slots
    for (const tpl of templates) {
      const date = formatDate(weekDates[tpl.day_of_week]);
      const slots = generateTimeSlots(tpl.start_time.slice(0, 5), tpl.end_time.slice(0, 5));

      for (const slot of slots) {
        // Check for assignment
        const asgn = assignments.find(
          (a) => a.day_of_week === tpl.day_of_week && a.time_slot.slice(0, 5) === slot
        );

        const { error } = await supabase.from("bookings").upsert({
          trainer_id: trainerId,
          date,
          time_slot: slot,
          client_id: asgn?.client_id || null,
          client_type: asgn?.client_type || "новый",
        }, { onConflict: "trainer_id,date,time_slot", ignoreDuplicates: true });

        if (!error) created++;
      }
    }

    setMsg(`✅ Готово! Создано ${created} слотов на текущую неделю.`);
    setGenerating(false);
  }

  if (!trainer) return <p className="text-gray-400">Загрузка...</p>;

  return (
    <div className="max-w-2xl">
      <Link href="/templates" className="text-sm text-blue-500 hover:underline">← Все тренеры</Link>
      <h1 className="text-xl font-bold mt-2 mb-4">📋 {trainer.name} — Шаблон</h1>

      {/* Generate week button */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm mb-2">Сгенерировать расписание на текущую неделю из шаблона (не затирает существующие записи).</p>
        <button
          onClick={generateWeek}
          disabled={generating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? "Генерация..." : "🔄 Сгенерировать неделю"}
        </button>
        {msg && <p className="text-sm text-green-600 mt-2">{msg}</p>}
      </div>

      {/* Work intervals */}
      <div className="mb-6">
        <h2 className="font-semibold mb-3">🕐 Рабочие интервалы</h2>
        <div className="space-y-1 mb-3">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-2 bg-white border rounded p-2 text-sm">
              <span className="font-medium w-28">{DAY_NAMES_FULL[t.day_of_week]}</span>
              <span>{t.start_time.slice(0, 5)} — {t.end_time.slice(0, 5)}</span>
              <button onClick={() => removeInterval(t.id)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
          {templates.length === 0 && <p className="text-gray-400 text-sm">Нет интервалов</p>}
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          <select value={addDay} onChange={(e) => setAddDay(+e.target.value)} className="border rounded px-2 py-1.5 text-sm">
            {DAY_NAMES_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
          <input type="time" value={addStart} onChange={(e) => setAddStart(e.target.value)} className="border rounded px-2 py-1.5 text-sm" />
          <span className="text-gray-400">—</span>
          <input type="time" value={addEnd} onChange={(e) => setAddEnd(e.target.value)} className="border rounded px-2 py-1.5 text-sm" />
          <button onClick={addInterval} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm">+ Добавить</button>
        </div>
      </div>

      {/* Template assignments (pinned clients) */}
      <div>
        <h2 className="font-semibold mb-3">📌 Постоянные клиенты</h2>
        <div className="space-y-1 mb-3">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center gap-2 bg-white border rounded p-2 text-sm">
              <span className="font-medium w-28">{DAY_NAMES_FULL[a.day_of_week]}</span>
              <span>{a.time_slot.slice(0, 5)}</span>
              <span className="text-gray-600">→ {(a.clients as any)?.child_full_name}</span>
              <button onClick={() => removeAssignment(a.id)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
          {assignments.length === 0 && <p className="text-gray-400 text-sm">Нет закреплённых клиентов</p>}
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          <select value={assignDay} onChange={(e) => setAssignDay(+e.target.value)} className="border rounded px-2 py-1.5 text-sm">
            {DAY_NAMES_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
          <input type="time" value={assignTime} onChange={(e) => setAssignTime(e.target.value)} step="1800" className="border rounded px-2 py-1.5 text-sm" />
          <select value={assignClient} onChange={(e) => setAssignClient(e.target.value)} className="border rounded px-2 py-1.5 text-sm max-w-xs">
            <option value="">Клиент...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.child_full_name}</option>)}
          </select>
          <button onClick={addAssignment} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm">+ Закрепить</button>
        </div>
      </div>
    </div>
  );
}
