# Nguồn đề tự luận (essay-generators.js)

## Nguồn ảnh gốc

Toàn bộ 18 ảnh JPG chụp đề thi tự luận nằm trong thư mục
`C:\Users\Perseus\OneDrive\Desktop\folder chứa file về dạng bài thi`
(tên file dạng `1794240896…_<hash>.jpg`). Các ảnh gồm hai loại: ảnh câu hỏi
(code điền khuyết) và ảnh bài làm của sinh viên (có đáp án điền tay — nhiều chỗ
sai). Qua 18 ảnh rút ra **ba biến thể đề**:

1. **Quản lý sách (Sach)** — một lớp bọc kín `Sach` với `_ma`, `_ten`, `_gia`,
   bộ đếm tĩnh `_dem`, thuộc tính `Ma`/`Ten`/`Gia`, phương thức `Xuat`,
   menu `1. Them 2. Xuat 3. Cap nhat gia 4. Tong gia 0. Thoat`.
   Ví dụ ảnh: `…c6b8f1e05a24208e40899f9661c64c53.jpg` (yêu cầu và khai báo lớp),
   `…f75dd48e21185d63810addeb2368847a.jpg` (XuatDS/CapNhatGia/TongGia),
   `…da8488bb9563b3304841e64fa489dd5a.jpg` (Main).
2. **Tính lương nhân viên (NhanVien)** — lớp cơ sở + `NhanVienVanPhong` /
   `NhanVienSanXuat`, `LuongThucLinh()`, kiểm tra kiểu `is` + ép kiểu,
   `DemSanXuat()`, menu `1. Them 2. Xuat 3. Tong luong 4. Dem NV san xuat 0. Thoat`.
   Ví dụ ảnh: `…41f557c158bb00cd3f3697849d911b45.jpg`,
   `…8d1cde847625aebc051e92aacfb821e7.jpg`.
3. **Quản lý sản phẩm (SanPham, lớp trừu tượng)** — `abstract`/`virtual`,
   `HangDienTu : SanPham` với công thức `giaGoc * 1.15 + _thangBH * 20000`,
   `HangThucPham : SanPham`, sắp xếp giảm dần theo `TinhGiaBan()`.
   Ví dụ ảnh: `…c3b047b7b7224e3b9189847e8154b71d.jpg` (yêu cầu),
   `…c1d0a1f4dfe5345f51e0d312c5a9d540.jpg` (các lớp con).

## Ba form gốc → 5 bài tự sinh (formVersion 2)

| templateId | Form ảnh | Cấu trúc giữ nguyên |
|---|---|---|
| `essay-encapsulation` | Quản lý sách | `_ma/_ten/_gia` private, `_dem` static; constructor có tham số dùng `this.Gia`, `Ma` chỉ đọc, `Ten` chống rỗng, `Gia > 0`, `Dem` chỉ đọc, `Xuat()`. Program: mảng và n static, `Tim` theo mã, `Them`, `XuatDS`, `CapNhatGia`, `TongGia` in cả bộ đếm; menu 1–4/0. |
| `essay-inheritance` | Nhân viên | Lớp cơ sở private mã/tên, protected lương; hai lớp con có ngày công/số sản phẩm, constructor gọi `base`, `LuongThucLinh` và `ToString` riêng. Program: `Them`, `XuatDS`, `TongLuong` dùng `is` và ép kiểu, `DemSanXuat`; menu 1–4/0. **Không đổi sang virtual Luong().** |
| `essay-polymorphism` | Sản phẩm trừu tượng | `_giaGoc` private, property `GiaGoc` có kiểm tra, constructor public dùng property; abstract `TinhGiaBan`, virtual `Xuat`; điện tử/thực phẩm override giá, thực phẩm override `Xuat` gọi `base.Xuat`. Program: `Them`, `XuatDS`, `SapXepGiamDan` đổi chỗ rồi xuất, `TongGiaTri`; menu 1–4/0. |

Mỗi đề có đúng **5 bài**: đủ cả ba form, hai bài còn lại chọn ngẫu nhiên từ ba form; sau đó xáo trộn thứ tự. Các bài trong một đề dùng tình huống/tên lớp khác nhau. Bộ sinh **không luôn lấy lại năm khung cũ**.

Tên lớp/bối cảnh, sức chứa, mẫu số ngày công, đơn giá sản phẩm, hệ số giá, phí bảo hành, ngưỡng hạn và tỷ lệ giảm được tham số hóa. **Dạng công thức không đổi:** văn phòng = lương cơ bản / ngày chuẩn × ngày công; sản xuất = lương cơ bản + số sản phẩm × đơn giá; thực phẩm dùng ngưỡng `<=` như ảnh. Mọi số liệu đều có trong đề. Giữ nguyên phân công các hàm, quyền truy cập và cơ chế OOP của từng form; không thêm form tìm theo giá hoặc thay phương thức theo ý bộ sinh.

Đề hiển thị đoạn mở đầu, các mục đánh số theo từng lớp với gạch đầu dòng, cuối cùng là chương trình điền khuyết. Chỗ khuyết được chọn ở các **vị trí cú pháp/biểu thức đã đánh dấu thủ công**, không thay toàn bộ mọi lần xuất hiện của một từ khóa, không khuyết trong chuỗi thông báo. Mỗi bài có 60–80 ô; code ngữ cảnh còn lại giúp đọc hiểu bài.

Nút **Đổi 5 bài tự luận** tạo thêm một bộ mới, giữ nguyên trắc nghiệm và câu trả lời trắc nghiệm. Nếu đang có bài làm tự luận, thao tác yêu cầu xác nhận. Đề lưu thuộc form cũ vẫn được giữ lại và có thông báo, không tự xóa bản nháp; người học chủ động đổi sang form mới.

## Đáp án C# dựng lại ĐÚNG (không lặp lại lỗi trong ảnh bài làm)

Các lỗi sai của sinh viên nhìn thấy trong ảnh, và cách bộ sinh dựng lại đúng:

| Lỗi trong ảnh bài làm | Bản dựng lại đúng (essay-generators.js) |
|---|---|
| `if (_gia > 0) _gia = value;` / `if (_giaGoc > 0)` (validate nhầm trường) | `set { if (value > 0) _gia = value; }` — validate `value` |
| `public virtual double TinhGiaBan();` (virtual không thân) | `public abstract double TinhGiaBan();` trong lớp `abstract` |
| `break;` trong `if` ở giữa method CapNhatGia (ngoài switch/vòng lặp — không biên dịch được) | Dùng `return`/điều kiện `if/else`, mọi `break` chỉ nằm trong `switch` |
| `ds[vt].gia`, `ds[i].gia`, `ds[i].ma` (sai hoa thường) | `ds[vt].Gia`, `ds[i].Gia`, `ds[i].Ma` — đúng hoa như khai báo |
| `case 2: Xuat()` trong khi method là `XuatDS()` | Tên method trong menu/case khớp đúng một tên (`Xuat`, `XuatDS`, `TongGia`, `SapXepGiamDan`…) |
| `double tong` với công thức double nhưng biến `int tong` (bài làm có chỗ ghi `int tong = 0;` cho tổng giá trị) | `double tongTien = 0;` đúng kiểu |
| `static string Tim` trả về `int` | `public static int Tim(...)` đúng kiểu trả về |
| `ds[i].Them()` trong `case` của switch (gọi nhầm kiểu method) | Trong `case` gọi đúng static method của Program hoặc gán `ds[n] = new …` |
| `private static double _dem` (kiểu sai cho bộ đếm) | `private static int _dem;` |
| `case 1: ds[i].Them(); break;` (đối tượng `ds[i]` chưa tồn tại) | `case 1` tạo `new` rồi gán `ds[n]`, tăng `n` |

Ngoài ra: mọi chương trình đều có `using System;`, `class Program` +
`static void Main`, ngoặc cân, tên phân biệt hoa/thường nhất quán, chỉ dùng API chuẩn
(`Console.ReadLine/WriteLine`, `int.Parse`, `double.Parse`).

## Kiểm chứng

- `node tests/essay.test.cjs` — 30 seed: hợp đồng schema (5 bài đủ ba form, 45–100 chỗ
  trống, chỉ số phủ đủ 0..n-1 mỗi chỗ một lần), đề có đoạn mở đầu và mục từng lớp,
  tên riêng suy ra được từ yêu cầu hoặc code ngữ cảnh,
  trùng seed ⇒ trùng đề, khác seed ⇒ khác đề, tích hợp `exam-core`,
  và biên dịch 5 chương mẫu bằng Roslyn (thư mục tạm
  `C:\Users\Perseus\AppData\Local\Temp\opencode\essay-compile-*`).
- `tests/compile-essays.ps1` (của main) — 20/20 chương đã điền đáp án
  (seed 1, 7, 42, 2026 × 5) biên dịch thành công.
- `tests/essay-regression.test.cjs` — số liệu lương/giá có trong đề, công thức và đối tượng cần đếm khớp code, chọn 0 thoát đúng, báo mảng đầy, giữ ngưỡng hạn `<=`, property kiểm tra dữ liệu và tìm theo mã.
