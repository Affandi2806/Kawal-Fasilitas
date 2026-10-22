import { Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Kawal Fasilitas",
  description: "Lapor dan pantau perbaikan fasilitas umum desa",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kawal Fasilitas",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakartaSans.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
