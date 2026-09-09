import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { schools } from "../../../data/schools";

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSlug(school: (typeof schools)[number]) {
  const base = normalize(school.shortName);

  const duplicates = schools.filter(
    (item) => normalize(item.shortName) === base
  );

  if (duplicates.length > 1) {
    return `${base}-${school.id}`;
  }

  return base;
}

function getSchool(slug: string) {
  return schools.find((school) => getSlug(school) === slug);
}

export function generateStaticParams() {
  return schools.map((school) => ({
    slug: getSlug(school),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = getSchool(slug);

  if (!school) {
    return {
      title: "Không tìm thấy trường",
    };
  }

  const url = `https://quydoihsa.com/truong/${getSlug(school)}`;

  return {
    title: `Quy đổi điểm HSA ${school.shortName} 2026 - ${school.name}`,

    description:
      `Tra cứu quy đổi điểm HSA 2026 của ${school.name} - ${school.shortName}. ` +
      `Xem thông tin sử dụng điểm HSA, phương thức xét tuyển và nguồn tham khảo.`,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: `Quy đổi HSA ${school.shortName} 2026`,
      description:
        `Tra cứu thông tin quy đổi điểm HSA 2026 của ${school.name}.`,
      url,
      type: "website",
    },
  };
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = getSchool(slug);

  if (!school) {
    notFound();
  }

  const verified = school.status === "verified";

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "60px 20px",
      }}
    >
      <a
        href="/"
        style={{
          textDecoration: "none",
          color: "#2563eb",
        }}
      >
        ← Quay lại công cụ quy đổi HSA
      </a>

      <h1
        style={{
          fontSize: "clamp(32px, 6vw, 52px)",
          marginTop: 30,
          marginBottom: 16,
          lineHeight: 1.1,
        }}
      >
        Quy đổi điểm HSA {school.shortName} 2026
      </h1>

      <p
        style={{
          fontSize: 20,
          lineHeight: 1.6,
        }}
      >
        {school.name}
        {school.code ? ` - Mã trường: ${school.code}` : ""}
      </p>

      <section
        style={{
          marginTop: 40,
          padding: 28,
          border: "1px solid #e5e7eb",
          borderRadius: 20,
        }}
      >
        <h2>Thông tin xét tuyển HSA</h2>

        <p style={{ lineHeight: 1.7 }}>{school.note}</p>

        <p>
          Trạng thái dữ liệu:{" "}
          <strong>
            {verified
              ? "Đã xác minh trong nhóm ĐHQGHN"
              : "Thông tin tham khảo"}
          </strong>
        </p>
      </section>

      <section style={{ marginTop: 45 }}>
        <h2>{school.shortName} có sử dụng điểm HSA không?</h2>

        <p style={{ lineHeight: 1.8 }}>
          {school.name} có trong dữ liệu cơ sở sử dụng kết quả kỳ thi đánh giá
          năng lực HSA được website tham khảo. Thí sinh cần kiểm tra đề án tuyển
          sinh năm 2026 của trường để xác định ngành, điều kiện và công thức quy
          đổi áp dụng cụ thể.
        </p>
      </section>

      <section style={{ marginTop: 45 }}>
        <h2>Cách quy đổi điểm HSA {school.shortName} 2026</h2>

        <p style={{ lineHeight: 1.8 }}>
          Điểm HSA không nên được quy đổi bằng một công thức chung cho tất cả
          các trường. Mỗi cơ sở đào tạo có thể công bố phương án xét tuyển,
          ngưỡng đầu vào và cách quy đổi riêng.
        </p>

        <p style={{ lineHeight: 1.8 }}>
          Bạn có thể sử dụng công cụ trên QuyDoiHSA để tham khảo mức điểm tương
          đương, sau đó đối chiếu với thông báo tuyển sinh chính thức của{" "}
          {school.name}.
        </p>
      </section>

      <section style={{ marginTop: 45 }}>
        <h2>Câu hỏi thường gặp</h2>

        <h3>HSA bao nhiêu điểm có thể xét {school.shortName}?</h3>

        <p style={{ lineHeight: 1.8 }}>
          Ngưỡng xét tuyển phụ thuộc ngành và quy định tuyển sinh từng năm.
          Không nên dùng một mốc HSA duy nhất để kết luận trúng tuyển.
        </p>

        <h3>Điểm quy đổi HSA {school.shortName} có phải điểm chuẩn không?</h3>

        <p style={{ lineHeight: 1.8 }}>
          Không. Điểm quy đổi, điểm sàn và điểm trúng tuyển là các khái niệm
          khác nhau. Kết quả trên website nên được dùng để tham khảo và cần đối
          chiếu nguồn tuyển sinh của trường.
        </p>
      </section>

      <section
        style={{
          marginTop: 45,
          padding: 24,
          background: "#f8fafc",
          borderRadius: 18,
        }}
      >
        <h2>Nguồn tham khảo</h2>

        <p>
          <a
            href={school.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            Danh sách cơ sở sử dụng kết quả HSA
          </a>
        </p>
      </section>
    </main>
  );
}
