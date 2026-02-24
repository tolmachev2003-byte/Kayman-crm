import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function HomePage() {
  let trainers: any[] = [];
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("trainers")
      .select("id, name, phone")
      .is("archived_at", null)
      .order("name");
    trainers = data || [];
  } catch {}

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-block bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full mb-4 font-medium">
              Школа плавания в Павлодаре
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Научим вашего ребёнка
              <span className="text-emerald-600"> плавать уверенно</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Индивидуальные и групповые занятия для детей от 4 лет.
              Опытные тренеры, тёплый бассейн, видимый результат уже после первых занятий.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/book"
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
              >
                Записаться на пробное занятие
              </Link>
              <a
                href="#pricing"
                className="border-2 border-emerald-200 text-emerald-700 px-6 py-3 rounded-xl font-medium hover:bg-emerald-50 transition"
              >
                Узнать цены
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section className="py-16 bg-white" id="about">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Почему выбирают Kayman</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Мы создали комфортные условия, чтобы каждый ребёнок полюбил воду
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "👨‍🏫",
                title: "Опытные тренеры",
                desc: "Сертифицированные специалисты с педагогическим образованием и опытом работы с детьми от 5 лет",
              },
              {
                icon: "🏊",
                title: "Индивидуальный подход",
                desc: "Занятия по 1–3 ребёнка на тренера. Программа адаптируется под уровень и возраст каждого ученика",
              },
              {
                icon: "🌡️",
                title: "Комфортные условия",
                desc: "Тёплый бассейн (28–30°C), чистая вода, раздевалки с фенами. Всё для удобства детей и родителей",
              },
              {
                icon: "📈",
                title: "Видимый прогресс",
                desc: "Чёткая система уровней. Родители видят прогресс ребёнка после каждого блока занятий",
              },
              {
                icon: "📅",
                title: "Гибкое расписание",
                desc: "Утренние, дневные и вечерние слоты. Легко вписать занятия в расписание школы и кружков",
              },
              {
                icon: "💰",
                title: "Прозрачные цены",
                desc: "Абонементы на 1, 4 или 8 занятий. Никаких скрытых платежей. Первое пробное занятие — со скидкой",
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* КАК ПРОХОДИТ ЗАНЯТИЕ */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Как проходит занятие</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Разминка", desc: "5 минут на суше — подготовка мышц и суставов", time: "5 мин" },
              { step: "2", title: "Техника", desc: "Отработка элементов: дыхание, работа ног, гребки", time: "15 мин" },
              { step: "3", title: "Практика", desc: "Плавание на дистанцию с корректировкой тренера", time: "15 мин" },
              { step: "4", title: "Игра", desc: "Игровые упражнения в воде для закрепления навыков", time: "10 мин" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 text-center">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
                <span className="text-xs text-emerald-600 font-medium">{item.time}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            Длительность одного занятия — <strong>45 минут</strong>
          </p>
        </div>
      </section>

      {/* ТРЕНЕРЫ */}
      <section className="py-16 bg-white" id="trainers">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Наши тренеры</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Каждый тренер имеет профильное образование и опыт работы с детьми
          </p>
          {trainers.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {trainers.map((t) => (
                <div key={t.id} className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    🏊
                  </div>
                  <h3 className="font-semibold text-lg">{t.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">Тренер по плаванию</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">Информация о тренерах появится после настройки CRM</p>
          )}
        </div>
      </section>

      {/* ЦЕНЫ */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-cyan-50" id="pricing">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Абонементы</h2>
          <p className="text-gray-500 text-center mb-12">Выберите подходящий вариант</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                name: "Разовое",
                count: "1 занятие",
                price: "3 000 ₸",
                desc: "Попробовать и познакомиться с тренером",
                color: "bg-white",
                badge: null,
              },
              {
                name: "Стандарт",
                count: "4 занятия",
                price: "10 000 ₸",
                desc: "Оптимальный вариант — 1 раз в неделю",
                color: "bg-emerald-600 text-white",
                badge: "Популярный",
              },
              {
                name: "Интенсив",
                count: "8 занятий",
                price: "18 000 ₸",
                desc: "Максимальный прогресс — 2 раза в неделю",
                color: "bg-white",
                badge: "Выгодно",
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`${plan.color} rounded-2xl p-6 text-center shadow-sm relative ${
                  i === 1 ? "md:scale-105 shadow-lg" : ""
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full ${
                    i === 1 ? "bg-yellow-400 text-yellow-900" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {plan.badge}
                  </span>
                )}
                <h3 className="font-semibold text-lg mt-2">{plan.name}</h3>
                <p className={`text-sm mt-1 ${i === 1 ? "text-emerald-200" : "text-gray-400"}`}>{plan.count}</p>
                <p className="text-3xl font-bold my-4">{plan.price}</p>
                <p className={`text-sm mb-6 ${i === 1 ? "text-emerald-200" : "text-gray-500"}`}>{plan.desc}</p>
                <Link
                  href="/book"
                  className={`inline-block w-full py-2.5 rounded-xl font-medium transition ${
                    i === 1
                      ? "bg-white text-emerald-700 hover:bg-emerald-50"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  Записаться
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            Цены указаны за индивидуальные занятия. Пробное занятие — 2 000 ₸
          </p>
        </div>
      </section>

      {/* РАСПИСАНИЕ */}
      <section className="py-16 bg-white" id="schedule">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Расписание</h2>
          <p className="text-gray-500 text-center mb-8">Занятия проходят каждый день</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse max-w-2xl mx-auto">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="p-3 text-left border font-medium">День</th>
                  <th className="p-3 text-left border font-medium">Время</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { day: "Понедельник", time: "08:00 – 21:00" },
                  { day: "Вторник", time: "08:00 – 21:00" },
                  { day: "Среда", time: "08:00 – 21:00" },
                  { day: "Четверг", time: "08:00 – 21:00" },
                  { day: "Пятница", time: "08:00 – 21:00" },
                  { day: "Суббота", time: "09:00 – 18:00" },
                  { day: "Воскресенье", time: "10:00 – 16:00" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 border">{row.day}</td>
                    <td className="p-3 border text-gray-600">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-6">
            <Link href="/book" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition">
              Выбрать удобное время
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Частые вопросы</h2>
          <div className="space-y-4">
            {[
              {
                q: "С какого возраста можно начинать?",
                a: "Мы берём детей с 4 лет. Для самых маленьких — специальная программа с акцентом на привыкание к воде через игру.",
              },
              {
                q: "Что нужно взять с собой?",
                a: "Купальник или плавки, шапочка для бассейна, очки для плавания, полотенце, сменная обувь (сланцы). Шапочку и очки можно купить у нас.",
              },
              {
                q: "Сколько длится занятие?",
                a: "Одно занятие длится 45 минут: 5 минут разминка, 30 минут основная часть, 10 минут игровые упражнения.",
              },
              {
                q: "Можно ли присутствовать родителям?",
                a: "Да, есть зона для родителей с обзором бассейна. Вы можете наблюдать за занятием.",
              },
              {
                q: "Как отменить занятие?",
                a: "Отмена возможна за 4 часа до начала без потери занятия. Позвоните или напишите нам.",
              },
              {
                q: "Есть ли пробное занятие?",
                a: "Да! Пробное занятие стоит 2 000 ₸. Ребёнок познакомится с тренером, а мы оценим его уровень.",
              },
            ].map((item, i) => (
              <details key={i} className="bg-white rounded-xl p-5 group">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-emerald-500 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + КОНТАКТЫ */}
      <section className="py-16 bg-emerald-600 text-white" id="contact">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Запишите ребёнка на пробное занятие</h2>
          <p className="text-emerald-200 mb-8">
            Первое занятие — 2 000 ₸. Познакомимся, оценим уровень, подберём группу.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Link
              href="/book"
              className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-medium hover:bg-emerald-50 transition"
            >
              Записаться онлайн
            </Link>
            <a
              href="tel:+77771234567"
              className="border-2 border-white/30 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition"
            >
              📞 +7 (777) 123-45-67
            </a>
          </div>
          <div className="text-emerald-200 text-sm">
            <p>📍 г. Павлодар, ул. Примерная, 42</p>
            <p className="mt-1">Ежедневно с 08:00 до 21:00</p>
          </div>
        </div>
      </section>
    </>
  );
}
