"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Trainer, Profile } from "@/lib/types";
import Modal from "@/components/ui/Modal";

export default function SettingsPage() {
  const supabase = createClient();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [modal, setModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null);
  const [exporting, setExporting] = useState("");

  async function loadData() {
    let q = supabase.from("trainers").select("*").order("name");
    if (!showArchived) q = q.is("archived_at", null);
    const [t, p] = await Promise.all([
      q,
      supabase.from("profiles").select("*"),
    ]);
    setTrainers(t.data || []);
    setProfiles(p.data || []);
  }

  useEffect(() => { loadData(); }, [showArchived]);

  async function exportCSV(table: string) {
    setExporting(table);
    const { data } = await supabase.from(table).select("*");
    if (!data?.length) { setExporting(""); return; }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row: Record<string, any>) =>
        headers.map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = String(val).replace(/"/g, '""');
          return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${table}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting("");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">⚙️ Настройки</h1>

      {/* Trainers */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-semibold text-lg">Тренеры</h2>
          <button
            onClick={() => { setEditTrainer(null); setModal(true); }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            + Добавить
          </button>
          <label className="text-sm text-gray-400 flex items-center gap-1">
            <input type="checkbox" checked={showArchived} onChange={() => setShowArchived(!showArchived)} /> Архив
          </label>
        </div>
        <div className="space-y-1">
          {trainers.map((t) => (
            <div key={t.id} className={`flex items-center justify-between bg-white border rounded-lg p-3 ${t.archived_at ? "opacity-50" : ""}`}>
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-gray-400">{t.phone || "—"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditTrainer(t); setModal(true); }}
                  className="text-sm text-blue-500"
                >
                  Ред.
                </button>
                {!t.archived_at ? (
                  <button
                    onClick={async () => {
                      await supabase.from("trainers").update({ archived_at: new Date().toISOString() }).eq("id", t.id);
                      loadData();
                    }}
                    className="text-sm text-red-400"
                  >
                    Архив
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await supabase.from("trainers").update({ archived_at: null }).eq("id", t.id);
                      loadData();
                    }}
                    className="text-sm text-green-500"
                  >
                    Восст.
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CSV Export */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-3">📥 Экспорт CSV</h2>
        <div className="flex flex-wrap gap-2">
          {["clients", "bookings", "tasks"].map((table) => (
            <button
              key={table}
              onClick={() => exportCSV(table)}
              disabled={exporting === table}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {exporting === table ? "..." : `⬇ ${table}`}
            </button>
          ))}
        </div>
      </section>

      {/* Users / Profiles info */}
      <section>
        <h2 className="font-semibold text-lg mb-3">👤 Пользователи</h2>
        <p className="text-sm text-gray-500 mb-3">
          Роли назначаются через таблицу profiles в Supabase Dashboard.
          Admin видит всё, trainer — только своё.
        </p>
        <div className="space-y-1">
          {profiles.map((p) => (
            <div key={p.id} className="bg-white border rounded p-2 text-sm flex justify-between">
              <span className="font-mono text-xs text-gray-400">{p.user_id.slice(0, 8)}...</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                p.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
              }`}>
                {p.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Trainer Form Modal */}
      <TrainerFormModal
        open={modal}
        trainer={editTrainer}
        supabase={supabase}
        onClose={() => setModal(false)}
        onSaved={() => { setModal(false); loadData(); }}
      />
    </div>
  );
}

function TrainerFormModal({
  open, trainer, supabase, onClose, onSaved,
}: {
  open: boolean;
  trainer: Trainer | null;
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(trainer?.name || "");
      setPhone(trainer?.phone || "");
    }
  }, [open, trainer]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    if (trainer) {
      await supabase.from("trainers").update({ name: name.trim(), phone: phone || null }).eq("id", trainer.id);
    } else {
      await supabase.from("trainers").insert({ name: name.trim(), phone: phone || null });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={trainer ? "Редактировать тренера" : "Новый тренер"}>
      <div className="space-y-3">
        <input placeholder="Имя *" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        <input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
          {saving ? "..." : trainer ? "Сохранить" : "Создать"}
        </button>
      </div>
    </Modal>
  );
}
