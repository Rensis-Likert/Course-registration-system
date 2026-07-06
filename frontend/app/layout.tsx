import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeKUT Unit Reg",
  description: "Course unit registration for Dedan Kimathi University of Technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-navy">{children}</body>
    </html>
  );
}
