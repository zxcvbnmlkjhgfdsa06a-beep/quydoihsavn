import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://quydoihsa.com"),
  title: {
    default: "Quy đổi điểm HSA 2026 - Tra cứu HSA các trường",
    template: "%s | QuyDoiHSA",
  },
  description:
    "Công cụ quy đổi điểm HSA theo quy tắc riêng từng trường và từng năm tuyển sinh. Tra cứu HSA 2026, nguồn và trạng thái xác minh.",
  keywords: [
    "HSA",
    "quy đổi HSA",
    "quy đổi điểm HSA",
    "quy đổi HSA 2026",
    "điểm HSA",
    "HSA 2026",
    "tra cứu HSA",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Quy đổi điểm HSA 2026",
    description: "Tra cứu và quy đổi HSA theo quy tắc riêng từng trường.",
    url: "https://quydoihsa.com",
    siteName: "QuyDoiHSA",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
