"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getWeekDates, formatDate, formatDateShort, DAY_NAMES, generateTimeSlots, CLIENT_TYPES } from "@/lib/utils";
import type { Booking, Trainer, Client } from "@/lib/types";
import Modal from "@/components/ui/Modal";

const TIME_SLOTS = generateTimeSlots("08:00", "21:00");

export default function SchedulePage() {
  const supabase = createClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    date: string;
    time: string;
    trainerId: string;
    booking: Booking | null;
  }>({ open: false, date: "", time: "", trainerId: "", booking: null });

  const weekDates = getWeekDates(weekOffset);
  const weekStart = formatDate(weekDates[0]);
  const weekEnd = formatDate(weekDates[6]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [t, b, c] = await Promise.all([
      supabase.from("trainers").select("*").is("archived_at", null).order("name"),
      supabase
        .from("bookings")
        .select("*, clients(*), trainers(*)")
        .is("archived_at", null)
        .gte("date", weekStart)
        .lte("date", weekEnd),
      supabase.from("clients").select("*").is("archived_at", null).order("child_full_name"),
    ]);
    setTrainers(t.data || []);
    setBookings(b.data || []);
    setClients(c.data || []);
    if (selectedTrainers.length === 0 && t.data?.length) {
      setSelectedTrainers(t.data.map((tr) => tr.id));
    }
    setLoading(false);
  }, [weekStart, weekEnd]);

  useEffect(() => { loadData(); }, [loadData]);

  function getBooking(date: string, time: string, trainerId: string) {
    return bookings.find(
      (b) => b.date === date && b.time_slot === time + ":00" && b.trainer_id === trainerId
    ) || bookings.find(
      (b) => b.date === date && b.time_slot === time && b.trainer_id === trainerId
    );
  }

  function toggleTrainer(id: string) {
    setSelectedTrainers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const filteredTrainers = trainers.filter((t) => selectedTrainers.includes(t.id));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">📅 Расписание</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">←</button>
          <button onClick={() => setWeekOffset(0)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">Сегодня</button>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">→</button>
        </div>
        <span className="text-sm text-gray-500">
          {formatDateShort(weekDates[0])} — {formatDateShort(weekDates[6])}
        </span>
      </div>

      {/* Trainer filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {trainers.map((t) => (
          <button
            key={t.id}
            onClick={() => toggleTrainer(t.id)}
            className={`text-xs px-3 py-1 rounded-full border ${
              selectedTrainers.includes(t.id)
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Загрузка...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="p-1 border bg-gray-50 w-16">Время</th>
                {weekDates.map((d, i) => (
                  <th key={i} className={`p-1 border bg-gray-50 ${formatDate(d) === formatDate(new Date()) ? "bg-blue-50" : ""}`}>
                    {DAY_NAMES[i]} {formatDateShort(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time}>
                  <td className="p-1 border text-center font-mono text-gray-500">{time}</td>
                  {weekDates.map((d, di) => {
                    const dateStr = formatDate(d);
                    const cellBookings = filteredTrainers
                      .map((tr) => ({ trainer: tr, booking: getBooking(dateStr, time, tr.id) }))
                      .filter((x) => x.booking || filteredTrainers.length === 1);

                    return (
                      <td key={di} className="p-0.5 border align-top min-w-[100px]">
                        {filteredTrainers.map((tr) => {
                          const bk = getBooking(dateStr, time, tr.id);
                          if (bk) {
                            return (
                              <div
                                key={tr.id}
                                onClick={() => setModal({ open: true, date: dateStr, time, trainerId: tr.id, booking: bk })}
                                className="bg-blue-100 border border-blue-200 rounded px-1 py-0.5 mb-0.5 cursor-pointer hover:bg-blue-200 truncate"
                                title={`${bk.clients?.child_full_name || "?"} — ${tr.name}`}
                              >
                                <span className="font-medium">{bk.clients?.child_full_name || "?"}</span>
                                <span className="text-gray-500 ml-1">{bk.client_type}</span>
                                {filteredTrainers.length > 1 && (
                                  <span className="text-gray-400 ml-1">• {tr.name.split(" ")[0]}</span>
                                )}
                              </div>
                            );
                          }
                          return (
                            <div
                              key={tr.id}
                              onClick={() => setModal({ open: true, date: dateStr, time, trainerId: tr.id, booking: null })}
                              className="h-5 rounded hover:bg-green-50 cursor-pointer border border-transparent hover:border-green-200 mb-0.5"
                            />
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        {...modal}
        trainers={filteredTrainers}
        clients={clients}
        supabase={supabase}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSaved={loadData}
      />
    </div>
  );
}

// ─── Booking Modal ───────────────────────────────────────

function BookingModal({
  open, date, time, trainerId, booking, trainers, clients, supabase, onClose, onSaved,
}: {
  open: boolean;
  date: string;
  time: string;
  trainerId: string;
  booking: Booking | null;
  trainers: Trainer[];
  clients: Client[];
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [clientId, setClientId] = useState("");
  const [clientType, setClientType] = useState<string>("новый");
  const [selTrainer, setSelTrainer] = useState(trainerId);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Quick-create client
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [showQuick, setShowQuick] = useState(false);

  useEffect(() => {
    if (open) {
      setClientId(booking?.client_id || "");
      setClientType(booking?.client_type || "новый");
      setSelTrainer(trainerId);
      setSearch("");
      setShowQuick(false);
    }
  }, [open, booking, trainerId]);

  const filtered = clients.filter((c) =>
    c.child_full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.parent_phone?.includes(search)
  );

  async function handleSave() {
    setSaving(true);
    if (booking) {
      await supabase.from("bookings").update({
        client_id: clientId || null,
        client_type: clientType,
        trainer_id: selTrainer,
      }).eq("id", booking.id);
    } else {
      await supabase.from("bookings").insert({
        date,
        time_slot: time,
        trainer_id: selTrainer,
        client_id: clientId || null,
        client_type: clientType,
      });
    }
    setSaving(false);
    onClose();
    onSaved();
  }

  async function handleCancel() {
    if (!booking) return;
    setSaving(true);
    await supabase.from("bookings").update({ archived_at: new Date().toISOString() }).eq("id", booking.id);
    setSaving(false);
    onClose();
    onSaved();
  }

  async function handleQuickCreate() {
    if (!quickName.trim()) return;
    const { data } = await supabase.from("clients").insert({
      child_full_name: quickName.trim(),
      parent_phone: quickPhone || null,
    }).select().single();
    if (data) {
      setClientId(data.id);
      setShowQuick(false);
      // refresh will happen on save
    }
  }

  const title = booking ? `Запись ${date} ${time}` : `Новая запись ${date} ${time}`;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-3">
        {/* Trainer */}
        <div>
          <label className="text-sm font-medium text-gray-600">Тренер</label>
          <select
            value={selTrainer}
            onChange={(e) => setSelTrainer(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Client search */}
        <div>
          <label className="text-sm font-medium text-gray-600">Клиент</label>
          <input
            placeholder="Поиск по имени или телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            size={4}
            className="w-full border rounded-lg mt-1 text-sm"
          >
            <option value="">— Без клиента —</option>
            {filtered.slice(0, 20).map((c) => (
              <option key={c.id} value={c.id}>
                {c.child_full_name} {c.parent_phone ? `(${c.parent_phone})` : ""}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowQuick(!showQuick)}
            className="text-xs text-blue-500 mt-1 hover:underline"
          >
            + Быстро создать клиента
          </button>
        </div>

        {/* Quick create */}
        {showQuick && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <input
              placeholder="ФИО ребёнка"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
            <input
              placeholder="Телефон родителя"
              value={quickPhone}
              onChange={(e) => setQuickPhone(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
            <button onClick={handleQuickCreate} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
              Создать
            </button>
          </div>
        )}

        {/* Client type */}
        <div>
          <label className="text-sm font-medium text-gray-600">Тип</label>
          <select
            value={clientType}
            onChange={(e) => setClientType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            {CLIENT_TYPES.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "..." : booking ? "Сохранить" : "Создать"}
          </button>
          {booking && (
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              Отменить
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
