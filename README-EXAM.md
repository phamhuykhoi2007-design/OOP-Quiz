# Đề OOP tự sinh: Chế độ Ôn tập (40 + 5) & Chế độ Làm bài thi 80 phút (50 phân hóa + 5)

## Chạy

- Nhấn đúp **`Chay-web.bat`**, hoặc mở **`index.html`** trực tiếp.
- Không cần Internet, API key, cài Node hay AI để sử dụng web.
- Bộ sinh và kho câu hỏi hoạt động 100% offline.

## Kho câu hỏi và quy tắc chống trùng lặp

- **Kho 600 câu trắc nghiệm (`ExamMCQ.getBank()`):**
  - **200 câu Dễ (`easy`)** (40 câu/chương × 5 chương)
  - **200 câu Trung bình (`medium`)** (40 câu/chương × 5 chương)
  - **200 câu Khó (`hard`)** (40 câu/chương × 5 chương)
  - Bám sát 5 chương tài liệu lý thuyết OOP C#: Tổng quan OOP, Lớp và đối tượng, Đóng gói, Kế thừa, Đa hình.
- **Kho 300 câu tự luận điền khuyết (`ExamEssay.getBank()`):**
  - **100 câu Đóng gói (`encapsulation`)** + **100 câu Kế thừa (`inheritance`)** + **100 câu Đa hình (`polymorphism`)** trên 75 ngữ cảnh lớp nghiệp vụ.
  - Giữ đúng 100% form đề ảnh: lời dẫn đầy đủ (`introduction`), hướng dẫn đánh số từng lớp (`sections`) kèm gạch đầu dòng mô tả từng trường/thuộc tính/constructor/phương thức/menu `Main`, và khung chương trình C# có **60–80 ô trống**.
- **Quy tắc chống trùng lặp:**
  - Không trùng lặp câu hỏi trong cùng một kho và trong cùng một đề.
  - Giữa các lần tạo đề thi liên tiếp, hệ thống lưu lịch sử `bankId` đã ra (`recentHistory` và `localStorage`) để không lặp lại câu hỏi cũ cho tới khi kho của nhóm độ khó/form đó được rút hết.

## Hai chế độ: Ôn tập & Làm bài thi (80 phút)

1. **📖 Ôn tập (`#practiceModeBtn`):**
   - 40 câu trắc nghiệm (8 câu/chương) + 5 bài tự luận điền khuyết.
   - Không giới hạn thời gian; kiểm tra từng câu ngay lập tức; cho phép **Xem đáp án** sau 2 lần thử sai; có nút **Đổi 5 bài tự luận** riêng.
2. **⏱️ Làm bài thi (80 phút) (`#examModeBtn`):**
   - Giới hạn thời gian **80 phút (`80:00`)** với đồng hồ đếm ngược trực tiếp (tự lưu thời gian còn lại khi tải lại trang và **tự động thu bài, chấm điểm** khi hết giờ, hoặc nộp sớm bằng nút **Nộp bài thi ✓**).
   - **50 câu trắc nghiệm phân hóa**: đúng **10 câu Dễ + 15 câu Trung bình + 25 câu Khó** lấy từ kho 600 câu, **xếp lộn xộn nhau**.
   - **5 bài tự luận điền khuyết**: lấy từ kho 300 bài tự luận (đảm bảo đủ cả 3 form Đóng gói, Kế thừa, Đa hình và 5 hệ lớp khác nhau).
   - Khi nộp bài hoặc hết giờ, hệ thống chấm điểm toàn bộ 55 câu và thống kê chi tiết theo từng mức độ (**Dễ /10 · Trung bình /15 · Khó /25 · Tự luận /5**), đồng thời cho phép xem lại lời giải từng câu.

## Lưu bài

- Lưu ngay mỗi lần nhập/chọn: chế độ đang làm, nội dung đề, thời gian còn lại (ở chế độ thi), câu đang làm, bản nháp, số lần kiểm tra và trạng thái đúng/xem đáp án. Tải lại trang tiếp tục được.
- **Xóa bài làm** chỉ xóa câu trả lời của đề hiện tại, giữ nội dung đề; thao tác có xác nhận.
- Dữ liệu lưu riêng theo trình duyệt/địa chỉ. Mở file trực tiếp và mở localhost có thể là hai vùng lưu khác nhau. Xóa dữ liệu trình duyệt sẽ mất bài lưu.
- Nếu trình duyệt chặn lưu trữ, web hiện cảnh báo; vẫn làm được nhưng không bảo đảm giữ bài sau khi đóng trang.
- Các khóa tiến độ phiên bản cũ không bị xóa. Bộ đề 10 câu cũ không được tự chuyển thành đề 45 câu mới.
- Nếu trang báo tự luận đang lưu thuộc mẫu cũ, hãy bấm **Đổi 5 bài tự luận** để dùng form ảnh mới. Bản nháp cũ không tự bị xóa khi mở trang; trắc nghiệm vẫn giữ nguyên khi đổi riêng tự luận.

## File đang sử dụng

| File | Chức năng |
|---|---|
| `index.html`, `style.css` | Trang, nút chuyển chế độ Ôn tập / Làm bài thi (80 phút), đồng hồ đếm ngược và giao diện |
| `mcq-generators.js` | Kho 600 câu trắc nghiệm (200 Dễ + 200 TB + 200 Khó), bộ sinh đề Ôn tập (40 câu) và Đề thi phân hóa (50 câu) |
| `essay-generators.js` | Kho 300 bài tự luận điền khuyết (100 bài/form × 3 form ảnh) có hướng dẫn đầy đủ |
| `exam-core.js` | Xác thực đề Ôn tập (40+5) & Đề thi (50+5), chấm bài, thống kê theo độ khó, khôi phục bài lưu |
| `exam-app.js` | Điều hướng, đồng hồ 80 phút, tự động nộp bài khi hết giờ, lưu nháp, kiểm tra/xem đáp án |
| `tests/` | Kiểm thử kho 600 TN, kho 300 TL, quy tắc chống trùng lặp, chấm bài và trình duyệt |

Các file `app.js`, `questions.js`, `generators.js` cũ được giữ nguyên nhưng không còn nạp vào trang.

## Kiểm thử cho người phát triển

Cần Node.js (chỉ để phát triển):

```powershell
node --test tests/*.test.cjs
```

Kiểm thử trình duyệt tùy chọn cần Playwright cho Node; không phải phụ thuộc của web:

```powershell
node tests/browser.cjs
node tests/browser.cjs --real
```

Lệnh đầu kiểm tra luồng bằng dữ liệu mẫu; `--real` kiểm tra với bộ sinh thật. Nếu Playwright không nằm trong module path, đặt `PLAYWRIGHT_MODULE` tới thư mục package đã cài. Có thể đặt `BROWSER_PATH` tới trình duyệt Chromium/Edge để dùng thay trình duyệt đi kèm Playwright. Test tự mở máy chủ localhost tạm thời, dùng profile thử nghiệm riêng và tự đóng khi xong.

Nếu có .NET SDK, kiểm tra biên dịch 20 chương trình tự luận đã điền đáp án chuẩn (4 seed × 5 bài):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/compile-essays.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests/compile-essays.ps1 -RunSmoke
```

Lệnh chỉ dùng compiler và reference assemblies có sẵn, không tải package; file `.cs`/`.dll` kiểm thử nằm trong thư mục tạm, không được nạp vào trang web. Tùy chọn `-RunSmoke` kiểm tra khởi động/thoát, sau đó chạy các thao tác quản lý thật: thêm/tìm/cập nhật/tính tổng, từ chối giá âm, bộ đếm static, tính lương/đếm theo loại, giá đa hình/ngưỡng hạn và sắp xếp giảm dần.
