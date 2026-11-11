// Put this file at: src/app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jai Shri Krishna Society",
    template: "%s · Jai Shri Krishna Society",
  },
  description:
    "Staff console and member portal for Jai Shri Krishna Co-operative Thrift & Credit Society Ltd.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${dmSans.variable} ${lora.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
