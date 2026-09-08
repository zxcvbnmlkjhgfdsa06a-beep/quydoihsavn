# HSA Converter 2026 - 100 co so

Project Next.js tra cuu 100 co so su dung HSA theo danh sach VNU-IDT.

## Chay
npm install
npm run dev

## Font
Chep file SFPRODISPLAYMEDIUM.otf vao public/fonts/.

## Quan trong ve do chinh xac
- Danh sach 100 co so: theo VNU-IDT (31/12/2025).
- Bang quy doi A00/B00/C00/D01: bang phan vi HSA 2026 cua DHQGHN, dung de tham chieu.
- Khong tu gan cong thuc cua DHQGHN cho tat ca truong. Cac truong ngoai DHQGHN duoc danh dau "tham khao - can check rule truong".
- Khi co cong thuc 2026 rieng cua tung truong, hay them rule rieng vao lib/conversion.ts va cap nhat status trong data/schools.ts.

Nguon tham khao chinh:
- https://www.hsa.edu.vn/tra-cuu/truong-dai-hoc-su-dung
- https://hsavnu.edu.vn/quy-doi-diem

## Cách hiển thị tên trường
Danh sách hiển thị theo dạng `Tên trường - Tên viết tắt`, ví dụ `Đại học Kinh tế Quốc dân - NEU`, `Trường Đại học Ngoại thương - FTU`, `Học viện Công nghệ Bưu chính Viễn thông - PTIT`. Ô tìm kiếm hỗ trợ cả tên đầy đủ, tên viết tắt và mã tuyển sinh nếu có.
