import type { Metadata } from "next";
import "./globals.css";
import { WorkoutProvider } from "@/lib/workout-context";

export const metadata: Metadata = {
  title: "Muscle Tracker - 高機能筋トレ記録アプリ",
  description: "トレーニング中のUX最適化を重視した筋トレ記録Webアプリ",
  manifest: "/manifest.json",
  themeColor: "#22c55e",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Muscle Tracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body className="antialiased">
        <WorkoutProvider>
          {children}
        </WorkoutProvider>
      </body>
    </html>
  );
}
