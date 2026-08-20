import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DapurPOS - Catering Management System",
  description: "Sistem manajemen catering untuk nasi kotak dan snack",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
