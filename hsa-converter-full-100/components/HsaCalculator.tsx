"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { schools } from "@/data/schools";
import { convertForSchool, Group } from "@/lib/conversion";

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
  const duplicates = schools.filter((item) => normalize(item.shortName) === base);
  return duplicates.length > 1 ? `${base}-${school.id}` : base;
}

export default function HsaCalculator() {
  const [schoolId, setSchoolId] = useState(3);
  const [hsa, setHsa] = useState("100");
  const [group, setGroup] = useState<Group>("A00");
  const [year, setYear] = useState(2026);
  const [q, setQ] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  const school = schools.find((s) => s.id === schoolId)!;
  const result = convertForSchool(school.shortName, Number(hsa), group, year);

  const filtered = useMemo(() => {
    const query = normalize(q);
    if (!query) return schools;

    return schools.filter((s) => {
      const haystack = normalize(`${s.name} ${s.shortName} ${s.code ?? ""}`);
      return haystack.includes(query);
    });
  }, [q]);

  useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function chooseSchool(id: number) {
    setSchoolId(id);
    setQ("");
    setPickerOpen(false);
  }

  function handlePickerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!pickerOpen && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      setPickerOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(filtered.length - 1, 0)));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter" && pickerOpen && filtered[activeIndex]) {
      event.preventDefault();
      chooseSchool(filtered[activeIndex].id);
    }

    if (event.key === "Escape") {
      setPickerOpen(false);
    }
  }

  const badgeClass = result.status === "official" ? "verified" : result.status === "needs-input" ? "needsInput" : "reference";
  const badgeText = result.status === "official"
    ? "BẢNG QUY ĐỔI RIÊNG ĐÃ XÁC MINH"
    : result.status === "official-reference"
      ? "CÓ NGUỒN RIÊNG / ĐỐI CHIẾU"
      : result.status === "needs-input"
        ? "CẦN THÊM DỮ LIỆU"
        : "THAM KHẢO";

  return (
    <div className="wrap">
      <header className="siteHeader">
        <a href="/" className="siteBrand">
          <img src="/logo-hsa.png" alt="QuyDoiHSA" className="headerLogo" />
          <div className="brandText">
            <strong>QuyDoiHSA</strong>
            <span>Công cụ hỗ trợ thí sinh</span>
          </div>
        </a>
        <nav className="siteNav">
          <a href="#calculator">Quy đổi</a>
          <a href="#schools">Các trường</a>
        </nav>
      </header>

      <section className="hero">
        <span className="eyebrow">Dữ liệu theo từng trường · hỗ trợ nhiều năm</span>
        <h1>Quy đổi điểm HSA<br />nhanh chóng chính xác.</h1>
        <p>
          Website ưu tiên công thức/bảng quy đổi chính thức của từng trường. Nếu trường chưa có công thức/bảng quy đổi chính thức riêng đã xác minh,
          kết quả sẽ được gắn nhãn tham khảo thay vì giả định dùng chung một công thức.
        </p>
      </section>

      <section className="grid" id="calculator">
        <div className="card">
          <div className="field schoolPickerField">
            <label className="label">Trường / cơ sở đào tạo</label>

            <div className="schoolPicker" ref={pickerRef}>
              <div className={`schoolSearchShell ${pickerOpen ? "schoolSearchShellOpen" : ""}`}>
                <span className="schoolSearchIcon" aria-hidden="true">⌕</span>
                <input
                  className="schoolSearchInput"
                  type="text"
                  placeholder="Tìm NEU, FTU, PTIT, Ngoại thương..."
                  value={q}
                  onFocus={() => setPickerOpen(true)}
                  onClick={() => setPickerOpen(true)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setQ(e.target.value);
                    setPickerOpen(true);
                  }}
                  onKeyDown={handlePickerKeyDown}
                  autoComplete="off"
                  aria-label="Tìm trường hoặc cơ sở đào tạo"
                  aria-expanded={pickerOpen}
                  aria-controls="school-picker-list"
                />
                <button
                  type="button"
                  className="schoolPickerToggle"
                  onClick={() => setPickerOpen((open) => !open)}
                  aria-label={pickerOpen ? "Đóng danh sách trường" : "Mở danh sách trường"}
                >
                  <span className={pickerOpen ? "pickerChevron pickerChevronOpen" : "pickerChevron"}>⌄</span>
                </button>
              </div>

              {pickerOpen && (
                <div className="schoolDropdown" id="school-picker-list" role="listbox">
                  <div className="schoolDropdownTop">
                    <span>{filtered.length} kết quả</span>
                    <span>Dùng ↑ ↓ và Enter để chọn</span>
                  </div>

                  {filtered.length > 0 ? (
                    filtered.map((s, index) => (
                      <button
                        type="button"
                        key={s.id}
                        role="option"
                        aria-selected={s.id === schoolId}
                        className={`schoolOption ${s.id === schoolId ? "schoolOptionSelected" : ""} ${index === activeIndex ? "schoolOptionKeyboard" : ""}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => chooseSchool(s.id)}
                      >
                        <span className="schoolOptionMain">
                          <span className="schoolOptionShort">{s.shortName}</span>
                          <span className="schoolOptionName">{s.name}</span>
                        </span>

                        <span className="schoolOptionMeta">
                          {s.code ? `Mã ${s.code}` : `#${s.id}`}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="schoolEmpty">
                      <strong>Không tìm thấy trường</strong>
                      <span>Thử tên đầy đủ, mã trường hoặc tên viết tắt.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="selectedSchool">
                <span className="selectedSchoolLabel">Đang chọn</span>
                <span className="selectedSchoolInfo">
                  <strong>{school.shortName}</strong>
                  <span>{school.name}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label className="label">Năm tuyển sinh</label>
              <select className="select" value={year} onChange={(e: ChangeEvent<HTMLSelectElement>) => setYear(Number(e.target.value))}>
                <option value={2026}>2026</option>
                <option value={2027} disabled>2027 · chưa công bố</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Điểm HSA (0–150)</label>
              <input className="input" type="number" min="0" max="150" value={hsa} onChange={(e: ChangeEvent<HTMLInputElement>) => setHsa(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="label">Tổ hợp quy đổi tham chiếu</label>
            <select className="select" value={group} onChange={(e: ChangeEvent<HTMLSelectElement>) => setGroup(e.target.value as Group)}>
              <option>A00</option><option>B00</option><option>C00</option><option>D01</option>
            </select>
          </div>

          <div className="notice">
            Nếu sau khi nhập điểm không hiện điểm đã quy đổi thì đã chưa đạt/quá giới hạn điểm trường xét. Tổ hợp chỉ tác động tới các trường dùng bảng phân vị chung.
          </div>
        </div>

        <div className="card">
          <span className={`badge ${badgeClass}`}>{badgeText}</span>
          <div className="small" style={{ marginTop: 10 }}>{school.name} - {school.shortName} · {year}</div>
          <div className="score">{result.score === null ? "—" : result.score.toFixed(2)}</div>
          <div className="muted">{result.score === null ? "chưa thể tính chỉ từ điểm HSA" : "điểm quy đổi / 30"}</div>

          <div className="kpis">
            <div className="kpi"><span className="small">HSA nhập</span><strong>{hsa || "—"}/150</strong></div>
            <div className="kpi"><span className="small">Rule đang dùng</span><strong className="ruleName">{result.label}</strong></div>
          </div>

          <div className="notice">
            {result.note}
            <br /><br />
            <a href={result.source} target="_blank" rel="noopener noreferrer">Mở nguồn quy đổi ↗</a>
            <br /><br />
            <a href={`/truong/${getSchoolSlug(school)}`} style={{ fontWeight: 700 }}>Xem trang HSA {school.shortName} {year} →</a>
          </div>
        </div>
      </section>

      <section className="schools card" id="schools">
        <div className="schoolsHeader">
          <div>
            <h2>Tra cứu HSA theo trường</h2>
            <div className="small">BẢNG QUY ĐỔI 2026 được tách riêng theo trường khi có nguồn xác minh; các trường còn lại hiện nhãn tham khảo.</div>
          </div>
          <input className="input" style={{ maxWidth: 320 }} placeholder="Tìm NEU, FTU, HaUI, UET..." value={q} onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} />
        </div>
        <div className="list">
          {filtered.map((s) => {
            const slug = getSchoolSlug(s);
            return (
              <div className="schoolItem" key={s.id}>
                <div onClick={() => setSchoolId(s.id)} style={{ cursor: "pointer" }}>
                  <b>{s.id}. {s.name} - {s.shortName}</b>
                  <span className="small">{s.code ? `Mã: ${s.code} · ` : ""}{s.note}</span>
                </div>
                <a href={`/truong/${slug}`}>Xem trang quy đổi HSA {s.shortName} →</a>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="siteFooter">
        <div className="footerGrid">
          <div className="footerBlock footerAbout">
            <div className="footerBrand">
              <img src="/logo-hsa.png" alt="QuyDoiHSA" className="footerLogo" />
              <div>
                <strong>QuyDoiHSA</strong>
                <span>Công cụ tra cứu & quy đổi HSA</span>
              </div>
            </div>
            <p>QuyDoiHSA hỗ trợ tra cứu các trường sử dụng kết quả HSA, tham khảo mức quy đổi và tổng hợp thông tin tuyển sinh.</p>
            <div className="footerInfo">
              <div><span>✉</span><a href="mailto:zxcvbnmlkjhgfdsa06a@gmail.com">zxcvbnmlkjhgfdsa06a@gmail.com</a></div>
              <div><span>🌐</span><a href="https://quydoihsa.com">quydoihsa.com</a></div>
            </div>
            <div className="socialRow">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="TikTok">♪</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>
          </div>

          <div className="footerBlock">
            <h3>DANH MỤC</h3><div className="footerLine" />
            <a href="/">Quy đổi điểm HSA</a>
            <a href="#schools">Tra cứu trường</a>
            <a href="/truong/neu">Quy đổi HSA NEU</a>
            <a href="/truong/ftu">Quy đổi HSA FTU</a>
            <a href="/truong/uet">Quy đổi HSA UET</a>
          </div>

          <div className="footerBlock">
            <h3>HỖ TRỢ</h3><div className="footerLine" />
            <p>Tư vấn & hỗ trợ sử dụng website</p>
            <a href="mailto:contact@quydoihsa.com">Liên hệ hỗ trợ</a>
            <a href="#schools">Tìm trường sử dụng HSA</a>
            <p className="footerHours">Cập nhật dữ liệu tuyển sinh định kỳ.</p>
          </div>

          <div className="footerBlock">
            <h3>CHÍNH SÁCH & THÔNG TIN</h3><div className="footerLine" />
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Nguồn dữ liệu</a>
            <a href="#">Miễn trừ trách nhiệm</a>
          </div>
        </div>
        <div className="footerBottom">
          <span>© 2026 QuyDoiHSA · MeefuTech</span>
          <span>Dữ liệu quy đổi chỉ mang tính tham khảo.</span>
        </div>
      </footer>
    </div>
  );
}
