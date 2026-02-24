"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function BookPage() {
  const supabase = createClient();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    child_name: "",
    parent_name: "",
    parent_phone: "",
    birth_date: "",
    subscription_type: "1",
    trainer_id: "",
    comment: "",
  });

  useEffect(() => {
    supabase
      .from("trainers")
      .select("id, name")
      .is("archived_at", null)
      .order("name")
      .then(({ data }) => setTrainers(data || []));
  }, []);

  function upd(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.child_name.trim() || !form.parent_phone.trim()) return;

    setLoading(true);

    // Create client record
    const { error } = await supabase.from("clients").insert({
      child_full_name: form.child_name.trim(),
      parent_name: form.parent_name.trim() || null,
      parent_phone: form.parent_phone.trim(),
      birth_date: form.birth_date || null,
      subscription_type: form.subscription_type,
      status: "записался",
      assigned_trainer_id: form.trainer_id || null,
      comment: form.comment
        ? `[Онлайн-запись] ${form.comment}`
        : "[Онлайн-запись]",
    });

    setLoading(false);
    if (!error) {
      setSubmitted(true);
    } else {
      console.error(error);
      alert("Произошла ошибка. Попробуйте ещё раз или позвоните нам.");
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-3">Заявка отправлена!</h1>
        <p className="text-gray-500 mb-6">
          Спасибо! Мы перезвоним вам в ближайшее время, чтобы подтвердить запись
          и подобрать удобное время.
        </p>
        <div className="bg-emerald-50 rounded-xl p-4 text-sm text-emerald-700 mb-6">
          <p className="font-medium">Что дальше?</p>
          <p className="mt-1">Наш администратор свяжется с вами по номеру {form.parent_phone} в течение 2 часов.</p>
        </div>
        <Link
          href="/"
          className="text-emerald-600 hover:underline font-medium"
        >
          ← На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-emerald-600 hover:underline">← На главную</Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">Записаться на занятие</h1>
      <p className="text-gray-500 text-sm mb-8">
        Заполните форму и мы перезвоним для подтверждения
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Child name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ФИО ребёнка <span className="text-red-400">*</span>
          </label>
          <input
            required
            value={form.child_name}
            onChange={(e) => upd("child_name", e.target.value)}
            placeholder="Иванов Миша"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>

        {/* Parent name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Имя родителя</label>
          <input
            value={form.parent_name}
            onChange={(e) => upd("parent_name", e.target.value)}
            placeholder="Анна"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Телефон <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="tel"
            value={form.parent_phone}
            onChange={(e) => upd("parent_phone", e.target.value)}
            placeholder="+7 (777) 123-45-67"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>

        {/* Birth date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения ребёнка</label>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => upd("birth_date", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>

        {/* Subscription */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Абонемент</label>
          <select
            value={form.subscription_type}
            onChange={(e) => upd("subscription_type", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          >
            <option value="1">Пробное — 1 занятие (2 000 ₸)</option>
            <option value="4">Стандарт — 4 занятия (10 000 ₸)</option>
            <option value="8">Интенсив — 8 занятий (18 000 ₸)</option>
          </select>
        </div>

        {/* Trainer preference */}
        {trainers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Предпочтительный тренер</label>
            <select
              value={form.trainer_id}
              onChange={(e) => upd("trainer_id", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            >
              <option value="">Без предпочтений</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <textarea
            value={form.comment}
            onChange={(e) => upd("comment", e.target.value)}
            placeholder="Удобное время, особенности здоровья, пожелания..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {loading ? "Отправка..." : "Отправить заявку"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Нажимая кнопку, вы соглашаетесь на обработку персональных данных
        </p>
      </form>
    </div>
  );
}
