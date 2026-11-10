# Nguồn và phạm vi câu hỏi MCQ

`mcq-generators.js` sinh đề gồm đúng 40 câu: 8 câu/chương, chọn từ 56 template
(10 template chương 1–2, 12 template chương 3–5). Mỗi đề dùng 40 template khác
nhau; mỗi template có nhiều biến thể tham số (lớp, trường, giá trị, đoạn code,
hoặc dạng câu hỏi) và vị trí đáp án đúng được xáo trộn bằng `rng`.

## Tài liệu nguồn

| Chương | Tài liệu |
| --- | --- |
| 1 | `Chương 1 - Tổng quan về lập trình hướng đối tượng.pptx` |
| 2 | `Chương 2 - Lớp và đối tượng.pptx`, `Chương 2 - Lớp và đối tượng.pdf` |
| 3 | `Chương 3 - Đóng gói.pptx`, `Chương-4-Đóng-gói.pdf` (nội dung đóng gói) |
| 4 | `Chương 4 - Kế thừa.pptx`, `Bài tập ôn tập Kế Thừa và Đa hình.docx` |
| 5 | `Chương 5 - Đa hình.pptx`, `Bài tập ôn tập Kế Thừa và Đa hình.docx` |

Bài tập `Bài tập ôn tập Lớp đối tượng đóng gói.pdf` được dùng để tham khảo cách
đặt tình huống cho chương 2–3.

## Template theo chương

### Chương 1 — Tổng quan OOP

- `c1-blueprint` — lớp như bản thiết kế, đối tượng như thực thể cụ thể.
- `c1-four-principles` — bốn tính chất OOP; nhận diện tính chất không thuộc OOP.
- `c1-state-behavior` — thuộc tính (trạng thái) và phương thức (hành vi).
- `c1-abstraction-def` — tính trừu tượng qua tình huống che giấu chi tiết.
- `c1-encapsulation-benefit` — lợi ích đóng gói dữ liệu.
- `c1-inheritance-direction` — lớp cơ sở và lớp dẫn xuất.
- `c1-polymorphism-def` — cùng lời gọi, hành vi khác nhau theo đối tượng.
- `c1-message-method` — gửi thông điệp tương đương gọi phương thức.
- `c1-procedural-vs-oop` — so sánh lập trình thủ tục và OOP.
- `c1-instance-memory` — mỗi đối tượng có bản sao thuộc tính instance riêng.

### Chương 2 — Lớp và đối tượng

- `c2-class-syntax` — cú pháp khai báo lớp.
- `c2-new-object` — tạo đối tượng bằng `new`.
- `c2-ctor-features` — tên constructor, không có kiểu trả về, không kế thừa.
- `c2-default-ctor` — constructor mặc định do C# cung cấp.
- `c2-ctor-overload` — nạp chồng constructor.
- `c2-destructor-syntax` — cú pháp destructor `~TenLop()`.
- `c2-method-return` — giá trị trả về của phương thức.
- `c2-method-call` — cú pháp gọi phương thức instance.
- `c2-member-kinds` — phân biệt trường, thuộc tính, constructor, phương thức.
- `c2-two-objects` — gán tham chiếu giữa hai biến đối tượng.

### Chương 3 — Đóng gói

- `c3-default-private` — thành viên không ghi access modifier mặc định private.
- `c3-protected-access` — phạm vi truy cập protected.
- `c3-private-field-access` — lỗi biên dịch khi truy cập private từ ngoài lớp.
- `c3-property-value` — get/set của thuộc tính.
- `c3-static-counter` — trường static dùng chung.
- `c3-static-call` — gọi thành viên static qua tên lớp.
- `c3-static-class` — không thể khởi tạo static class.
- `c3-ref-swap` — tham số `ref` và hoán đổi giá trị.
- `c3-out-parse` — tham số `out` qua `int.TryParse`.
- `c3-default-param` — tham số mặc định và truyền đè.
- `c3-this` — `this` tham chiếu đối tượng hiện tại.
- `c3-indexer` — cú pháp indexer `this[int i]`.

### Chương 4 — Kế thừa

- `c4-syntax` — cú pháp `class Con : Cha`.
- `c4-ctor-not-inherited` — constructor không được kế thừa.
- `c4-private-base` — private của lớp cơ sở không truy cập trực tiếp từ lớp dẫn xuất.
- `c4-base-ctor` — gọi constructor cơ sở bằng `base(...)`.
- `c4-base-order` — constructor cơ sở chạy trước constructor dẫn xuất.
- `c4-new-hiding` — `new` che khuất phương thức.
- `c4-base-call` — gọi phương thức cơ sở bằng `base.Method()`.
- `c4-base-ref-limits` — giới hạn của biến kiểu lớp cơ sở.
- `c4-single-inheritance` — C# chỉ cho kế thừa trực tiếp một lớp.
- `c4-derived-ctor-required` — lớp dẫn xuất phải gọi constructor cơ sở phù hợp.
- `c4-protected-output` — lớp dẫn xuất đọc trường protected.
- `c4-cast` — ép kiểu từ lớp cơ sở về lớp dẫn xuất.

### Chương 5 — Đa hình

- `c5-virtual-override` — cặp `virtual`/`override`.
- `c5-dispatch-output` — điều phối động qua biến lớp cơ sở.
- `c5-new-dispatch` — `new` không tham gia đa hình.
- `c5-abstract-instantiate` — không khởi tạo trực tiếp abstract class.
- `c5-abstract-method-syntax` — phương thức abstract trong lớp: chỉ có chữ ký, không có phần thân.
- `c5-interface-implement` — lớp thực thi interface và cài đặt thành viên; lớp abstract vẫn phải khai báo thành viên abstract tương ứng.
- `c5-interface-members` — interface cổ điển (trước C# 8) chỉ khai báo chữ ký, không có cài đặt mặc định.
- `c5-multiple-interfaces` — một lớp thực thi nhiều interface.
- `c5-interface-vs-abstract` — so sánh interface và abstract class.
- `c5-object-tostring` — ghi đè `ToString()`.
- `c5-overload` — nạp chồng quyết định khi biên dịch.
- `c5-interface-dispatch` — gọi phương thức qua biến interface.

## Ghi chú kỹ thuật

- Hợp đồng: `globalThis.ExamMCQ.generate(rng)` trả về mảng 40 câu.
- `rng` là tùy chọn; mặc định dùng `Math.random`.
- Mọi câu có `type: "mcq"`, `options` gồm 4 chuỗi khác nhau, `answer` là 0..3.
- `code` chỉ xuất hiện khi câu hỏi cần đoạn code; các câu hỏi lỗi biên dịch
  được ghi rõ trong đề và giải thích.
- Không có phụ thuộc ngoài, không gọi mạng khi chạy.
