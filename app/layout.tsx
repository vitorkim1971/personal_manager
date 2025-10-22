import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "개인 업무/재정 관리 시스템",
  description: "업무와 재정을 효율적으로 관리하는 통합 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
