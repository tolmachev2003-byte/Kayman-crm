import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏊</span>
            <span className="font-bold text-xl text-emerald-700">Kayman</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#about" className="text-gray-600 hover:text-emerald-600">О нас</a>
            <a href="#trainers" className="text-gray-600 hover:text-emerald-600">Тренеры</a>
            <a href="#pricing" className="text-gray-600 hover:text-emerald-600">Цены</a>
            <a href="#schedule" className="text-gray-600 hover:text-emerald-600">Расписание</a>
            <a href="#contact" className="text-gray-600 hover:text-emerald-600">Контакты</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              Записаться
            </Link>
            <Link
              href="/login"
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Вход
            </Link>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex gap-4 px-4 pb-2 text-xs overflow-x-auto">
          <a href="#about" className="text-gray-500 whitespace-nowrap">О нас</a>
          <a href="#trainers" className="text-gray-500 whitespace-nowrap">Тренеры</a>
          <a href="#pricing" className="text-gray-500 whitespace-nowrap">Цены</a>
          <a href="#schedule" className="text-gray-500 whitespace-nowrap">Расписание</a>
          <a href="#contact" className="text-gray-500 whitespace-nowrap">Контакты</a>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-white text-lg mb-3">🏊 Kayman</h3>
              <p className="text-sm text-emerald-300">
                Школа плавания в Павлодаре. Обучаем детей и взрослых плаванию
                с индивидуальным подходом к каждому ученику.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Контакты</h4>
              <div className="space-y-2 text-sm">
                <p>📍 г. Павлодар, ул. Примерная, 42</p>
                <p>📞 +7 (777) 123-45-67</p>
                <p>📧 kayman.swim@gmail.com</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Режим работы</h4>
              <div className="space-y-1 text-sm">
                <p>Пн–Пт: 08:00–21:00</p>
                <p>Сб: 09:00–18:00</p>
                <p>Вс: 10:00–16:00</p>
              </div>
            </div>
          </div>
          <div className="border-t border-emerald-800 mt-8 pt-6 text-center text-sm text-emerald-400">
            © {new Date().getFullYear()} Kayman. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
