import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "EduSphere 360 - Premium School ERP",
  description: "Executive-grade international school management system demonstration dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
