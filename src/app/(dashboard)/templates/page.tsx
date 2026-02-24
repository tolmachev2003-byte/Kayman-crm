"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Trainer } from "@/lib/types";
import Link from "next/link";

export default function TemplatesPage() {
  const supabase = createClient();
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    supabase.from("trainers").select("*").is("archived_at", null).order("name")
      .then(({ data }) => setTrainers(data || []));
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">📋 Шаблоны расписания</h1>
      <p className="text-sm text-gray-500 mb-4">
        Настройте рабочие часы тренеров и закрепите постоянных клиентов за слотами.
      </p>
      <div className="space-y-2">
        {trainers.map((t) => (
          <Link
            key={t.id}
            href={`/templates/${t.id}`}
            className="block bg-white border rounded-lg p-4 hover:shadow-sm"
          >
            <p className="font-medium">{t.name}</p>
            <p className="text-sm text-gray-400">{t.phone || "Нет телефона"}</p>
          </Link>
        ))}
        {trainers.length === 0 && (
          <p className="text-gray-400">Нет тренеров. Добавьте в Настройках.</p>
        )}
      </div>
    </div>
  );
}
