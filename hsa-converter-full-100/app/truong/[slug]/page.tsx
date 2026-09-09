import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { schools } from "../../../data/schools";
import { schoolRules } from "../../../data/schoolRules";

function normalize(value: string) {
  return value.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function getSlug(school: (typeof schools)[number]) {
  const base = normalize(school.shortName);
  const duplicates = schools.filter((item) => normalize(item.shortName) === base);
  return duplicates.length > 1 ? `${base}-${school.id}` : base;
}
function getSchool(slug: string) { return schools.find((school) => getSlug(school) === slug); }

export function generateStaticParams() { return schools.map((school) => ({ slug: getSlug(school) })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const school = getSchool(slug);
  if (!school) return { title: "Không tìm thấy trường" };
  const url = `https://quydoihsa.com/truong/${getSlug(school)}`;
  return {
    title: `Quy đổi điểm HSA ${school.shortName} 2026 - ${school.name}`,
    description: `Tra cứu quy đổi HSA 2026 của ${school.name} - ${school.shortName}, nguồn và trạng thái rule riêng của trường.`,
    alternates: { canonical: url },
    openGraph: { title: `Quy đổi HSA ${school.shortName} 2026`, description: `Tra cứu thông tin HSA 2026 của ${school.name}.`, url, type: "website" },
  };
}

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = getSchool(slug);
  if (!school) {
    notFound();
    return null;
  }

  const rule = schoolRules[school.shortName]?.[2026];
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "60px 20px" }}>
      <a href="/">← Quay lại công cụ quy đổi HSA</a>
      <h1 style={{ fontSize: "clamp(32px,6vw,52px)", marginTop: 30, marginBottom: 16, lineHeight: 1.1 }}>Quy đổi điểm HSA {school.shortName} 2026</h1>
      <p style={{ fontSize: 20, lineHeight: 1.6 }}>{school.name}{school.code ? ` - Mã trường: ${school.code}` : ""}</p>
      <section style={{ marginTop: 40, padding: 28, border: "1px solid #e5e7eb", borderRadius: 20 }}>
        <h2>Rule 2026</h2>
        <p style={{ lineHeight: 1.7 }}>{rule?.note ?? school.note}</p>
        <p><strong>Trạng thái:</strong> {rule?.status ?? "reference"}</p>
        <p><strong>Phương pháp:</strong> {rule?.label ?? "Tham khảo theo phân vị HSA"}</p>
        <p><a href={rule?.source ?? school.source} target="_blank" rel="noopener noreferrer">Mở nguồn ↗</a></p>
      </section>
      <section style={{ marginTop: 45 }}>
        <h2>Lưu ý khi dùng điểm HSA {school.shortName}</h2>
        <p style={{ lineHeight: 1.8 }}>Điểm quy đổi không đồng nghĩa điểm chuẩn. Một số trường còn cộng điểm ưu tiên, điểm thưởng hoặc yêu cầu thêm học bạ/chứng chỉ. Hãy đối chiếu đề án tuyển sinh đúng năm và đúng chương trình.</p>
      </section>
    </main>
  );
}
