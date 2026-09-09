"use client";

import { useMemo, useState } from "react";
import { schools } from "@/data/schools";
import { convert, Group } from "@/lib/conversion";

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

function getSchoolSlug(school: (typeof schools)[number]) {
  const base = normalize(school.shortName);

  const duplicates = schools.filter(
    (item) => normalize(item.shortName) === base
  );

  return duplicates.length > 1
    ? `${base}-${school.id}`
    : base;
}

export default function HsaCalculator() {
  const [schoolId, setSchoolId] = useState(3);
  const [hsa, setHsa] = useState("100");
  const [group, setGroup] = useState<Group>("A00");
  const [q, setQ] = useState("");

  const school = schools.find((s) => s.id === schoolId)!;
  const score = convert(Number(hsa), group);

  const filtered = useMemo(
    () =>
      schools.filter((s) =>
        `${s.name} ${s.shortName} ${s.code ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase())
      ),
    [q]
  );

  return (
    <div className="wrap">

      {/* HEADER */}
      <header className="siteHeader">
        <a href="/" className="siteBrand">
          <img
            src="/logo-hsa.png"
            alt="QuyDoiHSA"
            className="headerLogo"
          />

          <div className="brandText">
            <strong>QuyDoiHSA</strong>
            <span>Công cụ tra cứu & quy đổi HSA</span>
          </div>
        </a>

        <nav className="siteNav">
          <a href="/">Quy đổi HSA</a>
          <a href="#schools">Các trường</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <span className="eyebrow">
          Công Cụ Quy Đổi HSA - LH QC ZALO : 033333.9660
        </span>

        <h1>
          Tra cứu trường dùng HSA
          <br />
          và quy đổi tham khảo.
        </h1>

        <p>
          Danh sách trường bám theo VNU-IDT. Bảng điểm quy đổi tham
          chiếu theo phân vị HSA 2026; trường nào có công thức riêng
          thì cần đối chiếu đề án tuyển sinh của trường trước khi nộp
          nguyện vọng.
        </p>
      </section>

      {/* CALCULATOR */}
      <section className="grid">

        {/* LEFT */}
        <div className="card">
          <div className="field">
            <label className="label">
              Trường / cơ sở đào tạo
            </label>

            <select
              className="select"
              value={schoolId}
              onChange={(e) =>
                setSchoolId(Number(e.target.value))
              }
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. {s.name} - {s.shortName}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="field">
              <label className="label">
                Điểm HSA (0–150)
              </label>

              <input
                className="input"
                type="number"
                min="0"
                max="150"
                value={hsa}
                onChange={(e) =>
                  setHsa(e.target.value)
                }
              />
            </div>

            <div className="field">
              <label className="label">
                Tổ hợp quy đổi
              </label>

              <select
                className="select"
                value={group}
                onChange={(e) =>
                  setGroup(e.target.value as Group)
                }
              >
                <option>A00</option>
                <option>B00</option>
                <option>C00</option>
                <option>D01</option>
              </select>
            </div>
          </div>

          <div className="notice">
            Lưu ý: nhiều trường ngoài ĐHQGHN dùng công thức/bách
            phân vị riêng. Kết quả bên phải sẽ tự gắn nhãn
            “tham khảo” khi chưa có rule riêng được xác minh
            trong project.
          </div>
        </div>

        {/* RIGHT */}
        <div className="card">
          <span
            className={`badge ${
              school.status === "verified"
                ? "verified"
                : "reference"
            }`}
          >
            {school.status === "verified"
              ? "ĐÃ XÁC MINH NGUỒN HSA 2026"
              : "THAM KHẢO - CẦN CHECK RULE TRƯỜNG"}
          </span>

          <div
            className="small"
            style={{ marginTop: 10 }}
          >
            {school.name} - {school.shortName}
          </div>

          <div className="score">
            {score === null
              ? "—"
              : score.toFixed(2)}
          </div>

          <div className="muted">
            điểm quy đổi tham chiếu / 30 · tổ hợp{" "}
            {group}
          </div>

          <div className="kpis">
            <div className="kpi">
              <span className="small">
                HSA nhập
              </span>

              <strong>
                {hsa || "—"}/150
              </strong>
            </div>

            <div className="kpi">
              <span className="small">
                Số trường trong hệ thống
              </span>

              <strong>
                {schools.length}
              </strong>
            </div>
          </div>

          <div className="notice">
            {school.note}

            <br />
            <br />

            <a
              href={school.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              Mở danh sách nguồn VNU-IDT ↗
            </a>

            <br />
            <br />

            <a
              href={`/truong/${getSchoolSlug(school)}`}
              style={{
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Xem thông tin HSA {school.shortName} 2026 →
            </a>
          </div>
        </div>

      </section>

      {/* SCHOOL LIST */}
      <section
        className="schools card"
        id="schools"
      >
        <div className="schoolsHeader">
          <div>
            <h2>
              Tra cứu quy đổi HSA theo trường
            </h2>

            <div className="small">
              Danh sách 100 cơ sở sử dụng HSA.
              Nguồn danh sách: VNU-IDT, cập nhật
              31/12/2025.
            </div>
          </div>

          <input
            className="input"
            style={{ maxWidth: 320 }}
            placeholder="Tìm tên trường / viết tắt (NEU, FTU, PTIT...)"
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
          />
        </div>

        <div className="list">
          {filtered.map((s) => {
            const slug = getSchoolSlug(s);

            return (
              <div
                className="schoolItem"
                key={s.id}
              >
                <div
                  onClick={() =>
                    setSchoolId(s.id)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <b>
                    {s.id}. {s.name} -{" "}
                    {s.shortName}
                  </b>

                  <span className="small">
                    {s.code
                      ? `Mã: ${s.code} · `
                      : ""}

                    {s.status === "verified"
                      ? "ĐHQGHN / có bảng tham chiếu 2026"
                      : "Có sử dụng HSA · cần đối chiếu quy tắc riêng"}
                  </span>
                </div>

                <a
                  href={`/truong/${slug}`}
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  Xem trang quy đổi HSA{" "}
                  {s.shortName} 2026 →
                </a>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}