# Đề OOP tự sinh: 40 trắc nghiệm + 5 tự luận

## Chạy

- Nhấn đúp **`Chay-web.bat`**, hoặc mở **`index.html`** trực tiếp.
- Không cần Internet, API key, cài Node hay AI để sử dụng web.
- Bộ sinh dựa trên khung bài có tham số, **không gọi AI**: thay đổi tình huống, code, số liệu, công thức và vị trí khuyết trong phạm vi mẫu đã biên soạn. Không phải hệ thống sáng tác mọi dạng bài mới không giới hạn.

## Nội dung và nguồn

- **40 câu trắc nghiệm:** tài liệu trong `D:\Học tập\OOP`, 5 chương: tổng quan, lớp/đối tượng, đóng gói, kế thừa, đa hình. Mỗi câu có 4 lựa chọn, 1 đáp án đúng, giải thích và nguồn.
- **5 bài tự luận đúng form ảnh:** đoạn mô tả, yêu cầu đánh số theo từng lớp, gạch đầu dòng cho từng thuộc tính/hàm, rồi code điền khuyết. Có đủ ba form đóng gói (quản lý sách), kế thừa (nhân viên dùng `is`/ép kiểu) và đa hình (sản phẩm trừu tượng); hai bài còn lại chọn ngẫu nhiên trong ba form. Tên lớp, số liệu và vị trí 60–80 ô khuyết thay đổi, nhưng cấu trúc lớp/hàm/menu và cơ chế OOP giữ đúng ảnh. Nguồn: `C:\Users\Perseus\OneDrive\Desktop\folder chứa file về dạng bài thi`.
- Hai thư mục nguồn chỉ được dùng khi biên soạn bộ sinh. Sau đó web **không cần truy cập lại** các thư mục này. Thêm tài liệu vào thư mục không tự động cập nhật nội dung web.
- Không dùng các đáp án người làm nhập sai trong ảnh làm đáp án chuẩn.

## Làm bài

1. Trang tự tạo đề khi chưa có bài lưu. **Tạo đề mới** sinh lại đầy đủ 40 + 5; nếu đã làm bài, trang sẽ hỏi trước khi thay đề.
   Muốn luyện thêm tự luận mà không mất phần trắc nghiệm, bấm **Đổi 5 bài tự luận**. Nút này giữ nguyên 40 câu và câu trả lời trắc nghiệm; chỉ thay phần tự luận, có xác nhận nếu đã điền bài.
2. Chuyển phần bằng **Trắc nghiệm / Tự luận**; bấm số câu hoặc B1–B5 để nhảy đến bài.
3. Trắc nghiệm chọn một lựa chọn, bấm **Kiểm tra**. Tự luận điền code vào các ô rồi bấm **Kiểm tra** (hoặc Enter trong ô).
4. Code được chấm **phân biệt hoa/thường**, giữ nguyên nội dung chuỗi; bỏ qua khoảng trắng giữa các token. Một bài tự luận được tính đúng khi tất cả ô đều đúng.
5. Sau hai lần kiểm tra sai, có thể **Xem đáp án** và đọc giải thích. Bài đã xem đáp án được ghi riêng, **không tính vào số tự làm đúng**.
6. **Tổng kết** tách hai phần và cho biết còn bài chưa hoàn thành; vẫn quay lại làm tiếp được. Đây là chế độ luyện tập, không có đồng hồ hay thang điểm thi quy định.

## Lưu bài

- Lưu ngay mỗi lần nhập/chọn: nội dung đề, câu đang làm, bản nháp, số lần kiểm tra và trạng thái đúng/xem đáp án. Tải lại trang tiếp tục được.
- **Xóa bài làm** chỉ xóa câu trả lời của đề hiện tại, giữ nội dung đề; thao tác có xác nhận.
- Dữ liệu lưu riêng theo trình duyệt/địa chỉ. Mở file trực tiếp và mở localhost có thể là hai vùng lưu khác nhau. Xóa dữ liệu trình duyệt sẽ mất bài lưu.
- Nếu trình duyệt chặn lưu trữ, web hiện cảnh báo; vẫn làm được nhưng không bảo đảm giữ bài sau khi đóng trang.
- Các khóa tiến độ phiên bản cũ không bị xóa. Bộ đề 10 câu cũ không được tự chuyển thành đề 45 câu mới.
- Nếu trang báo tự luận đang lưu thuộc mẫu cũ, hãy bấm **Đổi 5 bài tự luận** để dùng form ảnh mới. Bản nháp cũ không tự bị xóa khi mở trang; trắc nghiệm vẫn giữ nguyên khi đổi riêng tự luận.

## File đang sử dụng

| File | Chức năng |
|---|---|
| `index.html`, `style.css` | Trang và giao diện |
| `mcq-generators.js` | Bộ sinh 40 câu trắc nghiệm |
| `essay-generators.js` | Bộ sinh 5 bài tự luận điền khuyết |
| `exam-core.js` | Xác thực đề, so đáp án, tổng kết, khôi phục bài lưu |
| `exam-app.js` | Điều hướng, hiển thị, lưu nháp, kiểm tra/xem đáp án |
| `tests/` | Kiểm thử bộ sinh, chấm bài và trình duyệt |

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
