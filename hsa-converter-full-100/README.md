# QuyDoiHSA v2 - multi-year + school-specific rules

Bản này tách rule theo **trường + năm**, để năm 2027 chỉ cần thêm dữ liệu mới vào `data/schoolRules.ts` thay vì sửa calculator.

## Rule riêng 2026 đã cài
- NEU: bảng khoảng HSA↔THPT, nội suy trong khoảng; ngưỡng HSA 85.
- FTU: công thức thang 30 `27 + (HSA - 100) * 3 / 50` cho nhóm chương trình phù hợp; một số chương trình tích hợp dùng thang 40/kết hợp khác.
- UET: các mốc quy đổi riêng 2026 + nội suy giữa mốc.
- HaUI: bảng HSA từng điểm 75–129, từ 130 trở lên = 30.
- UTT: 5 khoảng HSA↔THPT, nội suy theo công thức trường.
- UNETI: 5 khoảng HSA↔THPT, nội suy theo khoảng.
- BAV: đánh dấu `needs-input`, vì chỉ nhập HSA không đủ để tính điểm xét cuối cùng cho phương thức kết hợp.
- PTIT/HOU: gắn nguồn riêng, nhưng không đoán dữ liệu nằm trong ảnh/bảng chưa được trích xuất đầy đủ.
- Các đơn vị ĐHQGHN còn lại: bảng phân vị HSA 2026 theo A00/B00/C00/D01.
- Trường chưa có rule riêng xác minh: chỉ hiện `THAM KHẢO`, không giả vờ là công thức chính thức.

## Cập nhật cho 2027
Trong `data/schoolRules.ts`:

```ts
schoolRules.NEU[2027] = {
  year: 2027,
  ...
}
```

Sau đó bật option 2027 trong `components/HsaCalculator.tsx`.

## Chạy
```bash
npm install
npm run dev
```

## Font
Project không đóng gói lại file font. Nếu bạn có quyền sử dụng SF Pro Display trên web, đặt file `SFPRODISPLAYMEDIUM.otf` vào `public/fonts/`.

## Bản FIX
- Đã sửa lỗi CSS `Unknown word` do chuỗi `\\n` bị ghi trực tiếp vào `app/globals.css`.
- Đã kiểm tra cú pháp toàn bộ file TypeScript/TSX.
- Đã kiểm tra type cho phần dữ liệu/rule/conversion.
- Đã kiểm tra CSS bằng parser: không còn lỗi cú pháp.
