import type { Group } from "@/lib/conversion";

export type RuleStatus = "official" | "official-reference" | "needs-input" | "reference";

export type Band = {
  hsaMin: number;
  hsaMax: number;
  thptMin: number;
  thptMax: number;
};

export type SchoolRule = {
  year: number;
  school: string;
  label: string;
  status: RuleStatus;
  method: "formula" | "bands" | "lookup" | "vnu-percentile" | "needs-input" | "reference";
  minHsa?: number;
  maxHsa?: number;
  formula?: (hsa: number) => number | null;
  bands?: Band[];
  lookup?: Record<number, number>;
  source: string;
  note: string;
  group?: Group;
};

const hauiLookup: Record<number, number> = {
  75:20.48,76:20.52,77:20.75,78:20.99,79:21.02,80:21.25,81:21.49,82:21.52,
  83:21.76,84:21.99,85:22.02,86:22.25,87:22.48,88:22.51,89:22.74,90:22.77,
  91:23.00,92:23.23,93:23.26,94:23.49,95:23.52,96:23.75,97:23.98,98:24.01,
  99:24.24,100:24.27,101:24.50,102:24.52,103:24.75,104:24.98,105:25.01,
  106:25.24,107:25.27,108:25.50,109:25.52,110:25.76,111:25.99,112:26.01,
  113:26.24,114:26.27,115:26.50,116:26.52,117:26.75,118:26.98,119:27.00,
  120:27.23,121:27.27,122:27.49,123:27.51,124:27.74,125:27.76,126:27.77,
  127:28.01,128:28.24,129:28.26,130:30.00,
};

const neuBands: Band[] = [
  { hsaMin: 85, hsaMax: 87, thptMin: 22, thptMax: 24 },
  { hsaMin: 87, hsaMax: 98, thptMin: 24, thptMax: 26 },
  { hsaMin: 98, hsaMax: 112, thptMin: 26, thptMax: 28 },
  { hsaMin: 112, hsaMax: 150, thptMin: 28, thptMax: 30 },
];

const uttBands: Band[] = [
  { hsaMin: 50, hsaMax: 63, thptMin: 15, thptMax: 18 },
  { hsaMin: 63, hsaMax: 78, thptMin: 18, thptMax: 21 },
  { hsaMin: 78, hsaMax: 91, thptMin: 21, thptMax: 23 },
  { hsaMin: 91, hsaMax: 105, thptMin: 23, thptMax: 25 },
  { hsaMin: 105, hsaMax: 150, thptMin: 25, thptMax: 30 },
];

const unetiBands: Band[] = [
  { hsaMin: 0, hsaMax: 55, thptMin: 0, thptMax: 16 },
  { hsaMin: 55, hsaMax: 65, thptMin: 16, thptMax: 18 },
  { hsaMin: 65, hsaMax: 75, thptMin: 18, thptMax: 22 },
  { hsaMin: 75, hsaMax: 90, thptMin: 22, thptMax: 26 },
  { hsaMin: 90, hsaMax: 150, thptMin: 26, thptMax: 30 },
];

const uetPoints = [
  [65,18.83],[70,20.33],[80,22.75],[90,24.49],[100,26.00],[110,27.51],[112,27.77],[120,29.01],[130,30.00],
] as const;

function piecewise(points: readonly (readonly [number, number])[], x: number) {
  if (x < points[0][0]) return null;
  if (x >= points[points.length - 1][0]) return points[points.length - 1][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    if (x >= x1 && x <= x2) {
      const t = (x - x1) / (x2 - x1);
      return +(y1 + t * (y2 - y1)).toFixed(2);
    }
  }
  return null;
}

export const schoolRules: Record<string, Record<number, SchoolRule>> = {
  NEU: {
    2026: {
      year: 2026,
      school: "NEU",
      label: "Bảng khoảng điểm riêng NEU 2026",
      status: "official",
      method: "bands",
      minHsa: 85,
      maxHsa: 150,
      bands: neuBands,
      source: "https://nct.neu.edu.vn/post/dai-hoc-kinh-te-quoc-dan-cong-bo-bang-quy-doi-tuong-duong-muc-diem-chuan-giua-cac-phuong-thuc-xet-tuyen-nam-2026",
      note: "NEU công bố các khoảng HSA tương đương điểm THPT. Công cụ nội suy tuyến tính bên trong từng khoảng; HSA dưới 85 không đạt ngưỡng phương thức này.",
    },
  },
  FTU: {
    2026: {
      year: 2026,
      school: "FTU",
      label: "Công thức HSA riêng FTU 2026",
      status: "official",
      method: "formula",
      minHsa: 100,
      maxHsa: 150,
      formula: (hsa) => hsa < 100 || hsa > 150 ? null : +(27 + (hsa - 100) * 3 / 50).toFixed(2),
      source: "https://thongtintuyensinh.ftu.edu.vn/admissions-methods",
      note: "Các chương trình thang 30: Điểm quy đổi HSA = 27 + (HSA - 100)×3/50, chưa cộng điểm ưu tiên/điểm thưởng. Một số chương trình tích hợp dùng thang 40 hoặc công thức kết hợp khác.",
    },
  },
  UET: {
    2026: {
      year: 2026,
      school: "UET",
      label: "Bảng HSA riêng UET 2026",
      status: "official-reference",
      method: "formula",
      minHsa: 65,
      maxHsa: 150,
      formula: (hsa) => piecewise(uetPoints, hsa),
      source: "https://tuyensinh.uet.vnu.edu.vn/uncategorized/thong-bao-nguong-bao-dam-chat-luong-dau-vao-va-quy-doi-diem-trong-xet-tuyen-dhcq-nam-2026/",
      note: "Dùng các mốc quy đổi UET 2026 và nội suy giữa các mốc trong project. Điểm xét tuyển thực tế còn cộng điểm cộng/ưu tiên theo quy định trường.",
    },
  },
  HaUI: {
    2026: {
      year: 2026,
      school: "HaUI",
      label: "Bảng HSA từng điểm HaUI 2026",
      status: "official",
      method: "lookup",
      minHsa: 75,
      maxHsa: 150,
      lookup: hauiLookup,
      source: "https://tuyensinh.haui.edu.vn/dai-hoc-chinh-quy/thong-tin-tuyen-sinh-trinh-do-dai-hoc-nam-2026/69b4e60495dfe0072a789cf6",
      note: "HaUI công bố bảng quy đổi từng điểm HSA. Từ 130 HSA trở lên quy đổi 30.00; dưới 75 không nằm trong bảng công bố này.",
    },
  },
  UTT: {
    2026: {
      year: 2026,
      school: "UTT",
      label: "Bảng khoảng điểm riêng UTT 2026",
      status: "official",
      method: "bands",
      minHsa: 50,
      maxHsa: 150,
      bands: uttBands,
      source: "https://utt.edu.vn/vn/tuyensinh/tuyen-sinh/dai-hoc-chinh-quy/bang-quy-doi-tuong-duong-diem-trung-tuyen-giua-cac-phuong-thuc-xet-tuyen-dai-hoc-chinh-quy-nam-2026-a17264.html",
      note: "UTT công bố 5 khoảng HSA tương đương THPT. Công cụ nội suy tuyến tính đúng nguyên tắc quy đổi trong từng khoảng.",
    },
  },
  UNETI: {
    2026: {
      year: 2026,
      school: "UNETI",
      label: "Bảng khoảng điểm riêng UNETI 2026",
      status: "official",
      method: "bands",
      minHsa: 0,
      maxHsa: 150,
      bands: unetiBands,
      source: "https://uneti.edu.vn/thong-tin-tuyen-sinh-2026-cap-nhat/",
      note: "UNETI công bố 5 khoảng tương đương giữa HSA và THPT. Công cụ nội suy tuyến tính trong khoảng tương ứng.",
    },
  },
  BAV: {
    2026: {
      year: 2026,
      school: "BAV",
      label: "BAV 2026 cần thêm thành phần xét tuyển",
      status: "needs-input",
      method: "needs-input",
      source: "https://hsavnu.edu.vn/tin-tuc/hoc-vien-ngan-hang-cong-bo-diem-san-quy-doi-diem-nam-2026",
      note: "Học viện Ngân hàng có phương thức kết hợp, nên chỉ nhập HSA không đủ để tính điểm xét tuyển cuối cùng. Website không tự bịa một điểm duy nhất.",
    },
  },
  PTIT: {
    2026: {
      year: 2026,
      school: "PTIT",
      label: "PTIT có bảng quy đổi riêng 2026",
      status: "official-reference",
      method: "reference",
      source: "https://tuyensinh.ptit.edu.vn/thong-bao-bang-quy-doi-tuong-duong-giua-cac-phuong-thuc-xet-tuyen-dai-hoc-he-chinh-quy-nam-2026/",
      note: "PTIT công bố bảng quy đổi riêng cho cơ sở phía Bắc và có công cụ quy đổi chính thức. Bản này không suy đoán các ô bảng nằm trong ảnh; kết quả sẽ ghi rõ cần đối chiếu công cụ PTIT.",
    },
  },
  HOU: {
    2026: {
      year: 2026,
      school: "HOU",
      label: "HOU có bảng quy đổi riêng 2026",
      status: "official-reference",
      method: "reference",
      source: "https://hou.edu.vn/tin-tuyen-sinh/truong-dai-hoc-mo-ha-noi-thong-bao-nguong-bao-dam-chat-luong-dau-vao-va-bang-quy-doi-tuong-duong-giua-cac-phuong-thuc-xet-tuyen-dai-hoc-chinh-quy-nam-2026-2/",
      note: "HOU công bố bảng quy đổi riêng và có điều kiện bổ sung ở một số ngành (đặc biệt lĩnh vực pháp luật). Cần đối chiếu đúng ngành/tổ hợp.",
    },
  },
};

export const VNU_SHORT_NAMES = new Set([
  "UMP-VNU","ULIS","HUS","USSH","UEB","UED-VNU","VJU","VNU-UL","VNU-IS","HSB","SIS",
]);
