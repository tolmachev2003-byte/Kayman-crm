"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Client, Trainer } from "@/lib/types";
import { CLIENT_STATUSES, SUBSCRIPTION_TYPES } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import Link from "next/link";

export default function ClientsPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterTrainer, setFilterTrainer] = useState("");
  const [modal, setModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  async function loadData() {
    setLoading(true);
    let q = supabase.from("clients").select("*").order("child_full_name");
    if (!showArchived) q = q.is("archived_at", null);
    const [c, t] = await Promise.all([
      q,
      supabase.from("trainers").select("*").is("archived_at", null),
    ]);
    setClients(c.data || []);
    setTrainers(t.data || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [showArchived]);

  const filtered = clients.filter((c) => {
    if (search && !c.child_full_name.toLowerCase().includes(search.toLowerCase()) &&
        !c.parent_phone?.includes(search)) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterSub && c.subscription_type !== filterSub) return false;
    if (filterTrainer && c.assigned_trainer_id !== filterTrainer) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">👥 Посетители</h1>
        <button
          onClick={() => { setEditClient(null); setModal(true); }}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"
        >
          + Новый
        </button>
        <label className="text-sm flex items-center gap-1 text-gray-500">
          <input type="checkbox" checked={showArchived} onChange={() => setShowArchived(!showArchived)} />
          Архив
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm w-48"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm">
          <option value="">Все статусы</option>
          {CLIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm">
          <option value="">Все абонементы</option>
          {SUBSCRIPTION_TYPES.map((s) => <option key={s} value={s}>{s} зан.</option>)}
        </select>
        <select value={filterTrainer} onChange={(e) => setFilterTrainer(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm">
          <option value="">Все тренеры</option>
          {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Загрузка...</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">{filtered.length} клиентов</p>
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className={`block bg-white border rounded-lg p-3 hover:shadow-sm ${c.archived_at ? "opacity-50" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{c.child_full_name}</p>
                  <p className="text-sm text-gray-500">
                    {c.parent_name && `${c.parent_name} • `}
                    {c.parent_phone || "нет телефона"}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${
                    c.status === "ходит" ? "bg-green-100 text-green-700" :
                    c.status === "записался" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {c.status}
                  </span>
                  {c.subscription_type && (
                    <p className="mt-1 text-gray-400">{c.subscription_type} зан.</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ClientFormModal
        open={modal}
        client={editClient}
        trainers={trainers}
        supabase={supabase}
        onClose={() => setModal(false)}
        onSaved={() => { setModal(false); loadData(); }}
      />
    </div>
  );
}

// ─── Client Form Modal ────────────────────────────────

function ClientFormModal({
  open, client, trainers, supabase, onClose, onSaved,
}: {
  open: boolean;
  client: Client | null;
  trainers: Trainer[];
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    child_full_name: "",
    parent_name: "",
    parent_phone: "",
    birth_date: "",
    subscription_type: "",
    comment: "",
    status: "записался",
    assigned_trainer_id: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        child_full_name: client?.child_full_name || "",
        parent_name: client?.parent_name || "",
        parent_phone: client?.parent_phone || "",
        birth_date: client?.birth_date || "",
        subscription_type: client?.subscription_type || "",
        comment: client?.comment || "",
        status: client?.status || "записался",
        assigned_trainer_id: client?.assigned_trainer_id || "",
      });
    }
  }, [open, client]);

  function upd(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    if (!form.child_full_name.trim()) return;
    setSaving(true);
    const data = {
      ...form,
      parent_name: form.parent_name || null,
      parent_phone: form.parent_phone || null,
      birth_date: form.birth_date || null,
      subscription_type: form.subscription_type || null,
      comment: form.comment || null,
      assigned_trainer_id: form.assigned_trainer_id || null,
    };
    if (client) {
      await supabase.from("clients").update(data).eq("id", client.id);
    } else {
      await supabase.from("clients").insert(data);
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={client ? "Редактировать клиента" : "Новый клиент"}>
      <div className="space-y-3">
        <input placeholder="ФИО ребёнка *" value={form.child_full_name} onChange={(e) => upd("child_full_name", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        <input placeholder="Имя родителя" value={form.parent_name} onChange={(e) => upd("parent_name", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        <input placeholder="Телефон" value={form.parent_phone} onChange={(e) => upd("parent_phone", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        <div>
          <label className="text-sm text-gray-500">Дата рождения</label>
          <input type="date" value={form.birth_date} onChange={(e) => upd("birth_date", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <select value={form.subscription_type} onChange={(e) => upd("subscription_type", e.target.value)} className="w-full border rounded-lg px-3 py-2">
          <option value="">Абонемент</option>
          {SUBSCRIPTION_TYPES.map((s) => <option key={s} value={s}>{s} занятий</option>)}
        </select>
        <select value={form.status} onChange={(e) => upd("status", e.target.value)} className="w-full border rounded-lg px-3 py-2">
          {CLIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={form.assigned_trainer_id} onChange={(e) => upd("assigned_trainer_id", e.target.value)} className="w-full border rounded-lg px-3 py-2">
          <option value="">Тренер (не назначен)</option>
          {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <textarea placeholder="Комментарий" value={form.comment} onChange={(e) => upd("comment", e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} />
        <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? "..." : client ? "Сохранить" : "Создать"}
        </button>
      </div>
    </Modal>
  );
}
