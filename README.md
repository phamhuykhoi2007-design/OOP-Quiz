# Web Ôn tập Lập trình hướng đối tượng (C#) — Đề tự sinh 40 + 5

> **Bản hiện tại:** mỗi đề gồm **40 câu trắc nghiệm + 5 bài tự luận điền khuyết chương trình C#**, tự sinh offline. Xem **[hướng dẫn hiện tại](README-EXAM.md)** để chạy, làm bài và kiểm thử.
>
> Phần dưới là **tài liệu lịch sử của bản 48 câu/10 câu cũ**, không còn mô tả giao diện hiện tại. Các file `app.js`, `questions.js`, `generators.js` vẫn được giữ nguyên để tham khảo; trang hiện tại không nạp chúng. Tiến độ cũ cũng được giữ riêng, không xóa.

---

## Tài liệu bản cũ (tham khảo)

Web ôn tập dạng **điền từ vào chỗ trống trong code** cho 4 chương đã học:

| Chương | Nội dung | Số câu |
|--------|--------------------|:------:|
| 1 | Tổng quan về lập trình hướng đối tượng | 12 |
| 2 | Lớp và đối tượng | 12 |
| 3 | Đóng gói | 12 |
| 4 | Kế thừa | 12 |

Câu hỏi được trích/biên soạn từ bộ slide: `Chương 1 - Tổng quan về lập trình hướng đối tượng.pptx`,
`Chương 2 - Lớp và đối tượng.pptx`, `Chương 3 - Đóng gói.pptx`, `Chương 4 - Kế thừa.pptx`
(đều nằm trong thư mục `Downloads` của bạn — web không cần đọc lại các file này).

## 🚀 Cách chạy (2 cách)

### Cách 1 — Chạy localhost (khuyên dùng)
Nhấn đúp vào file **`Chay-web.bat`**:
- Tự phát hiện máy **có Python thật** (bỏ qua "Python giả" của Microsoft Store).
- Chờ **cổng 8000 thật sự lắng nghe** rồi mới mở trình duyệt — không còn lỗi
  "This site can't be reached" do máy chậm.
- Nếu không có Python: tự chuyển sang **server PowerShell** (`server.ps1`);
  nếu 8000 bị chiếm, server PowerShell **tự lui sang cổng 8001…8009**.
- Nếu vẫn không lên được, cửa sổ launcher **hiện hướng dẫn** rõ ràng
  (đổi `set PORT=8000` thành `8080`...) thay vì chỉ mở trang lỗi.
- Tự mở trình duyệt: **http://localhost:8000**

Muốn tắt: đóng cửa sổ console màu đen có tên **"OOP Quiz Server"**.

> 💡 Nếu cổng 8000 bị chiếm (mở web ra trắng/truy cập lỗi): mở `Chay-web.bat` bằng Notepad,
> sửa dòng `set PORT=8000` thành `set PORT=8080` (hoặc 9000...), lưu và chạy lại.

### Cách 2 — Mở trực tiếp
Nhấn đúp vào **`index.html`** để mở bằng trình duyệt (không cần server).
Mọi tính năng vẫn hoạt động, kể cả lưu tiến độ.

## 🕹 Cách ôn tập

1. **Chọn bộ đề** ở thanh phía trên: *Tất cả / Chương 1 / Chương 2 / Chương 3 / Chương 4*.
2. Điền từ vào các ô trống trong khối code → nhấn **Check** (hoặc phím `Enter`).
3. Đúng → ô chuyển **xanh**, hiện dòng **Giải thích** để bạn ôn lại lý thuyết.
   Sai → ô chuyển **đỏ**, thử lại; sau 2 lần sai hiện nút **Xem đáp án**.
4. Nhấn **Next** (hoặc `Enter`) để sang câu tiếp, hoặc nút **Quay lại** ở góc trái để trở về câu trước nếu bạn nhỡ bỏ qua / muốn xem lại; cũng có thể bấm **chấm tròn** để nhảy nhanh đến câu bất kỳ:
   - Chấm tròn **xanh** = trả lời đúng · **vàng** = đã xem đáp án · **viền xanh** = câu đang xem.
5. Trả lời hết bộ đề sẽ thấy màn hình **tổng kết theo từng chương**.

⭐ Tiến độ được **lưu tự động trong máy** (localStorage) — tắt trình duyệt mở lại vẫn còn nguyên.
Nút **Xóa tiến độ** (góc trên phải) để ôn lại từ đầu.

## 🎲 Chế độ Đề tự sinh

Bên phải thanh trên cùng có nút chuyển **Đề có sẵn / Đề tự sinh 🎲**:

- Chọn **Đề tự sinh 🎲** → web tạo bộ đề mới gồm **10 câu** sinh ngẫu nhiên từ **27 khung mẫu** (template) điền khuyết code — tên lớp, thuộc tính, kiểu dữ liệu, tham số... được hoán đổi theo từng lần sinh, nên gần như không gặp lại cùng một câu.
- Cả **10 câu** luôn lấy từ các khung **khác nhau** (không trùng loại trong 1 đề).
- Trong phần câu hỏi có nút **Tạo đề khác 🎲** để sinh ngay một bộ mới; màn hình tổng kết cũng có nút tương đương.
- Kết quả từng câu của đề tự sinh được lưu tạm theo đề; khi sinh đề mới thì các kết quả của đề cũ được **xóa sạch** (không lẫn với 48 câu tĩnh — vì 48 câu tĩnh vẫn giữ nguyên tiến độ).
- Tiến trình giữa chừng (câu đang đến) cũng được lưu — refresh trang vẫn quay lại đúng vị trí.

## 📁 Các file

```
D:\OOP-Quiz\
├── index.html      trang web
├── style.css       giao diện
├── app.js          logic quiz
├── questions.js    NGÂN HÀNG 48 CÂU TĨNH (sửa ở đây để thêm/sửa câu)
├── generators.js   BỘ KHUNG SINH ĐỀ NGẪU NHIÊN (27 template)
├── server.ps1      server dự phòng bằng PowerShell
├── Chay-web.bat    khởi chạy web + mở localhost
└── README.md       file này
```

## ✏️ Thêm câu hỏi mới

Mở `questions.js`, copy 1 khối `{ ... },` và sửa theo mẫu:

```js
{
  id: "c1_13", ch: 1,
  title: "Điền từ còn thiếu ...",
  lines: [
    ["Dòng chữ thứ nhất ", { b: 0 }, " tiếp theo."],
    ["  Dòng thứ hai thụt đầu dòng."]
  ],
  blanks: [ { ok: ["đáp án 1", "cách viết khác"] } ],
  explain: "Giải thích hiển thị khi trả lời đúng."
}
```

- `{ b: 0 }` là ô điền thứ 0 (tăng dần 1, 2, 3... theo từng ô).
- Mỗi ô có thể nhận nhiều đáp án (chấp nhận **không phân biệt hoa/thường, có/không dấu**).
- Đặt `ch` = 1..4; tăng `id` theo thứ tự (đặt id không trùng).

## 🧩 Thêm khung sinh đề (template)

Mở `generators.js`, copy 1 khối `{ id: ..., chs: ..., make: ... },` trong mảng `TEMPLATES`:

```js
{
  id: "ttrungten",        // chữ "t" + tên khung
  chs: [2, 4],            // câu sinh ra có thể thuộc các chương nào
  make: function (rng) {
    var C = pick(rng, CLASSES);   // chọn ngẫu nhiên 1 lớp từ kho sẵn có
    return finalize({             // finalize tự tính độ rộng ô điền
      id: "g" + this.id + "-0",
      ch: pick(rng, this.chs),
      title: "Tiêu đề câu hỏi tiếng Việt...",
      lines: [
        ["class " + C.name],
        ["    public ", { b: 0 }, " int " + C.fields[0][0] + ";"]
      ],
      blanks: [ { ok: ["private", "public"] } ],
      explain: "Giải thích tiếng Việt có dấu..."
    });
  }
}
```

- `rng` là hàm ngẫu nhiên 0..1: dùng `pick(rng, mảng)` để bốc phần tử — **đừng** dùng `Math.random` trực tiếp (khó kiểm thử).
- Kho sẵn có: `CLASSES` (tên lớp, đóng gói tên đối tượng/kiểu/giá trị thuộc tính), `PAIRS` (lớp cha–con), `IFACES`, `HLP` (lớp tĩnh) — có thể tự bổ sung.
- Lưu ý: phần **code hiển thị cho người dùng không được in đáp án** ra chỗ khác cùng màn hình; giải thích/thẻ tiêu đề mới được gợi ý.
