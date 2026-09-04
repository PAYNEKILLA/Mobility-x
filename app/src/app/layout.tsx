import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mobility-X",
  description: "A movement-powered delivery marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
