import type { Metadata } from "next";
import "./globals.css";
import { WorkoutProvider } from "@/lib/workout-context";

export const metadata: Metadata = {
  title: "Muscle Tracker - 高機能筋トレ記録アプリ",
  description: "トレーニング中のUX最適化を重視した筋トレ記録Webアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className="antialiased">
        <WorkoutProvider>
          {children}
        </WorkoutProvider>
      </body>
    </html>
  );
}
