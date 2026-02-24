import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayman CRM",
  description: "CRM для школы плавания",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
