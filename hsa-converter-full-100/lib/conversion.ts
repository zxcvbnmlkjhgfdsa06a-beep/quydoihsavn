import { schoolRules, VNU_SHORT_NAMES, type Band, type SchoolRule } from "@/data/schoolRules";

export type Group = "A00" | "B00" | "C00" | "D01";

export const points = [
  {hsa:129,A00:29.98,B00:29.75,C00:28.00,D01:28.26},{hsa:117,A00:28.51,B00:28.99,C00:27.27,D01:26.75},
  {hsa:114,A00:28.23,B00:28.75,C00:27.01,D01:26.27},{hsa:111,A00:27.74,B00:28.27,C00:26.51,D01:25.99},
  {hsa:108,A00:27.24,B00:27.98,C00:26.25,D01:25.50},{hsa:105,A00:26.75,B00:27.49,C00:25.85,D01:25.01},
  {hsa:100,A00:26.00,B00:26.73,C00:25.24,D01:24.27},{hsa:93,A00:24.99,B00:25.51,C00:24.26,D01:23.26},
  {hsa:88,A00:24.11,B00:24.74,C00:23.52,D01:22.51},{hsa:83,A00:23.27,B00:23.76,C00:22.86,D01:21.76},
  {hsa:79,A00:22.51,B00:22.99,C00:22.19,D01:21.02},{hsa:75,A00:21.73,B00:22.00,C00:21.48,D01:20.48},
  {hsa:70,A00:20.33,B00:20.56,C00:20.48,D01:19.49},{hsa:66,A00:19.12,B00:19.48,C00:19.52,D01:18.74},
  {hsa:60,A00:17.11,B00:17.35,C00:18.09,D01:17.48},{hsa:19,A00:8.25,B00:8.68,C00:10.48,D01:9.75},
] as const;

export function convert(hsa:number,g:Group){
  if(!Number.isFinite(hsa)||hsa<19||hsa>150)return null;
  const a=[...points].sort((x,y)=>y.hsa-x.hsa);
  if(hsa>=a[0].hsa)return Math.min(30,a[0][g]+(hsa-a[0].hsa)*(30-a[0][g])/(150-a[0].hsa));
  for(let i=0;i<a.length-1;i++){
    const u=a[i],l=a[i+1];
    if(hsa<=u.hsa&&hsa>=l.hsa){
      const r=(hsa-l.hsa)/(u.hsa-l.hsa);
      return +(l[g]+r*(u[g]-l[g])).toFixed(2);
    }
  }
  return null;
}

function convertBands(hsa: number, bands: Band[]) {
  for (const b of bands) {
    if (hsa >= b.hsaMin && hsa <= b.hsaMax) {
      if (b.hsaMax === b.hsaMin) return b.thptMax;
      const t = (hsa - b.hsaMin) / (b.hsaMax - b.hsaMin);
      return +(b.thptMin + t * (b.thptMax - b.thptMin)).toFixed(2);
    }
  }
  return null;
}

function calculateRule(rule: SchoolRule, hsa: number, group: Group) {
  if (rule.method === "formula" && rule.formula) return rule.formula(hsa);
  if (rule.method === "bands" && rule.bands) return convertBands(hsa, rule.bands);
  if (rule.method === "lookup" && rule.lookup) {
    if (hsa >= 130 && rule.school === "HaUI") return 30;
    const rounded = Math.round(hsa);
    return rule.lookup[rounded] ?? null;
  }
  if (rule.method === "vnu-percentile") return convert(hsa, rule.group ?? group);
  return null;
}

export type ConversionResult = {
  score: number | null;
  year: number;
  status: "official" | "official-reference" | "needs-input" | "reference";
  label: string;
  note: string;
  source: string;
  method: string;
};

export function convertForSchool(shortName: string, hsa: number, group: Group, year = 2026): ConversionResult {
  const rule = schoolRules[shortName]?.[year];
  if (rule) {
    return {
      score: calculateRule(rule, hsa, group),
      year,
      status: rule.status,
      label: rule.label,
      note: rule.note,
      source: rule.source,
      method: rule.method,
    };
  }

  if (VNU_SHORT_NAMES.has(shortName)) {
    return {
      score: convert(hsa, group),
      year,
      status: "official-reference",
      label: `Bảng phân vị ĐHQGHN ${year}`,
      note: "Đơn vị thuộc ĐHQGHN: dùng bảng phân vị HSA theo tổ hợp để tham khảo. Đề án ngành cụ thể có thể có điều kiện bổ sung.",
      source: "https://idt.vnu.edu.vn/tin-tuc/tin-noi-bat/dhqghn-thong-bao-bang-phan-vi-quy-doi-tuong-duong-giua-diem-thi-hsa-va-diem-thi-tot-nghiep-thpt-nam-2026",
      method: "vnu-percentile",
    };
  }

  return {
    score: convert(hsa, group),
    year,
    status: "reference",
    label: "Tham khảo theo phân vị HSA ĐHQGHN",
    note: "Chưa cài rule riêng đã xác minh cho trường này trong năm được chọn. Kết quả chỉ là tham khảo và không thay thế đề án tuyển sinh của trường.",
    source: "https://www.hsa.edu.vn/tra-cuu/truong-dai-hoc-su-dung",
    method: "reference",
  };
}

export function supportedYears(shortName: string) {
  return Object.keys(schoolRules[shortName] ?? {}).map(Number).sort((a,b)=>b-a);
}
