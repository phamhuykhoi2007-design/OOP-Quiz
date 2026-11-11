/* ============================================================
   Sinh câu hỏi trắc nghiệm (MCQ) cho đề thi OOP C#.
   - Kho 1.500 câu phân hóa (500 Dễ + 500 Trung bình + 500 Khó):
     * 600 câu sinh tham số (200 Dễ + 200 Trung bình + 200 Khó, 40 câu/mức độ/chương 1..5).
     * 900 câu lý thuyết C# (300 Dễ + 300 Trung bình + 300 Khó, Chương 2..5).
   - Chế độ Ôn tập:
     * ExamMCQ.generate(rng): giữ nguyên hợp đồng 40 template (8 câu/chương).
     * ExamMCQ.generatePractice(rng, options) / generate(rng, { fromBank: true }):
       rút 40 câu (8 câu/chương, đủ Dễ/TB/Khó) từ toàn bộ kho 1.500 câu.
   - Chế độ Làm bài thi (ExamMCQ.generateExam(rng, options)):
     đúng 50 câu (10 Dễ + 15 Trung bình + 25 Khó) trộn lộn xộn từ kho 1.500 câu,
     áp dụng quy tắc chống trùng lặp trong đề và giữa các lần tạo đề.
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- tiện ích chung ---------- */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) {
    var i = Math.floor(rng() * arr.length);
    if (i < 0) i = 0;
    if (i >= arr.length) i = arr.length - 1;
    return arr[i];
  }

  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      if (j < 0) j = 0;
      if (j > i) j = i;
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  // Đáp án đúng luôn đứng đầu trong spec.options; build() sẽ xáo trộn.
  function build(rng, spec) {
    var opts = [];
    for (var i = 0; i < spec.options.length; i++) {
      var s = String(spec.options[i]);
      if (opts.indexOf(s) === -1) opts.push(s);
    }
    if (opts.length !== 4) {
      throw new Error("Template " + spec.templateId + " phải có 4 đáp án khác nhau, hiện có " + opts.length);
    }
    var correct = String(spec.options[0]);
    var shuffled = shuffle(rng, opts);
    var q = {
      type: "mcq",
      id: "",
      ch: spec.ch,
      difficulty: spec.difficulty || "medium",
      title: spec.title,
      options: shuffled,
      answer: shuffled.indexOf(correct),
      explain: spec.explain,
      source: spec.source,
      templateId: spec.templateId
    };
    if (spec.code) q.code = spec.code;
    if (spec.bankId) q.bankId = spec.bankId;
    return q;
  }

  // Tạo 4 lựa chọn số dạng chuỗi, đáp án đúng đứng đầu.
  function numOptions(correct, candidates) {
    var out = [String(correct)];
    var i;
    for (i = 0; i < candidates.length && out.length < 4; i++) {
      var s = String(candidates[i]);
      if (out.indexOf(s) === -1) out.push(s);
    }
    var d = 1;
    while (out.length < 4) {
      var s2 = String(correct + d);
      if (out.indexOf(s2) === -1) out.push(s2);
      d++;
    }
    return out;
  }

  var SRC = {
    1: "Chương 1 - Tổng quan về lập trình hướng đối tượng",
    2: "Chương 2 - Lớp và đối tượng",
    3: "Chương 3 - Đóng gói",
    4: "Chương 4 - Kế thừa",
    5: "Chương 5 - Đa hình"
  };

  /* ============================================================
     56 TEMPLATE CỐT LÕI (giữ nguyên hợp đồng cho chế độ Ôn tập 40 câu)
     ============================================================ */
  var TEMPLATES = {
    1: [
      function (rng) {
        var pairs = [
          ["bản thiết kế ngôi nhà", "ngôi nhà cụ thể"],
          ["khuôn đúc bánh", "chiếc bánh cụ thể"],
          ["bản vẽ kỹ thuật ô tô", "chiếc ô tô cụ thể"],
          ["bản thiết kế áo", "chiếc áo đã may"]
        ];
        var p = pick(rng, pairs);
        return build(rng, {
          templateId: "c1-blueprint", ch: 1, difficulty: "easy", source: SRC[1],
          title: "Trong cặp “" + p[0] + "” và “" + p[1] + "”, khái niệm nào tương ứng với lớp và đối tượng?",
          options: [
            "Lớp tương ứng với " + p[0] + "; đối tượng tương ứng với " + p[1],
            "Lớp tương ứng với " + p[1] + "; đối tượng tương ứng với " + p[0],
            "Cả hai đều là đối tượng vì đều được tạo bằng từ khóa new",
            "Cả hai đều là lớp vì đều mô tả đặc điểm chung"
          ],
          explain: "Lớp đóng vai trò bản thiết kế/khuôn mẫu, còn đối tượng là một thực thể cụ thể được tạo ra từ lớp đó. Vì vậy " + p[0] + " là lớp, còn " + p[1] + " là đối tượng."
        });
      },
      function (rng) {
        var mode = pick(rng, ["list", "not"]);
        if (mode === "list") {
          return build(rng, {
            templateId: "c1-four-principles", ch: 1, difficulty: "easy", source: SRC[1],
            title: "Bốn tính chất cơ bản của lập trình hướng đối tượng là gì?",
            options: [
              "Đóng gói, kế thừa, đa hình, trừu tượng",
              "Đóng gói, kế thừa, tuần tự, song song",
              "Kế thừa, đa hình, cấu trúc dữ liệu, giải thuật",
              "Trừu tượng, đóng gói, biên dịch, thông dịch"
            ],
            explain: "Bốn tính chất cơ bản của OOP là tính đóng gói, tính kế thừa, tính đa hình và tính trừu tượng."
          });
        }
        return build(rng, {
          templateId: "c1-four-principles", ch: 1, difficulty: "easy", source: SRC[1],
          title: "Tính chất nào KHÔNG thuộc bốn tính chất cơ bản của lập trình hướng đối tượng?",
          options: [
            "Tính tuần tự",
            "Tính đóng gói",
            "Tính kế thừa",
            "Tính đa hình"
          ],
          explain: "Tính tuần tự không phải là một trong bốn tính chất OOP. Bốn tính chất đúng là đóng gói, kế thừa, đa hình và trừu tượng."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", a: "HoTen", b: "DiemTB" },
          { cls: "HinhChuNhat", a: "Dai", b: "Rong" },
          { cls: "TaiKhoan", a: "SoDu", b: "ChuTaiKhoan" },
          { cls: "SanPham", a: "TenSP", b: "GiaBan" }
        ];
        var d = pick(rng, data);
        return build(rng, {
          templateId: "c1-state-behavior", ch: 1, difficulty: "easy", source: SRC[1],
          title: "Trong lớp " + d.cls + ", hai thành phần " + d.a + " và " + d.b + " được gọi là gì?",
          options: [
            "Thuộc tính (trường dữ liệu) biểu diễn trạng thái của đối tượng",
            "Phương thức biểu diễn hành vi của đối tượng",
            "Constructor dùng để khởi tạo đối tượng",
            "Interface dùng để định nghĩa hợp đồng"
          ],
          explain: d.a + " và " + d.b + " là các thuộc tính/trường dữ liệu, lưu trạng thái của từng đối tượng " + d.cls + "; hành vi được thể hiện bằng phương thức."
        });
      },
      function (rng) {
        var scenarios = [
          "Người lái xe chỉ cần biết vô lăng, chân ga và phanh mà không cần hiểu chi tiết động cơ",
          "Người dùng ATM chỉ cần chọn rút tiền mà không cần biết cách hệ thống xử lý bên trong",
          "Lập trình viên gọi phương thức DienTich() mà không cần biết công thức được cài đặt thế nào",
          "Người dùng điện thoại chỉ cần bấm nút gọi mà không cần hiểu mạch điện bên trong"
        ];
        var s = pick(rng, scenarios);
        return build(rng, {
          templateId: "c1-abstraction-def", ch: 1, difficulty: "medium", source: SRC[1],
          title: "“" + s + "” là biểu hiện chủ yếu của tính chất nào trong OOP?",
          options: [
            "Tính trừu tượng",
            "Tính kế thừa",
            "Tính đa hình",
            "Tính đóng gói"
          ],
          explain: "Tính trừu tượng tập trung vào việc cần làm và che giấu cách xử lý phức tạp bên trong, đúng với tình huống: " + s + ". Đóng gói thiên về gom dữ liệu/hành vi và kiểm soát quyền truy cập, không phải trọng tâm của tình huống này."
        });
      },
      function (rng) {
        var data = [
          { cls: "TaiKhoan", ctx: "số dư tài khoản ngân hàng" },
          { cls: "SinhVien", ctx: "điểm trung bình của sinh viên" },
          { cls: "SanPham", ctx: "số lượng tồn kho của sản phẩm" }
        ];
        var d = pick(rng, data);
        return build(rng, {
          templateId: "c1-encapsulation-benefit", ch: 1, difficulty: "easy", source: SRC[1],
          title: "Lợi ích chính của tính đóng gói khi xây dựng lớp " + d.cls + " quản lý " + d.ctx + " là gì?",
          options: [
            "Bảo vệ dữ liệu bên trong bằng phạm vi truy cập và kiểm soát việc đọc/ghi qua thuộc tính, phương thức công khai",
            "Cho phép lớp khác truy cập trực tiếp mọi trường private",
            "Bắt buộc mọi thuộc tính phải được khai báo public",
            "Loại bỏ hoàn toàn nhu cầu kiểm tra dữ liệu đầu vào"
          ],
          explain: "Đóng gói gom dữ liệu và hành vi vào lớp, giới hạn quyền truy cập trực tiếp và chỉ mở giao diện công khai (thuộc tính/phương thức) để kiểm soát cách " + d.ctx + " được đọc và thay đổi."
        });
      },
      function (rng) {
        var pairs = [
          ["DongVat", "Cho"],
          ["NhanVien", "KeToan"],
          ["Hinh", "HinhTron"],
          ["PhuongTien", "XeDap"]
        ];
        var p = pick(rng, pairs);
        var askBase = pick(rng, [true, false]);
        if (askBase) {
          return build(rng, {
            templateId: "c1-inheritance-direction", ch: 1, difficulty: "easy", source: SRC[1],
            title: "Nếu lớp " + p[1] + " kế thừa lớp " + p[0] + ", đâu là lớp cơ sở (base class)?",
            options: [
              p[0],
              p[1],
              "Cả hai đều là lớp cơ sở",
              "Không lớp nào là lớp cơ sở"
            ],
            explain: "Trong quan hệ “" + p[1] + " kế thừa " + p[0] + "”, lớp " + p[0] + " là lớp cơ sở, còn " + p[1] + " là lớp dẫn xuất."
          });
        }
        return build(rng, {
          templateId: "c1-inheritance-direction", ch: 1, difficulty: "easy", source: SRC[1],
          title: "Nếu lớp " + p[1] + " kế thừa lớp " + p[0] + ", đâu là lớp dẫn xuất (derived class)?",
          options: [
            p[1],
            p[0],
            "Cả hai đều là lớp dẫn xuất",
            "Không lớp nào là lớp dẫn xuất"
          ],
          explain: "Lớp đứng sau dấu “:” trong khai báo kế thừa là lớp dẫn xuất. Vì " + p[1] + " kế thừa " + p[0] + ", lớp dẫn xuất là " + p[1] + "."
        });
      },
      function (rng) {
        var scenarios = [
          "Cùng lời gọi Keu() nhưng đối tượng Cho kêu “Gâu gâu”, đối tượng Meo kêu “Meo meo”",
          "Cùng lời gọi DienTich() nhưng HinhTron và HinhVuong cho kết quả theo công thức khác nhau",
          "Cùng lời gọi TinhLuong() nhưng NhanVienVanPhong và NhanVienKinhDoanh tính theo cách khác nhau"
        ];
        var s = pick(rng, scenarios);
        return build(rng, {
          templateId: "c1-polymorphism-def", ch: 1, difficulty: "easy", source: SRC[1],
          title: "“" + s + "” minh họa tính chất nào của OOP?",
          options: [
            "Tính đa hình",
            "Tính đóng gói",
            "Tính trừu tượng",
            "Tính kế thừa"
          ],
          explain: "Cùng một lời gọi phương thức nhưng hành vi thực tế phụ thuộc vào đối tượng cụ thể — đó là tính đa hình."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", obj: "sv", method: "HienThi" },
          { cls: "HinhChuNhat", obj: "hcn", method: "DienTich" },
          { cls: "TaiKhoan", obj: "tk", method: "RutTien" }
        ];
        var d = pick(rng, data);
        var code = "class " + d.cls + " {\n" +
          "    public void " + d.method + "() { }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " " + d.obj + " = new " + d.cls + "();\n" +
          "        " + d.obj + "." + d.method + "();\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c1-message-method", ch: 1, difficulty: "medium", source: SRC[1],
          title: "Trong đoạn code dưới đây, việc gửi thông điệp " + d.method + " tới đối tượng " + d.obj + " tương ứng với hành động nào?",
          code: code,
          options: [
            "Gọi phương thức " + d.method + " của đối tượng " + d.obj,
            "Tạo thêm một lớp mới tên " + d.method,
            "Khởi tạo đối tượng " + d.obj + " lần thứ hai",
            "Kế thừa lớp " + d.cls
          ],
          explain: "Trong OOP, “gửi thông điệp” tới một đối tượng chính là gọi phương thức của đối tượng đó: " + d.obj + "." + d.method + "()."
        });
      },
      function (rng) {
        var mode = pick(rng, ["diff", "identify"]);
        if (mode === "diff") {
          return build(rng, {
            templateId: "c1-procedural-vs-oop", ch: 1, difficulty: "medium", source: SRC[1],
            title: "Điểm khác biệt cốt lõi giữa lập trình hướng đối tượng và lập trình thủ tục là gì?",
            options: [
              "OOP tổ chức chương trình quanh đối tượng gồm dữ liệu và hành vi; lập trình thủ tục tổ chức quanh hàm với dữ liệu tách rời",
              "OOP không cho phép sử dụng hàm",
              "Lập trình thủ tục bắt buộc phải có lớp và đối tượng",
              "OOP chỉ dùng được cho chương trình có giao diện đồ họa"
            ],
            explain: "OOP gắn dữ liệu với hành vi trong cùng đối tượng; lập trình thủ tục chủ yếu chia bài toán thành các hàm và xử lý dữ liệu riêng bên ngoài."
          });
        }
        return build(rng, {
          templateId: "c1-procedural-vs-oop", ch: 1, difficulty: "medium", source: SRC[1],
          title: "Đoạn code dưới đây thể hiện cách tổ chức chương trình theo hướng nào?",
          code: "using System;\nclass HinhTron {\n    public double BanKinh;\n    public double DienTich() { return 3.14 * BanKinh * BanKinh; }\n}\nclass Program {\n    static void Main() {\n        HinhTron h = new HinhTron();\n        h.BanKinh = 2;\n        Console.WriteLine(h.DienTich());\n    }\n}",
          options: [
            "Lập trình hướng đối tượng: dữ liệu và hành vi được gom vào cùng lớp",
            "Lập trình thủ tục: chỉ có hàm tự do, không có lớp",
            "Lập trình hàm thuần túy: không có trạng thái",
            "Lập trình assembly: thao tác trực tiếp trên thanh ghi"
          ],
          explain: "Code khai báo lớp HinhTron chứa cả dữ liệu (BanKinh) lẫn hành vi (DienTich), rồi tạo đối tượng và gọi phương thức — đó là cách tổ chức OOP."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", field: "Diem", init: 5, aVal: 8 },
          { cls: "TaiKhoan", field: "SoDu", init: 100, aVal: 250 },
          { cls: "SanPham", field: "SoLuong", init: 10, aVal: 3 },
          { cls: "NhanVien", field: "Tuoi", init: 20, aVal: 35 }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    public int " + d.field + " = " + d.init + ";\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " a = new " + d.cls + "();\n" +
          "        " + d.cls + " b = new " + d.cls + "();\n" +
          "        a." + d.field + " = " + d.aVal + ";\n" +
          "        Console.WriteLine(b." + d.field + ");\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c1-instance-memory", ch: 1, difficulty: "hard", source: SRC[1],
          title: "Hai đối tượng độc lập được tạo từ cùng một lớp: kết quả in ra là gì?",
          code: code,
          options: numOptions(d.init, [d.aVal, 0, d.init + 1]),
          explain: "Mỗi đối tượng có bản sao riêng của thuộc tính instance. Đổi a." + d.field + " không ảnh hưởng tới b." + d.field + ", nên b vẫn in ra " + d.init + "."
        });
      }
    ],
    2: [
      function (rng) {
        var cls = pick(rng, ["SinhVien", "HinhChuNhat", "TaiKhoan", "SanPham"]);
        var mode = pick(rng, ["valid", "invalid"]);
        if (mode === "invalid") {
          return build(rng, {
            templateId: "c2-class-syntax", ch: 2, difficulty: "easy", source: SRC[2],
            title: "Khai báo nào KHÔNG hợp lệ khi định nghĩa lớp " + cls + " trong C#?",
            options: [
              "class " + cls + "[] { }",
              "public class " + cls + " { }",
              "class " + cls + " { }",
              "internal class " + cls + " { }"
            ],
            explain: "Ba khai báo còn lại đều hợp lệ; “class " + cls + "[] { }” sai vì dùng ngoặc vuông thay cho thân lớp. Lưu ý: từ C# 12, dạng class " + cls + "() { } là primary constructor hợp lệ nên không dùng làm đáp án sai."
          });
        }
        return build(rng, {
          templateId: "c2-class-syntax", ch: 2, difficulty: "easy", source: SRC[2],
          title: "Khai báo nào là cú pháp định nghĩa lớp " + cls + " hợp lệ trong C#?",
          options: [
            "public class " + cls + " { }",
            "public void " + cls + "() { }",
            "class " + cls + "[] { }",
            "new class " + cls + " { }"
          ],
          explain: "Cú pháp định nghĩa lớp là: [access modifier] class TênLớp { ... }. Không dùng ngoặc vuông sau tên lớp và không dùng new khi khai báo lớp. (Từ C# 12, class " + cls + "(...) là primary constructor hợp lệ, nhưng đáp án đúng ở đây vẫn là khai báo lớp thông thường.)"
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", obj: "sv" },
          { cls: "HinhChuNhat", obj: "hcn" },
          { cls: "TaiKhoan", obj: "tk" }
        ];
        var d = pick(rng, data);
        var mode = pick(rng, ["create", "role"]);
        if (mode === "role") {
          return build(rng, {
            templateId: "c2-new-object", ch: 2, difficulty: "easy", source: SRC[2],
            title: "Từ khóa new trong `" + d.cls + " " + d.obj + " = new " + d.cls + "();` có vai trò gì?",
            options: [
              "Cấp phát và khởi tạo một đối tượng mới từ lớp " + d.cls,
              "Khai báo một lớp mới tên " + d.cls,
              "Gọi constructor tĩnh của lớp " + d.cls,
              "Xóa đối tượng " + d.obj + " khỏi bộ nhớ"
            ],
            explain: "new tạo một thể hiện mới của lớp: cấp phát bộ nhớ cho đối tượng rồi chạy constructor để khởi tạo trạng thái ban đầu."
          });
        }
        return build(rng, {
          templateId: "c2-new-object", ch: 2, difficulty: "easy", source: SRC[2],
          title: "Cách nào tạo đối tượng " + d.obj + " thuộc lớp " + d.cls + " đúng trong C#?",
          options: [
            d.cls + " " + d.obj + " = new " + d.cls + "();",
            d.cls + " " + d.obj + " = " + d.cls + "();",
            "new " + d.cls + " " + d.obj + " = " + d.cls + "();",
            "object " + d.obj + " = " + d.cls + ";"
          ],
          explain: "Tạo đối tượng dùng từ khóa new: " + d.cls + " " + d.obj + " = new " + d.cls + "();. Thiếu new hoặc đặt sai vị trí đều không hợp lệ."
        });
      },
      function (rng) {
        var cls = pick(rng, ["SinhVien", "TaiKhoan", "HinhChuNhat", "NhanVien"]);
        var mode = pick(rng, ["true", "false"]);
        if (mode === "false") {
          return build(rng, {
            templateId: "c2-ctor-features", ch: 2, difficulty: "easy", source: SRC[2],
            title: "Phát biểu nào SAI về constructor của lớp " + cls + " trong C#?",
            options: [
              "Constructor bắt buộc phải có kiểu trả về void",
              "Constructor có cùng tên với lớp " + cls,
              "Constructor không có kiểu trả về",
              "Constructor không được lớp dẫn xuất kế thừa"
            ],
            explain: "Constructor không có kiểu trả về, kể cả void. Các phát biểu còn lại đều đúng: constructor trùng tên lớp, không có kiểu trả về và không được kế thừa."
          });
        }
        return build(rng, {
          templateId: "c2-ctor-features", ch: 2, difficulty: "easy", source: SRC[2],
          title: "Phát biểu nào đúng về constructor của lớp " + cls + " trong C#?",
          options: [
            "Constructor có cùng tên với lớp và không có kiểu trả về",
            "Constructor phải có kiểu trả về void",
            "Constructor bắt buộc phải có từ khóa static",
            "Constructor được lớp dẫn xuất kế thừa tự động"
          ],
          explain: "Constructor có tên trùng với tên lớp và không khai báo kiểu trả về (kể cả void). Constructor không được kế thừa."
        });
      },
      function (rng) {
        var cls = pick(rng, ["SinhVien", "HinhChuNhat", "TaiKhoan"]);
        var mode = pick(rng, ["text", "output"]);
        if (mode === "output") {
          var code = "using System;\n" +
            "class " + cls + " {\n" +
            "    public int SoLuong;\n" +
            "    public bool DaDuyet;\n" +
            "}\n" +
            "class Program {\n" +
            "    static void Main() {\n" +
            "        " + cls + " x = new " + cls + "();\n" +
            "        Console.WriteLine(x.SoLuong + \" \" + x.DaDuyet);\n" +
            "    }\n" +
            "}";
          return build(rng, {
            templateId: "c2-default-ctor", ch: 2, difficulty: "medium", source: SRC[2],
            title: "Lớp " + cls + " không khai báo constructor: kết quả in ra là gì?",
            code: code,
            options: [
              "0 False",
              "0 True",
              "1 False",
              "null False"
            ],
            explain: "Lớp không khai báo constructor nên dùng constructor mặc định không tham số; các trường được khởi tạo về giá trị mặc định: int là 0, bool là false. Vì vậy in ra “0 False”."
          });
        }
        return build(rng, {
          templateId: "c2-default-ctor", ch: 2, difficulty: "medium", source: SRC[2],
          title: "Nếu lớp " + cls + " không khai báo constructor nào, C# xử lý như thế nào?",
          options: [
            "C# cung cấp constructor mặc định không tham số, khởi tạo các trường về giá trị mặc định",
            "Chương trình không biên dịch vì thiếu constructor",
            "C# tự tạo constructor có một tham số kiểu int",
            "Mỗi lần dùng new, C# yêu cầu truyền đủ giá trị cho mọi trường"
          ],
          explain: "Khi lớp không khai báo constructor, C# sinh constructor mặc định không tham số. Các trường được khởi tạo về giá trị mặc định (int là 0, bool là false, tham chiếu là null)."
        });
      },
      function (rng) {
        var cls = pick(rng, ["SinhVien", "NhanVien"]);
        var code = "class " + cls + " {\n" +
          "    public string Ten;\n" +
          "    public int Tuoi;\n" +
          "    public " + cls + "() { Ten = \"Chua dat\"; Tuoi = 0; }\n" +
          "    public " + cls + "(string ten) { Ten = ten; Tuoi = 18; }\n" +
          "}";
        var mode = pick(rng, ["concept", "select"]);
        if (mode === "select") {
          return build(rng, {
            templateId: "c2-ctor-overload", ch: 2, difficulty: "medium", source: SRC[2],
            title: "Với đoạn code trên, lời gọi `new " + cls + "(\"Lan\")` chọn constructor nào?",
            code: code,
            options: [
              "Constructor " + cls + "(string ten) vì lời gọi truyền một đối số kiểu string",
              "Constructor " + cls + "() vì constructor không tham số luôn được ưu tiên",
              "Cả hai constructor cùng chạy",
              "Không constructor nào chạy vì thiếu từ khóa new bên trong lớp"
            ],
            explain: "Trình biên dịch chọn constructor có danh sách tham số khớp với lời gọi. new " + cls + "(\"Lan\") truyền một string nên chọn " + cls + "(string ten)."
          });
        }
        return build(rng, {
          templateId: "c2-ctor-overload", ch: 2, difficulty: "medium", source: SRC[2],
          title: "Hai constructor cùng tên nhưng khác danh sách tham số trong lớp " + cls + " minh họa khái niệm nào?",
          code: code,
          options: [
            "Nạp chồng constructor (constructor overloading)",
            "Ghi đè constructor (constructor overriding)",
            "Kế thừa constructor",
            "Constructor tĩnh"
          ],
          explain: "Nhiều constructor cùng tên nhưng khác số lượng/kiểu tham số là nạp chồng constructor. Trình biên dịch chọn constructor phù hợp dựa trên đối số truyền vào."
        });
      },
      function (rng) {
        var cls = pick(rng, ["SinhVien", "HinhChuNhat", "TaiKhoan"]);
        var mode = pick(rng, ["syntax", "features"]);
        if (mode === "features") {
          return build(rng, {
            templateId: "c2-destructor-syntax", ch: 2, difficulty: "easy", source: SRC[2],
            title: "Destructor của lớp " + cls + " có đặc điểm nào?",
            options: [
              "Bắt đầu bằng dấu ~, không có tham số và không có access modifier",
              "Có kiểu trả về void và bắt buộc phải là public",
              "Có cùng danh sách tham số như constructor",
              "Được gọi ngay lập tức khi đối tượng vừa được tạo bằng new"
            ],
            explain: "Destructor có dạng ~" + cls + "() { }, không nhận tham số, không có access modifier và không có kiểu trả về. Nó do bộ dọn rác gọi, không chạy ngay sau new."
          });
        }
        return build(rng, {
          templateId: "c2-destructor-syntax", ch: 2, difficulty: "easy", source: SRC[2],
          title: "Cú pháp khai báo destructor cho lớp " + cls + " trong C# là gì?",
          options: [
            "~" + cls + "() { }",
            cls + "~() { }",
            "void ~" + cls + "() { }",
            "destructor " + cls + "() { }"
          ],
          explain: "Destructor có dấu ngã (~) đứng trước tên lớp, không có access modifier và không có kiểu trả về: ~" + cls + "() { }."
        });
      },
      function (rng) {
        var data = [
          { cls: "MayTinh", method: "Cong", a: 3, b: 8 },
          { cls: "MayTinh", method: "Nhan", a: 4, b: 6 },
          { cls: "XuLySo", method: "Tong", a: 7, b: 5 }
        ];
        var d = pick(rng, data);
        var correct = d.method === "Nhan" ? d.a * d.b : d.a + d.b;
        var code = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    public int " + d.method + "(int a, int b) { return " + (d.method === "Nhan" ? "a * b" : "a + b") + "; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " o = new " + d.cls + "();\n" +
          "        Console.WriteLine(o." + d.method + "(" + d.a + ", " + d.b + "));\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c2-method-return", ch: 2, difficulty: "medium", source: SRC[2],
          title: "Kết quả in ra từ phương thức " + d.method + " là gì?",
          code: code,
          options: numOptions(correct, [d.a + d.b + 1, d.a * d.b, correct + 10]),
          explain: "Phương thức " + d.method + " trả về " + (d.method === "Nhan" ? "tích" : "tổng") + " của hai tham số. Với " + d.a + " và " + d.b + ", kết quả là " + correct + "."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", obj: "sv", method: "HienThi" },
          { cls: "HinhChuNhat", obj: "hcn", method: "TinhDienTich" },
          { cls: "TaiKhoan", obj: "tk", method: "InSoDu" }
        ];
        var d = pick(rng, data);
        var mode = pick(rng, ["call", "receiver"]);
        if (mode === "receiver") {
          var code = "class " + d.cls + " {\n" +
            "    public void " + d.method + "() { }\n" +
            "}\n" +
            "class Program {\n" +
            "    static void Main() {\n" +
            "        " + d.cls + " " + d.obj + " = new " + d.cls + "();\n" +
            "        " + d.obj + "." + d.method + "();\n" +
            "    }\n" +
            "}";
          return build(rng, {
            templateId: "c2-method-call", ch: 2, difficulty: "easy", source: SRC[2],
            title: "Trong lời gọi `" + d.obj + "." + d.method + "();`, đối tượng nhận thông điệp là gì?",
            code: code,
            options: [
              d.obj,
              d.method,
              d.cls,
              "new"
            ],
            explain: "Trong cú pháp đối_tượng.phương_thức(), " + d.obj + " đứng trước dấu chấm nên là đối tượng nhận thông điệp; " + d.method + " là tên phương thức được gọi."
          });
        }
        return build(rng, {
          templateId: "c2-method-call", ch: 2, difficulty: "easy", source: SRC[2],
          title: "Lời gọi nào hợp lệ để gọi phương thức " + d.method + "() không tham số trên đối tượng " + d.obj + "?",
          options: [
            d.obj + "." + d.method + "();",
            d.method + "(" + d.obj + ");",
            d.cls + "." + d.method + "();",
            d.obj + "." + d.method + ";"
          ],
          explain: "Gọi phương thức instance trên đối tượng dùng cú pháp đối tượng.phương_thức(danh_sách_tham_số). Với phương thức không tham số vẫn phải có cặp ngoặc tròn: " + d.obj + "." + d.method + "()."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", field: "HoTen", prop: "Diem", method: "HienThi" },
          { cls: "SanPham", field: "TenSP", prop: "GiaBan", method: "InThongTin" },
          { cls: "TaiKhoan", field: "ChuTK", prop: "SoDu", method: "RutTien" }
        ];
        var d = pick(rng, data);
        var code = "class " + d.cls + " {\n" +
          "    public string " + d.field + ";\n" +
          "    public int " + d.prop + " { get; set; }\n" +
          "    public " + d.cls + "() { }\n" +
          "    public void " + d.method + "() { }\n" +
          "}";
        var kind = pick(rng, ["method", "field", "property", "ctor"]);
        var titles = {
          method: "Trong lớp trên, thành phần nào là phương thức (method)?",
          field: "Trong lớp trên, thành phần nào là trường dữ liệu (field)?",
          property: "Trong lớp trên, thành phần nào là thuộc tính (property)?",
          ctor: "Trong lớp trên, thành phần nào là constructor?"
        };
        var answers = { method: d.method, field: d.field, property: d.prop, ctor: d.cls };
        var explains = {
          method: d.method + " có kiểu trả về void và cặp ngoặc tròn nên là phương thức.",
          field: d.field + " được khai báo trực tiếp với kiểu dữ liệu và không có get/set nên là trường.",
          property: d.prop + " có khối get/set nên là thuộc tính.",
          ctor: d.cls + " trùng tên lớp và không có kiểu trả về nên là constructor."
        };
        var all = [d.method, d.field, d.prop, d.cls];
        var options = [answers[kind]].concat(all.filter(function (x) { return x !== answers[kind]; }));
        return build(rng, {
          templateId: "c2-member-kinds", ch: 2, difficulty: "medium", source: SRC[2],
          title: titles[kind],
          code: code,
          options: options,
          explain: explains[kind] + " " + d.field + " là trường, " + d.prop + " là thuộc tính, " + d.method + " là phương thức, " + d.cls + " là constructor."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", field: "Diem", first: 9, second: 7 },
          { cls: "TaiKhoan", field: "SoDu", first: 500, second: 250 },
          { cls: "SanPham", field: "SoLuong", first: 12, second: 4 }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    public int " + d.field + ";\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " a = new " + d.cls + "();\n" +
          "        a." + d.field + " = " + d.first + ";\n" +
          "        " + d.cls + " b = a;\n" +
          "        b." + d.field + " = " + d.second + ";\n" +
          "        Console.WriteLine(a." + d.field + ");\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c2-two-objects", ch: 2, difficulty: "hard", source: SRC[2],
          title: "Gán tham chiếu giữa hai biến đối tượng: kết quả in ra là gì?",
          code: code,
          options: numOptions(d.second, [d.first, 0, d.second + 1]),
          explain: "Phép gán b = a sao chép tham chiếu, không tạo đối tượng mới. a và b cùng trỏ tới một đối tượng, nên gán b." + d.field + " = " + d.second + " cũng làm a." + d.field + " thay đổi theo; kết quả là " + d.second + "."
        });
      }
    ],
    3: [
      function (rng) {
        var data = [
          { cls: "SinhVien", member: "int diem;" },
          { cls: "TaiKhoan", member: "double soDu;" },
          { cls: "HinhChuNhat", member: "int dai;" }
        ];
        var d = pick(rng, data);
        var mode = pick(rng, ["member", "class"]);
        if (mode === "class") {
          return build(rng, {
            templateId: "c3-default-private", ch: 3, difficulty: "easy", source: SRC[3],
            title: "Một lớp top-level khai báo `class " + d.cls + " { }` không ghi access modifier sẽ có mức truy cập mặc định nào?",
            options: [
              "internal",
              "private",
              "public",
              "protected"
            ],
            explain: "Với lớp top-level, không ghi access modifier thì mặc định là internal (chỉ dùng trong cùng assembly). Khác với thành viên của lớp, vốn mặc định là private."
          });
        }
        return build(rng, {
          templateId: "c3-default-private", ch: 3, difficulty: "easy", source: SRC[3],
          title: "Trong lớp " + d.cls + ", thành viên khai báo là `" + d.member + "` (không ghi access modifier) có mức truy cập nào?",
          options: [
            "private",
            "public",
            "protected",
            "internal"
          ],
          explain: "Trong C#, thành viên của lớp không ghi rõ access modifier mặc định là private, chỉ truy cập được bên trong chính lớp đó."
        });
      },
      function (rng) {
        var data = [
          { base: "DongVat", derived: "Cho" },
          { base: "NhanVien", derived: "KeToan" },
          { base: "Hinh", derived: "HinhTron" }
        ];
        var d = pick(rng, data);
        var mode = pick(rng, ["scope", "compare"]);
        if (mode === "compare") {
          return build(rng, {
            templateId: "c3-protected-access", ch: 3, difficulty: "easy", source: SRC[3],
            title: "Điểm khác nhau giữa protected và private khi lớp " + d.derived + " kế thừa " + d.base + " là gì?",
            options: [
              "protected cho lớp dẫn xuất " + d.derived + " truy cập, private thì không",
              "private cho lớp dẫn xuất " + d.derived + " truy cập, protected thì không",
              "Cả hai đều cho mọi lớp bên ngoài truy cập trực tiếp",
              "Cả hai chỉ được dùng bên trong interface"
            ],
            explain: "private chỉ mở trong chính lớp khai báo; protected mở thêm cho lớp dẫn xuất. Vì vậy " + d.derived + " truy cập được thành viên protected nhưng không truy cập trực tiếp thành viên private của " + d.base + "."
          });
        }
        return build(rng, {
          templateId: "c3-protected-access", ch: 3, difficulty: "easy", source: SRC[3],
          title: "Thành viên protected của lớp cơ sở " + d.base + " có thể được truy cập từ đâu?",
          options: [
            "Từ chính lớp " + d.base + " và các lớp dẫn xuất như " + d.derived,
            "Từ mọi lớp trong cùng namespace",
            "Chỉ từ bên trong lớp " + d.base + ", lớp dẫn xuất cũng không được",
            "Từ bất kỳ đối tượng nào sau khi dùng new"
          ],
          explain: "protected cho phép truy cập trong lớp khai báo và trong các lớp dẫn xuất, nhưng không cho lớp không liên quan truy cập trực tiếp."
        });
      },
      function (rng) {
        var data = [
          { cls: "TaiKhoan", field: "soDu", value: 100 },
          { cls: "SinhVien", field: "diem", value: 8 },
          { cls: "SanPham", field: "soLuong", value: 25 }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    private int " + d.field + " = " + d.value + ";\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " o = new " + d.cls + "();\n" +
          "        Console.WriteLine(o." + d.field + ");\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c3-private-field-access", ch: 3, difficulty: "medium", source: SRC[3],
          title: "Đoạn chương trình trên cho kết quả gì?",
          code: code,
          options: [
            "Lỗi biên dịch vì " + d.field + " là private, không truy cập được từ lớp Program",
            "In ra " + d.value,
            "In ra 0",
            "In ra null"
          ],
          explain: "Trường private chỉ truy cập được bên trong lớp " + d.cls + ". Lớp Program truy cập trực tiếp o." + d.field + " nên bị lỗi biên dịch."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", prop: "Diem", value: 8 },
          { cls: "SanPham", prop: "GiaBan", value: 150 },
          { cls: "TaiKhoan", prop: "SoDu", value: 500 }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    private int " + d.prop.toLowerCase() + ";\n" +
          "    public int " + d.prop + " {\n" +
          "        get { return " + d.prop.toLowerCase() + "; }\n" +
          "        set { " + d.prop.toLowerCase() + " = value; }\n" +
          "    }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " o = new " + d.cls + "();\n" +
          "        o." + d.prop + " = " + d.value + ";\n" +
          "        Console.WriteLine(o." + d.prop + ");\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c3-property-value", ch: 3, difficulty: "medium", source: SRC[3],
          title: "Kết quả in ra khi sử dụng thuộc tính " + d.prop + " là gì?",
          code: code,
          options: numOptions(d.value, [0, d.value + 1, d.value - 1]),
          explain: "Thuộc tính " + d.prop + " ghi giá trị vào trường private qua set và đọc lại qua get. Sau khi gán " + d.value + ", chương trình in ra " + d.value + "."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", n: 3 },
          { cls: "TaiKhoan", n: 4 },
          { cls: "SanPham", n: 5 }
        ];
        var d = pick(rng, data);
        var news = [];
        for (var i = 0; i < d.n; i++) news.push("        new " + d.cls + "();");
        var code = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    public static int Dem = 0;\n" +
          "    public " + d.cls + "() { Dem++; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          news.join("\n") + "\n" +
          "        Console.WriteLine(" + d.cls + ".Dem);\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c3-static-counter", ch: 3, difficulty: "medium", source: SRC[3],
          title: "Biến static Dem dùng chung cho mọi đối tượng: kết quả in ra là gì?",
          code: code,
          options: numOptions(d.n, [1, d.n - 1, d.n + 1]),
          explain: "Trường static Dem thuộc về lớp chứ không thuộc từng đối tượng. Mỗi lần constructor chạy, Dem tăng 1; tạo " + d.n + " đối tượng nên Dem bằng " + d.n + "."
        });
      },
      function (rng) {
        var data = [
          { cls: "MathHelper", method: "Tong" },
          { cls: "TienIch", method: "BinhPhuong" },
          { cls: "Calculator", method: "Nhan" }
        ];
        var d = pick(rng, data);
        var mode = pick(rng, ["call", "reason"]);
        if (mode === "reason") {
          return build(rng, {
            templateId: "c3-static-call", ch: 3, difficulty: "medium", source: SRC[3],
            title: "Vì sao không thể gọi phương thức static " + d.method + " qua `new " + d.cls + "()." + d.method + "(2, 3)`?",
            options: [
              "Thành viên static thuộc về lớp, không thuộc thể hiện; C# báo lỗi khi truy cập qua thể hiện",
              "Vì phương thức static không được phép có tham số",
              "Vì new không tạo được đối tượng từ lớp " + d.cls,
              "Vì phương thức static chỉ gọi được bằng từ khóa base"
            ],
            explain: "Static gắn với kiểu/lớp chứ không gắn với từng đối tượng. C# yêu cầu gọi qua tên lớp: " + d.cls + "." + d.method + "(...); gọi qua thể hiện là lỗi biên dịch."
          });
        }
        return build(rng, {
          templateId: "c3-static-call", ch: 3, difficulty: "easy", source: SRC[3],
          title: "Với phương thức static " + d.method + " trong lớp " + d.cls + ", lời gọi nào đúng trong C#?",
          options: [
            d.cls + "." + d.method + "(2, 3)",
            "new " + d.cls + "()." + d.method + "(2, 3)",
            d.cls + "." + d.method + ";",
            d.method + "." + d.cls + "(2, 3)"
          ],
          explain: "Phương thức static được gọi thông qua tên lớp: " + d.cls + "." + d.method + "(...). C# không cho phép truy cập thành viên static qua một thể hiện cụ thể."
        });
      },
      function (rng) {
        var cls = pick(rng, ["TienIch", "MathHelper", "HangSo"]);
        var mode = pick(rng, ["instantiate", "members"]);
        if (mode === "members") {
          return build(rng, {
            templateId: "c3-static-class", ch: 3, difficulty: "easy", source: SRC[3],
            title: "Static class " + cls + " có thể chứa những thành viên nào?",
            options: [
              "Chỉ thành viên static (phương thức, trường, thuộc tính static)",
              "Cả thành viên instance và thành viên static",
              "Chỉ constructor instance",
              "Chỉ thuộc tính instance"
            ],
            explain: "Static class không thể có thành viên instance; mọi thành viên của nó đều phải là static. Nó cũng không có constructor instance."
          });
        }
        return build(rng, {
          templateId: "c3-static-class", ch: 3, difficulty: "easy", source: SRC[3],
          title: "Điều gì xảy ra khi viết `new " + cls + "()` với " + cls + " là static class?",
          options: [
            "Lỗi biên dịch vì không thể tạo đối tượng từ static class",
            "Tạo đối tượng bình thường",
            "Tạo được đối tượng nhưng không gọi được phương thức",
            "Chương trình tự chuyển static class thành lớp thường"
          ],
          explain: "Static class không thể khởi tạo bằng new; nó chỉ chứa thành viên static và được dùng trực tiếp qua tên lớp."
        });
      },
      function (rng) {
        var data = [
          { x: 3, y: 8 },
          { x: 10, y: 4 },
          { x: 6, y: 9 }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class Program {\n" +
          "    static void HoanDoi(ref int a, ref int b) {\n" +
          "        int t = a; a = b; b = t;\n" +
          "    }\n" +
          "    static void Main() {\n" +
          "        int x = " + d.x + ", y = " + d.y + ";\n" +
          "        HoanDoi(ref x, ref y);\n" +
          "        Console.WriteLine(x + \" \" + y);\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c3-ref-swap", ch: 3, difficulty: "medium", source: SRC[3],
          title: "Kết quả in ra sau khi gọi HoanDoi với tham số ref là gì?",
          code: code,
          options: [
            d.y + " " + d.x,
            d.x + " " + d.y,
            d.x + " " + d.x,
            d.y + " " + d.y
          ],
          explain: "Tham số ref truyền tham chiếu tới biến gốc, nên phương thức hoán đổi được giá trị của x và y. Kết quả là “" + d.y + " " + d.x + "”."
        });
      },
      function (rng) {
        var good = pick(rng, ["42", "125", "7"]);
        var bad = pick(rng, ["abc", "12x", "OOP"]);
        var useGood = pick(rng, [true, false]);
        var input = useGood ? good : bad;
        var n = useGood ? input : "0";
        var code = "using System;\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        string s = \"" + input + "\";\n" +
          "        bool ok = int.TryParse(s, out int n);\n" +
          "        Console.WriteLine(ok + \" \" + n);\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c3-out-parse", ch: 3, difficulty: "hard", source: SRC[3],
          title: "Kết quả in ra khi dùng int.TryParse với tham số out là gì?",
          code: code,
          options: useGood
            ? ["True " + n, "False " + n, "True 0", "False 0"]
            : ["False 0", "True 0", "False " + input, "True " + input],
          explain: useGood
            ? "Chuỗi “" + input + "” chuyển được thành số nguyên, nên TryParse trả về True và gán n = " + n + " qua tham số out."
            : "Chuỗi “" + input + "” không phải số nguyên hợp lệ, nên TryParse trả về False và gán n = 0 qua tham số out."
        });
      },
      function (rng) {
        var data = [
          { x: 5, step: 2 },
          { x: 10, step: 3 },
          { x: 7, step: 4 }
        ];
        var d = pick(rng, data);
        var useDefault = pick(rng, [true, false]);
        var overrideStep = d.step + pick(rng, [1, 2, 3]);
        var arg = useDefault ? "" : ", " + overrideStep;
        var usedStep = useDefault ? d.step : overrideStep;
        var correct = d.x + usedStep;
        var code = "using System;\n" +
          "class MayTinh {\n" +
          "    public int Tang(int x, int buoc = " + d.step + ") { return x + buoc; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        MayTinh mt = new MayTinh();\n" +
          "        Console.WriteLine(mt.Tang(" + d.x + arg + "));\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c3-default-param", ch: 3, difficulty: "medium", source: SRC[3],
          title: useDefault
            ? "Tham số mặc định được dùng khi lời gọi bỏ qua đối số: kết quả in ra là gì?"
            : "Truyền đè giá trị tham số mặc định: kết quả in ra là gì?",
          code: code,
          options: numOptions(correct, [d.x, d.step, d.x + d.step + 1]),
          explain: useDefault
            ? "Lời gọi Tang(" + d.x + ") bỏ qua đối số thứ hai nên buoc nhận giá trị mặc định " + d.step + "; kết quả là " + correct + "."
            : "Lời gọi Tang(" + d.x + ", " + overrideStep + ") truyền đè giá trị mặc định " + d.step + " bằng " + overrideStep + "; kết quả là " + d.x + " + " + overrideStep + " = " + correct + "."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", field: "ten", param: "ten" },
          { cls: "SanPham", field: "gia", param: "gia" },
          { cls: "TaiKhoan", field: "soDu", param: "soDu" }
        ];
        var d = pick(rng, data);
        var code = "class " + d.cls + " {\n" +
          "    private string " + d.field + ";\n" +
          "    public " + d.cls + "(string " + d.param + ") {\n" +
          "        this." + d.field + " = " + d.param + ";\n" +
          "    }\n" +
          "}";
        var mode = pick(rng, ["meaning", "output"]);
        if (mode === "output") {
          var name = pick(rng, ["Lan", "Minh", "An"]);
          var full = "using System;\n" +
            "class " + d.cls + " {\n" +
            "    private string " + d.field + ";\n" +
            "    public " + d.cls + "(string " + d.param + ") { this." + d.field + " = " + d.param + "; }\n" +
            "    public string Lay() { return " + d.field + "; }\n" +
            "}\n" +
            "class Program {\n" +
            "    static void Main() {\n" +
            "        Console.WriteLine(new " + d.cls + "(\"" + name + "\").Lay());\n" +
            "    }\n" +
            "}";
          return build(rng, {
            templateId: "c3-this", ch: 3, difficulty: "medium", source: SRC[3],
            title: "Kết quả in ra khi constructor dùng this để gán trường là gì?",
            code: full,
            options: [
              name,
              d.param,
              d.cls,
              "null"
            ],
            explain: "this." + d.field + " là trường của đối tượng hiện tại; phép gán this." + d.field + " = " + d.param + " lưu giá trị “" + name + "” vào đối tượng. Lay() trả về " + name + "."
          });
        }
        return build(rng, {
          templateId: "c3-this", ch: 3, difficulty: "easy", source: SRC[3],
          title: "Trong constructor trên, từ khóa this tham chiếu đến đâu?",
          code: code,
          options: [
            "Đối tượng hiện tại đang được khởi tạo",
            "Lớp cơ sở của " + d.cls,
            "Một đối tượng mới do C# tự tạo",
            "Biến static dùng chung của lớp"
          ],
          explain: "this tham chiếu tới đối tượng hiện tại. Ở đây this." + d.field + " phân biệt trường của đối tượng với tham số " + d.param + " cùng tên."
        });
      },
      function (rng) {
        var type = pick(rng, ["int", "string", "double"]);
        var mode = pick(rng, ["syntax", "access"]);
        if (mode === "access") {
          return build(rng, {
            templateId: "c3-indexer", ch: 3, difficulty: "medium", source: SRC[3],
            title: "Với indexer đã khai báo trong lớp DanhSach, cú pháp truy cập phần tử thứ 0 của đối tượng ds là gì?",
            options: [
              "ds[0]",
              "ds.0",
              "ds(0)",
              "DanhSach[0]"
            ],
            explain: "Indexer cho phép truy cập đối tượng như mảng: ds[0]. Cú pháp này gọi get của indexer với tham số i = 0."
          });
        }
        return build(rng, {
          templateId: "c3-indexer", ch: 3, difficulty: "medium", source: SRC[3],
          title: "Cú pháp nào khai báo indexer cho lớp DanhSach trong C#?",
          options: [
            "public " + type + " this[int i] { get { return a[i]; } }",
            "public " + type + " DanhSach[int i] { get { return a[i]; } }",
            "public indexer " + type + " i { get { return a[i]; } }",
            "public " + type + " this(i) { return a[i]; }"
          ],
          explain: "Indexer dùng từ khóa this cùng danh sách tham số trong ngoặc vuông: public " + type + " this[int i] { get { ... } }."
        });
      }
    ],
    4: [
      function (rng) {
        var pairs = [
          ["DongVat", "Cho"],
          ["NhanVien", "KeToan"],
          ["Hinh", "HinhTron"],
          ["PhuongTien", "XeDap"]
        ];
        var p = pick(rng, pairs);
        var mode = pick(rng, ["syntax", "meaning"]);
        if (mode === "meaning") {
          return build(rng, {
            templateId: "c4-syntax", ch: 4, difficulty: "easy", source: SRC[4],
            title: "Trong khai báo `class " + p[1] + " : " + p[0] + "`, dấu hai chấm (:) biểu thị điều gì?",
            options: [
              p[1] + " kế thừa lớp " + p[0],
              p[0] + " kế thừa lớp " + p[1],
              p[1] + " và " + p[0] + " đều là interface",
              p[1] + " là static class chứa " + p[0]
            ],
            explain: "Dấu “:” đứng sau tên lớp dẫn xuất và trước lớp cơ sở. Vì vậy " + p[1] + " kế thừa " + p[0] + "."
          });
        }
        return build(rng, {
          templateId: "c4-syntax", ch: 4, difficulty: "easy", source: SRC[4],
          title: "Cú pháp nào khai báo lớp " + p[1] + " kế thừa lớp " + p[0] + " trong C#?",
          options: [
            "class " + p[1] + " : " + p[0] + " { }",
            "class " + p[1] + " extends " + p[0] + " { }",
            "class " + p[1] + " inherits " + p[0] + " { }",
            "class " + p[1] + " -> " + p[0] + " { }"
          ],
          explain: "C# dùng dấu hai chấm (:) để biểu diễn kế thừa: class " + p[1] + " : " + p[0] + " { }. Không dùng extends hay inherits như một số ngôn ngữ khác."
        });
      },
      function (rng) {
        var pairs = [
          ["DongVat", "Cho"],
          ["NhanVien", "KeToan"],
          ["Hinh", "HinhTron"]
        ];
        var p = pick(rng, pairs);
        var mode = pick(rng, ["fact", "basecall"]);
        if (mode === "basecall") {
          return build(rng, {
            templateId: "c4-ctor-not-inherited", ch: 4, difficulty: "medium", source: SRC[4],
            title: "Lớp " + p[1] + " kế thừa " + p[0] + ", và " + p[0] + " chỉ có constructor " + p[0] + "(int). " + p[1] + " muốn chuyển tham số lên constructor cơ sở thì viết thế nào?",
            options: [
              "public " + p[1] + "(int x) : base(x) { }",
              "public " + p[1] + "(int x) : this(x) { }",
              "public " + p[1] + "(int x) { base(x); }",
              "public " + p[1] + "(int x) { " + p[0] + "(x); }"
            ],
            explain: "Constructor cơ sở được gọi qua cú pháp : base(...) đặt ngay sau danh sách tham số của constructor dẫn xuất. base(x) trong thân phương thức không phải lời gọi constructor."
          });
        }
        return build(rng, {
          templateId: "c4-ctor-not-inherited", ch: 4, difficulty: "easy", source: SRC[4],
          title: "Phát biểu nào đúng về constructor khi lớp " + p[1] + " kế thừa lớp " + p[0] + "?",
          options: [
            "Constructor của " + p[0] + " không được " + p[1] + " kế thừa",
            p[1] + " tự động kế thừa mọi constructor của " + p[0],
            p[1] + " chỉ kế thừa constructor không tham số của " + p[0],
            "Constructor được kế thừa nếu khai báo public"
          ],
          explain: "Constructor không phải thành viên được kế thừa. Lớp dẫn xuất phải tự khai báo constructor và có thể gọi constructor cơ sở bằng base(...)."
        });
      },
      function (rng) {
        var pairs = [
          ["DongVat", "Cho", "tuoi"],
          ["NhanVien", "KeToan", "luong"],
          ["Hinh", "HinhTron", "banKinh"]
        ];
        var p = pick(rng, pairs);
        var mode = pick(rng, ["access", "modifier"]);
        if (mode === "modifier") {
          return build(rng, {
            templateId: "c4-private-base", ch: 4, difficulty: "easy", source: SRC[4],
            title: "Muốn lớp dẫn xuất " + p[1] + " truy cập trực tiếp thành viên `" + p[2] + "` của " + p[0] + " nhưng không mở cho mọi lớp bên ngoài, nên dùng access modifier nào?",
            options: [
              "protected",
              "private",
              "public",
              "abstract"
            ],
            explain: "protected mở quyền truy cập cho chính lớp khai báo và các lớp dẫn xuất, nhưng không mở cho lớp không liên quan. private quá hẹp, public quá rộng; abstract không phải access modifier."
          });
        }
        return build(rng, {
          templateId: "c4-private-base", ch: 4, difficulty: "medium", source: SRC[4],
          title: "Thành viên private `" + p[2] + "` của lớp cơ sở " + p[0] + " được lớp dẫn xuất " + p[1] + " truy cập trực tiếp như thế nào?",
          options: [
            "Không truy cập trực tiếp được; phải dùng thành viên public/protected do lớp cơ sở cung cấp",
            "Truy cập trực tiếp bình thường",
            "Chỉ truy cập được nếu lớp dẫn xuất nằm cùng file",
            "Chỉ truy cập được qua cú pháp base.private"
          ],
          explain: "Private chỉ mở trong chính lớp khai báo. Lớp dẫn xuất không truy cập trực tiếp được; muốn dùng phải thông qua phương thức/thuộc tính public hoặc protected của lớp cơ sở."
        });
      },
      function (rng) {
        var data = [
          { base: "DongVat", derived: "Cho", name: "Milu" },
          { base: "NhanVien", derived: "KeToan", name: "Lan" },
          { base: "Hinh", derived: "HinhTron", name: "H1" }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.base + " {\n" +
          "    protected string ten;\n" +
          "    public " + d.base + "(string ten) { this.ten = ten; }\n" +
          "}\n" +
          "class " + d.derived + " : " + d.base + " {\n" +
          "    public " + d.derived + "(string ten) : base(ten) { }\n" +
          "    public void In() { Console.WriteLine(ten); }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        new " + d.derived + "(\"" + d.name + "\").In();\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c4-base-ctor", ch: 4, difficulty: "medium", source: SRC[4],
          title: "Kết quả in ra khi constructor lớp dẫn xuất gọi constructor cơ sở bằng base là gì?",
          code: code,
          options: [
            d.name,
            "Chua dat",
            "Lỗi biên dịch vì không gọi được base",
            "null"
          ],
          explain: "Lời gọi : base(ten) chuyển tham số lên constructor lớp cơ sở, gán ten = “" + d.name + "”. Phương thức In in ra " + d.name + "."
        });
      },
      function (rng) {
        var data = [
          { base: "A", derived: "B" },
          { base: "Cha", derived: "Con" },
          { base: "LopCoSo", derived: "LopDanXuat" }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.base + " {\n" +
          "    public " + d.base + "() { Console.Write(\"" + d.base + " \"); }\n" +
          "}\n" +
          "class " + d.derived + " : " + d.base + " {\n" +
          "    public " + d.derived + "() { Console.Write(\"" + d.derived + "\"); }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        new " + d.derived + "();\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c4-base-order", ch: 4, difficulty: "medium", source: SRC[4],
          title: "Thứ tự thực thi constructor khi tạo đối tượng lớp dẫn xuất là gì?",
          code: code,
          options: [
            d.base + " " + d.derived,
            d.derived + " " + d.base,
            d.base + " " + d.base,
            d.derived + " " + d.derived
          ],
          explain: "Khi tạo đối tượng lớp dẫn xuất, constructor lớp cơ sở chạy trước rồi mới đến constructor lớp dẫn xuất. Kết quả là “" + d.base + " " + d.derived + "”."
        });
      },
      function (rng) {
        var method = pick(rng, ["Keu", "In", "HienThi"]);
        var mode = pick(rng, ["meaning", "missing"]);
        if (mode === "missing") {
          var hidingCode = "class Cha {\n" +
            "    public void " + method + "() { }\n" +
            "}\n" +
            "class Con : Cha {\n" +
            "    public void " + method + "() { }\n" +
            "}";
          return build(rng, {
            templateId: "c4-new-hiding", ch: 4, difficulty: "hard", source: SRC[4],
            title: "Nếu lớp dẫn xuất khai báo phương thức cùng chữ ký với một phương thức instance không virtual của lớp cơ sở nhưng không dùng new hoặc override, điều gì xảy ra?",
            code: hidingCode,
            options: [
              "Trình biên dịch cảnh báo (CS0108) và phương thức mới che khuất phương thức cơ sở",
              "Trình biên dịch tự động biến phương thức mới thành override",
              "Chương trình không bao giờ biên dịch được",
              "Phương thức cơ sở bị xóa khỏi lớp cơ sở"
            ],
            explain: "Vì phương thức cơ sở là instance, không virtual, và lớp dẫn xuất khai báo cùng chữ ký mà thiếu new/override, C# phát cảnh báo CS0108 rằng thành viên mới che khuất thành viên cơ sở. Nó không tự động trở thành override và không xóa phương thức cơ sở. Nếu chỉ cùng tên nhưng khác tham số thì đó là nạp chồng, không phát sinh cảnh báo này."
          });
        }
        return build(rng, {
          templateId: "c4-new-hiding", ch: 4, difficulty: "medium", source: SRC[4],
          title: "Từ khóa new trong khai báo `public new void " + method + "()` của lớp dẫn xuất có ý nghĩa gì?",
          options: [
            "Che khuất phương thức cùng tên của lớp cơ sở (method hiding), không phải ghi đè",
            "Ghi đè phương thức ảo của lớp cơ sở",
            "Tạo một đối tượng mới ngay trong phương thức",
            "Bắt buộc lớp cơ sở phải là abstract"
          ],
          explain: "new dùng để che khuất (hide) thành viên cùng tên của lớp cơ sở. Nó không tham gia cơ chế đa hình như virtual/override."
        });
      },
      function (rng) {
        var data = [
          { base: "A", derived: "B", method: "In" },
          { base: "Cha", derived: "Con", method: "HienThi" }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.base + " {\n" +
          "    public void " + d.method + "() { Console.Write(\"" + d.base + "-\"); }\n" +
          "}\n" +
          "class " + d.derived + " : " + d.base + " {\n" +
          "    public new void " + d.method + "() { base." + d.method + "(); Console.Write(\"" + d.derived + "\"); }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        new " + d.derived + "()." + d.method + "();\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c4-base-call", ch: 4, difficulty: "medium", source: SRC[4],
          title: "Kết quả in ra khi lớp dẫn xuất gọi phương thức cơ sở bằng base là gì?",
          code: code,
          options: [
            d.base + "-" + d.derived,
            d.derived + "-" + d.base,
            d.base + "-" + d.base,
            d.derived + "-" + d.derived
          ],
          explain: "base." + d.method + "() gọi phiên bản của lớp cơ sở, sau đó lớp dẫn xuất in tiếp tên mình. Kết quả là “" + d.base + "-" + d.derived + "”."
        });
      },
      function (rng) {
        var pairs = [
          ["DongVat", "Cho"],
          ["NhanVien", "KeToan"],
          ["Hinh", "HinhTron"]
        ];
        var p = pick(rng, pairs);
        var mode = pick(rng, ["limits", "assignment"]);
        if (mode === "assignment") {
          var refCode = "class " + p[0] + " { }\n" +
            "class " + p[1] + " : " + p[0] + " { }\n" +
            "class Program {\n" +
            "    static void Main() {\n" +
            "        " + p[1] + " c = new " + p[0] + "();\n" +
            "    }\n" +
            "}";
          return build(rng, {
            templateId: "c4-base-ref-limits", ch: 4, difficulty: "hard", source: SRC[4],
            title: "Phép gán `" + p[1] + " c = new " + p[0] + "();` (" + p[0] + " là lớp cơ sở) có hợp lệ không?",
            code: refCode,
            options: [
              "Không biên dịch vì không có chuyển đổi ngầm từ " + p[0] + " xuống " + p[1] + "; ép tường minh `(" + p[1] + ")new " + p[0] + "()` sẽ ném InvalidCastException vì đối tượng thực tế là " + p[0],
              "Có, vì " + p[1] + " kế thừa " + p[0],
              "Có, vì mọi đối tượng " + p[0] + " đều là " + p[1],
              "Không, vì không thể tạo đối tượng " + p[0] + " bằng new"
            ],
            explain: "Gán trực tiếp `" + p[1] + " c = new " + p[0] + "();` không biên dịch vì C# không có chuyển đổi ngầm từ lớp cơ sở xuống lớp dẫn xuất. Ép tường minh `(" + p[1] + ")new " + p[0] + "()` biên dịch nhưng ném InvalidCastException khi chạy vì đối tượng thực tế là " + p[0] + ". Chỉ ép an toàn khi biến kiểu " + p[0] + " thực sự đang trỏ tới đối tượng " + p[1] + ", ví dụ `" + p[0] + " b = new " + p[1] + "(); " + p[1] + " c = (" + p[1] + ")b;`."
          });
        }
        return build(rng, {
          templateId: "c4-base-ref-limits", ch: 4, difficulty: "medium", source: SRC[4],
          title: "Khi biến kiểu " + p[0] + " trỏ đến đối tượng " + p[1] + ", điều gì đúng?",
          options: [
            "Chỉ gọi được thành viên khai báo ở " + p[0] + "; muốn dùng thành viên riêng của " + p[1] + " phải ép kiểu",
            "Gọi được mọi thành viên riêng của " + p[1] + " mà không cần ép kiểu",
            "Không thể gán đối tượng " + p[1] + " cho biến kiểu " + p[0],
            "Biến kiểu " + p[0] + " tự động trở thành kiểu " + p[1]
          ],
          explain: "Biến kiểu cơ sở chỉ thấy phần giao diện của lớp cơ sở. Muốn gọi thành viên riêng của lớp dẫn xuất phải ép kiểu về " + p[1] + " (có kiểm tra kiểu khi cần)."
        });
      },
      function (rng) {
        var pairs = [
          ["DongVat", "Cho"],
          ["NhanVien", "KeToan"],
          ["Hinh", "HinhTron"]
        ];
        var p = pick(rng, pairs);
        var mode = pick(rng, ["count", "multi"]);
        if (mode === "multi") {
          return build(rng, {
            templateId: "c4-single-inheritance", ch: 4, difficulty: "easy", source: SRC[4],
            title: "C# có cho phép lớp " + p[1] + " kế thừa trực tiếp nhiều lớp cơ sở như C++ không?",
            options: [
              "Không; tối đa một lớp cơ sở trực tiếp, nhưng có thể thực thi nhiều interface",
              "Có; kế thừa nhiều lớp nếu chúng cùng namespace",
              "Có; nhưng tối đa hai lớp cơ sở",
              "Không; C# không hỗ trợ kế thừa lớp nào"
            ],
            explain: "C# không hỗ trợ đa kế thừa lớp. Một lớp có tối đa một lớp cơ sở trực tiếp, nhưng có thể thực thi nhiều interface để có nhiều hợp đồng. Nếu không khai báo lớp cơ sở, lớp vẫn kế thừa object."
          });
        }
        return build(rng, {
          templateId: "c4-single-inheritance", ch: 4, difficulty: "easy", source: SRC[4],
          title: "Trong C#, lớp " + p[1] + " có thể kế thừa trực tiếp tối đa bao nhiêu lớp?",
          options: [
            "Tối đa một lớp cơ sở trực tiếp",
            "Hai lớp",
            "Nhiều lớp tùy ý",
            "Không lớp nào"
          ],
          explain: "C# cho phép tối đa một lớp cơ sở trực tiếp. Nếu không khai báo lớp cơ sở, lớp vẫn kế thừa object; một lớp có thể thực thi nhiều interface."
        });
      },
      function (rng) {
        var data = [
          { base: "A", derived: "B", value: 5 },
          { base: "Cha", derived: "Con", value: 10 },
          { base: "LopCoSo", derived: "LopDanXuat", value: 7 }
        ];
        var d = pick(rng, data);
        var code = "class " + d.base + " {\n" +
          "    public " + d.base + "(int x) { }\n" +
          "}\n" +
          "class " + d.derived + " : " + d.base + " {\n" +
          "    public " + d.derived + "() { }\n" +
          "}";
        var mode = pick(rng, ["error", "fix"]);
        if (mode === "fix") {
          return build(rng, {
            templateId: "c4-derived-ctor-required", ch: 4, difficulty: "hard", source: SRC[4],
            title: "Cách sửa nào giúp đoạn code trên biên dịch được?",
            code: code,
            options: [
              "Thêm : base(" + d.value + ") vào sau danh sách tham số của constructor " + d.derived,
              "Thêm từ khóa new vào trước constructor " + d.derived,
              "Đổi constructor " + d.base + "(int) thành private",
              "Thêm từ khóa static vào lớp " + d.derived
            ],
            explain: "Constructor " + d.derived + "() phải gọi constructor " + d.base + "(int) bằng cú pháp : base(" + d.value + "). Thêm new/static hoặc đổi private không giải quyết yêu cầu khởi tạo lớp cơ sở."
          });
        }
        return build(rng, {
          templateId: "c4-derived-ctor-required", ch: 4, difficulty: "hard", source: SRC[4],
          title: "Đoạn code trên có vấn đề gì?",
          code: code,
          options: [
            "Lỗi biên dịch vì " + d.derived + " không gọi constructor " + d.base + "(int) qua base",
            "Chạy bình thường và tạo đối tượng thành công",
            "Lỗi vì " + d.base + " không có constructor nào",
            "Lỗi vì " + d.derived + " không được phép kế thừa " + d.base
          ],
          explain: "Lớp cơ sở chỉ có constructor " + d.base + "(int), không có constructor không tham số. Constructor " + d.derived + "() ngầm gọi base() nên không tìm thấy constructor phù hợp — lỗi biên dịch. Cần viết : base(" + d.value + ") hoặc constructor phù hợp."
        });
      },
      function (rng) {
        var data = [
          { base: "A", derived: "B", value: 5 },
          { base: "Cha", derived: "Con", value: 10 },
          { base: "LopCoSo", derived: "LopDanXuat", value: 7 }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.base + " {\n" +
          "    protected int x = " + d.value + ";\n" +
          "}\n" +
          "class " + d.derived + " : " + d.base + " {\n" +
          "    public int Lay() { return x; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        Console.WriteLine(new " + d.derived + "().Lay());\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c4-protected-output", ch: 4, difficulty: "medium", source: SRC[4],
          title: "Lớp dẫn xuất truy cập trường protected: kết quả in ra là gì?",
          code: code,
          options: numOptions(d.value, [0, d.value + 1, d.value - 1]),
          explain: "Trường x là protected nên lớp dẫn xuất " + d.derived + " truy cập được trực tiếp. Giá trị ban đầu là " + d.value + ", nên Lay() trả về và in ra " + d.value + "."
        });
      },
      function (rng) {
        var data = [
          { base: "DongVat", derived: "Cho", baseMethod: "An", derivedMethod: "Sua", text: "Gau" },
          { base: "NhanVien", derived: "KeToan", baseMethod: "LamViec", derivedMethod: "TinhLuong", text: "1000" },
          { base: "Hinh", derived: "HinhTron", baseMethod: "In", derivedMethod: "DienTich", text: "12.5" }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.base + " {\n" +
          "    public void " + d.baseMethod + "() { Console.Write(\"co so \"); }\n" +
          "}\n" +
          "class " + d.derived + " : " + d.base + " {\n" +
          "    public void " + d.derivedMethod + "() { Console.Write(\"" + d.text + "\"); }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.base + " b = new " + d.derived + "();\n" +
          "        " + d.derived + " c = (" + d.derived + ")b;\n" +
          "        c." + d.derivedMethod + "();\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c4-cast", ch: 4, difficulty: "hard", source: SRC[4],
          title: "Kết quả in ra sau khi ép kiểu lớp cơ sở về lớp dẫn xuất là gì?",
          code: code,
          options: [
            d.text,
            "co so " + d.text,
            "Lỗi biên dịch vì không ép kiểu được",
            "Lỗi chạy vì đối tượng không phải " + d.derived
          ],
          explain: "b thực sự trỏ tới đối tượng " + d.derived + ", nên ép kiểu (" + d.derived + ")b hợp lệ và gọi được phương thức riêng " + d.derivedMethod + "(), in ra " + d.text + "."
        });
      }
    ],
    5: [
      function (rng) {
        var method = pick(rng, ["Keu", "DienTich", "TinhLuong"]);
        var mode = pick(rng, ["keywords", "missing"]);
        if (mode === "missing") {
          return build(rng, {
            templateId: "c5-virtual-override", ch: 5, difficulty: "hard", source: SRC[5],
            title: "Nếu lớp dẫn xuất khai báo `public void " + method + "()` trùng chữ ký với phương thức virtual của lớp cơ sở nhưng thiếu override, điều gì xảy ra?",
            options: [
              "Phương thức mới che khuất phương thức cơ sở; trình biên dịch cảnh báo và đa hình không xảy ra",
              "Phương thức tự động ghi đè và đa hình vẫn hoạt động",
              "Chương trình không bao giờ biên dịch được",
              "Phương thức cơ sở bị xóa khỏi lớp cơ sở"
            ],
            explain: "Thiếu override, phương thức mới chỉ che khuất thành viên cơ sở (C# cảnh báo CS0114). Nó không tham gia điều phối động, nên gọi qua biến lớp cơ sở vẫn chạy phiên bản cơ sở."
          });
        }
        return build(rng, {
          templateId: "c5-virtual-override", ch: 5, difficulty: "easy", source: SRC[5],
          title: "Để lớp dẫn xuất ghi đè phương thức " + method + " của lớp cơ sở trong C#, cần khai báo thế nào?",
          options: [
            "Phương thức cơ sở dùng virtual, phương thức dẫn xuất dùng override",
            "Phương thức cơ sở dùng override, phương thức dẫn xuất dùng virtual",
            "Cả hai phương thức đều dùng new",
            "Cả hai phương thức đều dùng static"
          ],
          explain: "Ghi đè đa hình cần phương thức cơ sở khai báo virtual (hoặc abstract) và phương thức dẫn xuất khai báo override cùng chữ ký."
        });
      },
      function (rng) {
        var data = [
          { base: "DongVat", derived: "Cho", method: "Keu", sound: "Gau gau" },
          { base: "Hinh", derived: "HinhTron", method: "In", sound: "Hinh tron" },
          { base: "NhanVien", derived: "KeToan", method: "In", sound: "Ke toan" }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.base + " {\n" +
          "    public virtual void " + d.method + "() { Console.WriteLine(\"co so\"); }\n" +
          "}\n" +
          "class " + d.derived + " : " + d.base + " {\n" +
          "    public override void " + d.method + "() { Console.WriteLine(\"" + d.sound + "\"); }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.base + " x = new " + d.derived + "();\n" +
          "        x." + d.method + "();\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c5-dispatch-output", ch: 5, difficulty: "medium", source: SRC[5],
          title: "Gọi phương thức virtual qua biến lớp cơ sở: kết quả in ra là gì?",
          code: code,
          options: [
            d.sound,
            "co so",
            "co so " + d.sound,
            "Lỗi biên dịch vì " + d.base + " không có phương thức " + d.method
          ],
          explain: "Phương thức " + d.method + " là virtual và bị override ở " + d.derived + ". Với biến kiểu " + d.base + " trỏ tới đối tượng " + d.derived + ", C# chọn phiên bản override khi chạy, nên in ra “" + d.sound + "”."
        });
      },
      function (rng) {
        var data = [
          { base: "A", derived: "B", method: "In", baseText: "A", derivedText: "B" },
          { base: "Cha", derived: "Con", method: "HienThi", baseText: "Cha", derivedText: "Con" },
          { base: "LopCoSo", derived: "LopDanXuat", method: "In", baseText: "Co so", derivedText: "Dan xuat" }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.base + " {\n" +
          "    public void " + d.method + "() { Console.WriteLine(\"" + d.baseText + "\"); }\n" +
          "}\n" +
          "class " + d.derived + " : " + d.base + " {\n" +
          "    public new void " + d.method + "() { Console.WriteLine(\"" + d.derivedText + "\"); }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.base + " x = new " + d.derived + "();\n" +
          "        x." + d.method + "();\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c5-new-dispatch", ch: 5, difficulty: "hard", source: SRC[5],
          title: "Phương thức bị che khuất bằng new, gọi qua biến lớp cơ sở: kết quả là gì?",
          code: code,
          options: [
            d.baseText,
            d.derivedText,
            d.baseText + d.derivedText,
            "Lỗi biên dịch vì thiếu override"
          ],
          explain: "new chỉ che khuất, không tham gia đa hình. Biến kiểu " + d.base + " gọi phương thức theo kiểu tĩnh của nó, nên chạy phiên bản lớp cơ sở và in ra “" + d.baseText + "”."
        });
      },
      function (rng) {
        var cls = pick(rng, ["Hinh", "DongVat", "NhanVien"]);
        var mode = pick(rng, ["instantiate", "concrete"]);
        if (mode === "concrete") {
          return build(rng, {
            templateId: "c5-abstract-instantiate", ch: 5, difficulty: "easy", source: SRC[5],
            title: "Muốn tạo đối tượng từ abstract class " + cls + ", phải làm gì?",
            options: [
              "Tạo lớp cụ thể dẫn xuất từ " + cls + ", cài đặt các thành viên abstract, rồi new lớp dẫn xuất",
              "new trực tiếp " + cls + " vì abstract class vẫn khởi tạo được",
              "Thêm từ khóa static cho " + cls + " rồi new",
              "Bỏ từ khóa abstract khỏi tên lớp là đủ, không cần cài đặt gì"
            ],
            explain: "Không thể new abstract class. Phải tạo một lớp cụ thể dẫn xuất, cài đặt đầy đủ thành viên abstract, sau đó khởi tạo lớp dẫn xuất đó."
          });
        }
        return build(rng, {
          templateId: "c5-abstract-instantiate", ch: 5, difficulty: "easy", source: SRC[5],
          title: "Điều gì xảy ra khi viết `new " + cls + "()` với " + cls + " là abstract class?",
          options: [
            "Lỗi biên dịch vì không thể tạo đối tượng từ lớp abstract",
            "Tạo được đối tượng nhưng không gọi được phương thức",
            "Tạo được nếu lớp abstract không có constructor",
            "C# tự tạo lớp con và khởi tạo lớp con đó"
          ],
          explain: "Abstract class không thể khởi tạo trực tiếp bằng new. Chỉ có thể tạo đối tượng của lớp cụ thể dẫn xuất và cài đặt đầy đủ thành viên abstract."
        });
      },
      function (rng) {
        var method = pick(rng, ["Keu", "DienTich", "TinhLuong"]);
        var mode = pick(rng, ["syntax", "location"]);
        if (mode === "location") {
          return build(rng, {
            templateId: "c5-abstract-method-syntax", ch: 5, difficulty: "easy", source: SRC[5],
            title: "Trong phạm vi lớp (class), phương thức abstract có thể được khai báo ở đâu?",
            options: [
              "Trong abstract class",
              "Trong bất kỳ class cụ thể nào",
              "Chỉ trong static class",
              "Chỉ trong constructor"
            ],
            explain: "Trong phạm vi lớp, phương thức abstract chỉ được khai báo trong abstract class; lớp cụ thể dẫn xuất phải override và cài đặt nó. (Interface có cơ chế riêng, không xét ở đây.)"
          });
        }
        return build(rng, {
          templateId: "c5-abstract-method-syntax", ch: 5, difficulty: "easy", source: SRC[5],
          title: "Khai báo nào là phương thức abstract hợp lệ trong lớp abstract?",
          options: [
            "public abstract void " + method + "();",
            "public abstract void " + method + "() { }",
            "public virtual abstract void " + method + "();",
            "public void abstract " + method + "();"
          ],
          explain: "Trong phạm vi lớp, phương thức abstract chỉ có chữ ký, không có phần thân, kết thúc bằng dấu chấm phẩy: public abstract void " + method + "();. Nó chỉ được đặt trong abstract class."
        });
      },
      function (rng) {
        var data = [
          { iface: "IKyNang", cls: "Nguoi", method: "Hoc" },
          { iface: "IPayment", cls: "CreditCard", method: "Pay" },
          { iface: "IVe", cls: "HinhTron", method: "TinhDienTich" }
        ];
        var d = pick(rng, data);
        var mode = pick(rng, ["requirement", "missing"]);
        if (mode === "missing") {
          var missingCode = "interface " + d.iface + " {\n" +
            "    void " + d.method + "();\n" +
            "}\n" +
            "class " + d.cls + " : " + d.iface + " {\n" +
            "}";
          return build(rng, {
            templateId: "c5-interface-implement", ch: 5, difficulty: "hard", source: SRC[5],
            title: "Đoạn code trên có vấn đề gì?",
            code: missingCode,
            options: [
              "Lỗi biên dịch vì lớp " + d.cls + " là lớp cụ thể nhưng không cài đặt " + d.method + "()",
              "Chạy bình thường vì interface tự cung cấp cài đặt mặc định cho " + d.method + "()",
              "Chạy bình thường vì lớp abstract được phép bỏ trống mọi thành viên interface",
              "Lỗi biên dịch vì interface " + d.iface + " không được phép khai báo phương thức " + d.method + "()"
            ],
            explain: "Interface " + d.iface + " chỉ khai báo chữ ký " + d.method + "() và không có cài đặt mặc định. Lớp " + d.cls + " là lớp cụ thể (không abstract) nên phải cài đặt " + d.method + "(); thiếu nó là lỗi biên dịch. Nếu muốn trì hoãn, lớp phải được khai báo abstract và khai báo thành viên abstract tương ứng (ví dụ public abstract void " + d.method + "();), hoặc kế thừa một cài đặt hợp lệ — không thể chỉ bỏ trống."
          });
        }
        return build(rng, {
          templateId: "c5-interface-implement", ch: 5, difficulty: "medium", source: SRC[5],
          title: "Lớp " + d.cls + " muốn thực thi interface " + d.iface + " phải khai báo và làm gì?",
          options: [
            "Khai báo class " + d.cls + " : " + d.iface + " và cài đặt đầy đủ các thành viên của " + d.iface,
            "Khai báo class " + d.cls + " : " + d.iface + " và không cần cài đặt gì",
            "Khai báo class " + d.cls + " extends " + d.iface + " và dùng new cho mọi phương thức",
            "Khai báo interface " + d.iface + " : " + d.cls
          ],
          explain: "Lớp thực thi interface bằng dấu “:” và phải cài đặt đầy đủ mọi thành viên mà interface yêu cầu, ví dụ phương thức " + d.method + "."
        });
      },
      function (rng) {
        var iface = pick(rng, ["IKyNang", "IPayment", "IVe"]);
        var mode = pick(rng, ["statement", "allowed"]);
        if (mode === "allowed") {
          return build(rng, {
            templateId: "c5-interface-members", ch: 5, difficulty: "easy", source: SRC[5],
            title: "Trong mô hình C# cổ điển, interface " + iface + " có thể khai báo thành viên nào?",
            options: [
              "Chữ ký phương thức, thuộc tính hoặc sự kiện (không có phần thân)",
              "Trường instance có giá trị khởi tạo",
              "Constructor có tham số",
              "Một đối tượng cụ thể được tạo bằng new"
            ],
            explain: "Interface cổ điển (trước C# 8) chỉ khai báo chữ ký thành viên (phương thức, thuộc tính, sự kiện), không có cài đặt mặc định; nó không có trường instance, constructor instance hay đối tượng cụ thể."
          });
        }
        return build(rng, {
          templateId: "c5-interface-members", ch: 5, difficulty: "medium", source: SRC[5],
          title: "Trong mô hình C# cổ điển (trước C# 8), phát biểu nào đúng về thành viên của interface " + iface + "?",
          options: [
            "Interface cổ điển khai báo chữ ký thành viên; lớp thực thi phải cài đặt chúng (không có cài đặt mặc định)",
            "Interface chứa sẵn phần thân cho mọi phương thức",
            "Interface có thể được khởi tạo trực tiếp bằng new",
            "Interface bắt buộc phải có constructor"
          ],
          explain: "Trong mô hình C# cổ điển (trước C# 8), interface chỉ khai báo chữ ký thành viên và không có cài đặt mặc định; lớp thực thi phải cài đặt chúng. Từ C# 8, interface có thể có default interface method, nhưng không phải mọi thành viên đều có phần thân."
        });
      },
      function (rng) {
        var data = [
          ["IKyNang", "IPayment"],
          ["IVe", "IIn"],
          ["IDoc", "IGhi"]
        ];
        var pair = pick(rng, data);
        var mode = pick(rng, ["possible", "syntax"]);
        if (mode === "syntax") {
          return build(rng, {
            templateId: "c5-multiple-interfaces", ch: 5, difficulty: "easy", source: SRC[5],
            title: "Cú pháp nào khai báo lớp X thực thi cả " + pair[0] + " và " + pair[1] + "?",
            options: [
              "class X : " + pair[0] + ", " + pair[1] + " { }",
              "class X : " + pair[0] + " + " + pair[1] + " { }",
              "class X extends " + pair[0] + ", " + pair[1] + " { }",
              "class X : " + pair[0] + " : " + pair[1] + " { }"
            ],
            explain: "Nhiều interface được liệt kê sau dấu “:”, ngăn cách bằng dấu phẩy: class X : " + pair[0] + ", " + pair[1] + ". Không dùng dấu + hay extends."
          });
        }
        return build(rng, {
          templateId: "c5-multiple-interfaces", ch: 5, difficulty: "easy", source: SRC[5],
          title: "Một lớp C# có thể thực thi cả " + pair[0] + " và " + pair[1] + " không?",
          options: [
            "Có, một lớp có thể thực thi nhiều interface cùng lúc",
            "Không, mỗi lớp chỉ thực thi được đúng một interface",
            "Không, tối đa hai interface nhưng phải cùng namespace",
            "Chỉ khi cả hai interface đều là abstract class"
          ],
          explain: "C# cho phép một lớp thực thi nhiều interface: class X : " + pair[0] + ", " + pair[1] + ". Điều này khác với kế thừa lớp, vốn có tối đa một lớp cơ sở trực tiếp."
        });
      },
      function (rng) {
        var iface = pick(rng, ["IKyNang", "IVe", "IIn"]);
        var mode = pick(rng, ["difference", "choose"]);
        if (mode === "choose") {
          return build(rng, {
            templateId: "c5-interface-vs-abstract", ch: 5, difficulty: "medium", source: SRC[5],
            title: "Cần một lớp tham gia nhiều hợp đồng hành vi khác nhau từ nhiều nguồn, nên chọn cơ chế nào?",
            options: [
              "Interface, vì một lớp có thể thực thi nhiều interface",
              "Abstract class, vì một lớp kế thừa được nhiều abstract class",
              "Static class, vì static class chia sẻ mọi thành viên",
              "Constructor, vì constructor có thể đóng vai trò hợp đồng"
            ],
            explain: "Một lớp có tối đa một lớp cơ sở trực tiếp nhưng có thể thực thi nhiều interface. Vì vậy interface phù hợp để ghép nhiều hợp đồng hành vi."
          });
        }
        return build(rng, {
          templateId: "c5-interface-vs-abstract", ch: 5, difficulty: "medium", source: SRC[5],
          title: "Điểm khác biệt nào giữa interface " + iface + " và abstract class là đúng?",
          options: [
            "Interface không có constructor instance và một lớp có thể thực thi nhiều interface; abstract class có constructor và có tối đa một lớp cơ sở trực tiếp",
            "Interface có constructor còn abstract class thì không",
            "Một lớp chỉ thực thi được một interface nhưng kế thừa được nhiều abstract class",
            "Abstract class không thể chứa phương thức đã cài đặt"
          ],
          explain: "Interface (theo mô hình cổ điển) chủ yếu là hợp đồng chữ ký, không có constructor instance và cho phép thực thi nhiều interface; từ C# 8 interface có thể có cài đặt mặc định. Abstract class có constructor, có thể chứa cả thành viên đã cài đặt, nhưng có tối đa một lớp cơ sở trực tiếp."
        });
      },
      function (rng) {
        var data = [
          { cls: "SinhVien", name: "Lan", prefix: "SV: " },
          { cls: "SanPham", name: "But bi", prefix: "SP: " },
          { cls: "NhanVien", name: "Minh", prefix: "NV: " }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    public string Ten = \"" + d.name + "\";\n" +
          "    public override string ToString() { return \"" + d.prefix + "\" + Ten; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        Console.WriteLine(new " + d.cls + "().ToString());\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c5-object-tostring", ch: 5, difficulty: "medium", source: SRC[5],
          title: "Kết quả in ra khi ghi đè ToString là gì?",
          code: code,
          options: [
            d.prefix + d.name,
            d.name,
            d.cls,
            "System.Object"
          ],
          explain: "ToString() của object là virtual, nên lớp " + d.cls + " ghi đè bằng override. Lời gọi in ra chuỗi do override trả về: “" + d.prefix + d.name + "”."
        });
      },
      function (rng) {
        var method = pick(rng, ["Tinh", "In", "XuLy"]);
        var mode = pick(rng, ["when", "difference"]);
        if (mode === "difference") {
          return build(rng, {
            templateId: "c5-overload", ch: 5, difficulty: "medium", source: SRC[5],
            title: "Điểm khác nhau giữa overload và override trong C# là gì?",
            options: [
              "Overload khác danh sách tham số và chọn khi biên dịch; override cùng chữ ký ở lớp dẫn xuất và chọn khi chạy",
              "Overload chọn khi chạy; override chọn khi biên dịch",
              "Overload bắt buộc dùng virtual; override bắt buộc dùng new",
              "Cả hai chỉ áp dụng cho constructor"
            ],
            explain: "Overload (nạp chồng) dựa trên danh sách tham số và được quyết định khi biên dịch. Override (ghi đè) giữ nguyên chữ ký, nằm ở lớp dẫn xuất và được chọn động khi chạy."
          });
        }
        return build(rng, {
          templateId: "c5-overload", ch: 5, difficulty: "easy", source: SRC[5],
          title: "Nạp chồng phương thức " + method + " trong C# được quyết định khi nào?",
          options: [
            "Khi biên dịch, dựa trên số lượng và kiểu tham số của lời gọi",
            "Khi chạy, dựa trên kiểu thực tế của đối tượng",
            "Chỉ khi phương thức được khai báo virtual",
            "Chỉ khi lớp thực thi interface"
          ],
          explain: "Nạp chồng (overload) là đa hình tĩnh: trình biên dịch chọn phiên bản dựa trên danh sách tham số. Ghi đè (override) mới quyết định khi chạy."
        });
      },
      function (rng) {
        var data = [
          { iface: "IKeu", cls: "Cho", method: "Keu", text: "Gau gau" },
          { iface: "IIn", cls: "HinhTron", method: "In", text: "Hinh tron" },
          { iface: "ITinh", cls: "MayTinh", method: "Tinh", text: "42" }
        ];
        var d = pick(rng, data);
        var code = "using System;\n" +
          "interface " + d.iface + " {\n" +
          "    void " + d.method + "();\n" +
          "}\n" +
          "class " + d.cls + " : " + d.iface + " {\n" +
          "    public void " + d.method + "() { Console.Write(\"" + d.text + "\"); }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.iface + " x = new " + d.cls + "();\n" +
          "        x." + d.method + "();\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c5-interface-dispatch", ch: 5, difficulty: "medium", source: SRC[5],
          title: "Gọi phương thức qua biến interface: kết quả in ra là gì?",
          code: code,
          options: [
            d.text,
            "Lỗi biên dịch vì interface không có phần thân",
            "Lỗi chạy vì không tạo được đối tượng interface",
            d.iface
          ],
          explain: "Biến kiểu interface " + d.iface + " trỏ tới đối tượng " + d.cls + ". Lời gọi " + d.method + "() được chuyển tới cài đặt của " + d.cls + ", in ra “" + d.text + "”."
        });
      }
    ]
  };

  /* ============================================================
     KHO 1.500 CÂU HỎI PHÂN HÓA (500 DỄ + 500 TRUNG BÌNH + 500 KHÓ)
     Gồm 600 câu sinh tham số (40 câu/mức độ/chương) + 900 câu lý thuyết C#
     (300 Dễ + 300 Trung bình + 300 Khó cho Chương 2..5).
     Tất cả 1.500 câu được kiểm tra không trùng lặp (unique signature).
     ============================================================ */
  var DOMAIN_CLASSES = [
    { cls: "SinhVien", noun: "sinh viên", f1: "HoTen", f2: "DiemTB", m1: "XuatThongTin", m2: "XepLoai", numF: "Diem", unit: "điểm" },
    { cls: "HocSinh", noun: "học sinh", f1: "MaHS", f2: "ChieuCao", m1: "HienThi", m2: "TinhBMI", numF: "Tuoi", unit: "tuổi" },
    { cls: "GiangVien", noun: "giảng viên", f1: "MaGV", f2: "HocVi", m1: "InHoSo", m2: "TinhGioDay", numF: "SoNamKN", unit: "năm kinh nghiệm" },
    { cls: "NhanVien", noun: "nhân viên", f1: "MaNV", f2: "PhongBan", m1: "Xuat", m2: "TinhLuong", numF: "NgayCong", unit: "ngày công" },
    { cls: "TaiKhoan", noun: "tài khoản", f1: "SoTK", f2: "ChuTK", m1: "RutTien", m2: "GuiTien", numF: "SoDu", unit: "triệu đồng" },
    { cls: "SanPham", noun: "sản phẩm", f1: "MaSP", f2: "TenSP", m1: "XuatSP", m2: "TinhGiaBan", numF: "GiaGoc", unit: "nghìn đồng" },
    { cls: "Sach", noun: "cuốn sách", f1: "TenSach", f2: "TacGia", m1: "InSach", m2: "KiemTraTon", numF: "SoTrang", unit: "trang" },
    { cls: "HinhChuNhat", noun: "hình chữ nhật", f1: "ChieuDai", f2: "ChieuRong", m1: "TinhChuVi", m2: "TinhDienTich", numF: "Canh", unit: "cm" },
    { cls: "HinhTron", noun: "hình tròn", f1: "TamO", f2: "MauSac", m1: "VeHinh", m2: "DienTich", numF: "BanKinh", unit: "cm" },
    { cls: "PhuongTien", noun: "phương tiện", f1: "BienSo", f2: "HangSX", m1: "KhoiDong", m2: "TangToc", numF: "TocDo", unit: "km/h" },
    { cls: "HoaDon", noun: "hóa đơn", f1: "MaHD", f2: "NgayLap", m1: "InHoaDon", m2: "TongThanhToan", numF: "SoMatHang", unit: "mặt hàng" },
    { cls: "KhachHang", noun: "khách hàng", f1: "MaKH", f2: "DiaChi", m1: "CapNhat", m2: "TinhDiemThuong", numF: "DiemTichLuy", unit: "điểm" },
    { cls: "DonHang", noun: "đơn hàng", f1: "MaDon", f2: "NguoiNhan", m1: "XacNhan", m2: "TinhPhiShip", numF: "KhoiLuong", unit: "kg" },
    { cls: "PhongKhachSan", noun: "phòng khách sạn", f1: "MaPhong", f2: "LoaiPhong", m1: "DatPhong", m2: "TinhTienThue", numF: "SoNgayThue", unit: "ngày" },
    { cls: "DoanhNghiep", noun: "doanh nghiệp", f1: "TenDN", f2: "MaSoThue", m1: "XuatTT", m2: "KiemTraMST", numF: "SoNhanSu", unit: "người" },
    { cls: "MonHoc", noun: "môn học", f1: "MaMH", f2: "TenMH", m1: "MoLop", m2: "TinhHocPhi", numF: "SoTinChi", unit: "tín chỉ" },
    { cls: "ThietBi", noun: "thiết bị", f1: "MaTB", f2: "NuocSX", m1: "BatMay", m2: "KiemTraBH", numF: "CongSuat", unit: "W" },
    { cls: "VeMayBay", noun: "vé máy bay", f1: "MaVe", f2: "ChangBay", m1: "InVe", m2: "TinhGiaVe", numF: "HanhLy", unit: "kg" },
    { cls: "BenhNhan", noun: "bệnh nhân", f1: "MaBN", f2: "ChanDoan", m1: "NhapVien", m2: "TinhVienPhi", numF: "SoNgayNam", unit: "ngày" },
    { cls: "DuAn", noun: "dự án", f1: "MaDA", f2: "TenDA", m1: "BaoCao", m2: "TinhKinhPhi", numF: "ThoiHan", unit: "tháng" }
  ];

  var INHERIT_PAIRS = [
    { base: "DongVat", sub1: "Cho", sub2: "Meo", m: "Keu", s1: "Gau gau", s2: "Meo meo", f: "tuoi" },
    { base: "NhanVien", sub1: "NVVanPhong", sub2: "NVSanXuat", m: "LamViec", s1: "Soan ho so", s2: "Van hanh may", f: "luongCB" },
    { base: "HinhHoc", sub1: "HinhTron", sub2: "HinhVuong", m: "Ve", s1: "Ve duong tron", s2: "Ve 4 canh", f: "mauSac" },
    { base: "PhuongTien", sub1: "XeHoi", sub2: "XeTai", m: "DiChuyen", s1: "Chay cao toc", s2: "Cho hang nang", f: "tocDo" },
    { base: "TaiKhoan", sub1: "TKTietKiem", sub2: "TKThanhToan", m: "TinhPhi", s1: "Mien phi duy tri", s2: "Thu phi hang thang", f: "soDu" },
    { base: "SanPham", sub1: "HangDienTu", sub2: "HangThucPham", m: "BaoQuan", s1: "Chong am", s2: "Giu lanh", f: "giaGoc" },
    { base: "AnPham", sub1: "SachIn", sub2: "TapChiDienTu", m: "PhatHanh", s1: "In tai nha in", s2: "Dang len web", f: "namXB" },
    { base: "ConNguoi", sub1: "SinhVien", sub2: "GiangVien", m: "HoatDong", s1: "Di hoc", s2: "Giang day", f: "hoTen" },
    { base: "ThietBiDien", sub1: "MayQuat", sub2: "DieuHoa", m: "VanHanh", s1: "Quay canh quat", s2: "Lam lanh phong", f: "congSuat" },
    { base: "PhongThue", sub1: "PhongStandard", sub2: "PhongVIP", m: "PhucVu", s1: "Don phong co ban", s2: "Phuc vu cao cap", f: "donGia" }
  ];

  var IFACE_LIST = [
    { iface: "ISpeak", m: "Speak", ret: "void" },
    { iface: "IPrintable", m: "Print", ret: "void" },
    { iface: "ICalculable", m: "Calculate", ret: "double" },
    { iface: "ISearchable", m: "Match", ret: "bool" },
    { iface: "IExportable", m: "Export", ret: "string" },
    { iface: "IDevice", m: "TurnOn", ret: "void" },
    { iface: "IPayment", m: "Pay", ret: "bool" },
    { iface: "ISortable", m: "CompareRank", ret: "int" },
    { iface: "ILoggable", m: "WriteLog", ret: "string" },
    { iface: "IValidatable", m: "IsValid", ret: "bool" }
  ];

  function generateChapterEasy(ch, idx, rng) {
    var d = DOMAIN_CLASSES[idx % DOMAIN_CLASSES.length];
    var p = INHERIT_PAIRS[idx % INHERIT_PAIRS.length];
    var f = IFACE_LIST[idx % IFACE_LIST.length];
    var variant = Math.floor(idx / 20); // 0 or 1

    if (ch === 1) {
      if (idx < 20) {
        return build(rng, {
          templateId: "c1-easy-state-" + idx, ch: 1, difficulty: "easy", source: SRC[1],
          title: "Khi mô hình hóa " + d.noun + " thành lớp `" + d.cls + "`, hai thông tin `" + d.f1 + "` và `" + d.f2 + "` biểu diễn yếu tố nào của đối tượng?",
          options: [
            "Trạng thái (state) được thể hiện qua các thuộc tính của đối tượng " + d.cls,
            "Hành vi (behavior) được thể hiện qua các phương thức của đối tượng " + d.cls,
            "Trình biên dịch (compiler) dùng để dịch lớp " + d.cls + " sang mã máy",
            "Cấu trúc kế thừa đa cấp của lớp " + d.cls
          ],
          explain: "Theo Chương 1 (Trạng thái và Hành vi), thông tin như " + d.f1 + ", " + d.f2 + " biểu diễn trạng thái (thuộc tính) của đối tượng " + d.cls + "; còn các thao tác xử lý mới là hành vi (phương thức)."
        });
      }
      return build(rng, {
        templateId: "c1-easy-behavior-" + idx, ch: 1, difficulty: "easy", source: SRC[1],
        title: "Trong lớp `" + d.cls + "` (quản lý " + d.noun + "), các thao tác `" + d.m1 + "()` và `" + d.m2 + "()` đại diện cho khái niệm nào trong OOP?",
        options: [
          "Hành vi (behavior) của đối tượng, được cài đặt bằng các phương thức (methods)",
          "Trạng thái tĩnh không bao giờ thay đổi của đối tượng",
          "Ngôn ngữ máy nhị phân gồm các bit 0 và 1",
          "Biểu đồ Use Case trong giai đoạn lập kế hoạch"
        ],
        explain: "Các thao tác mà đối tượng " + d.cls + " thực hiện để đáp trả thông điệp từ bên ngoài (" + d.m1 + ", " + d.m2 + ") chính là hành vi của đối tượng, được biểu diễn bằng phương thức."
      });
    }

    if (ch === 2) {
      if (idx < 20) {
        return build(rng, {
          templateId: "c2-easy-new-" + idx, ch: 2, difficulty: "easy", source: SRC[2],
          title: "Để khai báo biến đối tượng `x` và khởi tạo một thể hiện mới của lớp `" + d.cls + "` bằng constructor không tham số, câu lệnh nào đúng?",
          options: [
            d.cls + " x = new " + d.cls + "();",
            "class " + d.cls + " x = new " + d.cls + "();",
            d.cls + " x = " + d.cls + "();",
            "new " + d.cls + " x = new();"
          ],
          explain: "Cú pháp tạo đối tượng trong C# (Chương 2 - LO2) là: <TênLớp> <TênBiến> = new <TênLớp>(DanhSáchĐốiSố);."
        });
      }
      return build(rng, {
        templateId: "c2-easy-dtor-" + idx, ch: 2, difficulty: "easy", source: SRC[2],
        title: "Phương thức hủy (destructor) của lớp `" + d.cls + "` trong C# được khai báo với cú pháp nào?",
        options: [
          "~" + d.cls + "() { }",
          "public void ~" + d.cls + "() { }",
          "~" + d.cls + "(int x) { }",
          "private ~" + d.cls + "() { }"
        ],
        explain: "Theo Chương 2 (LO4), phương thức hủy trùng tên lớp, có dấu ngã `~` phía trước, không có kiểu trả về, không có phạm vi truy cập và không nhận tham số."
      });
    }

    if (ch === 3) {
      if (idx < 20) {
        return build(rng, {
          templateId: "c3-easy-encap-" + idx, ch: 3, difficulty: "easy", source: SRC[3],
          title: "Trong lớp `" + d.cls + "`, để ẩn trường `_" + d.numF.toLowerCase() + "` không cho bất kỳ lớp nào khác (kể cả lớp con) truy cập trực tiếp, ta dùng từ khóa phạm vi nào?",
          options: [
            "private",
            "public",
            "protected",
            "internal"
          ],
          explain: "Theo Chương 3 (LO1), chỉ thị `private` giới hạn phạm vi truy cập chỉ bên trong chính lớp `" + d.cls + "`, giúp che giấu dữ liệu nội tại."
        });
      }
      return build(rng, {
        templateId: "c3-easy-static-" + idx, ch: 3, difficulty: "easy", source: SRC[3],
        title: "Nếu lớp `" + d.cls + "` có phương thức tĩnh `public static void ThongKe()`, cách gọi nào từ hàm `Main` của lớp `Program` là đúng?",
        options: [
          d.cls + ".ThongKe();",
          "new " + d.cls + "().ThongKe();",
          "this.ThongKe();",
          "base.ThongKe();"
        ],
        explain: "Theo Chương 3 (LO3), thành viên tĩnh (`static`) thuộc về lớp chứ không thuộc về từng đối tượng, nên phải được gọi thông qua tên lớp: `" + d.cls + ".ThongKe();`."
      });
    }

    if (ch === 4) {
      var subName = variant === 0 ? d.cls + "NoiTru" : d.cls + "CaoCap";
      if (idx < 20) {
        return build(rng, {
          templateId: "c4-easy-inherit-" + idx, ch: 4, difficulty: "easy", source: SRC[4],
          title: "Cú pháp C# nào định nghĩa lớp dẫn xuất `" + subName + "` kế thừa từ lớp cơ sở `" + d.cls + "`?",
          options: [
            "class " + subName + " : " + d.cls + " { }",
            "class " + d.cls + " : " + subName + " { }",
            "class " + subName + " extends " + d.cls + " { }",
            "class " + subName + " inherits " + d.cls + " { }"
          ],
          explain: "Theo Chương 4 (LO1), cú pháp kế thừa trong C# là `class <TênLớpCon> : <TênLớpCơSở> { }`."
        });
      }
      return build(rng, {
        templateId: "c4-easy-scope-" + idx, ch: 4, difficulty: "easy", source: SRC[4],
        title: "Khi lớp `" + subName + "` kế thừa lớp `" + d.cls + "`, thành phần nào của `" + d.cls + "` KHÔNG được kế thừa xuống `" + subName + "`?",
        options: [
          "Các trường private, phương thức khởi tạo (constructor) và phương thức hủy (destructor)",
          "Các phương thức có phạm vi truy cập public",
          "Các thuộc tính và trường có phạm vi truy cập protected",
          "Các phương thức virtual có phạm vi public"
        ],
        explain: "Theo Chương 4 (LO1), lớp dẫn xuất không kế thừa các thành viên private, phương thức khởi tạo và phương thức hủy của lớp cơ sở."
      });
    }

    // ch === 5
    if (idx < 20) {
      return build(rng, {
        templateId: "c5-easy-abstract-" + idx, ch: 5, difficulty: "easy", source: SRC[5],
        title: "Trong lớp trừu tượng `abstract class " + d.cls + "`, khai báo phương thức thuần ảo `" + d.m2 + "()` trả về kiểu `double` nào sau đây là đúng cú pháp?",
        options: [
          "public abstract double " + d.m2 + "();",
          "public abstract double " + d.m2 + "() { return 0; }",
          "private abstract double " + d.m2 + "();",
          "public virtual abstract double " + d.m2 + "();"
        ],
        explain: "Theo Chương 5 (LO2), phương thức thuần ảo (`abstract`) trong lớp trừu tượng không có phần thân hàm `{ ... }`, kết thúc bằng dấu `;` và không được là `private`."
      });
    }
    return build(rng, {
      templateId: "c5-easy-iface-" + idx, ch: 5, difficulty: "easy", source: SRC[5],
      title: "Khi lớp `" + d.cls + "` thực thi giao diện `" + f.iface + "` có phương thức `" + f.ret + " " + f.m + "()`, phát biểu nào sau đây đúng?",
      options: [
        "Lớp " + d.cls + " phải định nghĩa phương thức public " + f.ret + " " + f.m + "() có phần thân cụ thể (không cần từ khóa override)",
        "Lớp " + d.cls + " bắt buộc phải dùng từ khóa override khi cài đặt " + f.m + "()",
        "Giao diện " + f.iface + " có thể được khởi tạo trực tiếp bằng lệnh new " + f.iface + "()",
        "Giao diện " + f.iface + " được phép khai báo các trường biến instance private"
      ],
      explain: "Theo Chương 5 (LO3 & LO4), khi thực thi interface, lớp cụ thể phải cài đặt các phương thức của interface với phạm vi `public` và không cần dùng từ khóa `override`."
    });
  }

  function generateChapterMedium(ch, idx, rng) {
    var d = DOMAIN_CLASSES[idx % DOMAIN_CLASSES.length];
    var p = INHERIT_PAIRS[idx % INHERIT_PAIRS.length];
    var f = IFACE_LIST[idx % IFACE_LIST.length];
    var v1 = 10 + idx * 2;
    var v2 = 5 + (idx % 7) * 3;

    if (ch === 1) {
      if (idx < 20) {
        var code1 = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    public int " + d.numF + " = " + v1 + ";\n" +
          "    public void CapNhat(int m) { " + d.numF + " = m; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " x = new " + d.cls + "();\n" +
          "        x.CapNhat(" + v2 + ");\n" +
          "        Console.WriteLine(x." + d.numF + ");\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c1-med-msg-" + idx, ch: 1, difficulty: "medium", source: SRC[1],
          title: "Khi gửi thông điệp `CapNhat(" + v2 + ")` tới đối tượng `x` của lớp `" + d.cls + "`, trạng thái `" + d.numF + "` in ra màn hình là bao nhiêu?",
          code: code1,
          options: numOptions(v2, [v1, v1 + v2, 0]),
          explain: "Đối tượng `x` ban đầu có `" + d.numF + " = " + v1 + "`. Lời gọi phương thức `x.CapNhat(" + v2 + ")` làm thay đổi trạng thái của `x` thành `" + v2 + "`."
        });
      }
      return build(rng, {
        templateId: "c1-med-view-" + idx, ch: 1, difficulty: "medium", source: SRC[1],
        title: "Khi xây dựng lớp `" + d.cls + "` cho bài toán quản lý " + d.noun + ", việc chỉ giữ lại `" + d.f1 + "`, `" + d.f2 + "` và lược bỏ các chi tiết không liên quan thể hiện nguyên lý nào?",
        options: [
          "Trừu tượng hóa (Abstraction) — chọn lọc các đặc trưng cốt lõi phù hợp với góc nhìn của bài toán",
          "Đa kế thừa (Multiple Inheritance) — gộp nhiều lớp cha thành một lớp con",
          "Nạp chồng toán tử (Operator Overloading) — định nghĩa lại phép toán",
          "Biên dịch tĩnh (Static Compilation) — dịch toàn bộ mã nguồn sang mã máy"
        ],
        explain: "Theo Chương 1 (LO3 - Trừu tượng hóa), trừu tượng hóa là quá trình loại bỏ các thông tin chi tiết vụn vặt và giữ lại những đặc điểm cốt lõi phụ thuộc vào góc nhìn/ngữ cảnh bài toán."
      });
    }

    if (ch === 2) {
      if (idx < 20) {
        var sum = v1 + v2;
        var code2 = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    public int " + d.numF + ";\n" +
          "    public " + d.cls + "() { " + d.numF + " = " + v1 + "; }\n" +
          "    public " + d.cls + "(int v) { " + d.numF + " = v; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " a = new " + d.cls + "();\n" +
          "        " + d.cls + " b = new " + d.cls + "(" + v2 + ");\n" +
          "        Console.WriteLine(a." + d.numF + " + b." + d.numF + ");\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c2-med-ctor-" + idx, ch: 2, difficulty: "medium", source: SRC[2],
          title: "Đoạn chương trình sử dụng nạp chồng constructor trong lớp `" + d.cls + "` dưới đây in ra kết quả nào?",
          code: code2,
          options: numOptions(sum, [v1 * 2, v2 * 2, v1]),
          explain: "`a` gọi constructor không đối số nên `a." + d.numF + " = " + v1 + "`; `b` gọi constructor 1 đối số nên `b." + d.numF + " = " + v2 + "`. Tổng in ra là " + v1 + " + " + v2 + " = " + sum + "."
        });
      }
      var res2 = v1 * 2;
      var code2b = "using System;\n" +
        "class " + d.cls + " {\n" +
        "    public int " + d.numF + ";\n" +
        "    public int GapDoi() { return " + d.numF + " * 2; }\n" +
        "}\n" +
        "class Program {\n" +
        "    static void Main() {\n" +
        "        " + d.cls + " item = new " + d.cls + "();\n" +
        "        item." + d.numF + " = " + v1 + ";\n" +
        "        Console.WriteLine(item.GapDoi());\n" +
        "    }\n" +
        "}";
      return build(rng, {
        templateId: "c2-med-method-" + idx, ch: 2, difficulty: "medium", source: SRC[2],
        title: "Khi gọi phương thức `item.GapDoi()` của đối tượng `" + d.cls + "`, giá trị in ra màn hình là gì?",
        code: code2b,
        options: numOptions(res2, [v1, v1 + 2, 0]),
        explain: "Thuộc tính `" + d.numF + "` được gán bằng " + v1 + ", phương thức `GapDoi()` trả về `" + d.numF + " * 2` = " + res2 + "."
      });
    }

    if (ch === 3) {
      if (idx < 20) {
        var code3 = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    private int _" + d.numF.toLowerCase() + ";\n" +
          "    public int " + d.numF + " {\n" +
          "        get { return _" + d.numF.toLowerCase() + "; }\n" +
          "        set { _" + d.numF.toLowerCase() + " = value + " + (idx + 1) + "; }\n" +
          "    }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " x = new " + d.cls + "();\n" +
          "        x." + d.numF + " = " + v1 + ";\n" +
          "        Console.WriteLine(x." + d.numF + ");\n" +
          "    }\n" +
          "}";
        var ans3 = v1 + (idx + 1);
        return build(rng, {
          templateId: "c3-med-prop-" + idx, ch: 3, difficulty: "medium", source: SRC[3],
          title: "Khi gán `x." + d.numF + " = " + v1 + "` qua property có biến đổi `value`, kết quả in ra là bao nhiêu?",
          code: code3,
          options: numOptions(ans3, [v1, idx + 1, v1 - (idx + 1)]),
          explain: "Trong khối `set`, từ khóa `value` nhận giá trị " + v1 + ", nên trường `_" + d.numF.toLowerCase() + "` được gán bằng " + v1 + " + " + (idx + 1) + " = " + ans3 + "."
        });
      }
      var step = (idx % 5) + 2;
      var code3b = "using System;\n" +
        "class " + d.cls + " {\n" +
        "    public void TangThem(int x, ref int y) {\n" +
        "        x = x + " + step + ";\n" +
        "        y = y + " + step + ";\n" +
        "    }\n" +
        "}\n" +
        "class Program {\n" +
        "    static void Main() {\n" +
        "        int a = " + v1 + ", b = " + v2 + ";\n" +
        "        new " + d.cls + "().TangThem(a, ref b);\n" +
        "        Console.WriteLine(a + \"-\" + b);\n" +
        "    }\n" +
        "}";
      return build(rng, {
        templateId: "c3-med-refval-" + idx, ch: 3, difficulty: "medium", source: SRC[3],
        title: "So sánh truyền tham trị (`a`) và truyền tham chiếu (`ref b`) trong lớp `" + d.cls + "`: kết quả in ra là gì?",
        code: code3b,
        options: [
          v1 + "-" + (v2 + step),
          (v1 + step) + "-" + (v2 + step),
          v1 + "-" + v2,
          (v1 + step) + "-" + v2
        ],
        explain: "`a` truyền theo tham trị nên không đổi sau lời gọi (vẫn là " + v1 + "); `b` truyền với từ khóa `ref` nên tăng thêm " + step + " thành " + (v2 + step) + "."
      });
    }

    if (ch === 4) {
      var sub4 = d.cls + "uuTien";
      if (idx < 20) {
        var code4 = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    protected int muc = " + v1 + ";\n" +
          "}\n" +
          "class " + sub4 + " : " + d.cls + " {\n" +
          "    public int TinhMuc() { return muc + " + v2 + "; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + sub4 + " x = new " + sub4 + "();\n" +
          "        Console.WriteLine(x.TinhMuc());\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c4-med-prot-" + idx, ch: 4, difficulty: "medium", source: SRC[4],
          title: "Lớp dẫn xuất `" + sub4 + "` kế thừa trường `protected int muc` từ lớp `" + d.cls + "`: kết quả in ra là gì?",
          code: code4,
          options: numOptions(v1 + v2, [v1, v2, v1 - v2]),
          explain: "Trường `protected int muc = " + v1 + "` được kế thừa xuống `" + sub4 + "`, vì vậy `TinhMuc()` trả về " + v1 + " + " + v2 + " = " + (v1 + v2) + "."
        });
      }
      var code4b = "using System;\n" +
        "class " + d.cls + " {\n" +
        "    protected int heSo;\n" +
        "    public " + d.cls + "(int h) { heSo = h; }\n" +
        "}\n" +
        "class " + sub4 + " : " + d.cls + " {\n" +
        "    private int phuCap;\n" +
        "    public " + sub4 + "(int h, int p) : base(h) { phuCap = p; }\n" +
        "    public int Tong() { return heSo * 10 + phuCap; }\n" +
        "}\n" +
        "class Program {\n" +
        "    static void Main() {\n" +
        "        Console.WriteLine(new " + sub4 + "(" + (idx - 15) + ", " + v2 + ").Tong());\n" +
        "    }\n" +
        "}";
      var hVal = idx - 15;
      var ans4b = hVal * 10 + v2;
      return build(rng, {
        templateId: "c4-med-basector-" + idx, ch: 4, difficulty: "medium", source: SRC[4],
        title: "Constructor của `" + sub4 + "` gọi `: base(" + hVal + ")` để khởi tạo lớp cơ sở `" + d.cls + "`: kết quả in ra là gì?",
        code: code4b,
        options: numOptions(ans4b, [hVal + v2, v2 * 10 + hVal, hVal * 10]),
        explain: "`: base(h)` gán `heSo = " + hVal + "`, còn constructor dẫn xuất gán `phuCap = " + v2 + "`. Phương thức `Tong()` trả về " + hVal + " * 10 + " + v2 + " = " + ans4b + "."
      });
    }

    // ch === 5
    if (idx < 20) {
      var code5 = "using System;\n" +
        "abstract class " + d.cls + " {\n" +
        "    public abstract int TinhDiem();\n" +
        "}\n" +
        "class " + d.cls + "LoaiA : " + d.cls + " {\n" +
        "    private int goc = " + v1 + ";\n" +
        "    public override int TinhDiem() { return goc + " + v2 + "; }\n" +
        "}\n" +
        "class Program {\n" +
        "    static void Main() {\n" +
        "        " + d.cls + " item = new " + d.cls + "LoaiA();\n" +
        "        Console.WriteLine(item.TinhDiem());\n" +
        "    }\n" +
        "}";
      return build(rng, {
        templateId: "c5-med-abs-" + idx, ch: 5, difficulty: "medium", source: SRC[5],
        title: "Gọi phương thức thuần ảo đã được `override` thông qua biến tham chiếu lớp trừu tượng `" + d.cls + "`: kết quả in ra là gì?",
        code: code5,
        options: numOptions(v1 + v2, [v1, v2, 0]),
        explain: "Biến `item` kiểu lớp trừu tượng `" + d.cls + "` trỏ tới đối tượng `" + d.cls + "LoaiA`, nên lời gọi `item.TinhDiem()` điều phối động tới bản `override`, trả về " + v1 + " + " + v2 + " = " + (v1 + v2) + "."
      });
    }
    var code5b = "using System;\n" +
      "interface I" + d.cls + " {\n" +
      "    int LayGiaTri();\n" +
      "}\n" +
      "class " + d.cls + " : I" + d.cls + " {\n" +
      "    private int v;\n" +
      "    public " + d.cls + "(int v) { this.v = v; }\n" +
      "    public int LayGiaTri() { return v * 3; }\n" +
      "}\n" +
      "class Program {\n" +
      "    static void Main() {\n" +
      "        I" + d.cls + " refObj = new " + d.cls + "(" + (idx - 10) + ");\n" +
      "        Console.WriteLine(refObj.LayGiaTri());\n" +
      "    }\n" +
      "}";
    var v5 = idx - 10;
    return build(rng, {
      templateId: "c5-med-iface-" + idx, ch: 5, difficulty: "medium", source: SRC[5],
      title: "Gọi phương thức `LayGiaTri()` thông qua biến kiểu giao diện `I" + d.cls + "`: kết quả in ra là bao nhiêu?",
      code: code5b,
      options: numOptions(v5 * 3, [v5, v5 + 3, 0]),
      explain: "Biến giao diện `I" + d.cls + "` tham chiếu đến đối tượng `" + d.cls + "(" + v5 + ")`, nên `refObj.LayGiaTri()` trả về " + v5 + " * 3 = " + (v5 * 3) + "."
    });
  }

  function generateChapterHard(ch, idx, rng) {
    var d = DOMAIN_CLASSES[idx % DOMAIN_CLASSES.length];
    var v1 = 12 + idx * 3;
    var v2 = 4 + (idx % 9) * 2;

    if (ch === 1) {
      if (idx < 20) {
        var code1h = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    public int " + d.numF + " = " + v1 + ";\n" +
          "    public void ChuyenSang(" + d.cls + " dich, int luong) {\n" +
          "        this." + d.numF + " -= luong;\n" +
          "        dich." + d.numF + " += luong;\n" +
          "    }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " x = new " + d.cls + "();\n" +
          "        " + d.cls + " y = new " + d.cls + "();\n" +
          "        x.ChuyenSang(y, " + v2 + ");\n" +
          "        Console.WriteLine(x." + d.numF + " + \"/\" + y." + d.numF + ");\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c1-hard-interact-" + idx, ch: 1, difficulty: "hard", source: SRC[1],
          title: "Hai đối tượng `x` và `y` thuộc lớp `" + d.cls + "` tương tác với nhau qua thông điệp `ChuyenSang`: kết quả in ra là gì?",
          code: code1h,
          options: [
            (v1 - v2) + "/" + (v1 + v2),
            v1 + "/" + v1,
            (v1 + v2) + "/" + (v1 - v2),
            (v1 - v2) + "/" + v1
          ],
          explain: "`x` và `y` có vùng nhớ trạng thái độc lập, khởi đầu đều bằng " + v1 + ". Khi `x.ChuyenSang(y, " + v2 + ")` thực thi, `x." + d.numF + "` giảm còn " + (v1 - v2) + " và `y." + d.numF + "` tăng lên " + (v1 + v2) + "."
        });
      }
      var code1hb = "using System;\n" +
        "class " + d.cls + " {\n" +
        "    public int " + d.numF + ";\n" +
        "    public " + d.cls + "(int v) { " + d.numF + " = v; }\n" +
        "    public int SoSanh(" + d.cls + " khac) { return this." + d.numF + " - khac." + d.numF + "; }\n" +
        "}\n" +
        "class Program {\n" +
        "    static void Main() {\n" +
        "        " + d.cls + " a = new " + d.cls + "(" + v1 + ");\n" +
        "        " + d.cls + " b = new " + d.cls + "(" + v2 + ");\n" +
        "        b." + d.numF + " += " + (idx % 5 + 1) + ";\n" +
        "        Console.WriteLine(a.SoSanh(b));\n" +
        "    }\n" +
        "}";
      var step1 = idx % 5 + 1;
      var ans1hb = v1 - (v2 + step1);
      return build(rng, {
        templateId: "c1-hard-compare-" + idx, ch: 1, difficulty: "hard", source: SRC[1],
        title: "Sau khi trạng thái của đối tượng `b` thuộc lớp `" + d.cls + "` thay đổi theo thời gian, lời gọi `a.SoSanh(b)` in ra kết quả nào?",
        code: code1hb,
        options: numOptions(ans1hb, [v1 - v2, (v2 + step1) - v1, v1 + v2]),
        explain: "Trạng thái của `b` thay đổi từ " + v2 + " thành " + (v2 + step1) + ", còn `a` giữ nguyên " + v1 + ". `a.SoSanh(b)` trả về " + v1 + " - " + (v2 + step1) + " = " + ans1hb + "."
      });
    }

    if (ch === 2) {
      if (idx < 20) {
        var code2h = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    public int " + d.numF + ";\n" +
          "    public " + d.cls + "(int v) { " + d.numF + " = v; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " p = new " + d.cls + "(" + v1 + ");\n" +
          "        " + d.cls + " q = new " + d.cls + "(" + v2 + ");\n" +
          "        p = q;\n" +
          "        p." + d.numF + " += 5;\n" +
          "        Console.WriteLine(q." + d.numF + ");\n" +
          "    }\n" +
          "}";
        return build(rng, {
          templateId: "c2-hard-alias-" + idx, ch: 2, difficulty: "hard", source: SRC[2],
          title: "Sau phép gán tham chiếu `p = q` giữa hai biến đối tượng kiểu `" + d.cls + "`, kết quả `q." + d.numF + "` in ra là bao nhiêu?",
          code: code2h,
          options: numOptions(v2 + 5, [v2, v1 + 5, v1]),
          explain: "Lệnh `p = q;` làm `p` trỏ cùng vào đối tượng của `q` (có giá trị " + v2 + "). Do đó `p." + d.numF + " += 5` cập nhật trực tiếp đối tượng chung đó thành " + (v2 + 5) + "."
        });
      }
      var bonus = (idx % 6) + 2;
      var code2hb = "using System;\n" +
        "class " + d.cls + " {\n" +
        "    public int " + d.numF + ";\n" +
        "    public " + d.cls + "() : this(" + v1 + ") { " + d.numF + " += " + bonus + "; }\n" +
        "    public " + d.cls + "(int v) { " + d.numF + " = v; }\n" +
        "}\n" +
        "class Program {\n" +
        "    static void Main() {\n" +
        "        " + d.cls + " x = new " + d.cls + "();\n" +
        "        Console.WriteLine(x." + d.numF + ");\n" +
        "    }\n" +
        "}";
      return build(rng, {
        templateId: "c2-hard-ctorchain-" + idx, ch: 2, difficulty: "hard", source: SRC[2],
        title: "Khi nạp chồng constructor trong lớp `" + d.cls + "` có sử dụng `: this(" + v1 + ")`, kết quả in ra của `new " + d.cls + "()` là gì?",
        code: code2hb,
        options: numOptions(v1 + bonus, [v1, bonus, 0]),
        explain: "Khi gọi `new " + d.cls + "()`, constructor `" + d.cls + "(int v)` chạy trước thông qua `: this(" + v1 + ")` gán `" + d.numF + " = " + v1 + "`, sau đó thân constructor không tham số cộng thêm " + bonus + " thành " + (v1 + bonus) + "."
      });
    }

    if (ch === 3) {
      if (idx < 20) {
        var minVal = (idx % 5) + 10;
        var invalidVal = minVal - 5;
        var code3h = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    private int _giaTri = " + v1 + ";\n" +
          "    public int GiaTri {\n" +
          "        get { return _giaTri; }\n" +
          "        set { if (value >= " + minVal + ") _giaTri = value; }\n" +
          "    }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + d.cls + " x = new " + d.cls + "();\n" +
          "        x.GiaTri = " + (minVal + 8) + ";\n" +
          "        x.GiaTri = " + invalidVal + ";\n" +
          "        Console.WriteLine(x.GiaTri);\n" +
          "    }\n" +
          "}";
        var expected3h = minVal + 8;
        return build(rng, {
          templateId: "c3-hard-validate-" + idx, ch: 3, difficulty: "hard", source: SRC[3],
          title: "Property `GiaTri` của lớp `" + d.cls + "` có kiểm tra điều kiện hợp lệ trong `set`: kết quả in ra là bao nhiêu?",
          code: code3h,
          options: numOptions(expected3h, [invalidVal, v1, 0]),
          explain: "Lần gán đầu `" + expected3h + " >= " + minVal + "` thỏa điều kiện nên `_giaTri = " + expected3h + "`. Lần gán sau `" + invalidVal + " < " + minVal + "` bị từ chối nên `_giaTri` giữ nguyên giá trị " + expected3h + "."
        });
      }
      var code3hb = "using System;\n" +
        "class " + d.cls + " {\n" +
        "    private int[] data = new int[3] { " + v1 + ", " + v2 + ", " + (v1 + v2) + " };\n" +
        "    public int this[int i] {\n" +
        "        get { return (i >= 0 && i < 3) ? data[i] : -1; }\n" +
        "        set { if (i >= 0 && i < 3) data[i] = value; }\n" +
        "    }\n" +
        "}\n" +
        "class Program {\n" +
        "    static void Main() {\n" +
        "        " + d.cls + " ds = new " + d.cls + "();\n" +
        "        ds[1] = ds[0] + 2;\n" +
        "        Console.WriteLine(ds[1] + \"/\" + ds[5]);\n" +
        "    }\n" +
        "}";
      return build(rng, {
        templateId: "c3-hard-indexer-" + idx, ch: 3, difficulty: "hard", source: SRC[3],
        title: "Sử dụng chỉ mục (indexer) có kiểm tra biên trong lớp `" + d.cls + "`: kết quả in ra màn hình là gì?",
        code: code3hb,
        options: [
          (v1 + 2) + "/-1",
          v2 + "/-1",
          (v1 + 2) + "/0",
          "Lỗi biên dịch vì đối tượng không được dùng dấu []"
        ],
        explain: "`ds[0]` trả về " + v1 + ", nên `ds[1]` được cập nhật thành " + (v1 + 2) + ". Khi đọc `ds[5]`, chỉ số 5 vượt ngoài phạm vi `0..2` nên `get` trả về `-1`."
      });
    }

    if (ch === 4) {
      var child4 = d.cls + "ChuyenBiet";
      if (idx < 20) {
        var code4h = "using System;\n" +
          "class " + d.cls + " {\n" +
          "    protected int diem = " + v1 + ";\n" +
          "    public " + d.cls + "() { diem += 2; }\n" +
          "    public int LayDiem() { return diem; }\n" +
          "}\n" +
          "class " + child4 + " : " + d.cls + " {\n" +
          "    public " + child4 + "() { diem *= 2; }\n" +
          "    public new int LayDiem() { return base.LayDiem() + " + v2 + "; }\n" +
          "}\n" +
          "class Program {\n" +
          "    static void Main() {\n" +
          "        " + child4 + " c = new " + child4 + "();\n" +
          "        Console.WriteLine(c.LayDiem());\n" +
          "    }\n" +
          "}";
        var ans4h = (v1 + 2) * 2 + v2;
        return build(rng, {
          templateId: "c4-hard-order-" + idx, ch: 4, difficulty: "hard", source: SRC[4],
          title: "Kết hợp thứ tự chạy constructor lớp cơ sở/lớp dẫn xuất và lời gọi `base.LayDiem()` trong `" + child4 + "`: kết quả in ra là gì?",
          code: code4h,
          options: numOptions(ans4h, [v1 * 2 + 2 + v2, (v1 + 2) * 2, v1 + 2 + v2]),
          explain: "Constructor `" + d.cls + "()` chạy trước làm `diem = " + v1 + " + 2 = " + (v1 + 2) + "`. Tiếp theo constructor `" + child4 + "()` nhân đôi thành `" + ((v1 + 2) * 2) + "`. Cuối cùng `c.LayDiem()` cộng thêm " + v2 + " ra " + ans4h + "."
        });
      }
      var code4hb = "using System;\n" +
        "class " + d.cls + " {\n" +
        "    public int LayHeSo() { return " + v1 + "; }\n" +
        "}\n" +
        "class " + child4 + " : " + d.cls + " {\n" +
        "    public new int LayHeSo() { return " + v2 + "; }\n" +
        "}\n" +
        "class Program {\n" +
        "    static void Main() {\n" +
        "        " + d.cls + " refBase = new " + child4 + "();\n" +
        "        " + child4 + " refSub = (" + child4 + ")refBase;\n" +
        "        Console.WriteLine(refBase.LayHeSo() + \"-\" + refSub.LayHeSo());\n" +
        "    }\n" +
        "}";
      return build(rng, {
        templateId: "c4-hard-refhide-" + idx, ch: 4, difficulty: "hard", source: SRC[4],
        title: "So sánh lời gọi phương thức bị che khuất bằng `new` qua tham chiếu lớp cơ sở `refBase` và tham chiếu lớp dẫn xuất `refSub`: kết quả in ra là gì?",
        code: code4hb,
        options: [
          v1 + "-" + v2,
          v2 + "-" + v2,
          v1 + "-" + v1,
          v2 + "-" + v1
        ],
        explain: "Vì `LayHeSo()` ở lớp con dùng từ khóa `new` (che khuất chứ không `override`), nên gọi qua biến kiểu lớp cơ sở `refBase` sẽ chạy hàm của `" + d.cls + "` (" + v1 + "), còn sau khi ép kiểu sang `" + child4 + "` thì chạy hàm của lớp con (" + v2 + ")."
      });
    }

    // ch === 5
    var sub5A = d.cls + "HangA";
    var sub5B = d.cls + "HangB";
    if (idx < 20) {
      var code5h = "using System;\n" +
        "class " + d.cls + " {\n" +
        "    public virtual int Tinh() { return " + v1 + "; }\n" +
        "}\n" +
        "class " + sub5A + " : " + d.cls + " {\n" +
        "    public override int Tinh() { return base.Tinh() + " + v2 + "; }\n" +
        "}\n" +
        "class " + sub5B + " : " + d.cls + " {\n" +
        "    public new int Tinh() { return 100; }\n" +
        "}\n" +
        "class Program {\n" +
        "    static void Main() {\n" +
        "        " + d.cls + " x = new " + sub5A + "();\n" +
        "        " + d.cls + " y = new " + sub5B + "();\n" +
        "        Console.WriteLine(x.Tinh() + \"/\" + y.Tinh());\n" +
        "    }\n" +
        "}";
      return build(rng, {
        templateId: "c5-hard-polyvsnew-" + idx, ch: 5, difficulty: "hard", source: SRC[5],
        title: "Trong đoạn chương trình đa hình dưới đây, `x` dùng `override` còn `y` dùng `new` trên phương thức `virtual Tinh()`: kết quả in ra là gì?",
        code: code5h,
        options: [
          (v1 + v2) + "/" + v1,
          (v1 + v2) + "/100",
          v1 + "/" + v1,
          v1 + "/100"
        ],
        explain: "`x` trỏ tới `" + sub5A + "` có `override Tinh()` nên đa hình động trả về `base.Tinh() + " + v2 + "` = " + (v1 + v2) + ". Ngược lại `" + sub5B + "` dùng `new` (che khuất) nên khi gọi qua biến lớp cơ sở `y`, phương thức của `" + d.cls + "` (" + v1 + ") được gọi."
      });
    }
    var code5hb = "using System;\n" +
      "abstract class " + d.cls + " {\n" +
      "    protected int goc = " + v1 + ";\n" +
      "    public abstract int TinhPhi();\n" +
      "}\n" +
      "interface IThuong {\n" +
      "    int TinhThuong();\n" +
      "}\n" +
      "class " + sub5A + " : " + d.cls + ", IThuong {\n" +
      "    public override int TinhPhi() { return goc - " + v2 + "; }\n" +
      "    public int TinhThuong() { return " + (v2 * 2) + "; }\n" +
      "}\n" +
      "class Program {\n" +
      "    static void Main() {\n" +
      "        " + sub5A + " obj = new " + sub5A + "();\n" +
      "        " + d.cls + " a = obj;\n" +
      "        IThuong b = obj;\n" +
      "        Console.WriteLine(a.TinhPhi() + b.TinhThuong());\n" +
      "    }\n" +
      "}";
    var ans5hb = (v1 - v2) + (v2 * 2);
    return build(rng, {
      templateId: "c5-hard-absiface-" + idx, ch: 5, difficulty: "hard", source: SRC[5],
      title: "Lớp `" + sub5A + "` vừa kế thừa lớp trừu tượng `" + d.cls + "` vừa thực thi giao diện `IThuong`: kết quả in ra là bao nhiêu?",
      code: code5hb,
      options: numOptions(ans5hb, [v1 - v2, v1 + v2 * 2, v2 * 2]),
      explain: "`a.TinhPhi()` gọi bản `override` trả về " + v1 + " - " + v2 + " = " + (v1 - v2) + "; `b.TinhThuong()` gọi qua giao diện `IThuong` trả về " + (v2 * 2) + ". Tổng cộng là " + ans5hb + "."
    });
  }

  var DIFF_VI = {
    easy: "Dễ",
    medium: "Trung bình",
    hard: "Khó"
  };

  // Kho 900 câu trắc nghiệm lý thuyết C#: [ch, diffIdx(0:easy,1:medium,2:hard), num, title, o0, o1, o2, o3, ansIdx]
  var THEORY_900 = [
    [2, 0, 1, "Biểu thức new Hop() thực hiện thao tác nào?", "Tạo thể hiện", "Khai báo biến cục bộ", "Gọi phương thức thể hiện", "Gán tham chiếu có sẵn", 0],
    [2, 0, 2, "Constructor The(int m, string ten) có bao nhiêu tham số?", "Có một tham số", "Không có tham số", "Có hai tham số", "Có ba tham số", 2],
    [2, 0, 3, "Tên constructor của một lớp C# tuân theo quy tắc nào?", "Có tên do người viết chọn", "Có dấu ~ trước tên lớp", "Trùng tên biến nhận đối tượng", "Trùng tên lớp", 3],
    [2, 0, 4, "Trong lớp K, đâu là constructor nhận một tham số int?", "~K() { }", "public K() { }", "public void KiemTra() { }", "public K(int n) { }", 3],
    [2, 0, 5, "Vai trò điển hình của constructor là gì?", "Hoàn tất đối tượng", "Cập nhật một giá trị", "Khởi tạo thể hiện", "Đọc một giá trị", 2],
    [2, 0, 6, "Cặp dấu nào dùng trong cú pháp truy cập theo chỉ mục?", "[]", "{}", ";", "()", 0],
    [2, 0, 7, "Trong public int Dem(int n) { return n; }, Dem là phần nào?", "Tên phương thức", "Tham số", "Thân phương thức", "Kiểu trả về", 0],
    [2, 0, 8, "Khai báo public Pin() { } trong lớp Pin minh họa thành phần nào?", "Constructor có tham số", "Phương thức thường", "Constructor ngầm định", "Constructor không tham số viết tường minh", 3],
    [2, 0, 9, "Khai báo public Pin(int cap) { } trong lớp Pin minh họa thành phần nào?", "Constructor ngầm định", "Constructor không tham số viết tường minh", "Constructor có tham số", "Phương thức thường", 2],
    [2, 0, 10, "Với hai biến Hop đã khai báo, câu lệnh a = b; minh họa thao tác nào?", "Gọi phương thức thể hiện", "Gán tham chiếu có sẵn", "Tạo thể hiện", "Khai báo biến cục bộ", 1],
    [2, 0, 11, "Trong biểu thức m.Doc(), vai trò của Doc là gì?", "Tên biến", "Đối số", "Tên lớp", "Tên phương thức", 3],
    [2, 0, 12, "Riêng câu lệnh Hop a; trong thân một phương thức thực hiện thao tác nào?", "Khai báo biến cục bộ", "Tạo thể hiện", "Gọi phương thức thể hiện", "Gán tham chiếu có sẵn", 0],
    [2, 0, 13, "Từ khóa nào đứng ở vị trí kiểu trả về của phương thức không trả giá trị?", "new", "public", "void", "class", 2],
    [2, 0, 14, "Trong public int Dem(int n) { return n; }, int n là phần nào?", "Tham số", "Kiểu trả về", "Tên phương thức", "Thân phương thức", 0],
    [2, 0, 15, "Constructor The(int m) có bao nhiêu tham số?", "Có hai tham số", "Có một tham số", "Có ba tham số", "Không có tham số", 1],
    [2, 0, 16, "Nếu thực hiện riêng hai lần new Mau(), có bao nhiêu thể hiện Mau mới được tạo?", "Ba thể hiện", "Một thể hiện", "Hai thể hiện", "Không tạo thể hiện", 2],
    [2, 0, 17, "Đâu là lời gọi Ghi trên m với đối số 5?", "m.Doc(5)", "m.Ghi(5)", "m.Doc()", "m.Ghi()", 1],
    [2, 0, 18, "Trong public int Dem(int n) { return n; }, int ngay trước Dem là phần nào?", "Thân phương thức", "Tham số", "Kiểu trả về", "Tên phương thức", 2],
    [2, 0, 19, "Nếu thực hiện một lần new Mau(), có bao nhiêu thể hiện Mau mới được tạo?", "Một thể hiện", "Không tạo thể hiện", "Ba thể hiện", "Hai thể hiện", 0],
    [2, 0, 20, "Accessor get của property chạy vào thời điểm nào trong biểu thức đọc p.X?", "Khi tạo thể hiện", "Khi đọc thuộc tính", "Khi GC thực hiện finalization", "Khi gọi rõ tên qua dấu chấm", 1],
    [2, 0, 21, "Constructor The(int m, string ten, bool bat) có bao nhiêu tham số?", "Không có tham số", "Có một tham số", "Có hai tham số", "Có ba tham số", 3],
    [2, 0, 22, "Từ khóa nào có thể đặt đầu khai báo để mở quyền truy cập thành viên?", "void", "public", "class", "new", 1],
    [2, 0, 23, "Trong lớp K, đâu là constructor không tham số?", "public K(int n) { }", "~K() { }", "public void KiemTra() { }", "public K() { }", 3],
    [2, 0, 24, "Trong lệnh Muc m = new Muc(4), vai trò của m là gì?", "Đối số", "Tên phương thức", "Tên lớp", "Tên biến", 3],
    [2, 0, 25, "Một phương thức gán trạng thái mới thường đảm nhận vai trò nào?", "Hoàn tất đối tượng", "Khởi tạo thể hiện", "Cập nhật một giá trị", "Đọc một giá trị", 2],
    [2, 0, 26, "Giữa Mau() và Mau(int n), yếu tố nào phân biệt hai chữ ký?", "Tên tham số", "Tên constructor", "Số lượng tham số", "Kiểu tham số", 2],
    [2, 0, 27, "Finalizer đã khai báo có thể được hệ thống chạy ở thời điểm nào?", "Khi GC thực hiện finalization", "Khi đọc thuộc tính", "Khi tạo thể hiện", "Khi gọi rõ tên qua dấu chấm", 0],
    [2, 0, 28, "Khuôn mô tả trạng thái và hành vi chung của các thể hiện gọi là gì?", "Trường", "Đối tượng", "Lớp", "Phương thức", 2],
    [2, 0, 29, "Một phương thức truy vấn thường đảm nhận vai trò nào?", "Hoàn tất đối tượng", "Khởi tạo thể hiện", "Cập nhật một giá trị", "Đọc một giá trị", 3],
    [2, 0, 30, "Đâu là lời gọi Doc trên m với đối số 5?", "m.Ghi()", "m.Doc(5)", "m.Doc()", "m.Ghi(5)", 1],
    [2, 0, 31, "Thân phương thức thường Doc chạy lúc nào khi mã dùng biểu thức x.Doc()?", "Khi tạo thể hiện", "Khi gọi rõ tên qua dấu chấm", "Khi đọc thuộc tính", "Khi GC thực hiện finalization", 1],
    [2, 0, 32, "Từ khóa nào cho biết phương thức không trả về giá trị?", "void", "bool", "int", "string", 0],
    [2, 0, 33, "Khai báo riêng Mau a; tạo bao nhiêu thể hiện Mau?", "Hai thể hiện", "Không tạo thể hiện", "Ba thể hiện", "Một thể hiện", 1],
    [2, 0, 34, "Đâu là lời gọi Ghi trên m với danh sách đối số rỗng?", "m.Ghi()", "m.Ghi(5)", "m.Doc(5)", "m.Doc()", 0],
    [2, 0, 35, "Đâu là lời gọi Doc trên m với danh sách đối số rỗng?", "m.Doc(5)", "m.Ghi(5)", "m.Doc()", "m.Ghi()", 2],
    [2, 0, 36, "Kiểu trả về nào phù hợp khi kết quả là số nguyên 32 bit có dấu?", "void", "string", "bool", "int", 3],
    [2, 0, 37, "Kiểu trả về nào biểu diễn kết quả đúng hoặc sai?", "bool", "int", "string", "void", 0],
    [2, 0, 38, "Constructor The() có bao nhiêu tham số?", "Có một tham số", "Có hai tham số", "Không có tham số", "Có ba tham số", 2],
    [2, 0, 39, "Từ khóa nào đứng trước tên lớp trong biểu thức tạo thể hiện?", "public", "new", "class", "void", 1],
    [2, 0, 40, "Thân constructor thể hiện chạy ở giai đoạn nào?", "Khi gọi rõ tên qua dấu chấm", "Khi tạo thể hiện", "Khi GC thực hiện finalization", "Khi đọc thuộc tính", 1],
    [2, 0, 41, "Nếu thực hiện riêng ba lần new Mau(), có bao nhiêu thể hiện Mau mới được tạo?", "Hai thể hiện", "Ba thể hiện", "Một thể hiện", "Không tạo thể hiện", 1],
    [2, 0, 42, "Trong lệnh Muc m = new Muc(4), vai trò của Muc là gì?", "Tên lớp", "Tên phương thức", "Tên biến", "Đối số", 0],
    [2, 0, 43, "Cú pháp tên finalizer của lớp C# có đặc điểm gì?", "Trùng tên lớp", "Có dấu ~ trước tên lớp", "Có tên do người viết chọn", "Trùng tên biến nhận đối tượng", 1],
    [2, 0, 44, "Một người hiểu nhầm rằng khai báo Hop h = new Hop() đòi hỏi constructor tên h. Họ đang nhầm tên constructor với gì?", "Trùng tên biến nhận đối tượng", "Có tên do người viết chọn", "Trùng tên lớp", "Có dấu ~ trước tên lớp", 0],
    [2, 0, 45, "Finalizer tham gia vào giai đoạn nào của vòng đời thể hiện?", "Khởi tạo thể hiện", "Đọc một giá trị", "Hoàn tất đối tượng", "Cập nhật một giá trị", 2],
    [2, 0, 46, "Cặp dấu nào bao quanh thân lớp?", ";", "[]", "()", "{}", 3],
    [2, 0, 47, "Giữa Mau(int n) và Mau(string n), phần Mau biểu thị điều gì?", "Số lượng tham số", "Tên constructor", "Kiểu tham số", "Tên tham số", 1],
    [2, 0, 48, "Giữa Mau(int n) và Mau(int m), yếu tố nào thay đổi nhưng không phân biệt được hai chữ ký?", "Số lượng tham số", "Tên constructor", "Kiểu tham số", "Tên tham số", 3],
    [2, 0, 49, "Tên của một phương thức thường như KiemTra được xác định thế nào?", "Trùng tên lớp", "Trùng tên biến nhận đối tượng", "Có dấu ~ trước tên lớp", "Có tên do người viết chọn", 3],
    [2, 0, 50, "Dấu nào kết thúc một khai báo trường đơn giản như int dem?", ";", "{}", "[]", "()", 0],
    [2, 0, 51, "Cặp dấu nào bao quanh danh sách tham số của phương thức?", "{}", "[]", "()", ";", 2],
    [2, 0, 52, "Trong lớp K, đâu là finalizer?", "public void KiemTra() { }", "~K() { }", "public K(int n) { }", "public K() { }", 1],
    [2, 0, 53, "Khai báo public int Doc() { return 1; } trong lớp Pin minh họa thành phần nào?", "Phương thức thường", "Constructor ngầm định", "Constructor có tham số", "Constructor không tham số viết tường minh", 0],
    [2, 0, 54, "Trong lớp K, đâu là phương thức thường có kiểu trả về void?", "public K(int n) { }", "~K() { }", "public void KiemTra() { }", "public K() { }", 2],
    [2, 0, 55, "Lớp thường không khai báo constructor thể hiện sẽ được trình biên dịch cung cấp thành phần nào?", "Constructor không tham số viết tường minh", "Constructor ngầm định", "Phương thức thường", "Constructor có tham số", 1],
    [2, 0, 56, "Từ khóa nào đứng trước tên lớp trong khai báo lớp thường?", "class", "void", "new", "public", 0],
    [2, 0, 57, "Một thể hiện cụ thể được tạo từ một lớp gọi là gì?", "Phương thức", "Trường", "Lớp", "Đối tượng", 3],
    [2, 0, 58, "Trong biểu thức m.Ghi(4), vai trò của 4 là gì?", "Đối số", "Tên phương thức", "Tên biến", "Tên lớp", 0],
    [2, 0, 59, "Kiểu trả về nào biểu diễn một chuỗi văn bản?", "void", "string", "int", "bool", 1],
    [2, 0, 60, "Trong public int Dem(int n) { return n; }, khối { return n; } là phần nào?", "Kiểu trả về", "Tên phương thức", "Tham số", "Thân phương thức", 3],
    [2, 0, 61, "Câu lệnh a.Mo() minh họa thao tác nào?", "Gán tham chiếu có sẵn", "Tạo thể hiện", "Gọi phương thức thể hiện", "Khai báo biến cục bộ", 2],
    [2, 0, 62, "Nhóm lệnh có tên dùng để thực hiện một tác vụ của lớp gọi là gì?", "Lớp", "Đối tượng", "Trường", "Phương thức", 3],
    [2, 0, 63, "Biến khai báo trực tiếp trong thân lớp để lưu dữ liệu gọi là gì?", "Phương thức", "Lớp", "Trường", "Đối tượng", 2],
    [2, 0, 64, "Giữa Mau(int n) và Mau(string n), yếu tố nào phân biệt hai chữ ký?", "Tên constructor", "Số lượng tham số", "Tên tham số", "Kiểu tham số", 3],
    [3, 0, 65, "Theo quy ước tên trong bài giảng, tên nào thích hợp để truy vấn trạng thái bool đang mở?", "SetMuc(int muc)", "Dong()", "GetMuc()", "IsMo()", 3],
    [3, 0, 66, "Một trường thể hiện không tĩnh có quan hệ thế nào với các đối tượng của lớp?", "Thuộc riêng từng thể hiện", "Do người gọi truyền vào", "Thuộc phạm vi thân phương thức", "Thuộc kiểu và dùng chung", 0],
    [3, 0, 67, "Chỉ thị nào xét assembly mà không xét quan hệ dẫn xuất?", "private", "internal", "protected internal", "protected", 1],
    [3, 0, 68, "Phần khai báo nào phù hợp cho chỉ mục nhận một khóa chuỗi?", "Doc(int i)", "this[int i]", "this[string key]", "this[int i, int j]", 2],
    [3, 0, 69, "Khi truyền một int theo giá trị bằng cú pháp mặc định, trước đối số có gì?", "Không có từ khóa ở đối số", "ref", "out", "this", 0],
    [3, 0, 70, "Trong thân CapNhat(int muc), muc là tên của thành phần nào?", "Tên kiểu", "Tên biến thể hiện", "Tên tham số", "Tên trường hỗ trợ", 2],
    [3, 0, 71, "Xây dựng một lớp từ lớp cơ sở là cơ chế nào?", "Ghi đè", "Kế thừa", "Che khuất", "Đóng gói", 1],
    [3, 0, 72, "Nếu Tong là trường public static của BoDem, cú pháp đọc phù hợp là gì?", "BoDem.DocTong()", "BoDem.Tong", "b.Muc", "b.Tang()", 1],
    [3, 0, 73, "Nếu DocTong là phương thức public static của BoDem, gọi nó bằng cú pháp nào?", "BoDem.DocTong()", "BoDem.Tong", "b.Tang()", "b.Muc", 0],
    [3, 0, 74, "Phần khai báo nào phù hợp cho chỉ mục nhận hai số nguyên?", "this[int i]", "this[string key]", "Doc(int i)", "this[int i, int j]", 3],
    [3, 0, 75, "Khai báo new M() để chọn phiên bản riêng theo kiểu tham chiếu là cơ chế nào?", "Đóng gói", "Kế thừa", "Ghi đè", "Che khuất", 3],
    [3, 0, 76, "Một trường static có quan hệ thế nào với các đối tượng của lớp?", "Do người gọi truyền vào", "Thuộc phạm vi thân phương thức", "Thuộc riêng từng thể hiện", "Thuộc kiểu và dùng chung", 3],
    [3, 0, 77, "Trong thân set, từ khóa nào biểu thị giá trị đang được gán?", "set", "get", "this", "value", 3],
    [3, 0, 78, "Trong BoDem.DocTong(), BoDem đứng trước dấu chấm với tư cách gì?", "Tên trường hỗ trợ", "Tên tham số", "Tên kiểu", "Tên biến thể hiện", 2],
    [3, 0, 79, "Trong lệnh m[2] = \"A\", 2 là gì?", "Đối số chỉ mục", "Kiểu phần tử", "Kiểu chỉ số", "Giá trị cần ghi", 0],
    [3, 0, 80, "Cú pháp nào khai báo một lớp trừu tượng?", "interface", "abstract class", "static class", "class", 1],
    [3, 0, 81, "Một setter gán _muc = value thực hiện chức năng gì?", "Truy vấn", "Lưu trữ dữ liệu", "Kiểm tra dữ liệu", "Cập nhật", 3],
    [3, 0, 82, "Accessor nào xử lý thao tác gán giá trị vào property?", "get", "set", "this", "value", 1],
    [3, 0, 83, "Một đối số trong lời gọi CapNhat(7) có nguồn gốc từ đâu?", "Thuộc riêng từng thể hiện", "Thuộc kiểu và dùng chung", "Do người gọi truyền vào", "Thuộc phạm vi thân phương thức", 2],
    [3, 0, 84, "Trong accessor set, value biểu thị gì?", "Giá trị đang gán qua set", "Tham số x", "Một chỉ số int", "Trường x của đối tượng", 0],
    [3, 0, 85, "Chỉ thị nào giới hạn truy cập thành viên theo cùng assembly?", "public", "internal", "private", "protected", 1],
    [3, 0, 86, "Từ khóa namespace tổ chức tên kiểu theo đơn vị nào?", "Lớp", "Thể hiện", "Namespace", "Assembly", 2],
    [3, 0, 87, "Accessor nào trả về giá trị khi đọc property?", "value", "set", "this", "get", 3],
    [3, 0, 88, "Khai báo override M() để thay phiên bản của phương thức ảo là cơ chế nào?", "Kế thừa", "Ghi đè", "Che khuất", "Đóng gói", 1],
    [3, 0, 89, "Trong lệnh m[2] = \"A\", \"A\" là gì?", "Kiểu chỉ số", "Giá trị cần ghi", "Đối số chỉ mục", "Kiểu phần tử", 1],
    [3, 0, 90, "Với ref int và một đối số hợp lệ, quyền của phương thức đối với biến của người gọi là gì?", "Cho phép đọc và ghi biến của người gọi", "Tham chiếu đối tượng hiện tại", "Sao chép giá trị", "Bắt buộc gán tham số đầu ra", 0],
    [3, 0, 91, "Trong void CapNhat(int x), nếu tên trùng với trường, x viết riêng trong thân chỉ đến gì?", "Trường x của đối tượng", "Một chỉ số int", "Tham số x", "Giá trị đang gán qua set", 2],
    [3, 0, 92, "Trong phương thức có tham số muc trùng tên trường, dòng nào lưu đối số vào trường?", "return this.muc", "muc = muc", "this.muc = 0", "this.muc = muc", 3],
    [3, 0, 93, "Điều kiện tối thiểu đối với danh sách tham số chỉ mục là gì?", "Có ít nhất một tham số", "Có thể chỉ có get", "Dùng cú pháp [] khi gọi", "Có thể nạp chồng", 0],
    [3, 0, 94, "public static int Doc() { return 1; } là thành viên loại nào?", "Phương thức thể hiện", "Phương thức tĩnh", "Constructor thể hiện", "Constructor tĩnh", 1],
    [3, 0, 95, "Chỉ thị nào dùng quyền kế thừa mà tự nó không cấp quyền cho lớp ngoài hệ phân cấp trong cùng assembly?", "internal", "protected internal", "protected", "private", 2],
    [3, 0, 96, "Theo quy ước tên trong bài giảng, tên nào thích hợp để cập nhật mức bằng tham số int?", "GetMuc()", "SetMuc(int muc)", "Dong()", "IsMo()", 1],
    [3, 0, 97, "Nhận định nào mô tả khả năng tạo chỉ mục chỉ đọc?", "Dùng cú pháp [] khi gọi", "Có thể chỉ có get", "Có thể nạp chồng", "Có ít nhất một tham số", 1],
    [3, 0, 98, "Giấu dữ liệu và cung cấp cách truy cập có kiểm soát là nguyên lý nào?", "Che khuất", "Kế thừa", "Đóng gói", "Ghi đè", 2],
    [3, 0, 99, "Trong cùng phương thức, dòng nào chỉ tự gán tham số cho chính nó?", "return this.muc", "muc = muc", "this.muc = 0", "this.muc = muc", 1],
    [3, 0, 100, "Nếu Muc là property thể hiện của BoDem, đọc nó trên b bằng cú pháp nào?", "b.Muc", "BoDem.DocTong()", "b.Tang()", "BoDem.Tong", 0],
    [3, 0, 101, "Biểu thức nào gọi phương thức Doc với đối số 2?", "o.Doc(2)", "o.Muc = 2", "o[2]", "o.Muc", 0],
    [3, 0, 102, "Từ khóa nào mở khai báo một kiểu hợp đồng giao diện?", "abstract class", "static class", "class", "interface", 3],
    [3, 0, 103, "Biểu thức nào chỉ đọc property Muc của o?", "o.Doc(2)", "o[2]", "o.Muc = 2", "o.Muc", 3],
    [3, 0, 104, "Phạm vi chứa trực tiếp khai báo trường private trong ví dụ một kiểu đơn giản là gì?", "Namespace", "Lớp", "Assembly", "Thể hiện", 1],
    [3, 0, 105, "Trong khai báo string this[int i], string là gì?", "Kiểu phần tử", "Đối số chỉ mục", "Kiểu chỉ số", "Giá trị cần ghi", 0],
    [3, 0, 106, "Khi một lớp có chỉ mục int và chỉ mục string, nó sử dụng khả năng nào?", "Dùng cú pháp [] khi gọi", "Có thể nạp chồng", "Có thể chỉ có get", "Có ít nhất một tham số", 1],
    [3, 0, 107, "Trong phương thức thể hiện, từ khóa nào chỉ đối tượng hiện tại?", "get", "set", "this", "value", 2],
    [3, 0, 108, "Dòng nào gán hằng số vào trường thể hiện muc?", "this.muc = muc", "return this.muc", "muc = muc", "this.muc = 0", 3],
    [3, 0, 109, "Property public có get và set đều public cho phép thao tác nào từ bên ngoài?", "Đọc và ghi từ bên ngoài", "Đọc từ bên ngoài", "Gọi như một phương thức", "Ghi từ bên ngoài", 0],
    [3, 0, 110, "Cú pháp nào khai báo một lớp tĩnh?", "interface", "class", "static class", "abstract class", 2],
    [3, 0, 111, "Biểu thức nào gán 2 vào property Muc?", "o.Muc = 2", "o.Muc", "o.Doc(2)", "o[2]", 0],
    [3, 0, 112, "Từ khóa nào diễn tả tham số đầu ra mà phương thức phải gán trước khi trở về bình thường?", "out", "ref", "this", "Không có từ khóa ở đối số", 0],
    [3, 0, 113, "Trong property Muc dùng get { return _muc; }, _muc thường là tên của thành phần nào?", "Tên biến thể hiện", "Tên tham số", "Tên kiểu", "Tên trường hỗ trợ", 3],
    [3, 0, 114, "Theo quy ước tên trong bài giảng, tên nào thích hợp để đọc mức hiện tại?", "GetMuc()", "SetMuc(int muc)", "Dong()", "IsMo()", 0],
    [3, 0, 115, "Thành viên có cú pháp int M { get; set; } thuộc loại nào?", "Trường hỗ trợ", "Property", "Phương thức cập nhật", "Phương thức truy vấn", 1],
    [3, 0, 116, "Phương thức SetM(int m) chỉ cập nhật _m đóng vai trò gì?", "Phương thức truy vấn", "Property", "Trường hỗ trợ", "Phương thức cập nhật", 3],
    [3, 0, 117, "Chỉ thị nào giới hạn truy cập thành viên trong chính kiểu khai báo theo các ví dụ cơ bản?", "protected", "public", "internal", "private", 3],
    [3, 0, 118, "Trường private _muc giữ mức hiện tại thực hiện chức năng gì?", "Truy vấn", "Lưu trữ dữ liệu", "Kiểm tra dữ liệu", "Cập nhật", 1],
    [3, 0, 119, "Biểu thức nào đọc phần tử qua chỉ mục của o?", "o.Doc(2)", "o.Muc", "o[2]", "o.Muc = 2", 2],
    [3, 0, 120, "Trong bốn lựa chọn, phần đầu khai báo nào dùng cho lớp thường?", "class", "abstract class", "interface", "static class", 0],
    [3, 0, 121, "Trong lớp Kho, public Kho() { } là thành viên loại nào?", "Constructor tĩnh", "Constructor thể hiện", "Phương thức thể hiện", "Phương thức tĩnh", 1],
    [3, 0, 122, "Khi truyền chính đối tượng đang chạy phương thức thể hiện, dùng biểu thức nào?", "this", "ref", "out", "Không có từ khóa ở đối số", 0],
    [3, 0, 123, "Một getter chỉ trả về _muc thực hiện chức năng gì?", "Kiểm tra dữ liệu", "Cập nhật", "Lưu trữ dữ liệu", "Truy vấn", 3],
    [3, 0, 124, "Chỉ thị nào cho phép truy cập theo điều kiện protected hoặc internal?", "protected", "private", "internal", "protected internal", 3],
    [3, 0, 125, "Trong lớp Kho, static Kho() { } là thành viên loại nào?", "Constructor thể hiện", "Phương thức tĩnh", "Phương thức thể hiện", "Constructor tĩnh", 3],
    [3, 0, 126, "Cấu hình nào mở cả hai thao tác đọc và ghi ra bên ngoài?", "private set", "Chỉ có set", "public get và public set", "Chỉ có get", 2],
    [3, 0, 127, "Trong void CapNhat(int x), this.x dùng để chỉ gì?", "Giá trị đang gán qua set", "Một chỉ số int", "Trường x của đối tượng", "Tham số x", 2],
    [3, 0, 128, "Phương thức GetM() chỉ trả về _m đóng vai trò gì?", "Phương thức truy vấn", "Trường hỗ trợ", "Property", "Phương thức cập nhật", 0],
    [3, 0, 129, "Trong chỉ mục this[int i], i biểu thị gì?", "Một chỉ số int", "Giá trị đang gán qua set", "Tham số x", "Trường x của đối tượng", 0],
    [3, 0, 130, "Từ khóa nào dùng để truyền một biến đã gán theo tham chiếu để phương thức có thể đọc và ghi?", "ref", "out", "this", "Không có từ khóa ở đối số", 0],
    [3, 0, 131, "Phần khai báo nào là đầu của một phương thức có tên riêng và nhận một số nguyên?", "this[string key]", "this[int i]", "Doc(int i)", "this[int i, int j]", 2],
    [3, 0, 132, "Trong b.DocMuc(), nếu b đã giữ một đối tượng BoDem thì b đứng trước dấu chấm với tư cách gì?", "Tên kiểu", "Tên biến thể hiện", "Tên tham số", "Tên trường hỗ trợ", 1],
    [3, 0, 133, "Property public chỉ có get cho phép thao tác nào từ bên ngoài?", "Gọi như một phương thức", "Đọc từ bên ngoài", "Đọc và ghi từ bên ngoài", "Ghi từ bên ngoài", 1],
    [3, 0, 134, "public int Doc() { return 1; } là thành viên loại nào?", "Constructor thể hiện", "Constructor tĩnh", "Phương thức thể hiện", "Phương thức tĩnh", 2],
    [3, 0, 135, "Dấu hiệu cú pháp nào xuất hiện khi bên gọi truy cập chỉ mục?", "Có thể nạp chồng", "Có ít nhất một tham số", "Dùng cú pháp [] khi gọi", "Có thể chỉ có get", 2],
    [3, 0, 136, "Khi truyền int theo tham trị, giá trị được chuyển vào tham số thế nào?", "Bắt buộc gán tham số đầu ra", "Cho phép đọc và ghi biến của người gọi", "Tham chiếu đối tượng hiện tại", "Sao chép giá trị", 3],
    [3, 0, 137, "Cấu hình nào có thao tác gán nhưng không có thao tác đọc?", "Chỉ có set", "private set", "public get và public set", "Chỉ có get", 0],
    [3, 0, 138, "Trường private _m mà các accessor đọc hoặc ghi đóng vai trò gì?", "Phương thức cập nhật", "Trường hỗ trợ", "Phương thức truy vấn", "Property", 1],
    [3, 0, 139, "Property public chỉ có set cho phép thao tác nào từ bên ngoài?", "Đọc từ bên ngoài", "Đọc và ghi từ bên ngoài", "Gọi như một phương thức", "Ghi từ bên ngoài", 3],
    [3, 0, 140, "Chỉ thị nào cho lớp dẫn xuất truy cập thành viên theo quy tắc kế thừa?", "internal", "protected", "public", "private", 1],
    [3, 0, 141, "Tên nào thể hiện hành động đóng trực tiếp theo tên gọi, không theo mẫu truy vấn hoặc cập nhật trong ba lựa chọn còn lại?", "Dong()", "SetMuc(int muc)", "IsMo()", "GetMuc()", 0],
    [3, 0, 142, "Trong biểu thức this.X, this đại diện cho gì?", "Lớp", "Assembly", "Thể hiện", "Namespace", 2],
    [3, 0, 143, "Phương thức khai báo out int có nghĩa vụ gì khi trả về bình thường?", "Cho phép đọc và ghi biến của người gọi", "Tham chiếu đối tượng hiện tại", "Bắt buộc gán tham số đầu ra", "Sao chép giá trị", 2],
    [3, 0, 144, "Trong hàm trả về int, dòng nào trả về trường thể hiện muc?", "muc = muc", "this.muc = muc", "return this.muc", "this.muc = 0", 2],
    [3, 0, 145, "Điều kiện if (value >= 0) trong setter thực hiện chức năng gì?", "Truy vấn", "Lưu trữ dữ liệu", "Kiểm tra dữ liệu", "Cập nhật", 2],
    [3, 0, 146, "Trong khai báo string this[int i], int là gì?", "Kiểu chỉ số", "Đối số chỉ mục", "Giá trị cần ghi", "Kiểu phần tử", 0],
    [3, 0, 147, "Cấu hình nào cho phép đọc và hoàn toàn không khai báo setter?", "Chỉ có get", "public get và public set", "private set", "Chỉ có set", 0],
    [3, 0, 148, "Trong phương thức thể hiện, this biểu thị điều gì?", "Cho phép đọc và ghi biến của người gọi", "Sao chép giá trị", "Bắt buộc gán tham số đầu ra", "Tham chiếu đối tượng hiện tại", 3],
    [3, 0, 149, "Ranh giới mà internal sử dụng gọi là gì?", "Thể hiện", "Lớp", "Namespace", "Assembly", 3],
    [3, 0, 150, "Nếu Tang là phương thức thể hiện của BoDem, gọi nó trên b bằng cú pháp nào?", "BoDem.DocTong()", "b.Tang()", "BoDem.Tong", "b.Muc", 1],
    [3, 0, 151, "Với phương thức truy vấn GetM() thay cho property, bên gọi dùng cách nào?", "Đọc và ghi từ bên ngoài", "Đọc từ bên ngoài", "Ghi từ bên ngoài", "Gọi như một phương thức", 3],
    [3, 0, 152, "Một biến cục bộ khai báo trong thân phương thức thuộc phạm vi nào?", "Thuộc riêng từng thể hiện", "Do người gọi truyền vào", "Thuộc phạm vi thân phương thức", "Thuộc kiểu và dùng chung", 2],
    [3, 0, 153, "Trong bốn lựa chọn, chỉ thị nào phù hợp nhất để giấu trường khỏi cả lớp dẫn xuất?", "protected", "internal", "protected internal", "private", 3],
    [3, 0, 154, "Với property public có cả hai accessor, chỉ định nào cho phép bên ngoài đọc nhưng chỉ lớp được dùng setter?", "Chỉ có set", "Chỉ có get", "private set", "public get và public set", 2],
    [3, 0, 155, "Với kiểu chứa có thể truy cập, chỉ thị nào mở quyền truy cập thành viên rộng nhất?", "internal", "private", "public", "protected", 2],
    [3, 0, 156, "Phần khai báo nào phù hợp cho chỉ mục nhận một số nguyên?", "this[string key]", "this[int i]", "this[int i, int j]", "Doc(int i)", 1],
    [4, 0, 157, "Khi chuỗi finalization chạy với đối tượng B : A và cả hai có finalizer, thành phần nào chạy trước?", "Finalizer lớp cơ sở", "Finalizer lớp dẫn xuất", "Constructor lớp cơ sở", "Constructor lớp dẫn xuất", 1],
    [4, 0, 158, "Nếu D không thuộc nhánh A, B, C, D là gì đối với nhánh này?", "Lớp ngoài hệ phân cấp", "Lớp cơ sở trực tiếp", "Lớp dẫn xuất trực tiếp", "Lớp cơ sở gián tiếp", 0],
    [4, 0, 159, "Một lớp C# được khai báo tối đa bao nhiêu lớp cơ sở trực tiếp?", "Không có giới hạn cố định ở mức bài giảng", "Hai", "Không có", "Một", 3],
    [4, 0, 160, "Từ khóa nào gọi phiên bản lớp cơ sở trong base.M()?", "override", "new", "base", "this", 2],
    [4, 0, 161, "Khai báo nào tạo lớp A kế thừa B?", "class A : B", "class B : A", "class B", "interface B : A", 0],
    [4, 0, 162, "Nếu chỉ viết class X : A và A không thực thi giao diện nào, X thực thi trực tiếp bao nhiêu giao diện?", "Không có giới hạn cố định ở mức bài giảng", "Không có", "Một", "Hai", 1],
    [4, 0, 163, "Nếu B dùng new M() che M() của A và biến b có kiểu B, b.M() chọn phiên bản nào?", "Chọn phiên bản cơ sở", "Cảnh báo che khuất", "Lỗi không truy cập được", "Chọn phiên bản dẫn xuất", 3],
    [4, 0, 164, "Initializer nào chuyển n đến constructor của lớp cơ sở?", ": base(n)", ": this(n)", ": base()", ": this()", 0],
    [4, 0, 165, "Initializer nào chuyển n đến constructor khác trong chính lớp?", ": this()", ": base()", ": base(n)", ": this(n)", 3],
    [4, 0, 166, "B khai báo new M() khi A đã có M(). Đây là thao tác gì?", "Che khuất thành viên trùng", "Dùng lại thành viên chung", "Thêm hành vi riêng", "Gọi hành vi lớp cơ sở", 0],
    [4, 0, 167, "Trong cùng cây phân cấp, A là gì đối với C?", "Lớp cơ sở trực tiếp", "Lớp dẫn xuất trực tiếp", "Lớp cơ sở gián tiếp", "Lớp ngoài hệ phân cấp", 2],
    [4, 0, 168, "Nếu B khai báo M cùng chữ ký M không ảo của A mà bỏ new, trình biên dịch thường đưa ra điều gì?", "Cảnh báo che khuất", "Chọn phiên bản dẫn xuất", "Chọn phiên bản cơ sở", "Lỗi không truy cập được", 0],
    [4, 0, 169, "Trong A a = new B(), A xác định điều gì về a?", "Kiểu thực của đối tượng", "Danh sách đối số", "Kiểu khai báo của biến", "Tên của biến", 2],
    [4, 0, 170, "Khai báo class X : A, I, J với A là lớp và I, J là giao diện thực thi bao nhiêu giao diện trực tiếp?", "Không có", "Hai", "Không có giới hạn cố định ở mức bài giảng", "Một", 1],
    [4, 0, 171, "Trong public int Id;, Id thuộc loại thành viên nào mà B có thể truy cập?", "Constructor thể hiện", "Trường public", "Phương thức public", "Finalizer", 1],
    [4, 0, 172, "Trong class LenhDacBiet : Lenh, Lenh giữ vai trò gì?", "Lớp dẫn xuất", "Lớp cùng cấp", "Giao diện", "Lớp cơ sở", 3],
    [4, 0, 173, "Trong B, base.M() gọi phiên bản nào nếu A khai báo M và là lớp cơ sở trực tiếp?", "Chọn phiên bản dẫn xuất", "Lỗi không truy cập được", "Cảnh báo che khuất", "Chọn phiên bản cơ sở", 3],
    [4, 0, 174, "Trong cùng cây phân cấp, C là gì đối với B?", "Lớp ngoài hệ phân cấp", "Lớp dẫn xuất trực tiếp", "Lớp cơ sở gián tiếp", "Lớp cơ sở trực tiếp", 1],
    [4, 0, 175, "Giả sử C : B và B : A. B là gì đối với C?", "Lớp cơ sở gián tiếp", "Lớp dẫn xuất trực tiếp", "Lớp ngoài hệ phân cấp", "Lớp cơ sở trực tiếp", 3],
    [4, 0, 176, "Nhận định nào đúng về số giao diện khác nhau mà một lớp có thể liệt kê theo quy tắc kế thừa của bài giảng?", "Không có", "Không có giới hạn cố định ở mức bài giảng", "Hai", "Một", 1],
    [4, 0, 177, "Giả sử A là giao diện, khai báo nào tạo giao diện B kế thừa A?", "class A : B", "class B", "class B : A", "interface B : A", 3],
    [4, 0, 178, "Hai lớp độc lập cùng dẫn xuất trực tiếp từ Lenh có quan hệ gì với nhau trong cây phân cấp?", "Lớp cùng cấp", "Lớp cơ sở", "Lớp dẫn xuất", "Giao diện", 0],
    [4, 0, 179, "Thành viên nào có dạng ~A() và không thể gọi trực tiếp từ B?", "Trường public", "Constructor thể hiện", "Finalizer", "Phương thức public", 2],
    [4, 0, 180, "Trong A a = new B(n), phần n giữa hai dấu ngoặc là gì?", "Danh sách đối số", "Kiểu thực của đối tượng", "Tên của biến", "Kiểu khai báo của biến", 0],
    [4, 0, 181, "Trong class B : A, dấu nào ngăn tên lớp dẫn xuất với danh sách kiểu cơ sở?", "Dấu hai chấm", "Dấu phẩy", "Dấu chấm", "Dấu chấm phẩy", 0],
    [4, 0, 182, "Với B b đã giữ đối tượng, khi chạy A a = b; điều gì xảy ra với đối tượng ban đầu?", "Thay đổi kiểu thực", "Tạo bản sao", "Giữ nguyên đối tượng", "Tạo đối tượng lớp cơ sở mới", 2],
    [4, 0, 183, "Dòng nào dùng phép ép kiểu tường minh từ biến a kiểu A sang B?", "B b = new B()", "A a = new B()", "B b = (B)a", "A a = new A()", 2],
    [4, 0, 184, "Chỉ thị nào cho phép bên ngoài dùng thành viên qua đối tượng nếu kiểu chứa cũng truy cập được?", "Truy cập protected", "Truy cập private", "Truy cập internal", "Truy cập public", 3],
    [4, 0, 185, "Dòng nào tạo B và dùng biến có kiểu khai báo B để giữ nó?", "A a = new A()", "B b = (B)a", "B b = new B()", "A a = new B()", 2],
    [4, 0, 186, "Khi tạo đối tượng B : A, thân constructor A là thân của thành phần nào?", "Constructor lớp dẫn xuất", "Constructor lớp cơ sở", "Finalizer lớp dẫn xuất", "Finalizer lớp cơ sở", 1],
    [4, 0, 187, "Trong A a = new B(), a là gì?", "Kiểu thực của đối tượng", "Tên của biến", "Danh sách đối số", "Kiểu khai báo của biến", 1],
    [4, 0, 188, "Trong A a = new B(), B xác định điều gì về đối tượng được tạo?", "Tên của biến", "Danh sách đối số", "Kiểu khai báo của biến", "Kiểu thực của đối tượng", 3],
    [4, 0, 189, "Kiểu được khai báo bằng interface và có thể được một lớp thực thi gọi là gì?", "Lớp cùng cấp", "Lớp dẫn xuất", "Lớp cơ sở", "Giao diện", 3],
    [4, 0, 190, "Trong khai báo trường int n;, dấu nào kết thúc khai báo?", "Dấu chấm phẩy", "Dấu chấm", "Dấu phẩy", "Dấu hai chấm", 0],
    [4, 0, 191, "Thành viên nào có thể được B gọi qua : base(...) nhưng phải được khai báo như một constructor riêng nếu B cần cùng chữ ký?", "Constructor thể hiện", "Finalizer", "Phương thức public", "Trường public", 0],
    [4, 0, 192, "Chỉ thị nào cho lớp khác cùng assembly dùng thành viên mà không cần kế thừa?", "Truy cập protected", "Truy cập private", "Truy cập internal", "Truy cập public", 2],
    [4, 0, 193, "Trong public void HienThi() { }, HienThi thuộc loại thành viên nào mà B có thể gọi?", "Phương thức public", "Trường public", "Constructor thể hiện", "Finalizer", 0],
    [4, 0, 194, "Chỉ thị nào thường mở thành viên cho lớp dẫn xuất ở assembly khác theo quy tắc kế thừa?", "Truy cập protected", "Truy cập internal", "Truy cập private", "Truy cập public", 0],
    [4, 0, 195, "Từ khóa nào đánh dấu phương thức ghi đè phương thức ảo thừa hưởng?", "this", "override", "base", "new", 1],
    [4, 0, 196, "Dòng nào tạo đúng một đối tượng có kiểu thực A?", "A a = new A()", "A a = new B()", "B b = new B()", "B b = (B)a", 0],
    [4, 0, 197, "Chỉ thị nào khóa quyền truy cập trực tiếp của một lớp dẫn xuất thông thường?", "Truy cập public", "Truy cập private", "Truy cập internal", "Truy cập protected", 1],
    [4, 0, 198, "Khai báo nào tạo lớp B mà không nêu lớp cơ sở tường minh?", "class A : B", "class B", "interface B : A", "class B : A", 1],
    [4, 0, 199, "Trong class LenhDacBiet : Lenh, LenhDacBiet giữ vai trò gì?", "Lớp cùng cấp", "Giao diện", "Lớp cơ sở", "Lớp dẫn xuất", 3],
    [4, 0, 200, "Từ khóa nào đặt trước khai báo để biểu thị che khuất có chủ ý?", "override", "base", "this", "new", 3],
    [4, 0, 201, "Trong lớp dẫn xuất bình thường, cố đọc trực tiếp trường private của lớp cơ sở dẫn đến điều gì?", "Chọn phiên bản cơ sở", "Chọn phiên bản dẫn xuất", "Cảnh báo che khuất", "Lỗi không truy cập được", 3],
    [4, 0, 202, "Giả sử B : A và cả hai tạo được, dòng nào thể hiện gán đối tượng B vào biến kiểu A ngay khi tạo?", "A a = new A()", "B b = new B()", "A a = new B()", "B b = (B)a", 2],
    [4, 0, 203, "Cụm từ nào mô tả một hiểu nhầm về tác dụng của phép gán tham chiếu sang biến lớp cơ sở?", "Tạo đối tượng lớp cơ sở mới", "Giữ nguyên đối tượng", "Thay đổi kiểu thực", "Tạo bản sao", 2],
    [4, 0, 204, "Trong A a = new A();, biểu thức bên phải thực hiện gì?", "Tạo đối tượng lớp cơ sở mới", "Tạo bản sao", "Thay đổi kiểu thực", "Giữ nguyên đối tượng", 0],
    [4, 0, 205, "Trong : base(x, y), dấu nào phân tách x với y?", "Dấu hai chấm", "Dấu phẩy", "Dấu chấm", "Dấu chấm phẩy", 1],
    [4, 0, 206, "Initializer nào gọi constructor không tham số của lớp cơ sở?", ": base(n)", ": this(n)", ": base()", ": this()", 2],
    [4, 0, 207, "Từ khóa nào dùng để gọi constructor khác của cùng lớp trong : this(...) ?", "base", "new", "this", "override", 2],
    [4, 0, 208, "Trong cùng chuỗi finalization, thành phần nào chạy sau ~B()?", "Finalizer lớp dẫn xuất", "Constructor lớp cơ sở", "Finalizer lớp cơ sở", "Constructor lớp dẫn xuất", 2],
    [4, 0, 209, "Trong class B : A, phần public B() { } thuộc thành phần nào?", "Finalizer lớp cơ sở", "Finalizer lớp dẫn xuất", "Constructor lớp dẫn xuất", "Constructor lớp cơ sở", 2],
    [4, 0, 210, "Trong base.M(), dấu nào nối base với M?", "Dấu hai chấm", "Dấu chấm", "Dấu chấm phẩy", "Dấu phẩy", 1],
    [4, 0, 211, "B thực hiện base.M() trong phương thức riêng. Đây là thao tác gì?", "Thêm hành vi riêng", "Che khuất thành viên trùng", "Dùng lại thành viên chung", "Gọi hành vi lớp cơ sở", 3],
    [4, 0, 212, "Initializer nào gọi constructor không tham số khác trong chính lớp?", ": this()", ": base()", ": base(n)", ": this(n)", 0],
    [4, 0, 213, "Một phương thức chung được viết ở A để B và C dùng lại minh họa lợi ích gì?", "Che khuất thành viên trùng", "Dùng lại thành viên chung", "Thêm hành vi riêng", "Gọi hành vi lớp cơ sở", 1],
    [4, 0, 214, "Thao tác nào được mô tả bởi cụm từ sao chép đối tượng sang một thể hiện khác?", "Giữ nguyên đối tượng", "Tạo đối tượng lớp cơ sở mới", "Tạo bản sao", "Thay đổi kiểu thực", 2],
    [4, 0, 215, "Khai báo nào tạo lớp B kế thừa A?", "class B", "interface B : A", "class A : B", "class B : A", 3],
    [4, 0, 216, "B có thêm phương thức ChiB() để thực hiện việc A không có. Đây là thao tác gì?", "Dùng lại thành viên chung", "Thêm hành vi riêng", "Che khuất thành viên trùng", "Gọi hành vi lớp cơ sở", 1],
    [5, 0, 217, "Giả sử C thực thi I.M. Sau I a = new C();, a.M() thuộc trường hợp nào?", "Lỗi tạo thể hiện", "Khai báo hợp đồng", "Khai báo biến hợp lệ", "Lời gọi hợp lệ và có cài đặt", 3],
    [5, 0, 218, "Trong A a = new B(); với B : A, A giữ vai trò nào trong quan hệ kế thừa?", "Biến tham chiếu", "Lớp cơ sở", "Phiên bản ghi đè", "Lớp dẫn xuất", 1],
    [5, 0, 219, "Thành viên nào có đúng tên và danh sách tham số nhưng không đủ quyền để thực thi ngầm định?", "public void Gui() { }", "public static void Gui() { }", "private void Gui() { }", "public void Gui(int n) { }", 2],
    [5, 0, 220, "Từ khóa nào ghi đè phương thức ảo thừa hưởng?", "virtual", "new", "abstract", "override", 3],
    [5, 0, 221, "Từ khóa nào khai báo phương thức ảo có thân mặc định ở lớp cơ sở?", "abstract", "override", "new", "virtual", 3],
    [5, 0, 222, "Tên nào theo quy ước đặt tên giao diện trong bài giảng?", "static class TruyenTin", "ITruyenTin", "abstract class TruyenTin", "TruyenTin", 1],
    [5, 0, 223, "Với interface I khai báo void Gui(), thành viên nào thực thi ngầm định đúng hợp đồng?", "public void Gui(int n) { }", "public void Gui() { }", "public static void Gui() { }", "private void Gui() { }", 1],
    [5, 0, 224, "Cùng một lời gọi trên kiểu chung thực hiện khác nhau theo đối tượng thực minh họa đặc điểm nào?", "Đa hình", "Finalization", "Khởi tạo", "Đóng gói", 0],
    [5, 0, 225, "Một phương thức khai báo abstract trong lớp và kết thúc bằng dấu chấm phẩy thuộc loại nào?", "Phương thức trừu tượng", "Giao diện", "Lớp trừu tượng", "Lớp cụ thể", 0],
    [5, 0, 226, "Nếu B có override M(), thân B.M() đóng vai trò gì?", "Lớp dẫn xuất", "Phiên bản ghi đè", "Biến tham chiếu", "Lớp cơ sở", 1],
    [5, 0, 227, "Trong mô hình giao diện chỉ khai báo hợp đồng, đâu là chữ ký của một phương thức?", "string this[int i] { get; }", "int Muc { get; }", "void Gui();", "int muc;", 2],
    [5, 0, 228, "Lớp tiện ích chuẩn nào chứa các hàm như Sqrt và Pow?", "System.Type", "System.Math", "System.String", "System.Object", 1],
    [5, 0, 229, "Thành viên nào cung cấp thông tin kiểu của thể hiện hiện tại?", "Finalize()", "ToString()", "MemberwiseClone()", "GetType()", 3],
    [5, 0, 230, "Lớp thường đã cung cấp đủ bản cài đặt cần thiết để tạo đối tượng được gọi là gì?", "Phương thức ảo có thân", "Lớp triển khai cụ thể", "Hợp đồng giao diện", "Lớp trừu tượng trung gian", 1],
    [5, 0, 231, "Khai báo nào tạo phương thức thường không ảo và có thân?", "public void M() { }", "public override void M() { }", "public virtual void M() { }", "public abstract void M();", 0],
    [5, 0, 232, "Câu lệnh new I() khi I là interface thuộc trường hợp nào?", "Lỗi tạo thể hiện", "Khai báo hợp đồng", "Lời gọi hợp lệ và có cài đặt", "Khai báo biến hợp lệ", 0],
    [5, 0, 233, "Khai báo nào là phương thức trừu tượng trong lớp trừu tượng?", "public abstract void M();", "public virtual void M() { }", "public override void M() { }", "public void M() { }", 0],
    [5, 0, 234, "Trong thân phương thức, dòng I a; khi I là interface thuộc trường hợp nào?", "Lời gọi hợp lệ và có cài đặt", "Khai báo hợp đồng", "Lỗi tạo thể hiện", "Khai báo biến hợp lệ", 3],
    [5, 0, 235, "Trong khai báo void M(int n), int n là gì?", "Kiểu khai báo", "Kiểu thực", "Giá trị trả về", "Tham số hình thức", 3],
    [5, 0, 236, "Kiểu nào là kiểu trả về của GetType() trên một đối tượng?", "System.Math", "System.Type", "System.String", "System.Object", 1],
    [5, 0, 237, "Việc thiết lập giá trị ban đầu của thể hiện thuộc giai đoạn nào?", "Đa hình", "Finalization", "Khởi tạo", "Đóng gói", 2],
    [5, 0, 238, "Mức truy cập nào dùng để cho phép lớp con gọi một phương thức của lớp trừu tượng theo quan hệ dẫn xuất?", "protected", "private", "internal", "public", 0],
    [5, 0, 239, "Khai báo nào tạo lớp thường A?", "interface A", "abstract class A", "class A", "static class A", 2],
    [5, 0, 240, "Tính năng nào cho phép lớp trừu tượng thiết lập trạng thái ban đầu khi tạo một lớp con?", "Có thể khai báo constructor", "Có thể khai báo phương thức không thân", "Không thể tạo thể hiện trực tiếp", "Có thể chứa trường thể hiện", 0],
    [5, 0, 241, "Một lớp đánh dấu abstract thuộc loại nào?", "Lớp cụ thể", "Lớp trừu tượng", "Phương thức trừu tượng", "Giao diện", 1],
    [5, 0, 242, "Khai báo nào tạo phương thức ảo có bản cài đặt gốc?", "public abstract void M();", "public override void M() { }", "public void M() { }", "public virtual void M() { }", 3],
    [5, 0, 243, "Thành viên nào có đúng tên và là public nhưng khác danh sách tham số?", "private void Gui() { }", "public void Gui(int n) { }", "public void Gui() { }", "public static void Gui() { }", 1],
    [5, 0, 244, "Dòng void M(); trong thân interface cổ điển thuộc trường hợp nào?", "Khai báo hợp đồng", "Khai báo biến hợp lệ", "Lời gọi hợp lệ và có cài đặt", "Lỗi tạo thể hiện", 0],
    [5, 0, 245, "Trong mô hình bài giảng, giao diện dùng chủ yếu để mô tả điều gì?", "Hợp đồng hành vi", "Trạng thái dùng chung của lớp cơ sở", "Phiên bản mặc định", "Thể hiện cụ thể", 0],
    [5, 0, 246, "Đâu là khai báo hợp đồng property chỉ đọc?", "int muc;", "string this[int i] { get; }", "int Muc { get; }", "void Gui();", 2],
    [5, 0, 247, "Khai báo nào tạo lớp trừu tượng A?", "interface A", "class A", "static class A", "abstract class A", 3],
    [5, 0, 248, "Sau khi đã chọn được phương thức ảo để gọi, yếu tố nào quyết định bản override chạy?", "Tham số hình thức", "Kiểu thực", "Kiểu khai báo", "Giá trị trả về", 1],
    [5, 0, 249, "Trong mô hình giao diện cổ điển, thành viên hợp đồng void M(); mặc định có mức truy cập nào?", "public", "private", "internal", "protected", 0],
    [5, 0, 250, "Khai báo nào tạo giao diện A?", "abstract class A", "interface A", "static class A", "class A", 1],
    [5, 0, 251, "Trong public void Gui() { }, public mô tả yếu tố nào?", "Quyền truy cập", "Chữ ký phương thức", "Thân phương thức", "Tên giao diện", 0],
    [5, 0, 252, "Mức truy cập nào phù hợp nhất cho phương thức trợ giúp chỉ dùng trong lớp khai báo?", "internal", "private", "protected", "public", 1],
    [5, 0, 253, "Trong interface IThongBao { }, IThongBao giữ vai trò gì?", "Thân phương thức", "Tên giao diện", "Quyền truy cập", "Chữ ký phương thức", 1],
    [5, 0, 254, "Khai báo nào cho phép lớp TruyenTin định nghĩa một khung chung mà không tạo trực tiếp đối tượng?", "ITruyenTin", "TruyenTin", "abstract class TruyenTin", "static class TruyenTin", 2],
    [5, 0, 255, "Một giao diện có thể liệt kê những kiểu nào ở danh sách kế thừa?", "Nhiều giao diện", "Chỉ một lớp", "Một lớp và nhiều giao diện", "Không thể dùng tên lớp ở vế new", 0],
    [5, 0, 256, "Tên nào phù hợp cho một lớp thường triển khai việc truyền tin?", "abstract class TruyenTin", "TruyenTin", "static class TruyenTin", "ITruyenTin", 1],
    [5, 0, 257, "Với lớp A trừu tượng, phát biểu nào đúng về new A()?", "Chỉ một lớp", "Không thể dùng tên lớp ở vế new", "Một lớp và nhiều giao diện", "Nhiều giao diện", 1],
    [5, 0, 258, "Phương thức nào cung cấp mã băm?", "GetHashCode()", "Equals()", "GetType()", "ToString()", 0],
    [5, 0, 259, "Kiểu nào nằm ở gốc phân cấp các lớp C#?", "System.Type", "System.Object", "System.String", "System.Math", 1],
    [5, 0, 260, "Một kiểu dùng interface để biểu diễn hợp đồng chung thuộc loại nào?", "Giao diện", "Lớp trừu tượng", "Phương thức trừu tượng", "Lớp cụ thể", 0],
    [5, 0, 261, "Đâu là khai báo một trường thể hiện, thuộc loại dữ liệu giao diện không chứa?", "void Gui();", "string this[int i] { get; }", "int Muc { get; }", "int muc;", 3],
    [5, 0, 262, "Giả sử I là giao diện. class C : I minh họa quan hệ nào?", "Lớp kế thừa lớp", "Lớp thực thi giao diện", "Giao diện làm kiểu tham chiếu", "Giao diện kế thừa giao diện", 1],
    [5, 0, 263, "Từ khóa nào khai báo phương thức chưa có thân trong lớp trừu tượng?", "override", "abstract", "new", "virtual", 1],
    [5, 0, 264, "Trường thể hiện khai báo trong lớp trừu tượng có thể biểu diễn phần gì cho các lớp dẫn xuất?", "Trạng thái dùng chung của lớp cơ sở", "Phiên bản mặc định", "Hợp đồng hành vi", "Thể hiện cụ thể", 0],
    [5, 0, 265, "Thành viên nào có đúng tên và danh sách tham số nhưng sai vì là static?", "public void Gui() { }", "private void Gui() { }", "public static void Gui() { }", "public void Gui(int n) { }", 2],
    [5, 0, 266, "Tính năng nào cho phép lớp trừu tượng yêu cầu lớp con cụ thể viết thân phương thức?", "Có thể chứa trường thể hiện", "Không thể tạo thể hiện trực tiếp", "Có thể khai báo constructor", "Có thể khai báo phương thức không thân", 3],
    [5, 0, 267, "Một lớp trừu tượng có thể nêu tối đa những loại kiểu cơ sở nào?", "Không thể dùng tên lớp ở vế new", "Nhiều giao diện", "Một lớp và nhiều giao diện", "Chỉ một lớp", 2],
    [5, 0, 268, "Tính năng nào giúp lớp trừu tượng lưu trạng thái riêng của từng đối tượng?", "Có thể khai báo phương thức không thân", "Không thể tạo thể hiện trực tiếp", "Có thể chứa trường thể hiện", "Có thể khai báo constructor", 2],
    [5, 0, 269, "Trong lớp cơ sở, public virtual void M() { } là dạng thành viên nào?", "Lớp triển khai cụ thể", "Lớp trừu tượng trung gian", "Hợp đồng giao diện", "Phương thức ảo có thân", 3],
    [5, 0, 270, "Khi cả I và J là giao diện, interface J : I minh họa quan hệ nào?", "Giao diện kế thừa giao diện", "Lớp thực thi giao diện", "Lớp kế thừa lớp", "Giao diện làm kiểu tham chiếu", 0],
    [5, 0, 271, "Khai báo nào thay phiên bản của phương thức ảo thừa hưởng?", "public abstract void M();", "public void M() { }", "public virtual void M() { }", "public override void M() { }", 3],
    [5, 0, 272, "Trong cùng khai báo, B giữ vai trò nào trong quan hệ kế thừa?", "Phiên bản ghi đè", "Biến tham chiếu", "Lớp cơ sở", "Lớp dẫn xuất", 3],
    [5, 0, 273, "Đối tượng tạo bằng new trên một lớp thực thi giao diện là gì?", "Hợp đồng hành vi", "Phiên bản mặc định", "Thể hiện cụ thể", "Trạng thái dùng chung của lớp cơ sở", 2],
    [5, 0, 274, "Khi kiểm tra a có được phép gọi thành viên nào, trình biên dịch bắt đầu từ kiểu gì của a?", "Tham số hình thức", "Kiểu thực", "Kiểu khai báo", "Giá trị trả về", 2],
    [5, 0, 275, "Thành viên nào gắn với cơ chế finalization?", "ToString()", "GetType()", "Finalize()", "MemberwiseClone()", 2],
    [5, 0, 276, "Từ khóa nào biểu thị che khuất thành viên thừa hưởng?", "virtual", "override", "abstract", "new", 3],
    [5, 0, 277, "Việc runtime chạy finalizer đã khai báo thuộc cơ chế nào?", "Khởi tạo", "Finalization", "Đóng gói", "Đa hình", 1],
    [5, 0, 278, "Khi C thực thi I, trong I x = new C();, I đóng vai trò gì?", "Giao diện kế thừa giao diện", "Lớp kế thừa lớp", "Lớp thực thi giao diện", "Giao diện làm kiểu tham chiếu", 3],
    [5, 0, 279, "Phương thức nào trả về thông tin kiểu thực?", "GetType()", "GetHashCode()", "Equals()", "ToString()", 0],
    [5, 0, 280, "C# cho phép một lớp kế thừa trực tiếp bao nhiêu kiểu thuộc loại lớp?", "Một lớp và nhiều giao diện", "Không thể dùng tên lớp ở vế new", "Chỉ một lớp", "Nhiều giao diện", 2],
    [5, 0, 281, "Phương thức nào kiểm tra quan hệ tương đương?", "GetHashCode()", "GetType()", "ToString()", "Equals()", 3],
    [5, 0, 282, "Trong lớp thực thi, khối { } của Gui dùng để chứa gì?", "Chữ ký phương thức", "Tên giao diện", "Thân phương thức", "Quyền truy cập", 2],
    [5, 0, 283, "Trong interface I { void Gui(); }, void Gui(); cung cấp phần nào của hợp đồng?", "Quyền truy cập", "Tên giao diện", "Chữ ký phương thức", "Thân phương thức", 2],
    [5, 0, 284, "Mức truy cập nào dành cho mã cùng assembly kể cả khi không kế thừa?", "internal", "private", "public", "protected", 0],
    [5, 0, 285, "Trong cùng khai báo, a đóng vai trò gì?", "Lớp dẫn xuất", "Phiên bản ghi đè", "Biến tham chiếu", "Lớp cơ sở", 2],
    [5, 0, 286, "Một lớp thường tạo được thể hiện và đã thực hiện mọi nghĩa vụ trừu tượng thuộc loại nào?", "Giao diện", "Lớp cụ thể", "Phương thức trừu tượng", "Lớp trừu tượng", 1],
    [5, 0, 287, "Đâu là khai báo hợp đồng chỉ mục chỉ đọc?", "int muc;", "string this[int i] { get; }", "int Muc { get; }", "void Gui();", 1],
    [5, 0, 288, "Giấu trạng thái sau property là ví dụ của nguyên lý nào?", "Khởi tạo", "Finalization", "Đóng gói", "Đa hình", 2],
    [5, 0, 289, "Trong int M() { return 3; }, số 3 là gì?", "Giá trị trả về", "Kiểu thực", "Tham số hình thức", "Kiểu khai báo", 0],
    [5, 0, 290, "Khi A và B đều là lớp, class B : A minh họa quan hệ nào?", "Lớp kế thừa lớp", "Giao diện kế thừa giao diện", "Lớp thực thi giao diện", "Giao diện làm kiểu tham chiếu", 0],
    [5, 0, 291, "Tên đầy đủ của kiểu string là gì?", "System.Object", "System.Math", "System.String", "System.Type", 2],
    [5, 0, 292, "Khai báo nào tạo lớp tiện ích tĩnh A?", "interface A", "abstract class A", "class A", "static class A", 3],
    [5, 0, 293, "Khai báo nào phù hợp cho một lớp TruyenTin chỉ chứa các hàm tiện ích tĩnh?", "TruyenTin", "abstract class TruyenTin", "ITruyenTin", "static class TruyenTin", 3],
    [5, 0, 294, "Giới hạn nào áp dụng khi viết new trực tiếp với tên lớp trừu tượng?", "Có thể khai báo phương thức không thân", "Có thể khai báo constructor", "Có thể chứa trường thể hiện", "Không thể tạo thể hiện trực tiếp", 3],
    [5, 0, 295, "Thân phương thức virtual ở lớp cơ sở cung cấp điều gì trước khi có override?", "Hợp đồng hành vi", "Trạng thái dùng chung của lớp cơ sở", "Thể hiện cụ thể", "Phiên bản mặc định", 3],
    [5, 0, 296, "Phương thức nào trả về chuỗi biểu diễn đối tượng?", "GetHashCode()", "Equals()", "ToString()", "GetType()", 2],
    [5, 0, 297, "Thành viên nào thường được ghi đè để trình bày nội dung đối tượng dưới dạng văn bản?", "Finalize()", "MemberwiseClone()", "ToString()", "GetType()", 2],
    [5, 0, 298, "Một lớp nằm giữa lớp cơ sở và lớp cụ thể, vẫn được đánh dấu abstract, thuộc vai trò nào?", "Hợp đồng giao diện", "Phương thức ảo có thân", "Lớp trừu tượng trung gian", "Lớp triển khai cụ thể", 2],
    [5, 0, 299, "Trong interface I { void M(); }, lời khai báo M() đại diện cho điều gì?", "Hợp đồng giao diện", "Lớp trừu tượng trung gian", "Phương thức ảo có thân", "Lớp triển khai cụ thể", 0],
    [5, 0, 300, "Thành viên nào của object tạo bản sao nông?", "Finalize()", "ToString()", "GetType()", "MemberwiseClone()", 3],
    [2, 1, 301, "Trong lớp Ve, xét các khai báo độc lập. Khai báo nào có thể gọi bằng v.In() nếu v đã được khởi tạo?", "~Ve() { }", "public Ve(int gia) { }", "public void Ve(int gia) { }", "public void In() { }", 3],
    [2, 1, 302, "Trong lớp NhietKe, các phương thức mẫu dưới đây được xét riêng. Đâu là phương thức trả về giá trị hợp lệ?", "void Xoa() { return; }", "void Xoa() { return 0; }", "int Doc() { }", "int Doc() { return 0; }", 3],
    [2, 1, 303, "Lớp Dau có int Doc() và void In(int n). Biến d đã được gán. Dòng nào gọi truy vấn rồi bỏ qua giá trị trả về?", "d.Doc();", "d.In(2);", "d.In(d.Doc());", "int n = d.Doc();", 0],
    [2, 1, 304, "Lớp Ban có trường public int Ma và không khai báo constructor. Mỗi tình huống được xét riêng. Đọc Ma ngay sau khi tạo Ban bằng new Ban() cho kết quả gì?", "Ma bằng 8", "Biến chưa được gán", "Ma bằng 5", "Ma bằng 0", 3],
    [2, 1, 305, "Biến cục bộ a, b có kiểu Den. Lớp Den có phương thức Bat() và constructor không tham số. Dòng nào làm hai biến giữ cùng tham chiếu, nếu a đã được gán?", "a.Bat();", "b = a;", "a = new Den();", "Den a;", 1],
    [2, 1, 306, "Lớp Dau có int Doc() và void In(int n). Biến d đã được gán. Dòng nào giữ kết quả truy vấn trong biến cục bộ?", "d.In(d.Doc());", "d.Doc();", "d.In(2);", "int n = d.Doc();", 3],
    [2, 1, 307, "Lớp Khoa có public Khoa(int m) và phương thức public int Doc(). Biến k đã giữ một Khoa. Biểu thức nào thiếu đối số bắt buộc của constructor duy nhất?", "new Khoa()", "new Khoa(6)", "Khoa.Doc()", "k.Doc()", 0],
    [2, 1, 308, "Lớp Tem có public Tem(), public Tem(int m) và public Tem(string s), không có constructor khác. Biểu thức nào chọn constructor có tham số string?", "new Tem(\"5\")", "new Tem(5)", "new Tem()", "new Tem(5, \"5\")", 0],
    [2, 1, 309, "Lớp Ngay có trường int m, constructor Ngay(int x) gán m = x và int Doc() trả m. Với cùng hai đối tượng, b.Doc() trả gì?", "7", "5", "Không biên dịch", "2", 1],
    [2, 1, 310, "Lớp Thuoc có trường private int _m. Xét các cách thiết kế dưới đây theo vai trò thành viên. Thành viên nào là nơi lưu mức của từng đối tượng?", "public void Dat(int m) { _m = m; }", "public Thuoc(int m) { _m = m; }", "private int _m;", "public int Doc() { return _m; }", 2],
    [2, 1, 311, "Lớp Ban có trường public int Ma và không khai báo constructor. Mỗi tình huống được xét riêng. Hai biến giữ cùng một Ban. Gán Ma = 8 qua biến thứ nhất rồi đọc qua biến thứ hai. Kết quả là gì?", "Ma bằng 5", "Biến chưa được gán", "Ma bằng 8", "Ma bằng 0", 2],
    [2, 1, 312, "Lớp Hop có trường public int So = 4. Constructor Hop(int n) gán So = n. Xét các đoạn độc lập. Nếu chưa thêm Hop(), điều gì xảy ra khi viết new Hop()?", "Lỗi biên dịch", "9", "7", "4", 0],
    [2, 1, 313, "Xét riêng một lớp không có constructor thể hiện tường minh, chứa trường int n, bool bat và string ten, đều không có biểu thức khởi tạo. Giá trị mặc định của ten lúc chạy là gì?", "0", "false", "null", "Một thể hiện mới", 2],
    [2, 1, 314, "Lớp Tem có public Tem(), public Tem(int m) và public Tem(string s), không có constructor khác. Biểu thức nào chọn constructor có tham số int?", "new Tem(5, \"5\")", "new Tem()", "new Tem(\"5\")", "new Tem(5)", 3],
    [2, 1, 315, "Lớp Thuoc có trường private int _m. Xét các cách thiết kế dưới đây theo vai trò thành viên. Thành viên nào cho phép đổi mức sau khi đã tạo đối tượng?", "public int Doc() { return _m; }", "public Thuoc(int m) { _m = m; }", "public void Dat(int m) { _m = m; }", "private int _m;", 2],
    [2, 1, 316, "Giả sử Ong là lớp thường, mỗi constructor được xét độc lập về chữ ký. Cặp nào có đúng một tham số mỗi bên nhưng khác kiểu tham số?", "Ong() và Ong(int n)", "Ong(int n) và Ong(string n)", "Ong(int n) và Ong(int m)", "Ong(int n, bool b) và Ong(bool b, int n)", 1],
    [2, 1, 317, "Giả sử Goi là một lớp có finalizer, và g là biến thể hiện đã gán. Dòng nào bỏ tham chiếu đang được biến g giữ?", "g = null;", "g.ToString();", "~Goi() { }", "public Goi() { }", 0],
    [2, 1, 318, "Lớp Dau có int Doc() và void In(int n). Biến d đã được gán. Dòng nào lấy kết quả truy vấn để truyền thẳng vào phương thức khác?", "int n = d.Doc();", "d.Doc();", "d.In(2);", "d.In(d.Doc());", 3],
    [2, 1, 319, "Giả sử t đang giữ đối tượng lớp Tin. Nếu Doc có bản nhận int, biểu thức nào gọi bản đó?", "t.Ma", "t.Doc", "t.Doc(4)", "t.Doc()", 2],
    [2, 1, 320, "Trong lớp NhietKe, các phương thức mẫu dưới đây được xét riêng. Đâu là phương thức thiếu giá trị trả về trên đường đi duy nhất?", "int Doc() { }", "int Doc() { return 0; }", "void Xoa() { return; }", "void Xoa() { return 0; }", 0],
    [2, 1, 321, "Lớp Khoa có public Khoa(int m) và phương thức public int Doc(). Biến k đã giữ một Khoa. Biểu thức nào cố gọi phương thức thể hiện qua tên lớp?", "new Khoa()", "Khoa.Doc()", "k.Doc()", "new Khoa(6)", 1],
    [2, 1, 322, "Lớp Hop có trường public int So = 4. Constructor Hop(int n) gán So = n. Xét các đoạn độc lập. Tạo h = new Hop(7) rồi gán h.So = 9. So bằng bao nhiêu?", "4", "9", "7", "Lỗi biên dịch", 1],
    [2, 1, 323, "Lớp Hop có trường public int So = 4. Constructor Hop(int n) gán So = n. Xét các đoạn độc lập. Sau khi thêm Hop() có thân rỗng, giá trị So từ new Hop() là gì?", "9", "Lỗi biên dịch", "4", "7", 2],
    [2, 1, 324, "Lớp Tem có public Tem(), public Tem(int m) và public Tem(string s), không có constructor khác. Biểu thức nào chọn constructor có danh sách tham số rỗng?", "new Tem(5)", "new Tem(5, \"5\")", "new Tem()", "new Tem(\"5\")", 2],
    [2, 1, 325, "Lớp Ngay có trường int m, constructor Ngay(int x) gán m = x và int Doc() trả m. Khi Ngay chỉ có constructor đã nêu, new Ngay() dẫn đến điều gì?", "2", "Không biên dịch", "5", "7", 1],
    [2, 1, 326, "Biến cục bộ a, b có kiểu Den. Lớp Den có phương thức Bat() và constructor không tham số. Dòng nào cần một thể hiện để gọi phương thức?", "a = new Den();", "a.Bat();", "b = a;", "Den a;", 1],
    [2, 1, 327, "Lớp Khoa có public Khoa(int m) và phương thức public int Doc(). Biến k đã giữ một Khoa. Biểu thức nào tạo đối tượng với đối số hợp lệ?", "k.Doc()", "new Khoa(6)", "new Khoa()", "Khoa.Doc()", 1],
    [2, 1, 328, "Lớp Khoa có public Khoa(int m) và phương thức public int Doc(). Biến k đã giữ một Khoa. Biểu thức nào đọc qua phương thức thể hiện?", "new Khoa(6)", "Khoa.Doc()", "k.Doc()", "new Khoa()", 2],
    [2, 1, 329, "Lớp Phieu chỉ có public Phieu(int ma, bool daDuyet). Biểu thức nào có đủ hai đối số nhưng đảo thứ tự kiểu?", "new Phieu(true, 9)", "new Phieu(9)", "new Phieu(9, true)", "new Phieu()", 0],
    [2, 1, 330, "Biến cục bộ a, b có kiểu Den. Lớp Den có phương thức Bat() và constructor không tham số. Dòng nào tạo đối tượng và lưu tham chiếu vào biến đã có?", "Den a;", "a = new Den();", "a.Bat();", "b = a;", 1],
    [2, 1, 331, "Trong lớp Ve, xét các khai báo độc lập. Khai báo nào gắn với finalization?", "public void In() { }", "public void Ve(int gia) { }", "~Ve() { }", "public Ve(int gia) { }", 2],
    [2, 1, 332, "Một đối tượng c kiểu Chuong có Doc() trả int, Keu() trả void, Dat(int) trả void và Lay(bool) trả int. Dòng nào gọi hành vi không đối số và không trả về giá trị?", "c.Keu();", "int x = c.Lay(true);", "c.Dat(3);", "int x = c.Doc();", 0],
    [2, 1, 333, "Giả sử t đang giữ đối tượng lớp Tin. Biểu thức nào thực sự gọi Doc không đối số?", "t.Doc", "t.Doc(4)", "t.Ma", "t.Doc()", 3],
    [2, 1, 334, "Lớp Dau có int Doc() và void In(int n). Biến d đã được gán. Dòng nào truyền một hằng số thay cho kết quả truy vấn?", "d.In(2);", "d.In(d.Doc());", "d.Doc();", "int n = d.Doc();", 0],
    [2, 1, 335, "Giả sử Ong là lớp thường, mỗi constructor được xét độc lập về chữ ký. Cặp nào có cùng hai kiểu nhưng sắp xếp thứ tự khác nhau?", "Ong(int n, bool b) và Ong(bool b, int n)", "Ong() và Ong(int n)", "Ong(int n) và Ong(string n)", "Ong(int n) và Ong(int m)", 0],
    [2, 1, 336, "Giả sử Goi là một lớp có finalizer, và g là biến thể hiện đã gán. Khai báo nào có thể được runtime thực thi trong quá trình hoàn tất đối tượng?", "~Goi() { }", "g = null;", "g.ToString();", "public Goi() { }", 0],
    [2, 1, 337, "Giả sử t đang giữ đối tượng lớp Tin. Nếu Doc là phương thức không tham số, biểu thức nào biểu thị nhóm phương thức trước khi gọi?", "t.Doc(4)", "t.Doc", "t.Ma", "t.Doc()", 1],
    [2, 1, 338, "Lớp Ban có trường public int Ma và không khai báo constructor. Mỗi tình huống được xét riêng. Tạo một Ban rồi gán Ma = 5. Đọc Ma cho kết quả gì?", "Ma bằng 5", "Ma bằng 8", "Biến chưa được gán", "Ma bằng 0", 0],
    [2, 1, 339, "Xét riêng một lớp không có constructor thể hiện tường minh, chứa trường int n, bool bat và string ten, đều không có biểu thức khởi tạo. Giá trị mặc định của n là gì?", "0", "null", "false", "Một thể hiện mới", 0],
    [2, 1, 340, "Trong lớp Ve, xét các khai báo độc lập. Khai báo nào lỗi vì thành viên có kiểu trả về lại trùng tên với lớp chứa?", "public void In() { }", "public Ve(int gia) { }", "public void Ve(int gia) { }", "~Ve() { }", 2],
    [2, 1, 341, "Lớp Ngay có trường int m, constructor Ngay(int x) gán m = x và int Doc() trả m. Ngay a = new Ngay(2); a = new Ngay(7); a.Doc() trả gì?", "2", "7", "Không biên dịch", "5", 1],
    [2, 1, 342, "Lớp Ban có trường public int Ma và không khai báo constructor. Mỗi tình huống được xét riêng. Chỉ khai báo Ban b; trong thân phương thức rồi định dùng b.Ma. Vấn đề là gì?", "Ma bằng 0", "Ma bằng 5", "Biến chưa được gán", "Ma bằng 8", 2],
    [2, 1, 343, "Giả sử Goi là một lớp có finalizer, và g là biến thể hiện đã gán. Dòng nào gọi một phương thức thông thường trên g?", "g = null;", "~Goi() { }", "public Goi() { }", "g.ToString();", 3],
    [2, 1, 344, "Lớp Thuoc có trường private int _m. Xét các cách thiết kế dưới đây theo vai trò thành viên. Thành viên nào giúp truyền mức ban đầu khi tạo đối tượng?", "public void Dat(int m) { _m = m; }", "public Thuoc(int m) { _m = m; }", "public int Doc() { return _m; }", "private int _m;", 1],
    [2, 1, 345, "Lớp Ngay có trường int m, constructor Ngay(int x) gán m = x và int Doc() trả m. Ngay a = new Ngay(2); Ngay b = new Ngay(5); a.Doc() trả gì?", "5", "7", "2", "Không biên dịch", 2],
    [2, 1, 346, "Lớp Thuoc có trường private int _m. Xét các cách thiết kế dưới đây theo vai trò thành viên. Thành viên nào giúp đọc mức đang lưu?", "public Thuoc(int m) { _m = m; }", "public int Doc() { return _m; }", "private int _m;", "public void Dat(int m) { _m = m; }", 1],
    [2, 1, 347, "Lớp Hop có trường public int So = 4. Constructor Hop(int n) gán So = n. Xét các đoạn độc lập. Giá trị So từ new Hop(7) là gì?", "Lỗi biên dịch", "7", "9", "4", 1],
    [2, 1, 348, "Xét riêng một lớp không có constructor thể hiện tường minh, chứa trường int n, bool bat và string ten, đều không có biểu thức khởi tạo. Giá trị mặc định của bat là gì?", "0", "null", "Một thể hiện mới", "false", 3],
    [2, 1, 349, "Xét riêng một lớp không có constructor thể hiện tường minh, chứa trường int n, bool bat và string ten, đều không có biểu thức khởi tạo. Biểu thức new trên lớp này tạo ra gì?", "null", "Một thể hiện mới", "0", "false", 1],
    [2, 1, 350, "Trong lớp Ve, xét các khai báo độc lập. Khai báo nào là constructor có thể nhận 25000?", "public Ve(int gia) { }", "~Ve() { }", "public void In() { }", "public void Ve(int gia) { }", 0],
    [2, 1, 351, "Giả sử Ong là lớp thường, mỗi constructor được xét độc lập về chữ ký. Cặp nào khác nhau về số tham số?", "Ong(int n) và Ong(string n)", "Ong(int n, bool b) và Ong(bool b, int n)", "Ong(int n) và Ong(int m)", "Ong() và Ong(int n)", 3],
    [2, 1, 352, "Một đối tượng c kiểu Chuong có Doc() trả int, Keu() trả void, Dat(int) trả void và Lay(bool) trả int. Dòng nào chuyển 3 vào tham số int?", "c.Keu();", "int x = c.Lay(true);", "c.Dat(3);", "int x = c.Doc();", 2],
    [2, 1, 353, "Một đối tượng c kiểu Chuong có Doc() trả int, Keu() trả void, Dat(int) trả void và Lay(bool) trả int. Dòng nào dùng đối số bool để lấy một giá trị int?", "int x = c.Lay(true);", "c.Keu();", "c.Dat(3);", "int x = c.Doc();", 0],
    [2, 1, 354, "Lớp Phieu chỉ có public Phieu(int ma, bool daDuyet). Biểu thức nào phù hợp cả số lượng lẫn thứ tự kiểu?", "new Phieu()", "new Phieu(9)", "new Phieu(9, true)", "new Phieu(true, 9)", 2],
    [2, 1, 355, "Một đối tượng c kiểu Chuong có Doc() trả int, Keu() trả void, Dat(int) trả void và Lay(bool) trả int. Dòng nào lấy kết quả int mà không truyền đối số?", "c.Dat(3);", "c.Keu();", "int x = c.Lay(true);", "int x = c.Doc();", 3],
    [2, 1, 356, "Trong lớp NhietKe, các phương thức mẫu dưới đây được xét riêng. Đâu là phương thức trả về giá trị trái với khai báo void?", "void Xoa() { return 0; }", "int Doc() { return 0; }", "void Xoa() { return; }", "int Doc() { }", 0],
    [2, 1, 357, "Giả sử Ong là lớp thường, mỗi constructor được xét độc lập về chữ ký. Cặp nào gây trùng chữ ký dù tên tham số khác nhau?", "Ong() và Ong(int n)", "Ong(int n) và Ong(string n)", "Ong(int n, bool b) và Ong(bool b, int n)", "Ong(int n) và Ong(int m)", 3],
    [2, 1, 358, "Lớp Phieu chỉ có public Phieu(int ma, bool daDuyet). Biểu thức nào chỉ thiếu đối số thứ hai?", "new Phieu(true, 9)", "new Phieu(9, true)", "new Phieu(9)", "new Phieu()", 2],
    [2, 1, 359, "Lớp Phieu chỉ có public Phieu(int ma, bool daDuyet). Biểu thức nào đòi hỏi một constructor không tham số?", "new Phieu(9, true)", "new Phieu()", "new Phieu(9)", "new Phieu(true, 9)", 1],
    [2, 1, 360, "Lớp Tem có public Tem(), public Tem(int m) và public Tem(string s), không có constructor khác. Biểu thức nào không có constructor phù hợp do số lượng đối số?", "new Tem(\"5\")", "new Tem(5)", "new Tem()", "new Tem(5, \"5\")", 3],
    [2, 1, 361, "Trong lớp NhietKe, các phương thức mẫu dưới đây được xét riêng. Đâu là phương thức void có thể kết thúc sớm bằng return không kèm giá trị?", "void Xoa() { return 0; }", "int Doc() { }", "int Doc() { return 0; }", "void Xoa() { return; }", 3],
    [2, 1, 362, "Biến cục bộ a, b có kiểu Den. Lớp Den có phương thức Bat() và constructor không tham số. Dòng nào chỉ khai báo a nếu đặt trước những dòng còn lại?", "b = a;", "a.Bat();", "a = new Den();", "Den a;", 3],
    [2, 1, 363, "Giả sử t đang giữ đối tượng lớp Tin. Nếu Ma là trường int, biểu thức nào đọc trường?", "t.Doc", "t.Doc(4)", "t.Doc()", "t.Ma", 3],
    [2, 1, 364, "Giả sử Goi là một lớp có finalizer, và g là biến thể hiện đã gán. Khai báo nào chạy khi dùng new Goi() trong ví dụ này?", "~Goi() { }", "g = null;", "public Goi() { }", "g.ToString();", 2],
    [3, 1, 365, "Cho int x; là biến cục bộ chưa gán. M(int), R(ref int) và O(out int) đều đã định nghĩa đúng. Dòng nào có thể khởi gán x thông qua phương thức?", "M(x);", "O(out x);", "R(x);", "R(ref x);", 1],
    [3, 1, 366, "B có chỉ mục this[int i], this[string key] và this[int i, int j], đều có getter. Biểu thức nào chọn chỉ mục một tham số nguyên?", "b[2]", "b[2, \"2\"]", "b[2, 2]", "b[\"2\"]", 0],
    [3, 1, 367, "K là lớp có int this[int i] đọc và ghi mảng riêng. Biến k đã giữ đối tượng K. Biểu thức nào dùng tên lớp ở nơi cần một thể hiện?", "k(0);", "K[0]", "k[0] = 6;", "int n = k[0];", 1],
    [3, 1, 368, "Lớp May có public int P { get; private set; }. Biến m đã được khởi tạo ở lớp khách. Dòng nào lỗi trong lớp khách vì setter bị giới hạn?", "int k = m.P;", "P += 1;", "m.P = 5;", "P = 5;", 2],
    [3, 1, 369, "Lớp Bo có public static int Tong và public int Rieng. Biến a đã giữ một Bo. Các biểu thức đọc xét ở bên ngoài lớp. Cú pháp nào đọc trường tĩnh hợp lệ?", "a.Rieng", "a.Tong", "Bo.Rieng", "Bo.Tong", 3],
    [3, 1, 370, "Một lớp đã có thể truy cập. Cần chọn mức truy cập hẹp nhất trong bốn lựa chọn để đáp ứng từng yêu cầu. Mọi lớp trong cùng assembly cần truy cập, mã ở assembly khác không cần. Chọn gì?", "public", "protected", "internal", "private", 2],
    [3, 1, 371, "Một lớp đã có thể truy cập. Cần chọn mức truy cập hẹp nhất trong bốn lựa chọn để đáp ứng từng yêu cầu. Mã ngoài assembly và không kế thừa cần dùng thành viên. Chọn gì?", "public", "internal", "protected", "private", 0],
    [3, 1, 372, "Lớp The có trường private int ma = 2. Constructor nhận int ma. Xét dòng được chọn làm toàn bộ thân constructor. Dòng nào chỉ tự gán tham số?", "ma = ma;", "this.ma = 0;", "ma = this.ma;", "this.ma = ma;", 0],
    [3, 1, 373, "Trong lớp X có constructor thể hiện public X(int n). Cần thêm constructor tĩnh. Đâu là cú pháp lỗi vì constructor tĩnh có tham số?", "static X(int n) { }", "static X() { }", "static void X() { }", "public static X() { }", 0],
    [3, 1, 374, "Một lớp đã có thể truy cập. Cần chọn mức truy cập hẹp nhất trong bốn lựa chọn để đáp ứng từng yêu cầu. Lớp con khác assembly cần dùng thành viên qua this, mã độc lập không cần. Chọn gì?", "public", "protected", "internal", "private", 1],
    [3, 1, 375, "Lớp M có int P với get trả _p và set chỉ gán _p khi value nằm trong [1, 9]. Ban đầu _p = 4. Xét từng phép gán từ trạng thái ban đầu. Sau m.P = 9, đọc m.P được gì?", "4", "1", "8", "9", 3],
    [3, 1, 376, "Trong một phương thức thể hiện của lớp L có tham số int n và trường int n. Có phương thức nhận một đối tượng L là Nhan(L). Biểu thức nào truyền đối tượng hiện tại sang một phương thức khác?", "n", "Nhan(this)", "L", "this.n", 1],
    [3, 1, 377, "Xét chỉ mục của lớp B với các chữ ký độc lập. Cặp nào nạp chồng hợp lệ bằng cách thay số chỉ số?", "this[int i] và this[string k]", "this[int i] và this[int j]", "this[int i] và this[int i, int j]", "this[]", 2],
    [3, 1, 378, "Cần chọn chữ ký phương thức theo quy ước truy vấn và cập nhật, với Muc kiểu int và Mo kiểu bool. Cần đổi trạng thái mở thông qua một đối số bool. Chọn gì?", "void SetMo(bool value)", "void SetMuc(int value)", "int GetMuc()", "bool IsMo()", 0],
    [3, 1, 379, "Lớp May có public int P { get; private set; }. Biến m đã được khởi tạo ở lớp khách. Dòng nào hợp lệ trong lớp khách để đọc?", "int k = m.P;", "m.P = 5;", "P = 5;", "P += 1;", 0],
    [3, 1, 380, "Trong lớp X có constructor thể hiện public X(int n). Cần thêm constructor tĩnh. Đâu là khai báo sai vì có kiểu trả về và tên thành viên trùng tên lớp?", "static X() { }", "static X(int n) { }", "static void X() { }", "public static X() { }", 2],
    [3, 1, 381, "Lớp May có static int Tong = 0 và int Dem = 0. Mỗi constructor tăng Tong một lần. Tạo a và b, rồi gán a.Dem = 3. Giá trị a.Dem là bao nhiêu?", "0", "5", "2", "3", 3],
    [3, 1, 382, "Trong cùng assembly, hai namespace N1 và N2 chứa hai lớp độc lập. Ở assembly khác có lớp con của lớp A trong N1. Mức nào giữ dữ liệu trong chính A trong tình huống này?", "public", "private", "internal", "protected", 1],
    [3, 1, 383, "Trong một phương thức thể hiện của lớp L có tham số int n và trường int n. Có phương thức nhận một đối tượng L là Nhan(L). Biểu thức nào truy cập rõ ràng trường bị trùng tên?", "L", "Nhan(this)", "n", "this.n", 3],
    [3, 1, 384, "Trong setter của chỉ mục public string this[int i], giả sử m là mảng string riêng của đối tượng. Dòng nào ghi đúng giá trị vào vị trí khách yêu cầu?", "i = 0;", "return m[i];", "m[i] = value;", "m[0] = value;", 2],
    [3, 1, 385, "Phương thức T có các biến thể độc lập. Trước khi gọi, int a = 4. Mọi lời gọi đều dùng từ khóa tương ứng. Nếu T(out int x) có thân rỗng rồi kết thúc bình thường, điều gì xảy ra?", "Lỗi biên dịch", "5", "8", "4", 0],
    [3, 1, 386, "Lớp May có static int Tong = 0 và int Dem = 0. Mỗi constructor tăng Tong một lần. Tạo a và b, rồi gán a.Dem = 3. Giá trị May.Tong là bao nhiêu?", "5", "0", "2", "3", 2],
    [3, 1, 387, "Xét chỉ mục của lớp B với các chữ ký độc lập. Khai báo nào sai do thiếu tham số chỉ mục?", "this[int i] và this[int i, int j]", "this[int i] và this[string k]", "this[]", "this[int i] và this[int j]", 2],
    [3, 1, 388, "Muốn mô hình hóa một bảng với mỗi đối tượng giữ dữ liệu riêng, có truy cập theo cặp tọa độ. Thành phần nào thích hợp để kiểm tra giá trị mới trước khi ghi?", "Getter của chỉ mục", "Trường mảng thể hiện private", "Setter của chỉ mục", "Chỉ mục this[int hang, int cot]", 2],
    [3, 1, 389, "Cần chọn chữ ký phương thức theo quy ước truy vấn và cập nhật, với Muc kiểu int và Mo kiểu bool. Cần đọc mức mà không nhận đầu vào. Chọn gì?", "void SetMuc(int value)", "int GetMuc()", "bool IsMo()", "void SetMo(bool value)", 1],
    [3, 1, 390, "R khai báo public int this[int i] { get { return i * 3; } }. Không có chỉ mục khác. Tại sao r[2] = 7 không biên dịch?", "6", "0", "9", "Lỗi vì thiếu setter", 3],
    [3, 1, 391, "Trong một phương thức thể hiện của lớp L có tham số int n và trường int n. Có phương thức nhận một đối tượng L là Nhan(L). Ký hiệu nào là tên kiểu và không thay thế cho một đối số đối tượng?", "this.n", "L", "n", "Nhan(this)", 1],
    [3, 1, 392, "Lớp M có int P với get trả _p + 1 và set gán _p = value. Xét các thao tác độc lập. Dòng m.P = 5; gọi gì?", "Setter", "Cả getter rồi setter", "Không accessor nào của P", "Getter", 0],
    [3, 1, 393, "Lớp The có trường private int ma = 2. Constructor nhận int ma. Xét dòng được chọn làm toàn bộ thân constructor. Dòng nào luôn đặt trường thành 0?", "this.ma = ma;", "this.ma = 0;", "ma = ma;", "ma = this.ma;", 1],
    [3, 1, 394, "U là lớp tĩnh có public static int Doi(int n). Bên gọi đã có biến int a. Dòng nào dùng đúng tên lớp, số lượng và kiểu đối số?", "U x = new U();", "U.Doi();", "int k = U.Doi(a);", "int k = U.Doi(\"a\");", 2],
    [3, 1, 395, "Trong setter của chỉ mục public string this[int i], giả sử m là mảng string riêng của đối tượng. Dòng nào ghi giá trị nhưng luôn dùng vị trí đầu tiên?", "return m[i];", "m[0] = value;", "m[i] = value;", "i = 0;", 1],
    [3, 1, 396, "Lớp A khai báo public int X, private int Y, protected int Z và internal int T. Giả sử A là public. Trường nào lớp con ngoài assembly có thể đọc qua this nhưng mã độc lập cùng assembly cũng không được đọc?", "T", "Y", "Z", "X", 2],
    [3, 1, 397, "Một lớp muốn công khai thông tin mà vẫn quản lý cách sửa trạng thái. Khai báo nào để khách gán trực tiếp, bỏ qua mọi kiểm tra trong accessor?", "Trường public", "Property có set kiểm tra điều kiện", "Property chỉ có get", "Trường private", 0],
    [3, 1, 398, "Lớp M có int P với get trả _p và set chỉ gán _p khi value nằm trong [1, 9]. Ban đầu _p = 4. Xét từng phép gán từ trạng thái ban đầu. Sau m.P = 1, đọc m.P được gì?", "8", "1", "9", "4", 1],
    [3, 1, 399, "Lớp A khai báo public int X, private int Y, protected int Z và internal int T. Giả sử A là public. Trường nào lớp độc lập cùng assembly có thể đọc nhưng lớp con ở assembly khác không có quyền theo internal?", "Z", "Y", "T", "X", 2],
    [3, 1, 400, "Lớp May có public int P { get; private set; }. Biến m đã được khởi tạo ở lớp khách. Trong phương thức thể hiện của May, dòng nào vừa đọc vừa ghi P?", "int k = m.P;", "m.P = 5;", "P += 1;", "P = 5;", 2],
    [3, 1, 401, "Xét chỉ mục của lớp B với các chữ ký độc lập. Cặp nào nạp chồng hợp lệ bằng cách thay kiểu chỉ số?", "this[]", "this[int i] và this[int j]", "this[int i] và this[int i, int j]", "this[int i] và this[string k]", 3],
    [3, 1, 402, "Cho int x; là biến cục bộ chưa gán. M(int), R(ref int) và O(out int) đều đã định nghĩa đúng. Dòng nào cố đọc x theo tham trị trước khi x được gán?", "R(x);", "R(ref x);", "M(x);", "O(out x);", 2],
    [3, 1, 403, "Muốn mô hình hóa một bảng với mỗi đối tượng giữ dữ liệu riêng, có truy cập theo cặp tọa độ. Thành phần nào giữ dữ liệu riêng mà mã ngoài không truy cập trực tiếp?", "Chỉ mục this[int hang, int cot]", "Trường mảng thể hiện private", "Setter của chỉ mục", "Getter của chỉ mục", 1],
    [3, 1, 404, "Trong cùng assembly, hai namespace N1 và N2 chứa hai lớp độc lập. Ở assembly khác có lớp con của lớp A trong N1. Mức nào cấp cho lớp con bên ngoài assembly khi nó đọc qua this?", "private", "internal", "protected", "public", 2],
    [3, 1, 405, "Lớp Bo có public static int Tong và public int Rieng. Biến a đã giữ một Bo. Các biểu thức đọc xét ở bên ngoài lớp. Cú pháp nào đọc trường thể hiện hợp lệ?", "Bo.Rieng", "Bo.Tong", "a.Tong", "a.Rieng", 3],
    [3, 1, 406, "R khai báo public int this[int i] { get { return i * 3; } }. Không có chỉ mục khác. Kết quả r[3] là gì?", "0", "Lỗi vì thiếu setter", "9", "6", 2],
    [3, 1, 407, "Trong cùng assembly, hai namespace N1 và N2 chứa hai lớp độc lập. Ở assembly khác có lớp con của lớp A trong N1. Mức nào cấp cho lớp độc lập ở N2 theo ranh giới assembly?", "internal", "public", "protected", "private", 0],
    [3, 1, 408, "Lớp Bo có public static int Tong và public int Rieng. Biến a đã giữ một Bo. Các biểu thức đọc xét ở bên ngoài lớp. Cú pháp nào lỗi vì thiếu thể hiện cho trường không tĩnh?", "a.Tong", "Bo.Tong", "a.Rieng", "Bo.Rieng", 3],
    [3, 1, 409, "B có chỉ mục this[int i], this[string key] và this[int i, int j], đều có getter. Biểu thức nào chọn chỉ mục hai tham số nguyên?", "b[2, \"2\"]", "b[\"2\"]", "b[2, 2]", "b[2]", 2],
    [3, 1, 410, "Muốn mô hình hóa một bảng với mỗi đối tượng giữ dữ liệu riêng, có truy cập theo cặp tọa độ. Thành phần nào cung cấp cú pháp bang[hang, cot] cho khách?", "Chỉ mục this[int hang, int cot]", "Trường mảng thể hiện private", "Setter của chỉ mục", "Getter của chỉ mục", 0],
    [3, 1, 411, "Cần chọn nơi đặt từng quy tắc trong một lớp đóng gói dữ liệu. Từ chối giá trị âm trong mọi lần gán qua property. Đặt ở đâu?", "Trường private", "Setter của property", "Constructor", "Getter của property", 1],
    [3, 1, 412, "R khai báo public int this[int i] { get { return i * 3; } }. Không có chỉ mục khác. Kết quả r[0] là gì?", "9", "Lỗi vì thiếu setter", "0", "6", 2],
    [3, 1, 413, "Cần chọn chữ ký phương thức theo quy ước truy vấn và cập nhật, với Muc kiểu int và Mo kiểu bool. Cần ghi mức và không trả kết quả. Chọn gì?", "int GetMuc()", "void SetMo(bool value)", "bool IsMo()", "void SetMuc(int value)", 3],
    [3, 1, 414, "Lớp M có int P với get trả _p và set chỉ gán _p khi value nằm trong [1, 9]. Ban đầu _p = 4. Xét từng phép gán từ trạng thái ban đầu. Sau m.P = 8, đọc m.P được gì?", "4", "1", "9", "8", 3],
    [3, 1, 415, "Lớp The có trường private int ma = 2. Constructor nhận int ma. Xét dòng được chọn làm toàn bộ thân constructor. Dòng nào sao chép giá trị trường vào tham số cục bộ?", "ma = ma;", "this.ma = 0;", "ma = this.ma;", "this.ma = ma;", 2],
    [3, 1, 416, "Phương thức T có các biến thể độc lập. Trước khi gọi, int a = 4. Mọi lời gọi đều dùng từ khóa tương ứng. Nếu T(int x) chỉ thực hiện x++, a có giá trị gì sau lời gọi?", "5", "4", "Lỗi biên dịch", "8", 1],
    [3, 1, 417, "Một lớp muốn công khai thông tin mà vẫn quản lý cách sửa trạng thái. Muốn khách chỉ đọc giá trị đã tính từ các trường khác, chọn giao diện công khai nào?", "Property chỉ có get", "Property có set kiểm tra điều kiện", "Trường public", "Trường private", 0],
    [3, 1, 418, "Lớp M có int P với get trả _p + 1 và set gán _p = value. Xét các thao tác độc lập. Nếu trong lớp chỉ chạy _p = 5;, nó gọi accessor nào?", "Không accessor nào của P", "Setter", "Cả getter rồi setter", "Getter", 0],
    [3, 1, 419, "U là lớp tĩnh có public static int Doi(int n). Bên gọi đã có biến int a. Dòng nào sai kiểu đối số?", "int k = U.Doi(a);", "int k = U.Doi(\"a\");", "U.Doi();", "U x = new U();", 1],
    [3, 1, 420, "Lớp May có static int Tong = 0 và int Dem = 0. Mỗi constructor tăng Tong một lần. Tạo a và b, rồi gán a.Dem = 3. Nếu sau đó chạy May.Tong += a.Dem;, Tong bằng bao nhiêu?", "2", "3", "0", "5", 3],
    [3, 1, 421, "Muốn mô hình hóa một bảng với mỗi đối tượng giữ dữ liệu riêng, có truy cập theo cặp tọa độ. Thành phần nào lấy dữ liệu theo tọa độ để trả về cho người đọc?", "Chỉ mục this[int hang, int cot]", "Getter của chỉ mục", "Setter của chỉ mục", "Trường mảng thể hiện private", 1],
    [3, 1, 422, "Lớp Bo có public static int Tong và public int Rieng. Biến a đã giữ một Bo. Các biểu thức đọc xét ở bên ngoài lớp. Cú pháp nào lỗi vì truy cập trường tĩnh qua thể hiện?", "Bo.Tong", "Bo.Rieng", "a.Tong", "a.Rieng", 2],
    [3, 1, 423, "Xét chỉ mục của lớp B với các chữ ký độc lập. Cặp nào vẫn trùng chữ ký vì chỉ thay tên tham số?", "this[int i] và this[int j]", "this[int i] và this[string k]", "this[int i] và this[int i, int j]", "this[]", 0],
    [3, 1, 424, "B có chỉ mục this[int i], this[string key] và this[int i, int j], đều có getter. Biểu thức nào không phù hợp với ba chữ ký đã nêu?", "b[2, 2]", "b[2]", "b[\"2\"]", "b[2, \"2\"]", 3],
    [3, 1, 425, "Cho int x; là biến cục bộ chưa gán. M(int), R(ref int) và O(out int) đều đã định nghĩa đúng. Dòng nào bỏ sót từ khóa ref ở nơi gọi?", "R(ref x);", "R(x);", "O(out x);", "M(x);", 1],
    [3, 1, 426, "Một lớp muốn công khai thông tin mà vẫn quản lý cách sửa trạng thái. Khai báo nào thích hợp để giữ dữ liệu thô bên trong?", "Trường private", "Trường public", "Property có set kiểm tra điều kiện", "Property chỉ có get", 0],
    [3, 1, 427, "Lớp The có trường private int ma = 2. Constructor nhận int ma. Xét dòng được chọn làm toàn bộ thân constructor. Dòng nào lưu đối số vào trường?", "ma = ma;", "this.ma = ma;", "this.ma = 0;", "ma = this.ma;", 1],
    [3, 1, 428, "Trong lớp X có constructor thể hiện public X(int n). Cần thêm constructor tĩnh. Đâu là cú pháp đúng của constructor tĩnh?", "public static X() { }", "static X(int n) { }", "static void X() { }", "static X() { }", 3],
    [3, 1, 429, "K là lớp có int this[int i] đọc và ghi mảng riêng. Biến k đã giữ đối tượng K. Dòng nào dùng nhầm dấu ngoặc của lời gọi phương thức?", "k[0] = 6;", "K[0]", "int n = k[0];", "k(0);", 3],
    [3, 1, 430, "B có chỉ mục this[int i], this[string key] và this[int i, int j], đều có getter. Biểu thức nào chọn chỉ mục theo khóa chuỗi?", "b[\"2\"]", "b[2]", "b[2, 2]", "b[2, \"2\"]", 0],
    [3, 1, 431, "Lớp A khai báo public int X, private int Y, protected int Z và internal int T. Giả sử A là public. Trường nào có thể đọc qua A từ mã ngoài assembly không kế thừa?", "T", "X", "Z", "Y", 1],
    [3, 1, 432, "R khai báo public int this[int i] { get { return i * 3; } }. Không có chỉ mục khác. Kết quả r[2] là gì?", "0", "6", "Lỗi vì thiếu setter", "9", 1],
    [3, 1, 433, "Cần chọn chữ ký phương thức theo quy ước truy vấn và cập nhật, với Muc kiểu int và Mo kiểu bool. Cần truy vấn trạng thái mở. Chọn gì?", "bool IsMo()", "void SetMo(bool value)", "int GetMuc()", "void SetMuc(int value)", 0],
    [3, 1, 434, "Trong một phương thức thể hiện của lớp L có tham số int n và trường int n. Có phương thức nhận một đối tượng L là Nhan(L). Biểu thức nào đọc tham số theo quy tắc ưu tiên tên cục bộ?", "n", "Nhan(this)", "L", "this.n", 0],
    [3, 1, 435, "Một lớp muốn công khai thông tin mà vẫn quản lý cách sửa trạng thái. Muốn khách gán theo cú pháp property nhưng chỉ nhận giá trị hợp lệ, chọn gì?", "Property chỉ có get", "Trường public", "Property có set kiểm tra điều kiện", "Trường private", 2],
    [3, 1, 436, "Trong setter của chỉ mục public string this[int i], giả sử m là mảng string riêng của đối tượng. Dòng nào chỉ đổi tham số chỉ số, không ghi mảng?", "i = 0;", "return m[i];", "m[0] = value;", "m[i] = value;", 0],
    [3, 1, 437, "Lớp M có int P với get trả _p và set chỉ gán _p khi value nằm trong [1, 9]. Ban đầu _p = 4. Xét từng phép gán từ trạng thái ban đầu. Sau m.P = 0, đọc m.P được gì?", "1", "8", "4", "9", 2],
    [3, 1, 438, "U là lớp tĩnh có public static int Doi(int n). Bên gọi đã có biến int a. Dòng nào cố khai báo và tạo đối tượng của lớp tĩnh?", "U.Doi();", "int k = U.Doi(a);", "U x = new U();", "int k = U.Doi(\"a\");", 2],
    [3, 1, 439, "Lớp May có public int P { get; private set; }. Biến m đã được khởi tạo ở lớp khách. Trong phương thức thể hiện của May, dòng nào ghi mà không cần đọc P trước?", "P = 5;", "m.P = 5;", "int k = m.P;", "P += 1;", 0],
    [3, 1, 440, "Lớp A khai báo public int X, private int Y, protected int Z và internal int T. Giả sử A là public. Trường nào A có thể tự đọc nhưng lớp dẫn xuất thông thường không thể truy cập trực tiếp?", "X", "T", "Y", "Z", 2],
    [3, 1, 441, "Phương thức T có các biến thể độc lập. Trước khi gọi, int a = 4. Mọi lời gọi đều dùng từ khóa tương ứng. Nếu T(out int x) chỉ thực hiện x = 8, a có giá trị gì?", "5", "4", "Lỗi biên dịch", "8", 3],
    [3, 1, 442, "Cần chọn nơi đặt từng quy tắc trong một lớp đóng gói dữ liệu. Giữ giá trị làm việc nội bộ qua nhiều lần gọi. Đặt ở đâu?", "Getter của property", "Trường private", "Setter của property", "Constructor", 1],
    [3, 1, 443, "K là lớp có int this[int i] đọc và ghi mảng riêng. Biến k đã giữ đối tượng K. Dòng nào thực thi getter của chỉ mục?", "int n = k[0];", "K[0]", "k[0] = 6;", "k(0);", 0],
    [3, 1, 444, "Trong setter của chỉ mục public string this[int i], giả sử m là mảng string riêng của đối tượng. Dòng nào dùng cho getter tương ứng thay vì setter?", "m[0] = value;", "i = 0;", "m[i] = value;", "return m[i];", 3],
    [3, 1, 445, "Một lớp đã có thể truy cập. Cần chọn mức truy cập hẹp nhất trong bốn lựa chọn để đáp ứng từng yêu cầu. Chỉ mã bên trong kiểu khai báo cần dùng trường. Chọn gì?", "internal", "public", "protected", "private", 3],
    [3, 1, 446, "U là lớp tĩnh có public static int Doi(int n). Bên gọi đã có biến int a. Dòng nào sai số lượng đối số?", "int k = U.Doi(\"a\");", "U.Doi();", "U x = new U();", "int k = U.Doi(a);", 1],
    [3, 1, 447, "Cần chọn nơi đặt từng quy tắc trong một lớp đóng gói dữ liệu. Thiết lập điều kiện ban đầu ngay khi new và trước khi khách gọi phương thức. Đặt ở đâu?", "Setter của property", "Getter của property", "Trường private", "Constructor", 3],
    [3, 1, 448, "Lớp M có int P với get trả _p + 1 và set gán _p = value. Xét các thao tác độc lập. Dòng int t = m.P; gọi gì?", "Getter", "Cả getter rồi setter", "Setter", "Không accessor nào của P", 0],
    [3, 1, 449, "Cần chọn nơi đặt từng quy tắc trong một lớp đóng gói dữ liệu. Tính nhãn dựa trên trạng thái mỗi lần khách đọc. Đặt ở đâu?", "Trường private", "Constructor", "Setter của property", "Getter của property", 3],
    [3, 1, 450, "Trong cùng assembly, hai namespace N1 và N2 chứa hai lớp độc lập. Ở assembly khác có lớp con của lớp A trong N1. Mức nào cho cả hai nhóm truy cập rộng nhất nếu A là public?", "internal", "private", "protected", "public", 3],
    [3, 1, 451, "Lớp May có static int Tong = 0 và int Dem = 0. Mỗi constructor tăng Tong một lần. Tạo a và b, rồi gán a.Dem = 3. Giá trị b.Dem là bao nhiêu?", "5", "0", "3", "2", 1],
    [3, 1, 452, "Phương thức T có các biến thể độc lập. Trước khi gọi, int a = 4. Mọi lời gọi đều dùng từ khóa tương ứng. Nếu T(ref int x) chỉ thực hiện x++, a có giá trị gì?", "Lỗi biên dịch", "8", "4", "5", 3],
    [3, 1, 453, "K là lớp có int this[int i] đọc và ghi mảng riêng. Biến k đã giữ đối tượng K. Dòng nào thực thi setter của chỉ mục?", "k[0] = 6;", "int n = k[0];", "K[0]", "k(0);", 0],
    [3, 1, 454, "Trong lớp X có constructor thể hiện public X(int n). Cần thêm constructor tĩnh. Đâu là cú pháp lỗi vì constructor tĩnh có chỉ thị truy cập?", "static X() { }", "static X(int n) { }", "static void X() { }", "public static X() { }", 3],
    [3, 1, 455, "Cho int x; là biến cục bộ chưa gán. M(int), R(ref int) và O(out int) đều đã định nghĩa đúng. Dòng nào đúng từ khóa nhưng vi phạm điều kiện biến ref đã được gán?", "R(x);", "M(x);", "O(out x);", "R(ref x);", 3],
    [3, 1, 456, "Lớp M có int P với get trả _p + 1 và set gán _p = value. Xét các thao tác độc lập. Dòng m.P += 5; gọi gì theo thứ tự?", "Không accessor nào của P", "Cả getter rồi setter", "Setter", "Getter", 1],
    [4, 1, 457, "Giả sử a có kiểu khai báo A, B : A, và B có thêm N(). Xét độc lập từng dòng, với a đang giữ một B. Dòng nào chỉ sao chép tham chiếu giữa hai biến kiểu A?", "B b = (B)a;", "A x = a;", "B b = a;", "a.N();", 1],
    [4, 1, 458, "A có trường private _m, phương thức protected SetM(int m) kiểm tra m rồi cập nhật _m, và public GetM(). Cách đọc nào vi phạm quyền private ở mã không liên quan?", "Đọc trực tiếp _m từ lớp khách", "Gọi SetM trong B", "Gọi GetM từ lớp khách", "Gán trực tiếp _m trong B", 0],
    [4, 1, 459, "A có A() và A(int n). B : A có B() và B(int n) : base(n). Xét các thao tác riêng. Thân constructor nào chạy khi new A()?", "Thân A(int) rồi thân B(int)", "Chỉ thân A()", "Thân A() rồi thân B()", "Chỉ thân A(int)", 1],
    [4, 1, 460, "A khai báo public int M() trả 3; B khai báo new int M() trả base.M() + 2. a kiểu A và b kiểu B cùng giữ một B. a.M() trả gì?", "3", "8", "10", "5", 0],
    [4, 1, 461, "A khai báo public int M() trả 3; B khai báo new int M() trả base.M() + 2. a kiểu A và b kiểu B cùng giữ một B. b.M() trả gì?", "10", "3", "5", "8", 2],
    [4, 1, 462, "B có thêm một hành vi chỉ dành cho B. Hai lớp B, C cần chia sẻ hành vi gốc và khởi tạo chung từ A. Lựa chọn nào chuyển dữ liệu bắt buộc sang constructor cơ sở?", "Dùng một biến kiểu A", "Đặt hành vi chung trong A", "Gọi : base(...)", "Đặt hành vi riêng trong B", 2],
    [4, 1, 463, "B có thêm một hành vi chỉ dành cho B. Hai lớp B, C cần chia sẻ hành vi gốc và khởi tạo chung từ A. Lựa chọn nào cho phép một biến giữ đối tượng thuộc B hoặc C?", "Dùng một biến kiểu A", "Gọi : base(...)", "Đặt hành vi chung trong A", "Đặt hành vi riêng trong B", 0],
    [4, 1, 464, "Giả sử a có kiểu khai báo A, B : A, và B có thêm N(). Xét độc lập từng dòng, với a đang giữ một B. Dòng nào cố gọi thành viên riêng của B ngay trên biến A?", "B b = a;", "A x = a;", "B b = (B)a;", "a.N();", 3],
    [4, 1, 465, "C : B và B : A. A, B, C lần lượt khai báo thành viên public M(), N(), P() riêng biệt. Thành viên nào chỉ C khai báo?", "M", "Không thành viên nào", "P", "N", 2],
    [4, 1, 466, "A có public void M(). B : A khai báo public new void M(). Biến b có kiểu B và a có kiểu A, cùng trỏ đến một B. Ở lớp khách, lời gọi nào chọn B.M() qua kiểu khai báo của biến?", "b.M()", "a.M()", "base.M()", "new B()", 0],
    [4, 1, 467, "Giả sử a có kiểu khai báo A, B : A, và B có thêm N(). Xét độc lập từng dòng, với a đang giữ một B. Dòng nào chuyển về kiểu B một cách tường minh?", "B b = (B)a;", "B b = a;", "A x = a;", "a.N();", 0],
    [4, 1, 468, "A có private int x, public int Doc() trả x và protected int y. B : A có public int z. Thành viên nào B không thể đọc trực tiếp?", "x", "z", "y", "Doc()", 0],
    [4, 1, 469, "Lớp A có phương thức public M(), B thêm public N() và không khai báo lại M(). Với A a = new B(); B b = (B)a; Dòng nào gọi được M qua tham chiếu lớp cơ sở?", "b.N()", "b.M()", "a.N()", "a.M()", 3],
    [4, 1, 470, "A có public void M(). B : A khai báo public new void M(). Biến b có kiểu B và a có kiểu A, cùng trỏ đến một B. Trong phương thức của B, cú pháp nào gọi rõ phiên bản A.M()?", "new B()", "b.M()", "base.M()", "a.M()", 2],
    [4, 1, 471, "A và B là lớp, B kế thừa A. I và J là giao diện; các nghĩa vụ triển khai được đáp ứng. Khai báo nào làm A trở thành lớp cơ sở gián tiếp của C?", "class C : A, I, J", "class C : B", "interface K : I, J", "class C : A, B", 1],
    [4, 1, 472, "Lớp A có phương thức public M(), B thêm public N() và không khai báo lại M(). Với A a = new B(); B b = (B)a; Dòng nào bị từ chối vì kiểu khai báo A không có N?", "b.N()", "b.M()", "a.N()", "a.M()", 2],
    [4, 1, 473, "A khai báo public A(int n) và không có constructor khác. Xét riêng mỗi constructor của B : A. Khai báo nào lỗi vì ngầm gọi base() không tồn tại?", "public B() : base(4) { }", "public B(int n) : base(n) { }", "public B() : base(\"4\") { }", "public B(int n) { }", 3],
    [4, 1, 474, "A và B : A đều khai báo finalizer. Mỗi constructor của B gọi constructor A hợp lệ. Nhận định nào đúng khi runtime thực hiện chuỗi finalization của B?", "Finalizer B trước A", "Thân constructor A trước B", "Thân constructor B trước A", "Finalizer A trước B", 0],
    [4, 1, 475, "C : B và B : A. A, B, C lần lượt khai báo thành viên public M(), N(), P() riêng biệt. Thành viên nào C thừa hưởng trực tiếp từ B?", "M", "N", "P", "Không thành viên nào", 1],
    [4, 1, 476, "A có public int X = 2. B : A khai báo public new int X = 5. a và b cùng giữ một B với kiểu khai báo A và B. Sau b.X = 8, đọc a.X + b.X được gì?", "2", "7", "10", "5", 2],
    [4, 1, 477, "Lớp A có protected int _m và constructor A(int m) gán _m = m. B có B(int n) : base(n + 1). Trong B, giá trị đọc từ _m sau new B(3) là gì?", "3", "Lỗi truy cập", "4", "7", 2],
    [4, 1, 478, "C : B và B : A. A, B, C lần lượt khai báo thành viên public M(), N(), P() riêng biệt. Thành viên nào C thừa hưởng gián tiếp từ A?", "Không thành viên nào", "M", "P", "N", 1],
    [4, 1, 479, "A và B : A đều khai báo finalizer. Mỗi constructor của B gọi constructor A hợp lệ. Nhận định sai nào đảo thứ tự hai thân constructor?", "Finalizer B trước A", "Finalizer A trước B", "Thân constructor B trước A", "Thân constructor A trước B", 2],
    [4, 1, 480, "A khai báo public A(int n) và không có constructor khác. Xét riêng mỗi constructor của B : A. Cách nào chuyển nguyên đối số của B xuống A?", "public B(int n) { }", "public B() : base(\"4\") { }", "public B(int n) : base(n) { }", "public B() : base(4) { }", 2],
    [4, 1, 481, "A có trường private _m, phương thức protected SetM(int m) kiểm tra m rồi cập nhật _m, và public GetM(). Lớp khách muốn đọc mức theo giao diện công khai nên làm gì?", "Đọc trực tiếp _m từ lớp khách", "Gán trực tiếp _m trong B", "Gọi SetM trong B", "Gọi GetM từ lớp khách", 3],
    [4, 1, 482, "B có thêm một hành vi chỉ dành cho B. Hai lớp B, C cần chia sẻ hành vi gốc và khởi tạo chung từ A. Lựa chọn nào giúp tránh sao chép cùng một phần cài đặt sang B và C?", "Dùng một biến kiểu A", "Đặt hành vi chung trong A", "Gọi : base(...)", "Đặt hành vi riêng trong B", 1],
    [4, 1, 483, "A có private int x, public int Doc() trả x và protected int y. B : A có public int z. Thành viên nào B có thể đọc nhưng mã độc lập không thể truy cập qua b?", "x", "z", "Doc()", "y", 3],
    [4, 1, 484, "Lớp A có protected int _m và constructor A(int m) gán _m = m. B có B(int n) : base(n + 1). Trong B, giá trị đọc từ _m sau new B(6) là gì?", "7", "Lỗi truy cập", "3", "4", 0],
    [4, 1, 485, "Lớp A có protected int _m và constructor A(int m) gán _m = m. B có B(int n) : base(n + 1). Mã khách độc lập đọc trực tiếp b._m thì sao?", "4", "7", "3", "Lỗi truy cập", 3],
    [4, 1, 486, "A và B là lớp, B kế thừa A. I và J là giao diện; các nghĩa vụ triển khai được đáp ứng. Khai báo nào kết hợp hai hợp đồng ở cấp giao diện?", "interface K : I, J", "class C : B", "class C : A, I, J", "class C : A, B", 0],
    [4, 1, 487, "A có A() và A(int n). B : A có B() và B(int n) : base(n). Xét các thao tác riêng. Thân constructor nào chạy khi new A(3)?", "Chỉ thân A()", "Thân A() rồi thân B()", "Chỉ thân A(int)", "Thân A(int) rồi thân B(int)", 2],
    [4, 1, 488, "A khai báo public A(int n) và không có constructor khác. Xét riêng mỗi constructor của B : A. Cách nào cho khách tạo B không đối số mà vẫn khởi tạo A bằng 4?", "public B(int n) { }", "public B(int n) : base(n) { }", "public B() : base(\"4\") { }", "public B() : base(4) { }", 3],
    [4, 1, 489, "A khai báo public A(int n) và không có constructor khác. Xét riêng mỗi constructor của B : A. Cách nào lỗi do đối số của base sai kiểu?", "public B() : base(\"4\") { }", "public B(int n) { }", "public B(int n) : base(n) { }", "public B() : base(4) { }", 0],
    [4, 1, 490, "A có private int x, public int Doc() trả x và protected int y. B : A có public int z. Thành viên nào là trường mới chỉ B khai báo?", "x", "Doc()", "z", "y", 2],
    [4, 1, 491, "A khai báo public int M() trả 3; B khai báo new int M() trả base.M() + 2. a kiểu A và b kiểu B cùng giữ một B. b.M() + b.M() trả gì?", "3", "8", "5", "10", 3],
    [4, 1, 492, "A có public int X = 2. B : A khai báo public new int X = 5. a và b cùng giữ một B với kiểu khai báo A và B. Đọc a.X được gì?", "7", "2", "5", "10", 1],
    [4, 1, 493, "Lớp A có protected int _m và constructor A(int m) gán _m = m. B có B(int n) : base(n + 1). Trong B, giá trị đọc từ _m sau new B(2) là gì?", "4", "7", "Lỗi truy cập", "3", 3],
    [4, 1, 494, "A có A() và A(int n). B : A có B() và B(int n) : base(n). Xét các thao tác riêng. Thứ tự thân constructor khi new B() là gì?", "Chỉ thân A()", "Thân A(int) rồi thân B(int)", "Chỉ thân A(int)", "Thân A() rồi thân B()", 3],
    [4, 1, 495, "Lớp A có public void M(). Các biến thể B : A được xét riêng. Khai báo nào bổ sung phương thức có tên khác?", "public new void M() { }", "public void N() { }", "public override void M() { }", "public void M() { }", 1],
    [4, 1, 496, "A và B là lớp, B kế thừa A. I và J là giao diện; các nghĩa vụ triển khai được đáp ứng. Khai báo nào dùng A trực tiếp và thực thi hai giao diện?", "class C : A, B", "class C : A, I, J", "interface K : I, J", "class C : B", 1],
    [4, 1, 497, "A khai báo public int M() trả 3; B khai báo new int M() trả base.M() + 2. a kiểu A và b kiểu B cùng giữ một B. a.M() + b.M() trả gì?", "10", "5", "3", "8", 3],
    [4, 1, 498, "Lớp A có phương thức public M(), B thêm public N() và không khai báo lại M(). Với A a = new B(); B b = (B)a; Dòng nào gọi được phương thức thừa hưởng M qua biến b?", "a.N()", "b.N()", "b.M()", "a.M()", 2],
    [4, 1, 499, "A có trường private _m, phương thức protected SetM(int m) kiểm tra m rồi cập nhật _m, và public GetM(). Cách sửa nào vi phạm quyền private dù mã nằm ở lớp dẫn xuất?", "Gán trực tiếp _m trong B", "Gọi GetM từ lớp khách", "Đọc trực tiếp _m từ lớp khách", "Gọi SetM trong B", 0],
    [4, 1, 500, "A và B là lớp, B kế thừa A. I và J là giao diện; các nghĩa vụ triển khai được đáp ứng. Khai báo nào cố dùng hai lớp cơ sở trực tiếp?", "interface K : I, J", "class C : A, B", "class C : B", "class C : A, I, J", 1],
    [4, 1, 501, "A có trường private _m, phương thức protected SetM(int m) kiểm tra m rồi cập nhật _m, và public GetM(). B muốn cập nhật đúng quy tắc của A nên làm gì?", "Đọc trực tiếp _m từ lớp khách", "Gán trực tiếp _m trong B", "Gọi GetM từ lớp khách", "Gọi SetM trong B", 3],
    [4, 1, 502, "Lớp A có phương thức public M(), B thêm public N() và không khai báo lại M(). Với A a = new B(); B b = (B)a; Dòng nào gọi được thành viên riêng của B qua biến b?", "a.M()", "b.M()", "b.N()", "a.N()", 2],
    [4, 1, 503, "A và B : A đều khai báo finalizer. Mỗi constructor của B gọi constructor A hợp lệ. Nhận định sai nào đảo thứ tự hai finalizer?", "Thân constructor B trước A", "Thân constructor A trước B", "Finalizer B trước A", "Finalizer A trước B", 3],
    [4, 1, 504, "Lớp A có public void M(). Các biến thể B : A được xét riêng. Khai báo nào che khuất nhưng thường kèm cảnh báo?", "public new void M() { }", "public override void M() { }", "public void N() { }", "public void M() { }", 3],
    [4, 1, 505, "B có thêm một hành vi chỉ dành cho B. Hai lớp B, C cần chia sẻ hành vi gốc và khởi tạo chung từ A. Lựa chọn nào giữ hành vi đặc thù ở đúng lớp?", "Đặt hành vi riêng trong B", "Gọi : base(...)", "Dùng một biến kiểu A", "Đặt hành vi chung trong A", 0],
    [4, 1, 506, "Lớp A có public void M(). Các biến thể B : A được xét riêng. Khai báo nào lỗi vì A.M không phải phương thức ảo?", "public new void M() { }", "public override void M() { }", "public void N() { }", "public void M() { }", 1],
    [4, 1, 507, "A có public void M(). B : A khai báo public new void M(). Biến b có kiểu B và a có kiểu A, cùng trỏ đến một B. Ở lớp khách, lời gọi nào chọn A.M() qua kiểu khai báo của biến?", "b.M()", "a.M()", "base.M()", "new B()", 1],
    [4, 1, 508, "A có private int x, public int Doc() trả x và protected int y. B : A có public int z. B dùng thành viên nào để lấy giá trị x qua cách A cho phép?", "z", "x", "y", "Doc()", 3],
    [4, 1, 509, "C : B và B : A. A, B, C lần lượt khai báo thành viên public M(), N(), P() riêng biệt. Trong ba thành viên, có thành viên nào C không thể gọi chỉ vì đã đi qua hai cấp kế thừa?", "Không thành viên nào", "M", "P", "N", 0],
    [4, 1, 510, "Giả sử a có kiểu khai báo A, B : A, và B có thêm N(). Xét độc lập từng dòng, với a đang giữ một B. Dòng nào cần chuyển từ A xuống B nhưng thiếu phép ép kiểu?", "a.N();", "A x = a;", "B b = a;", "B b = (B)a;", 2],
    [4, 1, 511, "A có public void M(). B : A khai báo public new void M(). Biến b có kiểu B và a có kiểu A, cùng trỏ đến một B. Biểu thức nào tạo thể hiện mới và dùng new theo nghĩa khác?", "a.M()", "b.M()", "new B()", "base.M()", 2],
    [4, 1, 512, "Lớp A có public void M(). Các biến thể B : A được xét riêng. Khai báo nào che khuất có chủ ý và không phát cảnh báo do thiếu new?", "public void N() { }", "public new void M() { }", "public void M() { }", "public override void M() { }", 1],
    [4, 1, 513, "A có public int X = 2. B : A khai báo public new int X = 5. a và b cùng giữ một B với kiểu khai báo A và B. Đọc b.X được gì?", "2", "5", "10", "7", 1],
    [4, 1, 514, "A và B : A đều khai báo finalizer. Mỗi constructor của B gọi constructor A hợp lệ. Nhận định nào đúng với thứ tự thân constructor khi new B() hợp lệ?", "Thân constructor A trước B", "Finalizer B trước A", "Thân constructor B trước A", "Finalizer A trước B", 0],
    [4, 1, 515, "A có public int X = 2. B : A khai báo public new int X = 5. a và b cùng giữ một B với kiểu khai báo A và B. Tính a.X + b.X được gì?", "10", "7", "2", "5", 1],
    [4, 1, 516, "A có A() và A(int n). B : A có B() và B(int n) : base(n). Xét các thao tác riêng. Thứ tự thân constructor khi new B(3) là gì?", "Thân A(int) rồi thân B(int)", "Thân A() rồi thân B()", "Chỉ thân A(int)", "Chỉ thân A()", 0],
    [5, 1, 517, "I1 và I2 là hai giao diện không liên quan, đều khai báo void M(). Xét thực thi ngầm định. Khai báo nào có thể đáp ứng đồng thời hai hợp đồng giống nhau?", "Một public void M(int n)", "Một public static void M()", "Một public void M()", "Một private void M()", 2],
    [5, 1, 518, "Lớp M có hai trường, một int N và một tham chiếu K. Trong M tạo bản sao bằng MemberwiseClone(). MemberwiseClone tạo ra gì ở cấp đối tượng ngoài?", "Đối tượng M mới", "Kiểu thực của bản sao vẫn là M", "Hai trường K ban đầu trỏ cùng đối tượng", "Giá trị N ban đầu được sao chép", 0],
    [5, 1, 519, "Lớp M có hai trường, một int N và một tham chiếu K. Trong M tạo bản sao bằng MemberwiseClone(). Khi gọi GetType() trên bản sao, điều gì đúng nếu đối tượng gốc đúng kiểu M?", "Kiểu thực của bản sao vẫn là M", "Đối tượng M mới", "Giá trị N ban đầu được sao chép", "Hai trường K ban đầu trỏ cùng đối tượng", 0],
    [5, 1, 520, "Hợp đồng I có M(). Hai lớp A và B thực thi I riêng, M lần lượt trả 2 và 5. I x = new A(); x.M() trả gì?", "10", "5", "2", "7", 2],
    [5, 1, 521, "A trừu tượng có public abstract int Doc(). B là lớp cụ thể kế thừa A. Khai báo nào có override nhưng sai kiểu trả về?", "public override int Doc() { return 1; }", "public int Doc(int n) { return n; }", "public new int Doc() { return 1; }", "public override void Doc() { }", 3],
    [5, 1, 522, "P là lớp thường có M() virtual và N() không ảo. Q : P có override M() và new N(). p kiểu P, q kiểu Q, cả hai giữ cùng Q. p.M() vào thân nào?", "P.N()", "Q.M()", "P.M()", "Q.N()", 1],
    [5, 1, 523, "Cho interface I { int Doc(); }. Mọi lựa chọn là thành viên duy nhất tương ứng trong một lớp cụ thể : I. Khai báo nào bị từ chối vì mức truy cập khi triển khai ngầm định?", "private int Doc() { return 1; }", "public int Doc() { return 1; }", "public static int Doc() { return 1; }", "public int Doc(int n) { return n; }", 0],
    [5, 1, 524, "I1 và I2 là hai giao diện không liên quan, đều khai báo void M(). Xét thực thi ngầm định. Khai báo nào có đúng chữ ký tham số nhưng thuộc kiểu thay vì thể hiện?", "Một private void M()", "Một public void M()", "Một public static void M()", "Một public void M(int n)", 2],
    [5, 1, 525, "Lớp abstract A : I có abstract void M() đúng chữ ký I.M. B : A chưa khai báo gì. Cách nào lỗi vì B cụ thể nhưng chưa thực thi phương thức trừu tượng?", "class B : A { }", "abstract class B : A { }", "I x = new A();", "class B : A { public override void M() { } }", 0],
    [5, 1, 526, "I có int Muc { get; } và J có string this[int i] { get; }. Lớp C thực thi cả hai. Với J j = new C(), dòng nào đọc đúng chỉ mục?", "string s = j[0];", "int n = i.Muc;", "j[0] = \"a\";", "i.Muc = 4;", 0],
    [5, 1, 527, "Các thành viên dưới đây được xem xét độc lập trong lớp cơ sở A không tĩnh. Khai báo nào gọi qua tên A mà không cần tạo đối tượng?", "public virtual int F() { return 2; }", "public abstract int F();", "public int F() { return 2; }", "public static int F() { return 2; }", 3],
    [5, 1, 528, "A có virtual string MoTa() trả \"A\". B : A có override trả \"B\". C : B không override. D : C override trả \"D\". A a = new A(); a.MoTa() trả gì?", "\"D\"", "\"B\"", "Lỗi tạo đối tượng", "\"A\"", 3],
    [5, 1, 529, "A khai báo virtual int M() trả 1. B có new int M() trả 2. C có override int M() trả 3 và kế thừa A trực tiếp. Nếu tham chiếu được khai báo kiểu một giao diện I mà không có M, i.M() dẫn đến gì?", "1", "3", "2", "Lỗi vì không tìm thấy M", 3],
    [5, 1, 530, "Trong mô hình giao diện chỉ khai báo của bài giảng, chọn cách phù hợp nhất với từng yêu cầu. Hai lớp không có cùng lớp cơ sở nghiệp vụ cần chia sẻ một hợp đồng. Dùng gì?", "Phương thức abstract", "Phương thức virtual", "Giao diện", "Lớp trừu tượng", 2],
    [5, 1, 531, "Cho interface I { int Doc(); }. Mọi lựa chọn là thành viên duy nhất tương ứng trong một lớp cụ thể : I. Khai báo nào sai vì hợp đồng yêu cầu thao tác thể hiện?", "public int Doc(int n) { return n; }", "public int Doc() { return 1; }", "public static int Doc() { return 1; }", "private int Doc() { return 1; }", 2],
    [5, 1, 532, "I là giao diện có void Chay(). Lớp M thực thi I bằng public void Chay() và có public void Dung(). Sau I i = new M(), lời gọi nào hợp lệ trên i?", "new I()", "m.Dung()", "i.Dung()", "i.Chay()", 3],
    [5, 1, 533, "Hợp đồng I có M(). Hai lớp A và B thực thi I riêng, M lần lượt trả 2 và 5. Cộng kết quả gọi M trên một A và một B qua hai biến I được gì?", "5", "10", "7", "2", 2],
    [5, 1, 534, "A có virtual int M() trả 1. B : A override M() trả 2. C : A không ghi đè. new A().M() + new B().M() bằng bao nhiêu?", "3", "2", "1", "4", 0],
    [5, 1, 535, "Hợp đồng I có M(). Hai lớp A và B thực thi I riêng, M lần lượt trả 2 và 5. Gọi M hai lần trên một B qua biến I rồi cộng hai kết quả được gì?", "5", "10", "2", "7", 1],
    [5, 1, 536, "I là giao diện có void Chay(). Lớp M thực thi I bằng public void Chay() và có public void Dung(). Nếu m kiểu M, lời gọi nào dùng thành viên ngoài hợp đồng I?", "m.Dung()", "i.Chay()", "new I()", "i.Dung()", 0],
    [5, 1, 537, "A trừu tượng có abstract int M(), virtual int N() trả 2 và phương thức thường P() trả 3. Thành viên nào có bản mặc định nhưng lớp con có thể ghi đè?", "Constructor của A", "M", "N", "P", 2],
    [5, 1, 538, "I1 và I2 là hai giao diện không liên quan, đều khai báo void M(). Xét thực thi ngầm định. Khai báo nào cần một đối số mà hợp đồng không yêu cầu?", "Một private void M()", "Một public void M(int n)", "Một public void M()", "Một public static void M()", 1],
    [5, 1, 539, "I là giao diện có void Chay(). Lớp M thực thi I bằng public void Chay() và có public void Dung(). Dòng nào lỗi do i chỉ thấy hợp đồng I?", "i.Chay()", "new I()", "m.Dung()", "i.Dung()", 3],
    [5, 1, 540, "A là lớp thường đã ghi đè ToString(). B : A không ghi đè thêm. object o = new B(); Kiểu khai báo của o là gì?", "Kiểu System.Type", "Bản ToString của A", "B", "object", 3],
    [5, 1, 541, "P là lớp thường có M() virtual và N() không ảo. Q : P có override M() và new N(). p kiểu P, q kiểu Q, cả hai giữ cùng Q. p.N() vào thân nào?", "P.M()", "P.N()", "Q.N()", "Q.M()", 1],
    [5, 1, 542, "Các thành viên dưới đây được xem xét độc lập trong lớp cơ sở A không tĩnh. Khai báo nào yêu cầu A được đánh dấu abstract?", "public int F() { return 2; }", "public static int F() { return 2; }", "public abstract int F();", "public virtual int F() { return 2; }", 2],
    [5, 1, 543, "A là lớp thường đã ghi đè ToString(). B : A không ghi đè thêm. object o = new B(); Đối tượng o.GetType() biểu diễn kiểu nào?", "B", "object", "Bản ToString của A", "Kiểu System.Type", 0],
    [5, 1, 544, "Một thư viện dùng giao diện theo mô hình cổ điển. Không xét cài đặt mặc định trong giao diện. Thay đổi nào có thể cấp hành vi mặc định cho các lớp con mà không bắt buộc từng lớp viết thân mới?", "Thêm phương thức có thân vào lớp cơ sở", "Thêm một lớp mới thực thi giao diện", "Thêm khai báo vào giao diện", "Thêm override trong một lớp con", 0],
    [5, 1, 545, "Trong mô hình cổ điển, I có void Doc(); A là lớp trừu tượng có abstract void Doc(); B : A, I và đã hoàn thành nghĩa vụ. Dòng nào dùng lớp trừu tượng làm kiểu khai báo nhưng tạo lớp cụ thể?", "A a = new B();", "I i = new B();", "B b = new B();", "A a = new A();", 0],
    [5, 1, 546, "Giao diện I có M(), giao diện J : I bổ sung N(). Lớp C thực thi J. Biến i có kiểu I và j có kiểu J. Lời gọi nào dùng thành viên J kế thừa từ I?", "j.N()", "i.M()", "j.M()", "i.N()", 2],
    [5, 1, 547, "Các thành viên dưới đây được xem xét độc lập trong lớp cơ sở A không tĩnh. Khai báo nào có thể gọi trên đối tượng nhưng không hỗ trợ ghi đè?", "public abstract int F();", "public static int F() { return 2; }", "public int F() { return 2; }", "public virtual int F() { return 2; }", 2],
    [5, 1, 548, "Cho interface I { int Doc(); }. Mọi lựa chọn là thành viên duy nhất tương ứng trong một lớp cụ thể : I. Khai báo nào đáp ứng hợp đồng ngầm định?", "public int Doc(int n) { return n; }", "public int Doc() { return 1; }", "public static int Doc() { return 1; }", "private int Doc() { return 1; }", 1],
    [5, 1, 549, "A có virtual int M() trả 1. B : A override M() trả 2. C : A không ghi đè. A x = new B(); x.M() trả gì?", "4", "2", "3", "1", 1],
    [5, 1, 550, "A có virtual string MoTa() trả \"A\". B : A có override trả \"B\". C : B không override. D : C override trả \"D\". Nếu A đổi thành abstract class, biểu thức new A() dẫn đến gì?", "\"D\"", "\"A\"", "Lỗi tạo đối tượng", "\"B\"", 2],
    [5, 1, 551, "A có virtual string MoTa() trả \"A\". B : A có override trả \"B\". C : B không override. D : C override trả \"D\". A a = new C(); a.MoTa() trả gì?", "\"D\"", "\"B\"", "\"A\"", "Lỗi tạo đối tượng", 1],
    [5, 1, 552, "A khai báo virtual int M() trả 1. B có new int M() trả 2. C có override int M() trả 3 và kế thừa A trực tiếp. A a = new B(); a.M() trả gì?", "3", "Lỗi vì không tìm thấy M", "2", "1", 3],
    [5, 1, 553, "Một thư viện dùng giao diện theo mô hình cổ điển. Không xét cài đặt mặc định trong giao diện. Thay đổi nào tùy chỉnh hành vi ảo cho một nhánh hiện hữu?", "Thêm phương thức có thân vào lớp cơ sở", "Thêm một lớp mới thực thi giao diện", "Thêm override trong một lớp con", "Thêm khai báo vào giao diện", 2],
    [5, 1, 554, "Trong mô hình cổ điển, I có void Doc(); A là lớp trừu tượng có abstract void Doc(); B : A, I và đã hoàn thành nghĩa vụ. Dòng nào dùng lớp cụ thể làm kiểu khai báo của biến?", "A a = new A();", "I i = new B();", "B b = new B();", "A a = new B();", 2],
    [5, 1, 555, "I là giao diện có void Chay(). Lớp M thực thi I bằng public void Chay() và có public void Dung(). Biểu thức nào cố tạo trực tiếp một giao diện?", "m.Dung()", "i.Chay()", "new I()", "i.Dung()", 2],
    [5, 1, 556, "Lớp abstract A : I có abstract void M() đúng chữ ký I.M. B : A chưa khai báo gì. Cách nào để B hợp lệ trong khi tiếp tục hoãn cài đặt M?", "class B : A { }", "class B : A { public override void M() { } }", "I x = new A();", "abstract class B : A { }", 3],
    [5, 1, 557, "Lớp M có hai trường, một int N và một tham chiếu K. Trong M tạo bản sao bằng MemberwiseClone(). Khi đọc số nguyên của bản sao ngay sau thao tác, điều gì xảy ra?", "Kiểu thực của bản sao vẫn là M", "Giá trị N ban đầu được sao chép", "Hai trường K ban đầu trỏ cùng đối tượng", "Đối tượng M mới", 1],
    [5, 1, 558, "A có virtual void M(). B : A override M(). Trong B còn có phương thức N(). Ở lớp khách, lời gọi nào minh họa đa hình qua biến a có kiểu A?", "this.M()", "a.M()", "b.N()", "base.M()", 1],
    [5, 1, 559, "Xét các thành viên được thừa hưởng từ object trong một lớp thường. Muốn quy định tương đương về dữ liệu, ghi đè phương thức nào để thực hiện phép so sánh?", "ToString()", "GetHashCode()", "Equals(object o)", "GetType()", 2],
    [5, 1, 560, "Trong mô hình giao diện chỉ khai báo của bài giảng, chọn cách phù hợp nhất với từng yêu cầu. Lớp cơ sở muốn lớp con cụ thể cung cấp cài đặt và không có thân mặc định. Dùng gì?", "Lớp trừu tượng", "Phương thức abstract", "Phương thức virtual", "Giao diện", 1],
    [5, 1, 561, "A trừu tượng có public abstract int Doc(). B là lớp cụ thể kế thừa A. Khai báo nào cố che phương thức trừu tượng thay vì thực thi nó?", "public new int Doc() { return 1; }", "public int Doc(int n) { return n; }", "public override int Doc() { return 1; }", "public override void Doc() { }", 0],
    [5, 1, 562, "A có virtual string MoTa() trả \"A\". B : A có override trả \"B\". C : B không override. D : C override trả \"D\". B b = new D(); b.MoTa() trả gì?", "\"A\"", "Lỗi tạo đối tượng", "\"B\"", "\"D\"", 3],
    [5, 1, 563, "Xét các thành viên được thừa hưởng từ object trong một lớp thường. Muốn biểu diễn đối tượng bằng nội dung nghiệp vụ khi in, ghi đè gì?", "GetType()", "Equals(object o)", "ToString()", "GetHashCode()", 2],
    [5, 1, 564, "Trong mô hình cổ điển, I có void Doc(); A là lớp trừu tượng có abstract void Doc(); B : A, I và đã hoàn thành nghĩa vụ. Dòng nào dùng hợp đồng làm kiểu khai báo và tạo lớp cụ thể?", "B b = new B();", "A a = new A();", "A a = new B();", "I i = new B();", 3],
    [5, 1, 565, "I có int Muc { get; } và J có string this[int i] { get; }. Lớp C thực thi cả hai. Dòng nào cố ghi property qua hợp đồng chỉ đọc?", "i.Muc = 4;", "string s = j[0];", "j[0] = \"a\";", "int n = i.Muc;", 0],
    [5, 1, 566, "Trong mô hình cổ điển, I có void Doc(); A là lớp trừu tượng có abstract void Doc(); B : A, I và đã hoàn thành nghĩa vụ. Dòng nào không hợp lệ vì vế phải dùng tên lớp trừu tượng?", "I i = new B();", "A a = new A();", "B b = new B();", "A a = new B();", 1],
    [5, 1, 567, "Lớp abstract A : I có abstract void M() đúng chữ ký I.M. B : A chưa khai báo gì. Dòng nào lỗi vì khởi tạo trực tiếp A?", "abstract class B : A { }", "class B : A { }", "I x = new A();", "class B : A { public override void M() { } }", 2],
    [5, 1, 568, "P là lớp thường có M() virtual và N() không ảo. Q : P có override M() và new N(). p kiểu P, q kiểu Q, cả hai giữ cùng Q. q.N() vào thân nào?", "P.N()", "P.M()", "Q.M()", "Q.N()", 3],
    [5, 1, 569, "P là lớp thường có M() virtual và N() không ảo. Q : P có override M() và new N(). p kiểu P, q kiểu Q, cả hai giữ cùng Q. Trong Q, base.M() vào thân nào?", "P.M()", "P.N()", "Q.N()", "Q.M()", 0],
    [5, 1, 570, "Giao diện I có M(), giao diện J : I bổ sung N(). Lớp C thực thi J. Biến i có kiểu I và j có kiểu J. Lời gọi nào lỗi do N không thuộc hợp đồng I?", "j.N()", "i.M()", "j.M()", "i.N()", 3],
    [5, 1, 571, "Giao diện I có M(), giao diện J : I bổ sung N(). Lớp C thực thi J. Biến i có kiểu I và j có kiểu J. Lời gọi nào dùng trực tiếp hợp đồng của I trên biến i?", "i.M()", "i.N()", "j.N()", "j.M()", 0],
    [5, 1, 572, "Một thư viện dùng giao diện theo mô hình cổ điển. Không xét cài đặt mặc định trong giao diện. Thay đổi nào bổ sung một biến thể đa hình mà vẫn giữ nguyên hợp đồng?", "Thêm phương thức có thân vào lớp cơ sở", "Thêm khai báo vào giao diện", "Thêm override trong một lớp con", "Thêm một lớp mới thực thi giao diện", 3],
    [5, 1, 573, "Giao diện I có M(), giao diện J : I bổ sung N(). Lớp C thực thi J. Biến i có kiểu I và j có kiểu J. Lời gọi nào dùng thành viên mới của J?", "i.N()", "j.N()", "i.M()", "j.M()", 1],
    [5, 1, 574, "Xét các thành viên được thừa hưởng từ object trong một lớp thường. Muốn biết kiểu thực mà không định nghĩa phương thức mới, gọi gì?", "GetType()", "ToString()", "GetHashCode()", "Equals(object o)", 0],
    [5, 1, 575, "Một thư viện dùng giao diện theo mô hình cổ điển. Không xét cài đặt mặc định trong giao diện. Thay đổi nào tạo thêm nghĩa vụ cho các lớp thực thi hiện có nếu chúng chưa có thành viên tương ứng?", "Thêm override trong một lớp con", "Thêm một lớp mới thực thi giao diện", "Thêm phương thức có thân vào lớp cơ sở", "Thêm khai báo vào giao diện", 3],
    [5, 1, 576, "Trong mô hình giao diện chỉ khai báo của bài giảng, chọn cách phù hợp nhất với từng yêu cầu. Các lớp con cần chia sẻ trường và constructor của một kiểu không tạo trực tiếp. Dùng gì?", "Lớp trừu tượng", "Phương thức abstract", "Giao diện", "Phương thức virtual", 0],
    [5, 1, 577, "I1 và I2 là hai giao diện không liên quan, đều khai báo void M(). Xét thực thi ngầm định. Khai báo nào có đúng tên nhưng chỉ dùng nội bộ và không thỏa hợp đồng?", "Một public void M(int n)", "Một public void M()", "Một public static void M()", "Một private void M()", 3],
    [5, 1, 578, "A trừu tượng có public abstract int Doc(). B là lớp cụ thể kế thừa A. Khai báo nào hoàn thành nghĩa vụ của B?", "public override void Doc() { }", "public override int Doc() { return 1; }", "public int Doc(int n) { return n; }", "public new int Doc() { return 1; }", 1],
    [5, 1, 579, "Xét các thành viên được thừa hưởng từ object trong một lớp thường. Muốn cung cấp mã băm tương thích với quy tắc tương đương, ghi đè gì?", "Equals(object o)", "ToString()", "GetHashCode()", "GetType()", 2],
    [5, 1, 580, "Lớp M có hai trường, một int N và một tham chiếu K. Trong M tạo bản sao bằng MemberwiseClone(). Khi so hai giá trị tham chiếu ở trường K ngay sau thao tác, điều gì đúng?", "Giá trị N ban đầu được sao chép", "Kiểu thực của bản sao vẫn là M", "Đối tượng M mới", "Hai trường K ban đầu trỏ cùng đối tượng", 3],
    [5, 1, 581, "Cho interface I { int Doc(); }. Mọi lựa chọn là thành viên duy nhất tương ứng trong một lớp cụ thể : I. Khai báo nào sai vì danh sách tham số khác?", "public static int Doc() { return 1; }", "public int Doc() { return 1; }", "public int Doc(int n) { return n; }", "private int Doc() { return 1; }", 2],
    [5, 1, 582, "A trừu tượng có abstract int M(), virtual int N() trả 2 và phương thức thường P() trả 3. Thành viên nào có thể khởi tạo trường dùng chung trong quá trình tạo thể hiện lớp con?", "M", "P", "N", "Constructor của A", 3],
    [5, 1, 583, "A có virtual int M() trả 1. B : A override M() trả 2. C : A không ghi đè. Hai lần gọi M trên cùng một B qua hai biến kiểu A và B, cộng lại bằng bao nhiêu?", "4", "1", "3", "2", 0],
    [5, 1, 584, "Hợp đồng I có M(). Hai lớp A và B thực thi I riêng, M lần lượt trả 2 và 5. I x = new B(); x.M() trả gì?", "10", "5", "2", "7", 1],
    [5, 1, 585, "A là lớp thường đã ghi đè ToString(). B : A không ghi đè thêm. object o = new B(); Bản thân giá trị trả về của GetType() thuộc kiểu nào?", "object", "Bản ToString của A", "B", "Kiểu System.Type", 3],
    [5, 1, 586, "A có virtual void M(). B : A override M(). Trong B còn có phương thức N(). Ở lớp khách, lời gọi nào gọi thành viên riêng của B khi b có kiểu B?", "base.M()", "b.N()", "this.M()", "a.M()", 1],
    [5, 1, 587, "A là lớp thường đã ghi đè ToString(). B : A không ghi đè thêm. object o = new B(); o.ToString() thực thi thân nào?", "B", "object", "Bản ToString của A", "Kiểu System.Type", 2],
    [5, 1, 588, "I có int Muc { get; } và J có string this[int i] { get; }. Lớp C thực thi cả hai. Dòng nào cố ghi chỉ mục qua hợp đồng chỉ đọc?", "int n = i.Muc;", "j[0] = \"a\";", "string s = j[0];", "i.Muc = 4;", 1],
    [5, 1, 589, "A trừu tượng có public abstract int Doc(). B là lớp cụ thể kế thừa A. Khai báo nào có một tham số dư và chỉ bổ sung một phương thức khác?", "public override void Doc() { }", "public new int Doc() { return 1; }", "public int Doc(int n) { return n; }", "public override int Doc() { return 1; }", 2],
    [5, 1, 590, "Lớp abstract A : I có abstract void M() đúng chữ ký I.M. B : A chưa khai báo gì. Cách nào tạo lớp cụ thể hợp lệ?", "class B : A { public override void M() { } }", "abstract class B : A { }", "class B : A { }", "I x = new A();", 0],
    [5, 1, 591, "I có int Muc { get; } và J có string this[int i] { get; }. Lớp C thực thi cả hai. Với I i = new C(), dòng nào đọc đúng property?", "int n = i.Muc;", "string s = j[0];", "j[0] = \"a\";", "i.Muc = 4;", 0],
    [5, 1, 592, "A trừu tượng có abstract int M(), virtual int N() trả 2 và phương thức thường P() trả 3. Thành viên nào lớp con cụ thể phải cung cấp bản override nếu chưa có bản cài đặt?", "M", "P", "N", "Constructor của A", 0],
    [5, 1, 593, "Trong mô hình giao diện chỉ khai báo của bài giảng, chọn cách phù hợp nhất với từng yêu cầu. Lớp cơ sở muốn đưa ra mặc định có thể ghi đè. Dùng gì?", "Phương thức abstract", "Phương thức virtual", "Lớp trừu tượng", "Giao diện", 1],
    [5, 1, 594, "A khai báo virtual int M() trả 1. B có new int M() trả 2. C có override int M() trả 3 và kế thừa A trực tiếp. A a = new C(); a.M() trả gì?", "2", "1", "Lỗi vì không tìm thấy M", "3", 3],
    [5, 1, 595, "A có virtual int M() trả 1. B : A override M() trả 2. C : A không ghi đè. A x = new C(); x.M() trả gì?", "2", "1", "3", "4", 1],
    [5, 1, 596, "A có virtual void M(). B : A override M(). Trong B còn có phương thức N(). Trong B.N(), lời gọi nào thực thi thẳng thân M của A?", "this.M()", "base.M()", "b.N()", "a.M()", 1],
    [5, 1, 597, "Các thành viên dưới đây được xem xét độc lập trong lớp cơ sở A không tĩnh. Khai báo nào vừa có mặc định vừa hỗ trợ ghi đè?", "public virtual int F() { return 2; }", "public static int F() { return 2; }", "public int F() { return 2; }", "public abstract int F();", 0],
    [5, 1, 598, "A khai báo virtual int M() trả 1. B có new int M() trả 2. C có override int M() trả 3 và kế thừa A trực tiếp. B b = new B(); b.M() trả gì?", "3", "2", "1", "Lỗi vì không tìm thấy M", 1],
    [5, 1, 599, "A trừu tượng có abstract int M(), virtual int N() trả 2 và phương thức thường P() trả 3. Thành viên nào có sẵn cài đặt và không tham gia cơ chế ghi đè?", "Constructor của A", "M", "N", "P", 3],
    [5, 1, 600, "A có virtual void M(). B : A override M(). Trong B còn có phương thức N(). Trong B.N(), lời gọi nào gọi M ảo trên chính đối tượng hiện tại?", "base.M()", "this.M()", "a.M()", "b.N()", 1],
    [2, 2, 601, "Lớp M có int n = 6. Constructor M(int n) gán this.n = n. Phương thức Dat(int n) chỉ thực hiện n = n + 1. Phương thức Tang() thực hiện this.n++. Sau new M(5), nếu bỏ dòng gán trong constructor, trường n là bao nhiêu?", "10", "6", "9", "12", 1],
    [2, 2, 602, "Lớp D có constructor không tham số và public int N = 3. Khi một biến khác nhận tham chiếu, kiểu khai báo vẫn là D. D a; int n = a.N; dẫn đến gì?", "Biên dịch nhưng lỗi khi đọc từ null", "Biến chưa được gán", "Đọc được 3", "Đọc được 8", 1],
    [2, 2, 603, "Lớp P có các constructor public P(int n, bool b), public P(bool b, int n) và public P(string s). Không có chuyển đổi ngầm định tùy biến. new P(1 + 2, 2 < 3) chọn gì?", "P(bool, int)", "P(string)", "Lỗi biên dịch", "P(int, bool)", 3],
    [2, 2, 604, "Lớp H có int m = 3. H(int n) đặt m = n; H() gọi : this(4) rồi nhân đôi m. Tang() tăng m thêm một và trả kết quả. H a = new H(); H b = a; a.Tang(); b.Tang(); đọc a.m được gì?", "8", "9", "10", "4", 2],
    [2, 2, 605, "Lớp U khai báo ~U(). Tất cả biến dưới đây là biến cục bộ trong một phương thức. Xét điều có thể suy ra từ mã. U a = new U(); a = null; với giả thiết không có chỗ nào giữ tham chiếu khác. Kết luận nào đúng nhất?", "Lỗi cú pháp vì cố gọi finalizer", "Còn ít nhất một tham chiếu sẽ được dùng", "Có hai đối tượng được tạo", "Đã bỏ tham chiếu duy nhất đã nêu, chưa xác định thời điểm finalizer", 3],
    [2, 2, 606, "Lớp D có int m = 1; D(int n) gán m = n; D() có thân rỗng. Phương thức Cong(int k) tăng m thêm k. Với a = new D(1), b = new D(), sau a.Cong(3), cặp (a.m, b.m) là gì?", "(1, 4)", "(4, 1)", "(4, 4)", "(7, 4)", 1],
    [2, 2, 607, "Lớp của h khai báo public int Doc() và public void Ghi(int). Xét các lời gọi từ bên ngoài lớp. h.Ghi(h.Doc(3)); thuộc trường hợp nào?", "Hợp lệ và bỏ kết quả của Doc", "Lỗi vì Doc thiếu bản nhận đối số", "Lỗi vì void không cung cấp đối số int", "Hợp lệ và lấy kết quả của Doc", 1],
    [2, 2, 608, "Xét phương thức int M(bool b) trong lớp C. Chọn mô tả chính xác nhất của từng thân dưới đây. Thân { if (b) return; return 1; } thuộc trường hợp nào?", "Lỗi vì có return rỗng", "Hợp lệ và luôn trả 1", "Hợp lệ và có thể trả hai giá trị", "Lỗi vì đường đi b == false không trả giá trị", 0],
    [2, 2, 609, "Xét từng cấu hình độc lập của lớp R. Mã khách nằm ngoài R và đủ quyền truy cập lớp. R khai báo public R() và public R(int n). Hai biểu thức hợp lệ thế nào?", "Chỉ new R(2) hợp lệ", "Chỉ new R() hợp lệ", "Cả hai đều hợp lệ", "Cả hai đều lỗi", 2],
    [2, 2, 610, "Xét độc lập các khai báo constructor dưới đây cho lớp C có trường int n. C(int x) { } cùng C(int y) { } thuộc trường hợp nào?", "Lỗi vì không có constructor phù hợp", "Lỗi vì trùng chữ ký", "Lỗi vì chuỗi gọi vòng", "Hợp lệ vì chuỗi gọi kết thúc", 1],
    [2, 2, 611, "Xét phương thức int M(bool b) trong lớp C. Chọn mô tả chính xác nhất của từng thân dưới đây. Thân { if (b) return 1; return 2; } thuộc trường hợp nào?", "Hợp lệ và có thể trả hai giá trị", "Lỗi vì có return rỗng", "Lỗi vì đường đi b == false không trả giá trị", "Hợp lệ và luôn trả 1", 0],
    [2, 2, 612, "Lớp Z có int v = 3; Z(int n) gán v += n. Z() gọi : this(2) rồi gán v *= 2. Doc() trả v. Nếu constructor nhận int được đổi thành v = n, new Z(2).Doc() trả gì?", "2", "5", "7", "10", 0],
    [2, 2, 613, "Lớp B có int n = 2; int Buoc() { n++; return n; } và void Dat(int x) { n = x; }. Mỗi câu bắt đầu bằng b = new B(). Chạy b.Dat(b.Buoc() + b.Buoc()); rồi đọc b.n. Kết quả là gì?", "7", "3", "4", "8", 0],
    [2, 2, 614, "Một lớp P thông thường có constructor thể hiện và cần xem xét có khai báo finalizer hay không. Các biến thể độc lập. Bỏ mọi khai báo ~P nhưng giữ constructor hợp lệ dẫn đến gì?", "Lỗi vì có hai finalizer", "Lỗi vì finalizer có tham số", "Hợp lệ, chỉ có một finalizer", "Hợp lệ, không có finalizer riêng do trình biên dịch sinh", 3],
    [2, 2, 615, "Lớp H có int m = 3. H(int n) đặt m = n; H() gọi : this(4) rồi nhân đôi m. Tang() tăng m thêm một và trả kết quả. Tạo H(4) rồi đọc trường m. Được gì?", "8", "4", "9", "10", 1],
    [2, 2, 616, "Lớp D có int m = 1; D(int n) gán m = n; D() có thân rỗng. Phương thức Cong(int k) tăng m thêm k. Với a = new D(1), b = a, sau a.Cong(3), a = new D(7), cặp là gì?", "(4, 4)", "(1, 4)", "(4, 1)", "(7, 4)", 3],
    [2, 2, 617, "Lớp P có các constructor public P(int n, bool b), public P(bool b, int n) và public P(string s). Không có chuyển đổi ngầm định tùy biến. new P(\"3\", true) chọn gì?", "Lỗi biên dịch", "P(bool, int)", "P(string)", "P(int, bool)", 0],
    [2, 2, 618, "Lớp P có các constructor public P(int n, bool b), public P(bool b, int n) và public P(string s). Không có chuyển đổi ngầm định tùy biến. new P((1 + 2).ToString()) chọn gì?", "P(string)", "Lỗi biên dịch", "P(int, bool)", "P(bool, int)", 0],
    [2, 2, 619, "Lớp Pin có int m = 2. Pin() gọi : this(5) rồi thực hiện m++; Pin(int x) thực hiện m += x. M() trả m. Với mã gốc, new Pin().M() trả gì?", "2", "5", "8", "7", 2],
    [2, 2, 620, "Một lớp P thông thường có constructor thể hiện và cần xem xét có khai báo finalizer hay không. Các biến thể độc lập. Viết hai khai báo ~P() { } trong một lớp dẫn đến gì?", "Lỗi vì finalizer có tham số", "Hợp lệ, không có finalizer riêng do trình biên dịch sinh", "Lỗi vì có hai finalizer", "Hợp lệ, chỉ có một finalizer", 2],
    [2, 2, 621, "Xét phương thức int M(bool b) trong lớp C. Chọn mô tả chính xác nhất của từng thân dưới đây. Thân { if (b) return 1; } thuộc trường hợp nào?", "Hợp lệ và luôn trả 1", "Lỗi vì có return rỗng", "Hợp lệ và có thể trả hai giá trị", "Lỗi vì đường đi b == false không trả giá trị", 3],
    [2, 2, 622, "Lớp H có int m = 3. H(int n) đặt m = n; H() gọi : this(4) rồi nhân đôi m. Tang() tăng m thêm một và trả kết quả. H a = new H(); H b = a; b.Tang(); đọc a.m được gì?", "4", "9", "10", "8", 1],
    [2, 2, 623, "Lớp E chỉ có public E(int n). Muốn kiểm soát đường tạo thể hiện khi bổ sung thành viên. Thêm public E() : this(0) { } đem lại gì?", "Vẫn chỉ tạo được từ ngoài qua E(int)", "Không biên dịch vì constructor gọi chính nó", "Cho phép cả hai đường tạo", "Không biên dịch vì tên thành viên trùng tên lớp", 2],
    [2, 2, 624, "Lớp D có constructor không tham số và public int N = 3. Khi một biến khác nhận tham chiếu, kiểu khai báo vẫn là D. D a = new D(); D b = a; b.N = 8; int n = a.N; dẫn đến gì?", "Đọc được 3", "Biến chưa được gán", "Đọc được 8", "Biên dịch nhưng lỗi khi đọc từ null", 2],
    [2, 2, 625, "Xét độc lập các khai báo constructor dưới đây cho lớp C có trường int n. C() : this(2) { } cùng C(int x) : this() { } thuộc trường hợp nào?", "Lỗi vì không có constructor phù hợp", "Lỗi vì chuỗi gọi vòng", "Hợp lệ vì chuỗi gọi kết thúc", "Lỗi vì trùng chữ ký", 1],
    [2, 2, 626, "Lớp của h khai báo public int Doc() và public void Ghi(int). Xét các lời gọi từ bên ngoài lớp. int x = h.Doc(); h.Ghi(x); thuộc trường hợp nào?", "Hợp lệ và lấy kết quả của Doc", "Lỗi vì void không cung cấp đối số int", "Hợp lệ và bỏ kết quả của Doc", "Lỗi vì Doc thiếu bản nhận đối số", 0],
    [2, 2, 627, "Lớp của h khai báo public int Doc() và public void Ghi(int). Xét các lời gọi từ bên ngoài lớp. h.Ghi(h.Ghi(3)); thuộc trường hợp nào?", "Lỗi vì Doc thiếu bản nhận đối số", "Hợp lệ và bỏ kết quả của Doc", "Lỗi vì void không cung cấp đối số int", "Hợp lệ và lấy kết quả của Doc", 2],
    [2, 2, 628, "Lớp E chỉ có public E(int n). Muốn kiểm soát đường tạo thể hiện khi bổ sung thành viên. Thêm private E() : this(0) { } đem lại gì cho mã khách?", "Vẫn chỉ tạo được từ ngoài qua E(int)", "Không biên dịch vì constructor gọi chính nó", "Không biên dịch vì tên thành viên trùng tên lớp", "Cho phép cả hai đường tạo", 0],
    [2, 2, 629, "Một lớp P thông thường có constructor thể hiện và cần xem xét có khai báo finalizer hay không. Các biến thể độc lập. Khai báo ~P() { } bên cạnh hai constructor hợp lệ dẫn đến gì?", "Lỗi vì finalizer có tham số", "Lỗi vì có hai finalizer", "Hợp lệ, không có finalizer riêng do trình biên dịch sinh", "Hợp lệ, chỉ có một finalizer", 3],
    [2, 2, 630, "Lớp Pin có int m = 2. Pin() gọi : this(5) rồi thực hiện m++; Pin(int x) thực hiện m += x. M() trả m. Nếu bỏ phép cộng trong thân Pin(int), new Pin(5).M() trả gì?", "5", "7", "8", "2", 3],
    [2, 2, 631, "Lớp D có int m = 1; D(int n) gán m = n; D() có thân rỗng. Phương thức Cong(int k) tăng m thêm k. Với a = new D(1), b = a, sau a.Cong(3), cặp là gì?", "(1, 4)", "(4, 1)", "(7, 4)", "(4, 4)", 3],
    [2, 2, 632, "Lớp D có constructor không tham số và public int N = 3. Khi một biến khác nhận tham chiếu, kiểu khai báo vẫn là D. D a = null; int n = a.N; dẫn đến gì khi chạy?", "Biến chưa được gán", "Đọc được 3", "Biên dịch nhưng lỗi khi đọc từ null", "Đọc được 8", 2],
    [2, 2, 633, "Lớp T có int m = 1, T() có thân rỗng, T(int x) gán m = x. Dat(int x) gán m = x và Doc() trả m. Cho a = new T(3), b = a. Gọi b.Dat(a.Doc()). Cặp là gì?", "(3, 3)", "(3, 1)", "(1, 3)", "(5, 3)", 0],
    [2, 2, 634, "Lớp M có int n = 6. Constructor M(int n) gán this.n = n. Phương thức Dat(int n) chỉ thực hiện n = n + 1. Phương thức Tang() thực hiện this.n++. Với mã gốc, tạo new M(9), gọi Dat(11), đọc trường n được gì?", "9", "10", "12", "6", 0],
    [2, 2, 635, "Lớp Z có int v = 3; Z(int n) gán v += n. Z() gọi : this(2) rồi gán v *= 2. Doc() trả v. Với mã gốc, new Z().Doc() trả gì?", "2", "10", "7", "5", 1],
    [2, 2, 636, "Lớp M có int n = 6. Constructor M(int n) gán this.n = n. Phương thức Dat(int n) chỉ thực hiện n = n + 1. Phương thức Tang() thực hiện this.n++. Nếu sửa Dat thành this.n = n + 1, tạo new M(9) rồi Dat(11), trường n bằng bao nhiêu?", "12", "6", "10", "9", 0],
    [2, 2, 637, "Xét từng cấu hình độc lập của lớp R. Mã khách nằm ngoài R và đủ quyền truy cập lớp. R không khai báo constructor thể hiện nhưng có static R(). Hai biểu thức new R() và new R(2) hợp lệ thế nào?", "Cả hai đều hợp lệ", "Cả hai đều lỗi", "Chỉ new R(2) hợp lệ", "Chỉ new R() hợp lệ", 3],
    [2, 2, 638, "Xét độc lập các khai báo constructor dưới đây cho lớp C có trường int n. C() : this(2) { } cùng C(int x) { n = x; } thuộc trường hợp nào?", "Lỗi vì chuỗi gọi vòng", "Lỗi vì không có constructor phù hợp", "Hợp lệ vì chuỗi gọi kết thúc", "Lỗi vì trùng chữ ký", 2],
    [2, 2, 639, "Lớp D có int m = 1; D(int n) gán m = n; D() có thân rỗng. Phương thức Cong(int k) tăng m thêm k. Với a = new D(), b = a, sau a.Cong(3), a = new D(), cặp là gì?", "(4, 1)", "(7, 4)", "(4, 4)", "(1, 4)", 3],
    [2, 2, 640, "Lớp T có int m = 1, T() có thân rỗng, T(int x) gán m = x. Dat(int x) gán m = x và Doc() trả m. Cho a = new T(3), b = a. Gán b = new T(). Cặp là gì?", "(1, 3)", "(3, 3)", "(5, 3)", "(3, 1)", 3],
    [2, 2, 641, "Lớp B có int n = 2; int Buoc() { n++; return n; } và void Dat(int x) { n = x; }. Mỗi câu bắt đầu bằng b = new B(). Chạy b.Dat(b.Buoc() * 2); b.Buoc(); b.Buoc(); rồi đọc b.n. Kết quả là gì?", "8", "3", "4", "7", 0],
    [2, 2, 642, "Lớp E chỉ có public E(int n). Muốn kiểm soát đường tạo thể hiện khi bổ sung thành viên. Thêm public E() : this() { } dẫn đến gì?", "Cho phép cả hai đường tạo", "Không biên dịch vì constructor gọi chính nó", "Vẫn chỉ tạo được từ ngoài qua E(int)", "Không biên dịch vì tên thành viên trùng tên lớp", 1],
    [2, 2, 643, "Xét phương thức int M(bool b) trong lớp C. Chọn mô tả chính xác nhất của từng thân dưới đây. Thân { if (b) return 1; return 1; } thuộc trường hợp nào?", "Lỗi vì có return rỗng", "Hợp lệ và có thể trả hai giá trị", "Hợp lệ và luôn trả 1", "Lỗi vì đường đi b == false không trả giá trị", 2],
    [2, 2, 644, "Lớp M có int n = 6. Constructor M(int n) gán this.n = n. Phương thức Dat(int n) chỉ thực hiện n = n + 1. Phương thức Tang() thực hiện this.n++. Với mã gốc, tạo new M(9), gọi Dat(11) rồi Tang(), đọc trường n được gì?", "12", "10", "6", "9", 1],
    [2, 2, 645, "Lớp U khai báo ~U(). Tất cả biến dưới đây là biến cục bộ trong một phương thức. Xét điều có thể suy ra từ mã. U a = new U(); a.~U(); thuộc trường hợp nào?", "Có hai đối tượng được tạo", "Đã bỏ tham chiếu duy nhất đã nêu, chưa xác định thời điểm finalizer", "Lỗi cú pháp vì cố gọi finalizer", "Còn ít nhất một tham chiếu sẽ được dùng", 2],
    [2, 2, 646, "Xét từng cấu hình độc lập của lớp R. Mã khách nằm ngoài R và đủ quyền truy cập lớp. R chỉ khai báo public R(int n) và static R(). Hai biểu thức hợp lệ thế nào?", "Cả hai đều hợp lệ", "Chỉ new R(2) hợp lệ", "Cả hai đều lỗi", "Chỉ new R() hợp lệ", 1],
    [2, 2, 647, "Lớp T có int m = 1, T() có thân rỗng, T(int x) gán m = x. Dat(int x) gán m = x và Doc() trả m. Cho a = new T(), b = new T(3). Không sửa gì. Cặp (a.Doc(), b.Doc()) là gì?", "(1, 3)", "(5, 3)", "(3, 1)", "(3, 3)", 0],
    [2, 2, 648, "Lớp E chỉ có public E(int n). Muốn kiểm soát đường tạo thể hiện khi bổ sung thành viên. Thêm public void E() { } dẫn đến gì?", "Cho phép cả hai đường tạo", "Vẫn chỉ tạo được từ ngoài qua E(int)", "Không biên dịch vì tên thành viên trùng tên lớp", "Không biên dịch vì constructor gọi chính nó", 2],
    [2, 2, 649, "Lớp Z có int v = 3; Z(int n) gán v += n. Z() gọi : this(2) rồi gán v *= 2. Doc() trả v. Nếu thân Z() đổi từ v *= 2 thành v += 2, new Z().Doc() trả gì?", "2", "5", "10", "7", 3],
    [2, 2, 650, "Lớp B có int n = 2; int Buoc() { n++; return n; } và void Dat(int x) { n = x; }. Mỗi câu bắt đầu bằng b = new B(). Chạy b.Buoc(); b.Buoc(); rồi đọc b.n. Kết quả là gì?", "7", "3", "4", "8", 2],
    [2, 2, 651, "Xét độc lập các khai báo constructor dưới đây cho lớp C có trường int n. Chỉ khai báo C() : this(2) { } thuộc trường hợp nào?", "Lỗi vì chuỗi gọi vòng", "Hợp lệ vì chuỗi gọi kết thúc", "Lỗi vì trùng chữ ký", "Lỗi vì không có constructor phù hợp", 3],
    [2, 2, 652, "Lớp Z có int v = 3; Z(int n) gán v += n. Z() gọi : this(2) rồi gán v *= 2. Doc() trả v. Với mã gốc, new Z(2).Doc() trả gì?", "2", "7", "10", "5", 3],
    [2, 2, 653, "Xét từng cấu hình độc lập của lớp R. Mã khách nằm ngoài R và đủ quyền truy cập lớp. R chỉ khai báo private R(int n). Hai biểu thức hợp lệ thế nào?", "Chỉ new R() hợp lệ", "Chỉ new R(2) hợp lệ", "Cả hai đều lỗi", "Cả hai đều hợp lệ", 2],
    [2, 2, 654, "Lớp của h khai báo public int Doc() và public void Ghi(int). Xét các lời gọi từ bên ngoài lớp. h.Doc(); h.Ghi(3); thuộc trường hợp nào?", "Hợp lệ và lấy kết quả của Doc", "Hợp lệ và bỏ kết quả của Doc", "Lỗi vì Doc thiếu bản nhận đối số", "Lỗi vì void không cung cấp đối số int", 1],
    [2, 2, 655, "Lớp Pin có int m = 2. Pin() gọi : this(5) rồi thực hiện m++; Pin(int x) thực hiện m += x. M() trả m. Với mã gốc, new Pin(5).M() trả gì?", "8", "5", "7", "2", 2],
    [2, 2, 656, "Lớp U khai báo ~U(). Tất cả biến dưới đây là biến cục bộ trong một phương thức. Xét điều có thể suy ra từ mã. U a = new U(); U b = a; a = null; rồi tiếp tục sử dụng b. Điều gì đúng về đối tượng gốc?", "Có hai đối tượng được tạo", "Đã bỏ tham chiếu duy nhất đã nêu, chưa xác định thời điểm finalizer", "Lỗi cú pháp vì cố gọi finalizer", "Còn ít nhất một tham chiếu sẽ được dùng", 3],
    [2, 2, 657, "Lớp B có int n = 2; int Buoc() { n++; return n; } và void Dat(int x) { n = x; }. Mỗi câu bắt đầu bằng b = new B(). Chạy b.Dat(b.Buoc()); rồi đọc b.n. Kết quả là gì?", "7", "3", "8", "4", 1],
    [2, 2, 658, "Lớp U khai báo ~U(). Tất cả biến dưới đây là biến cục bộ trong một phương thức. Xét điều có thể suy ra từ mã. U a = new U(); U b = new U(); có hệ quả gì?", "Có hai đối tượng được tạo", "Đã bỏ tham chiếu duy nhất đã nêu, chưa xác định thời điểm finalizer", "Còn ít nhất một tham chiếu sẽ được dùng", "Lỗi cú pháp vì cố gọi finalizer", 0],
    [2, 2, 659, "Lớp T có int m = 1, T() có thân rỗng, T(int x) gán m = x. Dat(int x) gán m = x và Doc() trả m. Cho a = new T(3), b = a. Gán a = new T(5) rồi gọi b.Dat(3). Cặp là gì?", "(5, 3)", "(3, 1)", "(1, 3)", "(3, 3)", 0],
    [2, 2, 660, "Lớp Pin có int m = 2. Pin() gọi : this(5) rồi thực hiện m++; Pin(int x) thực hiện m += x. M() trả m. Nếu thay m += x bằng m = x, new Pin(5).M() trả gì?", "7", "8", "2", "5", 3],
    [2, 2, 661, "Lớp D có constructor không tham số và public int N = 3. Khi một biến khác nhận tham chiếu, kiểu khai báo vẫn là D. D a = new D(); D b = a; a = null; int n = b.N; dẫn đến gì?", "Biến chưa được gán", "Đọc được 8", "Đọc được 3", "Biên dịch nhưng lỗi khi đọc từ null", 2],
    [2, 2, 662, "Lớp H có int m = 3. H(int n) đặt m = n; H() gọi : this(4) rồi nhân đôi m. Tang() tăng m thêm một và trả kết quả. Tạo H() rồi đọc trường m. Được gì?", "8", "4", "10", "9", 0],
    [2, 2, 663, "Lớp P có các constructor public P(int n, bool b), public P(bool b, int n) và public P(string s). Không có chuyển đổi ngầm định tùy biến. new P(2 < 3, 1 + 2) chọn gì?", "Lỗi biên dịch", "P(bool, int)", "P(string)", "P(int, bool)", 1],
    [2, 2, 664, "Một lớp P thông thường có constructor thể hiện và cần xem xét có khai báo finalizer hay không. Các biến thể độc lập. Chỉ viết ~P(int n) { } dẫn đến gì?", "Lỗi vì có hai finalizer", "Lỗi vì finalizer có tham số", "Hợp lệ, chỉ có một finalizer", "Hợp lệ, không có finalizer riêng do trình biên dịch sinh", 1],
    [3, 2, 665, "M(ref int a, ref int b) thực hiện a += 2; b *= 3. Mỗi câu bắt đầu với x = 2 và y = 5. Sau M(ref x, ref y), cặp (x, y) là gì?", "(2, 21)", "(12, 5)", "(4, 15)", "(6, 7)", 2],
    [3, 2, 666, "Lớp V có _m = 2. Getter P trả _m * 2, setter P gán _m = value / 2 với phép chia nguyên. Sau v.P = 9, đọc P được gì?", "2", "8", "4", "6", 1],
    [3, 2, 667, "Lớp K có trường thể hiện int n và trường static int t. Xét các biểu thức trong phương thức static của K có tham số K k. So sánh k.n và K.t.", "Chỉ biểu thức sau hợp lệ", "Cả hai lỗi", "Cả hai hợp lệ", "Chỉ biểu thức đầu hợp lệ", 2],
    [3, 2, 668, "Lớp H có _m = 4, getter P trả _m + 1 và setter P chỉ lưu value nếu 0 ≤ value ≤ 9. Xét riêng từng cặp lệnh rồi đọc P. h.P = 6; h.P += 0; đọc được gì?", "7", "5", "8", "10", 2],
    [3, 2, 669, "Lớp N có private int _x = 1; public int P có getter trả _x và setter chỉ gán nếu value >= 0. a, b là hai N riêng. Chạy a.P = -b.P. Điều gì xảy ra?", "Cả hai đổi vì cùng một đối tượng", "Chỉ sửa được a", "Không đối tượng nào đổi", "Chỉ sửa được b", 2],
    [3, 2, 670, "Lớp M có int R = 2 và static int T = 3. Tang() là phương thức thể hiện thực hiện R += T; T++. Biến a và b giữ hai M khác nhau. Sau a.Tang(), bộ (a.R, b.R, M.T) là gì?", "(9, 2, 5)", "(5, 2, 4)", "(2, 9, 5)", "(5, 6, 5)", 1],
    [3, 2, 671, "Lớp I có mảng riêng { 2, 5, 9 }. Getter this[int i] trả m[i] + i, setter gán m[i] = value - i. Mỗi câu xét một đối tượng mới. Không ghi gì, đọc t[1] được gì?", "8", "5", "6", "11", 2],
    [3, 2, 672, "Lớp S có int[] a = { 3, 7 }. Chỉ mục int đọc trực tiếp a[i]. Chỉ mục string đọc a[0] nếu khóa là \"A\", còn lại đọc a[1]. s[0, 1] dẫn đến gì?", "7", "10", "Lỗi vì thiếu chữ ký phù hợp", "3", 2],
    [3, 2, 673, "Lớp X có static int t = 1 và int n = 1. Phương thức M(ref int p) thực hiện p += t; n++; t++. a là một thể hiện, x = 4. Nếu n là trường public, chạy a.M(ref a.n). Bộ giá trị là gì?", "(4, 2, 3)", "(4, 3, 2)", "(7, 3, 3)", "(5, 2, 2)", 1],
    [3, 2, 674, "Lớp M có int R = 2 và static int T = 3. Tang() là phương thức thể hiện thực hiện R += T; T++. Biến a và b giữ hai M khác nhau. Sau b.Tang(); b.Tang(); bộ giá trị là gì?", "(5, 6, 5)", "(9, 2, 5)", "(2, 9, 5)", "(5, 2, 4)", 2],
    [3, 2, 675, "C có trường public int F, property public int P { get; set; } và chỉ mục int có cả get/set thông thường. R(ref int) và O(out int) đã khai báo hợp lệ; c đã tạo. int x = c.P; R(ref x); thuộc trường hợp nào?", "Lỗi vì property thường không phải biến ref", "Hợp lệ vì truyền trường có thể ghi", "Lỗi vì chỉ mục thường không phải biến out", "Hợp lệ vì truyền biến cục bộ đã gán", 3],
    [3, 2, 676, "Lớp S có trường int n = 4. void Tang() tăng trường n. void Goi(S s) thực hiện s.Tang(); this.Tang(). a và b là hai thể hiện S riêng. Chỉ gọi b.Goi(b), cặp là gì?", "(6, 4)", "(5, 5)", "(6, 6)", "(4, 6)", 3],
    [3, 2, 677, "Lớp K có private int _n. Setter của P nhận giá trị không âm, getter trả _n. Muốn bảo vệ cùng quy tắc ở mọi đường công khai. Cách nào đưa vào một đường khởi tạo có thể bỏ qua kiểm tra?", "Thêm một phương thức public đọc _n", "Gán _n = n trực tiếp từ constructor", "Thêm một phương thức public gán P = n", "Gán P = n từ constructor", 1],
    [3, 2, 678, "Lớp A public có trường X. Các bối cảnh là lớp dẫn xuất qua this ở assembly khác và lớp không dẫn xuất qua A ở cùng assembly. Nếu X là internal, quyền thế nào?", "Cả hai đều bị từ chối", "Chỉ lớp dẫn xuất được", "Chỉ lớp cùng assembly được", "Cả hai bối cảnh đều được", 2],
    [3, 2, 679, "C có trường public int F, property public int P { get; set; } và chỉ mục int có cả get/set thông thường. R(ref int) và O(out int) đã khai báo hợp lệ; c đã tạo. O(out c[0]) thuộc trường hợp nào?", "Hợp lệ vì truyền trường có thể ghi", "Lỗi vì property thường không phải biến ref", "Hợp lệ vì truyền biến cục bộ đã gán", "Lỗi vì chỉ mục thường không phải biến out", 3],
    [3, 2, 680, "Lớp S có trường int n = 4. void Tang() tăng trường n. void Goi(S s) thực hiện s.Tang(); this.Tang(). a và b là hai thể hiện S riêng. Chỉ gọi a.Goi(a), cặp là gì?", "(5, 5)", "(4, 6)", "(6, 6)", "(6, 4)", 3],
    [3, 2, 681, "Lớp L có chỉ mục int, getter trả _a[i], setter chỉ nhận value >= 0. Mảng _a của mỗi thể hiện ban đầu là { 2, 4 }. Gán l[1] += l[0]; l[0] = l[1]. Cặp là gì?", "(2, 4)", "(2, 6)", "(6, 6)", "(4, 4)", 2],
    [3, 2, 682, "Lớp K có public int P { get; private set; }. K không tĩnh, chứa phương thức thể hiện M và static S(K k). Ngoài K còn có B : K. Phương thức thể hiện M có thể làm gì với this.P?", "Đọc và gán P qua this", "Chỉ đọc được P", "Không thể dùng this", "Đọc và gán P qua tham số k", 0],
    [3, 2, 683, "Lớp G có static int N = 2; static G() { N *= 3; } và G() { N++; }. Mỗi câu bắt đầu với kiểu chưa khởi tạo. Chỉ đọc G.N lần đầu cho kết quả gì?", "Lỗi biên dịch", "8", "6", "7", 2],
    [3, 2, 684, "Lớp H có trường int n; phương thức M nhận tham số int n. Biến h ban đầu có trường n = 2 và được gọi M(5). Nếu thân là this.n = n;, trường n bằng gì?", "Trường n bằng 5", "Lỗi biên dịch", "Trường n bằng 7", "Trường n bằng 2", 0],
    [3, 2, 685, "Lớp H có _m = 4, getter P trả _m + 1 và setter P chỉ lưu value nếu 0 ≤ value ≤ 9. Xét riêng từng cặp lệnh rồi đọc P. h.P = 6; h.P = 12; đọc được gì?", "10", "5", "7", "8", 2],
    [3, 2, 686, "Lớp H có _m = 4, getter P trả _m + 1 và setter P chỉ lưu value nếu 0 ≤ value ≤ 9. Xét riêng từng cặp lệnh rồi đọc P. h.P = 12; h.P = -1; đọc được gì?", "10", "7", "8", "5", 3],
    [3, 2, 687, "Lớp K có public int P { get; private set; }. K không tĩnh, chứa phương thức thể hiện M và static S(K k). Ngoài K còn có B : K. Trong S, lý do không viết this.P là gì?", "Đọc và gán P qua this", "Chỉ đọc được P", "Đọc và gán P qua tham số k", "Không thể dùng this", 3],
    [3, 2, 688, "Lớp V có public int P { get; private set; } và phương thức thể hiện Cap(int n) đặt P = n nếu n >= 0. v vừa được tạo, P ban đầu bằng 0. Gọi v.Cap(4); v.P = 8; rồi đọc P dẫn đến gì?", "Hợp lệ, P bằng 4", "Lỗi ở phép ghi của mã khách", "Hợp lệ, P bằng 8", "Hợp lệ, P bằng 0", 1],
    [3, 2, 689, "Lớp I có mảng riêng { 2, 5, 9 }. Getter this[int i] trả m[i] + i, setter gán m[i] = value - i. Mỗi câu xét một đối tượng mới. Chạy t[1] = t[2]; đọc t[1] được gì?", "11", "8", "6", "5", 0],
    [3, 2, 690, "Lớp K có public int P { get; private set; }. K không tĩnh, chứa phương thức thể hiện M và static S(K k). Ngoài K còn có B : K. Phương thức tĩnh S có thể làm gì với k.P?", "Chỉ đọc được P", "Không thể dùng this", "Đọc và gán P qua tham số k", "Đọc và gán P qua this", 2],
    [3, 2, 691, "Lớp N có private int _x = 1; public int P có getter trả _x và setter chỉ gán nếu value >= 0. a, b là hai N riêng. Chạy a.P = b.P + 2. Điều gì xảy ra?", "Chỉ sửa được a", "Chỉ sửa được b", "Không đối tượng nào đổi", "Cả hai đổi vì cùng một đối tượng", 0],
    [3, 2, 692, "Lớp X có static int t = 1 và int n = 1. Phương thức M(ref int p) thực hiện p += t; n++; t++. a là một thể hiện, x = 4. Chạy a.M(ref x); đọc bộ (x, a.n, X.t). Kết quả là gì?", "(7, 3, 3)", "(4, 3, 2)", "(4, 2, 3)", "(5, 2, 2)", 3],
    [3, 2, 693, "Lớp A public có trường X. Các bối cảnh là lớp dẫn xuất qua this ở assembly khác và lớp không dẫn xuất qua A ở cùng assembly. Nếu X là protected, quyền thế nào?", "Chỉ lớp cùng assembly được", "Cả hai bối cảnh đều được", "Cả hai đều bị từ chối", "Chỉ lớp dẫn xuất được", 3],
    [3, 2, 694, "Lớp X có static int t = 1 và int n = 1. Phương thức M(ref int p) thực hiện p += t; n++; t++. a là một thể hiện, x = 4. Nếu t là trường public, chạy a.M(ref X.t). Bộ giá trị là gì?", "(4, 3, 2)", "(5, 2, 2)", "(4, 2, 3)", "(7, 3, 3)", 2],
    [3, 2, 695, "Các phương thức độc lập nhận tham số int theo những cách khác nhau. Ban đầu x = 3. M(ref int a) gán a += 2; sau M(ref x), x bằng gì?", "5", "Lỗi biên dịch", "8", "3", 0],
    [3, 2, 696, "Lớp N có private int _x = 1; public int P có getter trả _x và setter chỉ gán nếu value >= 0. a, b là hai N riêng. Chạy b.P = a.P + 2. Điều gì xảy ra?", "Cả hai đổi vì cùng một đối tượng", "Chỉ sửa được a", "Không đối tượng nào đổi", "Chỉ sửa được b", 3],
    [3, 2, 697, "Xét các cặp khai báo trong một lớp. Cần nhận biết lý do để các thành viên có thể hoặc không thể cùng tồn tại. int this[int i] và string this[int i] thuộc trường hợp nào?", "Trùng chữ ký vì chỉ khác kiểu trả về", "Nạp chồng hợp lệ bằng kiểu tham số", "Nạp chồng hợp lệ bằng số tham số", "Trùng chữ ký vì chỉ khác tên tham số", 0],
    [3, 2, 698, "Lớp K có private int _n. Setter của P nhận giá trị không âm, getter trả _n. Muốn bảo vệ cùng quy tắc ở mọi đường công khai. Cách nào bổ sung một đường cập nhật và vẫn áp dụng kiểm tra hiện có?", "Thêm một phương thức public đọc _n", "Thêm một phương thức public gán P = n", "Gán _n = n trực tiếp từ constructor", "Gán P = n từ constructor", 1],
    [3, 2, 699, "M(ref int a, ref int b) thực hiện a += 2; b *= 3. Mỗi câu bắt đầu với x = 2 và y = 5. Sau M(ref y, ref y), cặp là gì?", "(4, 15)", "(12, 5)", "(2, 21)", "(6, 7)", 2],
    [3, 2, 700, "Lớp Dem có static int T = 1; int R = 0. Constructor tăng T rồi gán R = T. Tang() tăng R và T mỗi trường một đơn vị. Mỗi câu chạy độc lập. Tạo a, gọi a.Tang() rồi đọc (T, a.R) được gì?", "(3, 2)", "(3, 3)", "(2, 2)", "(4, 3)", 1],
    [3, 2, 701, "B : A nằm ngoài assembly của A. A public, X protected. Trong phương thức của B có biến a kiểu A, b kiểu B; cả hai chứa cùng đối tượng B. So sánh b.X và a.X.", "Chỉ biểu thức thứ hai hợp lệ", "Cả hai lỗi", "Chỉ biểu thức thứ nhất hợp lệ", "Cả hai hợp lệ", 2],
    [3, 2, 702, "C có trường public int F, property public int P { get; set; } và chỉ mục int có cả get/set thông thường. R(ref int) và O(out int) đã khai báo hợp lệ; c đã tạo. R(ref c.F) thuộc trường hợp nào?", "Hợp lệ vì truyền trường có thể ghi", "Lỗi vì property thường không phải biến ref", "Lỗi vì chỉ mục thường không phải biến out", "Hợp lệ vì truyền biến cục bộ đã gán", 0],
    [3, 2, 703, "B : A nằm ngoài assembly của A. A public, X protected. Trong phương thức của B có biến a kiểu A, b kiểu B; cả hai chứa cùng đối tượng B. So sánh this.X và b.X.", "Cả hai lỗi", "Chỉ biểu thức thứ hai hợp lệ", "Cả hai hợp lệ", "Chỉ biểu thức thứ nhất hợp lệ", 2],
    [3, 2, 704, "Lớp N có private int _x = 1; public int P có getter trả _x và setter chỉ gán nếu value >= 0. N b = a; a.P = b.P + 2. Cả hai biến quan sát gì?", "Không đối tượng nào đổi", "Chỉ sửa được b", "Chỉ sửa được a", "Cả hai đổi vì cùng một đối tượng", 3],
    [3, 2, 705, "Mỗi phép đọc được xét ở mã khách khác assembly, không dẫn xuất từ A. X là trường public của A. A đổi thành internal, X giữ public. Kết quả gì?", "Bị chặn vì thành viên là protected", "Đọc được khi cả A và X có thể truy cập", "Bị chặn vì kiểu chứa là internal", "Bị chặn vì thành viên là internal", 2],
    [3, 2, 706, "Mỗi phép đọc được xét ở mã khách khác assembly, không dẫn xuất từ A. X là trường public của A. A được công khai, X giữ public. Kết quả gì?", "Bị chặn vì thành viên là protected", "Bị chặn vì kiểu chứa là internal", "Bị chặn vì thành viên là internal", "Đọc được khi cả A và X có thể truy cập", 3],
    [3, 2, 707, "M(ref int a, ref int b) thực hiện a += 2; b *= 3. Mỗi câu bắt đầu với x = 2 và y = 5. Sau M(ref y, ref x), cặp là gì?", "(4, 15)", "(2, 21)", "(6, 7)", "(12, 5)", 2],
    [3, 2, 708, "Lớp Dem có static int T = 1; int R = 0. Constructor tăng T rồi gán R = T. Tang() tăng R và T mỗi trường một đơn vị. Mỗi câu chạy độc lập. Tạo a, tạo b, gọi a.Tang() rồi đọc (T, a.R) được gì?", "(4, 3)", "(3, 3)", "(3, 2)", "(2, 2)", 0],
    [3, 2, 709, "B : A nằm ngoài assembly của A. A public, X protected. Trong phương thức của B có biến a kiểu A, b kiểu B; cả hai chứa cùng đối tượng B. So sánh a.X và ((B)a).X.", "Chỉ biểu thức thứ hai hợp lệ", "Chỉ biểu thức thứ nhất hợp lệ", "Cả hai lỗi", "Cả hai hợp lệ", 0],
    [3, 2, 710, "C có trường public int F, property public int P { get; set; } và chỉ mục int có cả get/set thông thường. R(ref int) và O(out int) đã khai báo hợp lệ; c đã tạo. R(ref c.P) thuộc trường hợp nào?", "Lỗi vì property thường không phải biến ref", "Hợp lệ vì truyền biến cục bộ đã gán", "Hợp lệ vì truyền trường có thể ghi", "Lỗi vì chỉ mục thường không phải biến out", 0],
    [3, 2, 711, "Lớp L có chỉ mục int, getter trả _a[i], setter chỉ nhận value >= 0. Mảng _a của mỗi thể hiện ban đầu là { 2, 4 }. Gán l[0] = l[1]; l[1] = -1. Cặp là gì?", "(6, 6)", "(4, 4)", "(2, 4)", "(2, 6)", 1],
    [3, 2, 712, "Lớp V có public int P { get; private set; } và phương thức thể hiện Cap(int n) đặt P = n nếu n >= 0. v vừa được tạo, P ban đầu bằng 0. Gọi v.Cap(4); v.Cap(-8); rồi đọc P dẫn đến gì?", "Lỗi ở phép ghi của mã khách", "Hợp lệ, P bằng 8", "Hợp lệ, P bằng 0", "Hợp lệ, P bằng 4", 3],
    [3, 2, 713, "Mỗi phép đọc được xét ở mã khách khác assembly, không dẫn xuất từ A. X là trường public của A. A được công khai, X đổi thành internal. Kết quả gì?", "Bị chặn vì thành viên là protected", "Đọc được khi cả A và X có thể truy cập", "Bị chặn vì thành viên là internal", "Bị chặn vì kiểu chứa là internal", 2],
    [3, 2, 714, "Lớp Dem có static int T = 1; int R = 0. Constructor tăng T rồi gán R = T. Tang() tăng R và T mỗi trường một đơn vị. Mỗi câu chạy độc lập. Tạo a rồi đọc (T, a.R) được gì?", "(3, 3)", "(4, 3)", "(3, 2)", "(2, 2)", 3],
    [3, 2, 715, "Lớp G có static int N = 2; static G() { N *= 3; } và G() { N++; }. Mỗi câu bắt đầu với kiểu chưa khởi tạo. Cố thêm một constructor tĩnh static G(int x) dẫn đến gì?", "8", "Lỗi biên dịch", "7", "6", 1],
    [3, 2, 716, "Lớp M có int R = 2 và static int T = 3. Tang() là phương thức thể hiện thực hiện R += T; T++. Biến a và b giữ hai M khác nhau. Sau a.Tang(); a.Tang(); bộ giá trị là gì?", "(5, 6, 5)", "(5, 2, 4)", "(2, 9, 5)", "(9, 2, 5)", 3],
    [3, 2, 717, "Xét các cặp khai báo trong một lớp. Cần nhận biết lý do để các thành viên có thể hoặc không thể cùng tồn tại. int this[int i] và int this[int k] thuộc trường hợp nào?", "Trùng chữ ký vì chỉ khác kiểu trả về", "Trùng chữ ký vì chỉ khác tên tham số", "Nạp chồng hợp lệ bằng số tham số", "Nạp chồng hợp lệ bằng kiểu tham số", 1],
    [3, 2, 718, "Lớp G có static int N = 2; static G() { N *= 3; } và G() { N++; }. Mỗi câu bắt đầu với kiểu chưa khởi tạo. Tạo hai G rồi đọc G.N cho kết quả gì?", "6", "8", "7", "Lỗi biên dịch", 1],
    [3, 2, 719, "Lớp V có _m = 2. Getter P trả _m * 2, setter P gán _m = value / 2 với phép chia nguyên. Sau v.P += 3, đọc P được gì?", "4", "6", "8", "2", 1],
    [3, 2, 720, "Lớp S có int[] a = { 3, 7 }. Chỉ mục int đọc trực tiếp a[i]. Chỉ mục string đọc a[0] nếu khóa là \"A\", còn lại đọc a[1]. s[\"0\"] trả gì?", "10", "7", "Lỗi vì thiếu chữ ký phù hợp", "3", 1],
    [3, 2, 721, "Xét các cặp khai báo trong một lớp. Cần nhận biết lý do để các thành viên có thể hoặc không thể cùng tồn tại. int this[int i] và int this[int i, int j] thuộc trường hợp nào?", "Nạp chồng hợp lệ bằng kiểu tham số", "Trùng chữ ký vì chỉ khác tên tham số", "Trùng chữ ký vì chỉ khác kiểu trả về", "Nạp chồng hợp lệ bằng số tham số", 3],
    [3, 2, 722, "Lớp L có chỉ mục int, getter trả _a[i], setter chỉ nhận value >= 0. Mảng _a của mỗi thể hiện ban đầu là { 2, 4 }. Gán l[0] = -l[1]. Cặp (l[0], l[1]) là gì?", "(2, 4)", "(6, 6)", "(2, 6)", "(4, 4)", 0],
    [3, 2, 723, "Lớp V có _m = 2. Getter P trả _m * 2, setter P gán _m = value / 2 với phép chia nguyên. Sau v.P += 1, đọc P được gì?", "4", "6", "2", "8", 0],
    [3, 2, 724, "Lớp H có trường int n; phương thức M nhận tham số int n. Biến h ban đầu có trường n = 2 và được gọi M(5). Nếu thân là this.n += n;, trường n bằng gì?", "Trường n bằng 2", "Lỗi biên dịch", "Trường n bằng 5", "Trường n bằng 7", 3],
    [3, 2, 725, "Các phương thức độc lập nhận tham số int theo những cách khác nhau. Ban đầu x = 3. M(int a) gán a += 5; sau M(x), x bằng gì?", "5", "8", "3", "Lỗi biên dịch", 2],
    [3, 2, 726, "Lớp K có trường thể hiện int n và trường static int t. Xét các biểu thức trong phương thức static của K có tham số K k. So sánh K.n và K.t.", "Cả hai hợp lệ", "Chỉ biểu thức đầu hợp lệ", "Chỉ biểu thức sau hợp lệ", "Cả hai lỗi", 2],
    [3, 2, 727, "Các phương thức độc lập nhận tham số int theo những cách khác nhau. Ban đầu x = 3. M(out int a) chỉ có a += 5; đoạn mã thuộc trường hợp nào?", "8", "Lỗi biên dịch", "5", "3", 1],
    [3, 2, 728, "Lớp H có trường int n; phương thức M nhận tham số int n. Biến h ban đầu có trường n = 2 và được gọi M(5). Nếu M được đổi thành static nhưng giữ thân this.n = n;, điều gì xảy ra?", "Trường n bằng 7", "Trường n bằng 2", "Trường n bằng 5", "Lỗi biên dịch", 3],
    [3, 2, 729, "Các phương thức độc lập nhận tham số int theo những cách khác nhau. Ban đầu x = 3. M(out int a) gán a = 8; sau M(out x), x bằng gì?", "8", "3", "Lỗi biên dịch", "5", 0],
    [3, 2, 730, "Lớp A public có trường X. Các bối cảnh là lớp dẫn xuất qua this ở assembly khác và lớp không dẫn xuất qua A ở cùng assembly. Nếu X là protected internal, quyền ở hai bối cảnh thế nào?", "Cả hai bối cảnh đều được", "Chỉ lớp cùng assembly được", "Cả hai đều bị từ chối", "Chỉ lớp dẫn xuất được", 0],
    [3, 2, 731, "Lớp A public có trường X. Các bối cảnh là lớp dẫn xuất qua this ở assembly khác và lớp không dẫn xuất qua A ở cùng assembly. Nếu X là private, quyền thế nào?", "Cả hai bối cảnh đều được", "Cả hai đều bị từ chối", "Chỉ lớp dẫn xuất được", "Chỉ lớp cùng assembly được", 1],
    [3, 2, 732, "Lớp L có chỉ mục int, getter trả _a[i], setter chỉ nhận value >= 0. Mảng _a của mỗi thể hiện ban đầu là { 2, 4 }. Gán l[1] += l[0]. Cặp là gì?", "(4, 4)", "(2, 6)", "(2, 4)", "(6, 6)", 1],
    [3, 2, 733, "Lớp I có mảng riêng { 2, 5, 9 }. Getter this[int i] trả m[i] + i, setter gán m[i] = value - i. Mỗi câu xét một đối tượng mới. Chạy t[1] = 5; đọc t[1] được gì?", "11", "6", "8", "5", 3],
    [3, 2, 734, "Lớp K có private int _n. Setter của P nhận giá trị không âm, getter trả _n. Muốn bảo vệ cùng quy tắc ở mọi đường công khai. Cách nào tái sử dụng kiểm tra của property ngay khi tạo?", "Gán _n = n trực tiếp từ constructor", "Thêm một phương thức public đọc _n", "Thêm một phương thức public gán P = n", "Gán P = n từ constructor", 3],
    [3, 2, 735, "Lớp V có _m = 2. Getter P trả _m * 2, setter P gán _m = value / 2 với phép chia nguyên. Sau v.P = 3, đọc P được gì?", "2", "6", "8", "4", 0],
    [3, 2, 736, "Lớp K có trường thể hiện int n và trường static int t. Xét các biểu thức trong phương thức static của K có tham số K k. So sánh k.n và this.n.", "Chỉ biểu thức sau hợp lệ", "Chỉ biểu thức đầu hợp lệ", "Cả hai lỗi", "Cả hai hợp lệ", 1],
    [3, 2, 737, "Xét các cặp khai báo trong một lớp. Cần nhận biết lý do để các thành viên có thể hoặc không thể cùng tồn tại. int this[int i] và int this[string s] thuộc trường hợp nào?", "Nạp chồng hợp lệ bằng kiểu tham số", "Trùng chữ ký vì chỉ khác kiểu trả về", "Trùng chữ ký vì chỉ khác tên tham số", "Nạp chồng hợp lệ bằng số tham số", 0],
    [3, 2, 738, "Mỗi phép đọc được xét ở mã khách khác assembly, không dẫn xuất từ A. X là trường public của A. A được công khai, X đổi thành protected. Kết quả gì?", "Bị chặn vì kiểu chứa là internal", "Bị chặn vì thành viên là protected", "Đọc được khi cả A và X có thể truy cập", "Bị chặn vì thành viên là internal", 1],
    [3, 2, 739, "Lớp G có static int N = 2; static G() { N *= 3; } và G() { N++; }. Mỗi câu bắt đầu với kiểu chưa khởi tạo. Tạo một G rồi đọc G.N cho kết quả gì?", "8", "Lỗi biên dịch", "6", "7", 3],
    [3, 2, 740, "Lớp K có private int _n. Setter của P nhận giá trị không âm, getter trả _n. Muốn bảo vệ cùng quy tắc ở mọi đường công khai. Cách nào thêm một đường truy vấn mà không làm đổi trạng thái?", "Thêm một phương thức public đọc _n", "Thêm một phương thức public gán P = n", "Gán P = n từ constructor", "Gán _n = n trực tiếp từ constructor", 0],
    [3, 2, 741, "Lớp S có trường int n = 4. void Tang() tăng trường n. void Goi(S s) thực hiện s.Tang(); this.Tang(). a và b là hai thể hiện S riêng. Chỉ gọi a.Goi(b), cặp (a.n, b.n) là gì?", "(4, 6)", "(5, 5)", "(6, 6)", "(6, 4)", 1],
    [3, 2, 742, "Lớp I có mảng riêng { 2, 5, 9 }. Getter this[int i] trả m[i] + i, setter gán m[i] = value - i. Mỗi câu xét một đối tượng mới. Chạy t[1] += 2; đọc t[1] được gì?", "11", "8", "6", "5", 1],
    [3, 2, 743, "Lớp K có public int P { get; private set; }. K không tĩnh, chứa phương thức thể hiện M và static S(K k). Ngoài K còn có B : K. Lớp dẫn xuất B có quyền gì với P, nếu không khai báo thành viên mới?", "Chỉ đọc được P", "Đọc và gán P qua this", "Không thể dùng this", "Đọc và gán P qua tham số k", 0],
    [3, 2, 744, "Lớp X có static int t = 1 và int n = 1. Phương thức M(ref int p) thực hiện p += t; n++; t++. a là một thể hiện, x = 4. Chạy a.M(ref x) hai lần. Bộ giá trị là gì?", "(4, 2, 3)", "(5, 2, 2)", "(7, 3, 3)", "(4, 3, 2)", 2],
    [3, 2, 745, "M(ref int a, ref int b) thực hiện a += 2; b *= 3. Mỗi câu bắt đầu với x = 2 và y = 5. Sau M(ref x, ref x), cặp là gì?", "(4, 15)", "(2, 21)", "(6, 7)", "(12, 5)", 3],
    [3, 2, 746, "Lớp V có public int P { get; private set; } và phương thức thể hiện Cap(int n) đặt P = n nếu n >= 0. v vừa được tạo, P ban đầu bằng 0. Gọi v.Cap(4); v.Cap(v.P * 2); rồi đọc P dẫn đến gì?", "Hợp lệ, P bằng 4", "Hợp lệ, P bằng 8", "Hợp lệ, P bằng 0", "Lỗi ở phép ghi của mã khách", 1],
    [3, 2, 747, "Lớp K có trường thể hiện int n và trường static int t. Xét các biểu thức trong phương thức static của K có tham số K k. So sánh this.t và k.t.", "Cả hai lỗi", "Chỉ biểu thức đầu hợp lệ", "Chỉ biểu thức sau hợp lệ", "Cả hai hợp lệ", 0],
    [3, 2, 748, "Lớp V có public int P { get; private set; } và phương thức thể hiện Cap(int n) đặt P = n nếu n >= 0. v vừa được tạo, P ban đầu bằng 0. Chỉ gọi v.Cap(-4) rồi đọc P dẫn đến gì?", "Hợp lệ, P bằng 0", "Lỗi ở phép ghi của mã khách", "Hợp lệ, P bằng 4", "Hợp lệ, P bằng 8", 0],
    [3, 2, 749, "Lớp Dem có static int T = 1; int R = 0. Constructor tăng T rồi gán R = T. Tang() tăng R và T mỗi trường một đơn vị. Mỗi câu chạy độc lập. Tạo a, tạo b rồi đọc (T, a.R) được gì?", "(4, 3)", "(3, 2)", "(2, 2)", "(3, 3)", 1],
    [3, 2, 750, "B : A nằm ngoài assembly của A. A public, X protected. Trong phương thức của B có biến a kiểu A, b kiểu B; cả hai chứa cùng đối tượng B. So sánh a.X và ((A)b).X.", "Chỉ biểu thức thứ nhất hợp lệ", "Cả hai hợp lệ", "Chỉ biểu thức thứ hai hợp lệ", "Cả hai lỗi", 3],
    [3, 2, 751, "Lớp H có _m = 4, getter P trả _m + 1 và setter P chỉ lưu value nếu 0 ≤ value ≤ 9. Xét riêng từng cặp lệnh rồi đọc P. h.P = 6; h.P += 2; đọc được gì?", "10", "7", "5", "8", 0],
    [3, 2, 752, "Lớp S có trường int n = 4. void Tang() tăng trường n. void Goi(S s) thực hiện s.Tang(); this.Tang(). a và b là hai thể hiện S riêng. Gọi a.Goi(b) rồi b.Goi(a), cặp là gì?", "(6, 6)", "(6, 4)", "(4, 6)", "(5, 5)", 0],
    [3, 2, 753, "Lớp S có int[] a = { 3, 7 }. Chỉ mục int đọc trực tiếp a[i]. Chỉ mục string đọc a[0] nếu khóa là \"A\", còn lại đọc a[1]. s[\"A\"] trả gì?", "Lỗi vì thiếu chữ ký phù hợp", "10", "7", "3", 3],
    [3, 2, 754, "Lớp M có int R = 2 và static int T = 3. Tang() là phương thức thể hiện thực hiện R += T; T++. Biến a và b giữ hai M khác nhau. Sau a.Tang(); b.Tang(); bộ giá trị là gì?", "(2, 9, 5)", "(5, 6, 5)", "(9, 2, 5)", "(5, 2, 4)", 1],
    [3, 2, 755, "Lớp S có int[] a = { 3, 7 }. Chỉ mục int đọc trực tiếp a[i]. Chỉ mục string đọc a[0] nếu khóa là \"A\", còn lại đọc a[1]. s[0] + s[\"0\"] trả gì?", "10", "7", "Lỗi vì thiếu chữ ký phù hợp", "3", 0],
    [3, 2, 756, "Lớp H có trường int n; phương thức M nhận tham số int n. Biến h ban đầu có trường n = 2 và được gọi M(5). Nếu thân là n += this.n;, trường n sau lời gọi bằng gì?", "Trường n bằng 5", "Trường n bằng 7", "Trường n bằng 2", "Lỗi biên dịch", 2],
    [4, 2, 757, "A có public int X = 2, B : A có public new int X = 5. C : B không khai báo X. Trong phương thức C có biến c kiểu C trỏ chính đối tượng. Biểu thức nào chọn trường B bằng cách chuyển kiểu tường minh sang B?", "((A)c).X", "((A)c).X + c.X", "base.X", "((B)c).X", 3],
    [4, 2, 758, "A public có internal int M và protected int N. B : A ở assembly khác; C : A ở cùng assembly với A. Lớp độc lập ngoài assembly, qua biến A, truy cập được gì?", "Chỉ M", "Chỉ N", "Cả M và N", "Không trường nào", 3],
    [4, 2, 759, "A, B : A và C : B đều có constructor thể hiện hợp lệ. A và C khai báo finalizer, B không khai báo. Nếu B bổ sung finalizer, thứ tự các thân finalizer của C là gì?", "C → A", "A → C", "C → B → A", "A → B → C", 2],
    [4, 2, 760, "A, B : A và C : B đều có constructor thể hiện hợp lệ. A và C khai báo finalizer, B không khai báo. Khi runtime hoàn tất đối tượng C, thứ tự các thân finalizer được khai báo là gì?", "C → B → A", "A → B → C", "C → A", "A → C", 2],
    [4, 2, 761, "A có private int _m. Constructor duy nhất A(int n) gọi phương thức riêng KiemTra để lưu giá trị. A có public int P chỉ đọc. B : A muốn khởi tạo và sau đó dùng giá trị. Thay đổi nào dẫn đến ngầm gọi constructor A() không tồn tại?", "Bỏ initializer của B", "Gán trực tiếp _m trong B", "Dùng : base(n) và đọc P", "Khai báo trường _m riêng trong B", 0],
    [4, 2, 762, "A chỉ khai báo protected A(int n). Mã khách ở ngoài hệ kế thừa. Các biến thể của B : A được xét riêng. B có public B() : base(2) { }. Kết quả gì?", "Lỗi vì chọn sai kiểu đối số base", "B hợp lệ nhưng khách không tạo được B()", "B hợp lệ và khách tạo được B()", "Lỗi vì cố gọi A() không tồn tại", 2],
    [4, 2, 763, "A, B : A và C : B đều có constructor thể hiện hợp lệ. A và C khai báo finalizer, B không khai báo. Khi new C(), thứ tự các thân constructor là gì?", "A → C", "A → B → C", "C → A", "C → B → A", 1],
    [4, 2, 764, "A khai báo public int M() trả 2. B : A có new int M() trả 5. Trong A có int N() trả M() + 1; trong B có int P() trả M() + 1. A a = new B(); a.P() dẫn đến gì?", "6", "3", "9", "Lỗi vì A không khai báo P", 3],
    [4, 2, 765, "B : A, C : B, D : A. B có N() công khai, C thừa hưởng. Biến a kiểu A đang giữ một C. B b = (B)a; có kết quả gì?", "Lỗi vì kiểu khai báo không có N", "Thành công và giữ đối tượng gốc", "Lỗi vì không có chuyển đổi ngầm định xuống B", "Biên dịch nhưng ép kiểu thất bại khi chạy", 1],
    [4, 2, 766, "A có phương thức không ảo M() trả 1; B : A có phương thức không ảo M() trả 2 và không ghi new. Giả sử cảnh báo không được coi là lỗi. A a = new B(); a.M() có kết quả gì?", "Gọi M của B, trả 2", "Vẫn giữ cách chọn phương thức nhưng bỏ cảnh báo che khuất", "Lỗi vì không thể ghi đè M không ảo", "Gọi M của A, trả 1", 3],
    [4, 2, 767, "B : A, C : B, D : A. B có N() công khai, C thừa hưởng. Biến a kiểu A đang giữ một C. a.N(); có kết quả gì?", "Lỗi vì không có chuyển đổi ngầm định xuống B", "Lỗi vì kiểu khai báo không có N", "Thành công và giữ đối tượng gốc", "Biên dịch nhưng ép kiểu thất bại khi chạy", 1],
    [4, 2, 768, "A() in A0 và A(int) in A1. B() : this(1) in B0; B(int) : base(2) in B1. C() ngầm gọi base() rồi in C0. new C() in thứ tự gì?", "A1 → B1 → B0 → C0", "A0 → B1 → B0 → C0", "A1 → B1 → B0", "A1 → B1", 0],
    [4, 2, 769, "A có public string M() trả \"A\". B : A có new M() trả base.M() + \"B\". C : B có new M() trả base.M() + \"C\". Với C c = new C(), c.M() trả gì?", "\"AABC\"", "\"AB\"", "\"A\"", "\"ABC\"", 3],
    [4, 2, 770, "A có protected int X. B : A khai báo public new int X. Trong B, một phương thức nhận tham số B b và thao tác trên chính this. b.X chỉ đến trường nào?", "Trường B của đối tượng b", "Trường A của this", "Lỗi truy cập", "Trường B của this", 0],
    [4, 2, 771, "A chỉ khai báo protected A(int n). Mã khách ở ngoài hệ kế thừa. Các biến thể của B : A được xét riêng. B có protected B() : base(2) { }. Kết quả gì?", "B hợp lệ và khách tạo được B()", "Lỗi vì chọn sai kiểu đối số base", "Lỗi vì cố gọi A() không tồn tại", "B hợp lệ nhưng khách không tạo được B()", 3],
    [4, 2, 772, "A có protected int X. B : A khai báo public new int X. Trong B, một phương thức nhận tham số B b và thao tác trên chính this. this.X chỉ đến trường nào?", "Trường A của this", "Trường B của đối tượng b", "Trường B của this", "Lỗi truy cập", 2],
    [4, 2, 773, "A(int n) lưu X = n. B(int n) : base(n + 2) lưu Y = X * 2. C(int n) : base(n + 3) lưu Z = X + Y. Mỗi câu dùng new C(1). Đối số truyền từ C đến B là bao nhiêu?", "4", "6", "1", "18", 0],
    [4, 2, 774, "A(int n) lưu X = n. B(int n) : base(n + 2) lưu Y = X * 2. C(int n) : base(n + 3) lưu Z = X + Y. Mỗi câu dùng new C(1). Sau toàn bộ chuỗi khởi tạo, X bằng bao nhiêu?", "6", "4", "1", "18", 0],
    [4, 2, 775, "A() in A0 và A(int) in A1. B() : this(1) in B0; B(int) : base(2) in B1. C() ngầm gọi base() rồi in C0. Nếu bỏ : base(2) khỏi B(int) mà không sửa gì khác, new C() in gì?", "A1 → B1 → B0 → C0", "A0 → B1 → B0 → C0", "A1 → B1 → B0", "A1 → B1", 1],
    [4, 2, 776, "A có public int X = 2, B : A có public new int X = 5. C : B không khai báo X. Trong phương thức C có biến c kiểu C trỏ chính đối tượng. Biểu thức nào chọn duy nhất trường do A khai báo bằng ép kiểu?", "((A)c).X", "base.X", "((A)c).X + c.X", "((B)c).X", 0],
    [4, 2, 777, "A có X = 2. B : A khai báo new X = 4. C : B khai báo new X = 8. C có phương thức Doc() trả base.X + this.X. C c = new C(); đọc c.X bằng bao nhiêu?", "2", "12", "4", "8", 3],
    [4, 2, 778, "A có X = 2. B : A khai báo new X = 4. C : B khai báo new X = 8. C có phương thức Doc() trả base.X + this.X. B b = new C(); đọc b.X bằng bao nhiêu?", "4", "8", "2", "12", 0],
    [4, 2, 779, "A có phương thức không ảo M() trả 1; B : A có phương thức không ảo M() trả 2 và không ghi new. Giả sử cảnh báo không được coi là lỗi. Đổi khai báo B.M sang override có hệ quả gì?", "Vẫn giữ cách chọn phương thức nhưng bỏ cảnh báo che khuất", "Gọi M của A, trả 1", "Lỗi vì không thể ghi đè M không ảo", "Gọi M của B, trả 2", 2],
    [4, 2, 780, "A có A(int n) và private A(). B : A có B(int n) : base(n). C : B chỉ có constructor riêng nếu được thêm. Nếu C để trình biên dịch tạo constructor ngầm, cần thêm gì vào B để new C() hợp lệ?", "Bổ sung C(int n) : base(n)", "Bỏ : base(n) ở B(int n)", "Bổ sung B() : base(0)", "Bổ sung C() : base(1)", 2],
    [4, 2, 781, "B : A, C : B, D : A. B có N() công khai, C thừa hưởng. Biến a kiểu A đang giữ một C. D d = (D)a; có kết quả gì?", "Thành công và giữ đối tượng gốc", "Lỗi vì không có chuyển đổi ngầm định xuống B", "Biên dịch nhưng ép kiểu thất bại khi chạy", "Lỗi vì kiểu khai báo không có N", 2],
    [4, 2, 782, "A chỉ khai báo protected A(int n). Mã khách ở ngoài hệ kế thừa. Các biến thể của B : A được xét riêng. B không khai báo constructor. Kết quả gì?", "Lỗi vì cố gọi A() không tồn tại", "B hợp lệ nhưng khách không tạo được B()", "Lỗi vì chọn sai kiểu đối số base", "B hợp lệ và khách tạo được B()", 0],
    [4, 2, 783, "A có public static int X = 1 và trường thể hiện public int Y = 2. B : A không khai báo X hoặc Y mới. B b = new B(); int x = b.X; dẫn đến gì?", "Lỗi do truy cập thành viên tĩnh qua đối tượng", "Hai trường thể hiện độc lập", "Một biến tĩnh dùng chung được đọc qua hai tên kiểu", "Cùng trường thể hiện được truy cập qua hai biến", 0],
    [4, 2, 784, "A có public static int X = 1 và trường thể hiện public int Y = 2. B : A không khai báo X hoặc Y mới. Đọc Y từ new A() và new B() minh họa điều gì về lưu trữ?", "Hai trường thể hiện độc lập", "Một biến tĩnh dùng chung được đọc qua hai tên kiểu", "Cùng trường thể hiện được truy cập qua hai biến", "Lỗi do truy cập thành viên tĩnh qua đối tượng", 0],
    [4, 2, 785, "A có phương thức không ảo M() trả 1; B : A có phương thức không ảo M() trả 2 và không ghi new. Giả sử cảnh báo không được coi là lỗi. B b = new B(); b.M() có kết quả gì?", "Vẫn giữ cách chọn phương thức nhưng bỏ cảnh báo che khuất", "Gọi M của B, trả 2", "Lỗi vì không thể ghi đè M không ảo", "Gọi M của A, trả 1", 1],
    [4, 2, 786, "A khai báo public int M() trả 2. B : A có new int M() trả 5. Trong A có int N() trả M() + 1; trong B có int P() trả M() + 1. B b = new B(); b.N() trả gì?", "6", "3", "9", "Lỗi vì A không khai báo P", 1],
    [4, 2, 787, "A có A(int n) và private A(). B : A có B(int n) : base(n). C : B chỉ có constructor riêng nếu được thêm. Thay đổi nào cho phép chuyển n do khách chọn từ C qua B đến A?", "Bỏ : base(n) ở B(int n)", "Bổ sung B() : base(0)", "Bổ sung C(int n) : base(n)", "Bổ sung C() : base(1)", 2],
    [4, 2, 788, "A có public int X = 2, B : A có public new int X = 5. C : B không khai báo X. Trong phương thức C có biến c kiểu C trỏ chính đối tượng. Biểu thức nào chọn trường của lớp cơ sở trực tiếp bằng từ khóa?", "((B)c).X", "((A)c).X + c.X", "((A)c).X", "base.X", 3],
    [4, 2, 789, "A có public int X = 2, B : A có public new int X = 5. C : B không khai báo X. Trong phương thức C có biến c kiểu C trỏ chính đối tượng. Biểu thức nào đọc hai vùng lưu trữ và trả 7?", "((B)c).X", "base.X", "((A)c).X + c.X", "((A)c).X", 2],
    [4, 2, 790, "A có protected int X. B : A khai báo public new int X. Trong B, một phương thức nhận tham số B b và thao tác trên chính this. ((A)b).X trong phương thức của B dẫn đến gì?", "Trường A của this", "Trường B của đối tượng b", "Trường B của this", "Lỗi truy cập", 3],
    [4, 2, 791, "A có phương thức không ảo M() trả 1; B : A có phương thức không ảo M() trả 2 và không ghi new. Giả sử cảnh báo không được coi là lỗi. Thêm new vào B.M thay đổi điều gì?", "Lỗi vì không thể ghi đè M không ảo", "Gọi M của B, trả 2", "Vẫn giữ cách chọn phương thức nhưng bỏ cảnh báo che khuất", "Gọi M của A, trả 1", 2],
    [4, 2, 792, "A có public static int X = 1 và trường thể hiện public int Y = 2. B : A không khai báo X hoặc Y mới. Đọc A.X rồi B.X minh họa điều gì?", "Một biến tĩnh dùng chung được đọc qua hai tên kiểu", "Hai trường thể hiện độc lập", "Cùng trường thể hiện được truy cập qua hai biến", "Lỗi do truy cập thành viên tĩnh qua đối tượng", 0],
    [4, 2, 793, "A(int n) lưu X = n. B(int n) : base(n + 2) lưu Y = X * 2. C(int n) : base(n + 3) lưu Z = X + Y. Mỗi câu dùng new C(1). Sau toàn bộ chuỗi khởi tạo, Z bằng bao nhiêu?", "4", "18", "6", "1", 1],
    [4, 2, 794, "A public có internal int M và protected int N. B : A ở assembly khác; C : A ở cùng assembly với A. Trong B, qua this, truy cập được gì?", "Không trường nào", "Chỉ N", "Chỉ M", "Cả M và N", 1],
    [4, 2, 795, "A public có internal int M và protected int N. B : A ở assembly khác; C : A ở cùng assembly với A. Lớp độc lập cùng assembly với A, qua biến A, truy cập được gì?", "Cả M và N", "Không trường nào", "Chỉ M", "Chỉ N", 2],
    [4, 2, 796, "A có public string M() trả \"A\". B : A có new M() trả base.M() + \"B\". C : B có new M() trả base.M() + \"C\". Với A a = new C(), a.M() trả gì?", "\"AB\"", "\"A\"", "\"ABC\"", "\"AABC\"", 1],
    [4, 2, 797, "A chỉ khai báo protected A(int n). Mã khách ở ngoài hệ kế thừa. Các biến thể của B : A được xét riêng. B có public B() : base(\"2\") { }. Kết quả gì?", "Lỗi vì chọn sai kiểu đối số base", "B hợp lệ và khách tạo được B()", "Lỗi vì cố gọi A() không tồn tại", "B hợp lệ nhưng khách không tạo được B()", 0],
    [4, 2, 798, "A() in A0 và A(int) in A1. B() : this(1) in B0; B(int) : base(2) in B1. C() ngầm gọi base() rồi in C0. new B(3) in thứ tự gì?", "A0 → B1 → B0 → C0", "A1 → B1", "A1 → B1 → B0", "A1 → B1 → B0 → C0", 1],
    [4, 2, 799, "A có X = 2. B : A khai báo new X = 4. C : B khai báo new X = 8. C có phương thức Doc() trả base.X + this.X. C c = new C(); gọi c.Doc() trả bao nhiêu?", "2", "4", "8", "12", 3],
    [4, 2, 800, "A có public string M() trả \"A\". B : A có new M() trả base.M() + \"B\". C : B có new M() trả base.M() + \"C\". Với B b = new C(), b.M() trả gì?", "\"ABC\"", "\"A\"", "\"AB\"", "\"AABC\"", 2],
    [4, 2, 801, "A khai báo public int M() trả 2. B : A có new int M() trả 5. Trong A có int N() trả M() + 1; trong B có int P() trả M() + 1. B b = new B(); b.N() + b.P() trả gì?", "Lỗi vì A không khai báo P", "9", "6", "3", 1],
    [4, 2, 802, "A khai báo public int M() trả 2. B : A có new int M() trả 5. Trong A có int N() trả M() + 1; trong B có int P() trả M() + 1. B b = new B(); b.P() trả gì?", "9", "Lỗi vì A không khai báo P", "3", "6", 3],
    [4, 2, 803, "A có private int _m. Constructor duy nhất A(int n) gọi phương thức riêng KiemTra để lưu giá trị. A có public int P chỉ đọc. B : A muốn khởi tạo và sau đó dùng giá trị. Cách nào tạo một vùng lưu trữ riêng không được getter P của A đọc?", "Dùng : base(n) và đọc P", "Bỏ initializer của B", "Gán trực tiếp _m trong B", "Khai báo trường _m riêng trong B", 3],
    [4, 2, 804, "A có public string M() trả \"A\". B : A có new M() trả base.M() + \"B\". C : B có new M() trả base.M() + \"C\". Cho C c = new C(); A a = c; biểu thức a.M() + c.M() trả gì?", "\"AB\"", "\"ABC\"", "\"A\"", "\"AABC\"", 3],
    [4, 2, 805, "A có A(int n) và private A(). B : A có B(int n) : base(n). C : B chỉ có constructor riêng nếu được thêm. Thay đổi nào cho phép new C() mà không đổi B?", "Bổ sung B() : base(0)", "Bổ sung C() : base(1)", "Bổ sung C(int n) : base(n)", "Bỏ : base(n) ở B(int n)", 1],
    [4, 2, 806, "A, B : A và C : B đều có constructor thể hiện hợp lệ. A và C khai báo finalizer, B không khai báo. Nếu chỉ theo dõi thân constructor của A và C khi new C(), thứ tự thấy được là gì?", "A → C", "C → B → A", "C → A", "A → B → C", 0],
    [4, 2, 807, "A có private int _m. Constructor duy nhất A(int n) gọi phương thức riêng KiemTra để lưu giá trị. A có public int P chỉ đọc. B : A muốn khởi tạo và sau đó dùng giá trị. Giải pháp nào giữ đúng quy tắc khởi tạo và đọc dữ liệu A đã lưu?", "Khai báo trường _m riêng trong B", "Dùng : base(n) và đọc P", "Bỏ initializer của B", "Gán trực tiếp _m trong B", 1],
    [4, 2, 808, "A có A(int n) và private A(). B : A có B(int n) : base(n). C : B chỉ có constructor riêng nếu được thêm. Thay đổi nào làm B cố gọi constructor private A() và lỗi?", "Bỏ : base(n) ở B(int n)", "Bổ sung C() : base(1)", "Bổ sung C(int n) : base(n)", "Bổ sung B() : base(0)", 0],
    [4, 2, 809, "B : A, C : B, D : A. B có N() công khai, C thừa hưởng. Biến a kiểu A đang giữ một C. B b = a; có kết quả gì?", "Lỗi vì kiểu khai báo không có N", "Biên dịch nhưng ép kiểu thất bại khi chạy", "Thành công và giữ đối tượng gốc", "Lỗi vì không có chuyển đổi ngầm định xuống B", 3],
    [4, 2, 810, "A có protected int X. B : A khai báo public new int X. Trong B, một phương thức nhận tham số B b và thao tác trên chính this. base.X chỉ đến trường nào?", "Lỗi truy cập", "Trường B của đối tượng b", "Trường A của this", "Trường B của this", 2],
    [4, 2, 811, "A(int n) lưu X = n. B(int n) : base(n + 2) lưu Y = X * 2. C(int n) : base(n + 3) lưu Z = X + Y. Mỗi câu dùng new C(1). Đối số truyền vào C(int) từ mã khách là bao nhiêu?", "4", "18", "6", "1", 3],
    [4, 2, 812, "A có public static int X = 1 và trường thể hiện public int Y = 2. B : A không khai báo X hoặc Y mới. B b = new B(); A a = b; a.Y = 9; đọc b.Y và a.Y minh họa điều gì?", "Một biến tĩnh dùng chung được đọc qua hai tên kiểu", "Cùng trường thể hiện được truy cập qua hai biến", "Hai trường thể hiện độc lập", "Lỗi do truy cập thành viên tĩnh qua đối tượng", 1],
    [4, 2, 813, "A public có internal int M và protected int N. B : A ở assembly khác; C : A ở cùng assembly với A. Trong C, qua this, truy cập được gì?", "Cả M và N", "Chỉ M", "Chỉ N", "Không trường nào", 0],
    [4, 2, 814, "A có private int _m. Constructor duy nhất A(int n) gọi phương thức riêng KiemTra để lưu giá trị. A có public int P chỉ đọc. B : A muốn khởi tạo và sau đó dùng giá trị. Thử nghiệm nào dùng sai quyền truy cập vào trường private của A?", "Bỏ initializer của B", "Dùng : base(n) và đọc P", "Gán trực tiếp _m trong B", "Khai báo trường _m riêng trong B", 2],
    [4, 2, 815, "A có X = 2. B : A khai báo new X = 4. C : B khai báo new X = 8. C có phương thức Doc() trả base.X + this.X. A a = new C(); đọc a.X bằng bao nhiêu?", "8", "2", "12", "4", 1],
    [4, 2, 816, "A() in A0 và A(int) in A1. B() : this(1) in B0; B(int) : base(2) in B1. C() ngầm gọi base() rồi in C0. new B() in thứ tự gì?", "A1 → B1 → B0 → C0", "A0 → B1 → B0 → C0", "A1 → B1 → B0", "A1 → B1", 2],
    [5, 2, 817, "A là lớp trừu tượng có protected int n, constructor nhận int, abstract int Tinh() và virtual string Nhan() trả \"G\". I là giao diện cổ điển chỉ có int Tinh(). Các lớp trong cùng nhánh cần dùng n và khởi tạo có kiểm soát. Chọn cách nào?", "Dùng I làm hợp đồng cho các lớp không chung cơ sở", "Ghi đè Tinh bằng override", "Giữ Nhan mặc định bằng cách không ghi đè", "Giữ A cho phần khởi tạo và trạng thái", 3],
    [5, 2, 818, "A có virtual int M() trả 2. B : A có new virtual int M() trả 5. C : B override M() trả 8. B x = new C(); x.M() trả gì?", "8", "10", "2", "5", 0],
    [5, 2, 819, "I khai báo int M(). A thực thi I bằng public int M() trả 1. B : A khai báo public new int M() trả 4. C : A, I khai báo public new int M() trả 7. C c = new C(); ((A)c).M() + ((I)c).M() bằng bao nhiêu?", "1", "8", "7", "4", 1],
    [5, 2, 820, "I có int M(); J có int N(); K : I, J. C thực thi K bằng M() trả 2 và N() trả 4. a, b, c có kiểu I, J, K và cùng giữ một C. a.M() trả gì?", "Lỗi vì kiểu tham chiếu thiếu thành viên", "2", "4", "6", 1],
    [5, 2, 821, "A có abstract int M() và virtual int N() trả M() + 2. B : A override M() trả 4. C : B override M() trả 7. A a = new A(); a.N() dẫn đến gì?", "Lỗi vì A trừu tượng", "6", "9", "4", 0],
    [5, 2, 822, "A có virtual int Tinh() trả 1. B : A override Tinh() trả 3. C : B có new int Tinh() trả 6. A có Tong(A x) trả Tinh() + x.Tinh(). Tạo C c = new C(). c.Tinh() + ((A)c).Tinh() trả gì?", "9", "12", "4", "6", 0],
    [5, 2, 823, "Hai đối tượng khác tham chiếu nhưng có cùng mã nghiệp vụ. Lớp C muốn Equals phản ánh mã nghiệp vụ và dùng được trong tập hợp dựa trên băm. Thao tác nào xác định kiểu thực của từng đối tượng?", "Ghi đè ToString", "Gọi GetType", "Ghi đè Equals theo mã", "Ghi đè GetHashCode nhất quán với Equals", 1],
    [5, 2, 824, "A có virtual int M() trả 2. B : A có new virtual int M() trả 5. C : B override M() trả 8. C x = new C(); ((A)x).M() + ((B)x).M() trả gì?", "8", "5", "10", "2", 2],
    [5, 2, 825, "A có virtual int M() trả 2. B : A override M() trả 5 và có int N() trả base.M(). C : B override M() trả 9. B b = new C(); b.N() trả gì?", "2", "9", "11", "5", 0],
    [5, 2, 826, "A ghi đè ToString() trả \"A\"; B : A ghi đè trả \"B\". A không ghi đè Equals. object o = new B(); o.Equals(o) trả gì với bản Equals mặc định của object?", "\"B\"", "Thông tin kiểu B", "\"A\"", "true", 3],
    [5, 2, 827, "A là lớp trừu tượng có protected int n, constructor nhận int, abstract int Tinh() và virtual string Nhan() trả \"G\". I là giao diện cổ điển chỉ có int Tinh(). Lớp cụ thể dẫn xuất A hoàn thành thành viên bắt buộc bằng cách nào?", "Giữ Nhan mặc định bằng cách không ghi đè", "Dùng I làm hợp đồng cho các lớp không chung cơ sở", "Ghi đè Tinh bằng override", "Giữ A cho phần khởi tạo và trạng thái", 2],
    [5, 2, 828, "A có virtual int M() trả 1. B : A override M() trả 2. C : B có new int M() trả 3. D : C không khai báo lại. D x = new D(); ((C)x).M() + x.M() trả gì?", "5", "3", "6", "2", 2],
    [5, 2, 829, "A có abstract int M() và virtual int N() trả M() + 2. B : A override M() trả 4. C : B override M() trả 7. A a = new B(); a.N() trả gì?", "9", "Lỗi vì A trừu tượng", "4", "6", 3],
    [5, 2, 830, "A có virtual string M() trả \"A\". B : A override M() trả base.M() + \"B\". C : B override M() trả base.M() + \"C\". A x = new B(); x.M() trả gì?", "\"AC\"", "\"AB\"", "\"ABC\"", "\"A\"", 1],
    [5, 2, 831, "A trừu tượng khai báo abstract void M(). B : A chưa thực hiện M; C là lớp cụ thể dẫn xuất từ B. Trong B, thử viết một phương thức thường gọi base.M(). Điều gì xảy ra?", "Hoàn thành nghĩa vụ ở C", "Lỗi vì gọi trực tiếp phương thức abstract của A", "Cho phép hoãn nghĩa vụ ở B", "Lỗi vì chỉ che khuất phương thức abstract", 1],
    [5, 2, 832, "I khai báo int P { get; }. C thực thi với public int P { get; set; }. Giả sử C c = new C(); I i = c; c.P = 3; trước từng thao tác. i.P += 2; dẫn đến gì?", "Đọc được 6", "Ghi được và i đọc thấy 5", "Đọc được 3", "Lỗi vì hợp đồng I thiếu setter", 3],
    [5, 2, 833, "A có virtual int M() trả 1. B : A override M() trả 2. C : B có new int M() trả 3. D : C không khai báo lại. C x = new D(); x.M() trả gì?", "5", "2", "3", "6", 2],
    [5, 2, 834, "I và J cùng khai báo int Doc(). C : I, J dùng một public int Doc() trả 2. B : C che khuất bằng new int Doc() trả 5 và không liệt kê lại giao diện. B b = new B(); b.Doc() trả gì?", "5", "9", "2", "7", 0],
    [5, 2, 835, "A có virtual int Tinh() trả 1. B : A override Tinh() trả 3. C : B có new int Tinh() trả 6. A có Tong(A x) trả Tinh() + x.Tinh(). Tạo C c = new C(). c.Tinh() + c.Tinh() trả gì?", "4", "6", "12", "9", 2],
    [5, 2, 836, "A có abstract int M() và virtual int N() trả M() + 2. B : A override M() trả 4. C : B override M() trả 7. A a = new C(); a.N() trả gì?", "6", "9", "4", "Lỗi vì A trừu tượng", 1],
    [5, 2, 837, "I khai báo int this[int i] { get; }. C : I có chỉ mục int trả i + 1 và chỉ mục string trả 9. C c = new C(); I x = c; x[2] + c[\"2\"] trả gì?", "12", "9", "Lỗi vì giao diện không có chỉ mục string", "3", 0],
    [5, 2, 838, "A có virtual int M() trả 2. B : A override M() trả base.M() * 2. C : B override M() trả base.M() + 3. Với mã gốc, B x = new B(); x.M() trả gì?", "4", "Lỗi biên dịch", "7", "2", 0],
    [5, 2, 839, "A có virtual string M() trả \"A\". B : A override M() trả base.M() + \"B\". C : B override M() trả base.M() + \"C\". A x = new A(); x.M() trả gì?", "\"AC\"", "\"AB\"", "\"A\"", "\"ABC\"", 2],
    [5, 2, 840, "A có abstract int M() và virtual int N() trả M() + 2. B : A override M() trả 4. C : B override M() trả 7. A a = new B(); a.M() trả gì?", "4", "9", "6", "Lỗi vì A trừu tượng", 0],
    [5, 2, 841, "I và J cùng khai báo int Doc(). C : I, J dùng một public int Doc() trả 2. B : C che khuất bằng new int Doc() trả 5 và không liệt kê lại giao diện. I i = new B(); i.Doc() trả gì?", "9", "5", "7", "2", 3],
    [5, 2, 842, "A trừu tượng khai báo abstract void M(). B : A chưa thực hiện M; C là lớp cụ thể dẫn xuất từ B. Với B abstract, C khai báo public override void M() { }. Tác dụng là gì?", "Hoàn thành nghĩa vụ ở C", "Cho phép hoãn nghĩa vụ ở B", "Lỗi vì chỉ che khuất phương thức abstract", "Lỗi vì gọi trực tiếp phương thức abstract của A", 0],
    [5, 2, 843, "I khai báo int Doc(). A : I thực thi bằng public virtual int Doc() trả 3. B : A override Doc() trả 8. C : A dùng public new int Doc() trả 5 và không khai báo lại I. C c = new C(); I i = new B(); c.Doc() + i.Doc() trả gì?", "3", "8", "5", "13", 3],
    [5, 2, 844, "I khai báo int this[int i] { get; }. C : I có chỉ mục int trả i + 1 và chỉ mục string trả 9. C c = new C(); I x = c; c[\"2\"] trả gì?", "9", "3", "Lỗi vì giao diện không có chỉ mục string", "12", 0],
    [5, 2, 845, "A có virtual int M() trả 2 và int N() trả M() + 1. B : A override M() trả 5. C : A có new M() trả 7. A a = new C(); a.N() trả gì?", "7", "3", "6", "10", 1],
    [5, 2, 846, "A ghi đè ToString() trả \"A\"; B : A ghi đè trả \"B\". A không ghi đè Equals. object o = new B(); new A().ToString() trả gì?", "\"B\"", "true", "Thông tin kiểu B", "\"A\"", 3],
    [5, 2, 847, "Lớp C có trường int N và trường tham chiếu Box H với H.Value kiểu int. a.N = 1, a.H.Value = 2. C cung cấp Copy() gọi MemberwiseClone(). C b = a.Copy(); b.H = new Box(); b.H.Value = 9; đọc (a.N, b.H.Value) được gì?", "(8, 2)", "(1, 9)", "(1, 5)", "(1, 2)", 1],
    [5, 2, 848, "A có virtual int M() trả 1. B : A override M() trả 2. C : B có new int M() trả 3. D : C không khai báo lại. D x = new D(); ((B)x).M() + x.M() trả gì?", "6", "2", "3", "5", 3],
    [5, 2, 849, "Hai đối tượng khác tham chiếu nhưng có cùng mã nghiệp vụ. Lớp C muốn Equals phản ánh mã nghiệp vụ và dùng được trong tập hợp dựa trên băm. Thay đổi nào làm phép so sánh Equals xem hai đối tượng này là tương đương?", "Ghi đè GetHashCode nhất quán với Equals", "Gọi GetType", "Ghi đè ToString", "Ghi đè Equals theo mã", 3],
    [5, 2, 850, "A có virtual int M() trả 2. B : A override M() trả 5 và có int N() trả base.M(). C : B override M() trả 9. A a = new B(); a.M() trả gì?", "9", "11", "2", "5", 3],
    [5, 2, 851, "A trừu tượng có trường protected X. Constructor A(int x) gán X = x; phương thức N() trả M() + X; M là abstract int. B(int n) : base(n + 1) và B.M() trả X * 2. Sau new B(2), phần trạng thái do A khởi tạo là bao nhiêu?", "6", "9", "12", "3", 3],
    [5, 2, 852, "A có virtual int M() trả 2 và int N() trả M() + 1. B : A override M() trả 5. C : A có new M() trả 7. C c = new C(); c.M() + c.N() trả gì?", "3", "10", "7", "6", 1],
    [5, 2, 853, "A có virtual int M() trả 2. B : A có new virtual int M() trả 5. C : B override M() trả 8. A x = new C(); x.M() trả gì?", "2", "5", "10", "8", 0],
    [5, 2, 854, "A trừu tượng khai báo abstract void M(). B : A chưa thực hiện M; C là lớp cụ thể dẫn xuất từ B. Trong C, thử dùng public new void M() { } thay override. Điều gì xảy ra?", "Hoàn thành nghĩa vụ ở C", "Lỗi vì chỉ che khuất phương thức abstract", "Cho phép hoãn nghĩa vụ ở B", "Lỗi vì gọi trực tiếp phương thức abstract của A", 1],
    [5, 2, 855, "A có virtual int M() trả 2. B : A override M() trả 5 và có int N() trả base.M(). C : B override M() trả 9. C c = new C(); c.N() + c.M() trả gì?", "9", "2", "11", "5", 2],
    [5, 2, 856, "I khai báo int this[int i] { get; }. C : I có chỉ mục int trả i + 1 và chỉ mục string trả 9. C c = new C(); I x = c; x[\"2\"] dẫn đến gì?", "9", "Lỗi vì giao diện không có chỉ mục string", "3", "12", 1],
    [5, 2, 857, "I có int M(); J có int N(); K : I, J. C thực thi K bằng M() trả 2 và N() trả 4. a, b, c có kiểu I, J, K và cùng giữ một C. c.M() + c.N() trả gì?", "2", "4", "Lỗi vì kiểu tham chiếu thiếu thành viên", "6", 3],
    [5, 2, 858, "I và J cùng khai báo int Doc(). C : I, J dùng một public int Doc() trả 2. B : C che khuất bằng new int Doc() trả 5 và không liệt kê lại giao diện. B b = new B(); ((I)b).Doc() + ((J)b).Doc() + b.Doc() trả gì?", "9", "7", "2", "5", 0],
    [5, 2, 859, "I khai báo int M(). A thực thi I bằng public int M() trả 1. B : A khai báo public new int M() trả 4. C : A, I khai báo public new int M() trả 7. B b = new B(); b.M() trả gì?", "1", "7", "8", "4", 3],
    [5, 2, 860, "Hai đối tượng khác tham chiếu nhưng có cùng mã nghiệp vụ. Lớp C muốn Equals phản ánh mã nghiệp vụ và dùng được trong tập hợp dựa trên băm. Thay đổi nào bảo đảm hai đối tượng tương đương tạo cùng mã băm?", "Ghi đè Equals theo mã", "Ghi đè GetHashCode nhất quán với Equals", "Gọi GetType", "Ghi đè ToString", 1],
    [5, 2, 861, "A ghi đè ToString() trả \"A\"; B : A ghi đè trả \"B\". A không ghi đè Equals. object o = new B(); o.GetType() biểu diễn gì?", "Thông tin kiểu B", "\"A\"", "\"B\"", "true", 0],
    [5, 2, 862, "I khai báo int Doc(). A : I thực thi bằng public virtual int Doc() trả 3. B : A override Doc() trả 8. C : A dùng public new int Doc() trả 5 và không khai báo lại I. I x = new B(); x.Doc() trả gì?", "8", "3", "5", "13", 0],
    [5, 2, 863, "I có int M(); J có int N(); K : I, J. C thực thi K bằng M() trả 2 và N() trả 4. a, b, c có kiểu I, J, K và cùng giữ một C. b.N() trả gì?", "Lỗi vì kiểu tham chiếu thiếu thành viên", "2", "6", "4", 3],
    [5, 2, 864, "A có virtual int Tinh() trả 1. B : A override Tinh() trả 3. C : B có new int Tinh() trả 6. A có Tong(A x) trả Tinh() + x.Tinh(). Tạo C c = new C(). c.Tong(new A()) trả gì?", "9", "4", "6", "12", 1],
    [5, 2, 865, "I có int M(); J có int N(); K : I, J. C thực thi K bằng M() trả 2 và N() trả 4. a, b, c có kiểu I, J, K và cùng giữ một C. a.N() + b.M() dẫn đến gì?", "Lỗi vì kiểu tham chiếu thiếu thành viên", "2", "6", "4", 0],
    [5, 2, 866, "A là lớp trừu tượng có protected int n, constructor nhận int, abstract int Tinh() và virtual string Nhan() trả \"G\". I là giao diện cổ điển chỉ có int Tinh(). Lớp cụ thể muốn nhận \"G\" theo cài đặt gốc. Chọn cách nào?", "Giữ A cho phần khởi tạo và trạng thái", "Giữ Nhan mặc định bằng cách không ghi đè", "Ghi đè Tinh bằng override", "Dùng I làm hợp đồng cho các lớp không chung cơ sở", 1],
    [5, 2, 867, "I khai báo int P { get; }. C thực thi với public int P { get; set; }. Giả sử C c = new C(); I i = c; c.P = 3; trước từng thao tác. int n = i.P + c.P; n bằng bao nhiêu?", "Ghi được và i đọc thấy 5", "Đọc được 6", "Lỗi vì hợp đồng I thiếu setter", "Đọc được 3", 1],
    [5, 2, 868, "Lớp C có trường int N và trường tham chiếu Box H với H.Value kiểu int. a.N = 1, a.H.Value = 2. C cung cấp Copy() gọi MemberwiseClone(). C b = a.Copy(); b.H.Value = 5; đọc (a.N, a.H.Value) được gì?", "(1, 2)", "(8, 2)", "(1, 5)", "(1, 9)", 2],
    [5, 2, 869, "A trừu tượng có trường protected X. Constructor A(int x) gán X = x; phương thức N() trả M() + X; M là abstract int. B(int n) : base(n + 1) và B.M() trả X * 2. A a = new B(3); a.N() trả gì?", "12", "9", "6", "3", 0],
    [5, 2, 870, "A trừu tượng khai báo abstract void M(). B : A chưa thực hiện M; C là lớp cụ thể dẫn xuất từ B. Việc đánh dấu B là abstract có tác dụng gì?", "Hoàn thành nghĩa vụ ở C", "Lỗi vì chỉ che khuất phương thức abstract", "Cho phép hoãn nghĩa vụ ở B", "Lỗi vì gọi trực tiếp phương thức abstract của A", 2],
    [5, 2, 871, "A có virtual int M() trả 2. B : A override M() trả base.M() * 2. C : B override M() trả base.M() + 3. Nếu A.M đổi thành phương thức thường và giữ nguyên cả hai override, điều gì xảy ra?", "2", "Lỗi biên dịch", "4", "7", 1],
    [5, 2, 872, "I khai báo int Doc(). A : I thực thi bằng public virtual int Doc() trả 3. B : A override Doc() trả 8. C : A dùng public new int Doc() trả 5 và không khai báo lại I. I x = new C(); x.Doc() trả gì?", "13", "5", "3", "8", 2],
    [5, 2, 873, "A có virtual int M() trả 2 và int N() trả M() + 1. B : A override M() trả 5. C : A có new M() trả 7. A a = new B(); a.N() trả gì?", "10", "7", "3", "6", 3],
    [5, 2, 874, "A có virtual int M() trả 2 và int N() trả M() + 1. B : A override M() trả 5. C : A có new M() trả 7. C c = new C(); c.M() trả gì?", "6", "10", "3", "7", 3],
    [5, 2, 875, "A có virtual string M() trả \"A\". B : A override M() trả base.M() + \"B\". C : B override M() trả base.M() + \"C\". A x = new C(); x.M() trả gì?", "\"AC\"", "\"A\"", "\"AB\"", "\"ABC\"", 3],
    [5, 2, 876, "I khai báo int P { get; }. C thực thi với public int P { get; set; }. Giả sử C c = new C(); I i = c; c.P = 3; trước từng thao tác. int n = i.P; n bằng bao nhiêu?", "Đọc được 3", "Ghi được và i đọc thấy 5", "Lỗi vì hợp đồng I thiếu setter", "Đọc được 6", 0],
    [5, 2, 877, "I khai báo int Doc(). A : I thực thi bằng public virtual int Doc() trả 3. B : A override Doc() trả 8. C : A dùng public new int Doc() trả 5 và không khai báo lại I. C x = new C(); x.Doc() trả gì?", "8", "5", "3", "13", 1],
    [5, 2, 878, "I có M(). A : I cài đặt M() và có virtual N(). B : A có override N() và thêm P(). Các tham chiếu cùng giữ một B. I i = new B(); i.N() dẫn đến gì?", "Lỗi vì kiểu khai báo I không có N", "Thấy M theo hợp đồng I", "Truy cập được P qua kiểu B", "Gọi override B.N qua A", 0],
    [5, 2, 879, "I có M(). A : I cài đặt M() và có virtual N(). B : A có override N() và thêm P(). Các tham chiếu cùng giữ một B. B b = new B(); b.P() minh họa điều gì?", "Thấy M theo hợp đồng I", "Gọi override B.N qua A", "Lỗi vì kiểu khai báo I không có N", "Truy cập được P qua kiểu B", 3],
    [5, 2, 880, "I khai báo int M(). A thực thi I bằng public int M() trả 1. B : A khai báo public new int M() trả 4. C : A, I khai báo public new int M() trả 7. I i = new B(); i.M() trả gì?", "8", "4", "1", "7", 2],
    [5, 2, 881, "A có virtual int M() trả 2. B : A override M() trả base.M() * 2. C : B override M() trả base.M() + 3. Với mã gốc, A x = new C(); x.M() trả gì?", "2", "4", "Lỗi biên dịch", "7", 3],
    [5, 2, 882, "A có virtual int M() trả 2. B : A override M() trả base.M() * 2. C : B override M() trả base.M() + 3. Nếu C không ghi đè và B đổi sang new M() trả 4, A x = new C(); x.M() trả gì?", "7", "4", "2", "Lỗi biên dịch", 2],
    [5, 2, 883, "I có M(). A : I cài đặt M() và có virtual N(). B : A có override N() và thêm P(). Các tham chiếu cùng giữ một B. I i = new B(); i.M() minh họa điều gì?", "Thấy M theo hợp đồng I", "Lỗi vì kiểu khai báo I không có N", "Gọi override B.N qua A", "Truy cập được P qua kiểu B", 0],
    [5, 2, 884, "A có virtual int Tinh() trả 1. B : A override Tinh() trả 3. C : B có new int Tinh() trả 6. A có Tong(A x) trả Tinh() + x.Tinh(). Tạo C c = new C(). c.Tong(new B()) trả gì?", "9", "4", "6", "12", 2],
    [5, 2, 885, "A có virtual int M() trả 2. B : A có new virtual int M() trả 5. C : B override M() trả 8. B x = new B(); x.M() trả gì?", "10", "2", "5", "8", 2],
    [5, 2, 886, "I và J cùng khai báo int Doc(). C : I, J dùng một public int Doc() trả 2. B : C che khuất bằng new int Doc() trả 5 và không liệt kê lại giao diện. B b = new B(); ((J)b).Doc() + b.Doc() trả gì?", "2", "5", "7", "9", 2],
    [5, 2, 887, "A là lớp trừu tượng có protected int n, constructor nhận int, abstract int Tinh() và virtual string Nhan() trả \"G\". I là giao diện cổ điển chỉ có int Tinh(). Lớp đã kế thừa kiểu khác vẫn cần được gọi qua cùng hợp đồng tính toán. Chọn cách nào?", "Giữ A cho phần khởi tạo và trạng thái", "Giữ Nhan mặc định bằng cách không ghi đè", "Dùng I làm hợp đồng cho các lớp không chung cơ sở", "Ghi đè Tinh bằng override", 2],
    [5, 2, 888, "A có virtual int M() trả 1. B : A override M() trả 2. C : B có new int M() trả 3. D : C không khai báo lại. A x = new D(); x.M() trả gì?", "2", "6", "5", "3", 0],
    [5, 2, 889, "I khai báo int M(). A thực thi I bằng public int M() trả 1. B : A khai báo public new int M() trả 4. C : A, I khai báo public new int M() trả 7. I i = new C(); i.M() trả gì?", "7", "4", "1", "8", 0],
    [5, 2, 890, "Lớp C có trường int N và trường tham chiếu Box H với H.Value kiểu int. a.N = 1, a.H.Value = 2. C cung cấp Copy() gọi MemberwiseClone(). C b = a.Copy(); đọc (b.N, b.H.Value) ngay sau sao chép được gì?", "(1, 9)", "(1, 5)", "(1, 2)", "(8, 2)", 2],
    [5, 2, 891, "A trừu tượng có trường protected X. Constructor A(int x) gán X = x; phương thức N() trả M() + X; M là abstract int. B(int n) : base(n + 1) và B.M() trả X * 2. A a = new B(2); a.N() trả gì?", "12", "3", "6", "9", 3],
    [5, 2, 892, "A có virtual int M() trả 2. B : A override M() trả 5 và có int N() trả base.M(). C : B override M() trả 9. A a = new C(); a.M() trả gì?", "2", "11", "9", "5", 2],
    [5, 2, 893, "I khai báo int P { get; }. C thực thi với public int P { get; set; }. Giả sử C c = new C(); I i = c; c.P = 3; trước từng thao tác. ((C)i).P = 5; có hệ quả gì?", "Đọc được 6", "Lỗi vì hợp đồng I thiếu setter", "Ghi được và i đọc thấy 5", "Đọc được 3", 2],
    [5, 2, 894, "I khai báo int this[int i] { get; }. C : I có chỉ mục int trả i + 1 và chỉ mục string trả 9. C c = new C(); I x = c; x[2] trả gì?", "9", "3", "12", "Lỗi vì giao diện không có chỉ mục string", 1],
    [5, 2, 895, "A ghi đè ToString() trả \"A\"; B : A ghi đè trả \"B\". A không ghi đè Equals. object o = new B(); o.ToString() trả gì?", "true", "Thông tin kiểu B", "\"B\"", "\"A\"", 2],
    [5, 2, 896, "Lớp C có trường int N và trường tham chiếu Box H với H.Value kiểu int. a.N = 1, a.H.Value = 2. C cung cấp Copy() gọi MemberwiseClone(). C b = a.Copy(); b.N = 8; đọc (b.N, a.H.Value) được gì?", "(1, 9)", "(1, 2)", "(8, 2)", "(1, 5)", 2],
    [5, 2, 897, "A trừu tượng có trường protected X. Constructor A(int x) gán X = x; phương thức N() trả M() + X; M là abstract int. B(int n) : base(n + 1) và B.M() trả X * 2. A a = new B(2); a.M() trả gì?", "12", "6", "3", "9", 1],
    [5, 2, 898, "A có virtual string M() trả \"A\". B : A override M() trả base.M() + \"B\". C : B override M() trả base.M() + \"C\". Nếu sửa B.M để chỉ trả \"A\" thì A x = new C(); x.M() trả gì?", "\"ABC\"", "\"AC\"", "\"A\"", "\"AB\"", 1],
    [5, 2, 899, "I có M(). A : I cài đặt M() và có virtual N(). B : A có override N() và thêm P(). Các tham chiếu cùng giữ một B. A a = new B(); a.N() minh họa điều gì?", "Thấy M theo hợp đồng I", "Truy cập được P qua kiểu B", "Lỗi vì kiểu khai báo I không có N", "Gọi override B.N qua A", 3],
    [5, 2, 900, "Hai đối tượng khác tham chiếu nhưng có cùng mã nghiệp vụ. Lớp C muốn Equals phản ánh mã nghiệp vụ và dùng được trong tập hợp dựa trên băm. Thay đổi nào làm chuỗi hiển thị chứa mã nhưng tự nó không quyết định Equals?", "Gọi GetType", "Ghi đè ToString", "Ghi đè GetHashCode nhất quán với Equals", "Ghi đè Equals theo mã", 1]
  ];

  var BANK_CACHE = null;

  function signatureOf(q) {
    return q.title.trim() + "\u0000" + (q.code ? q.code.trim() : "");
  }

  function registerBankQuestion(bank, seenSig, countByDiff, q, contextLabel) {
    var sig = signatureOf(q);
    if (seenSig.has(sig)) {
      throw new Error("Phát hiện câu hỏi trùng lặp trong kho tại " + contextLabel);
    }
    seenSig.add(sig);
    countByDiff[q.difficulty] = (countByDiff[q.difficulty] || 0) + 1;
    var serial = String(countByDiff[q.difficulty]).padStart(3, "0");
    q.bankId = "mcq-" + q.difficulty + "-" + serial;
    q.id = q.bankId;
    // Lưu đáp án gốc để có thể xáo trộn lại phương án khi bốc đề
    q._correctText = q.options[q.answer];
    bank.push(q);
  }

  function buildBank() {
    if (BANK_CACHE) return BANK_CACHE;
    var rng = mulberry32(20261110);
    var bank = [];
    var seenSig = new Set();
    var countByDiff = { easy: 0, medium: 0, hard: 0 };
    var generators = {
      easy: generateChapterEasy,
      medium: generateChapterMedium,
      hard: generateChapterHard
    };
    var levels = ["easy", "medium", "hard"];

    for (var li = 0; li < levels.length; li++) {
      var diff = levels[li];
      for (var ch = 1; ch <= 5; ch++) {
        for (var idx = 0; idx < 40; idx++) {
          var q = generators[diff](ch, idx, rng);
          q.difficulty = diff;
          registerBankQuestion(bank, seenSig, countByDiff, q, diff + " ch" + ch + " idx" + idx);
        }
      }
    }

    for (var ti = 0; ti < THEORY_900.length; ti++) {
      var row = THEORY_900[ti];
      var qCh = row[0];
      var qDiff = levels[row[1]];
      var qNum = row[2];
      var qOpts = [row[4], row[5], row[6], row[7]];
      var qAns = row[8];
      var correctText = qOpts[qAns];
      registerBankQuestion(bank, seenSig, countByDiff, {
        type: "mcq",
        id: "",
        ch: qCh,
        difficulty: qDiff,
        title: row[3],
        options: qOpts,
        answer: qAns,
        explain: "Đáp án đúng là: \"" + correctText + "\" (Câu " + qNum + " · " + DIFF_VI[qDiff] + " · " + SRC[qCh] + ").",
        source: SRC[qCh] + " · Ngân hàng 900 câu lý thuyết C# (Câu " + qNum + ")",
        templateId: "kb900-q" + qNum
      }, "kb900-q" + qNum);
    }

    BANK_CACHE = bank;
    return BANK_CACHE;
  }

  function cloneAndShuffleQuestion(item, rng, seqIndex) {
    var opts = item.options.slice();
    var correct = item._correctText || item.options[item.answer];
    var shuffled = shuffle(rng, opts);
    var out = {
      type: "mcq",
      id: "mcq-" + item.templateId + "-" + seqIndex,
      bankId: item.bankId,
      ch: item.ch,
      difficulty: item.difficulty,
      title: item.title,
      options: shuffled,
      answer: shuffled.indexOf(correct),
      explain: item.explain,
      source: item.source,
      templateId: item.templateId
    };
    if (item.code) out.code = item.code;
    return out;
  }

  // Lịch sử chống trùng lặp giữa các lần sinh đề liên tiếp
  var recentHistory = {
    easy: new Set(),
    medium: new Set(),
    hard: new Set()
  };

  function resetHistory() {
    recentHistory.easy.clear();
    recentHistory.medium.clear();
    recentHistory.hard.clear();
  }

  function pickFromBucket(bucket, count, rng, pickedInCurrentExam, excludedSet, historySet) {
    var available = bucket.filter(function (q) {
      return !pickedInCurrentExam.has(q.bankId);
    });

    // 1. Ưu tiên cấp 1: Chưa có trong cả excludedSet (lịch sử lưu trữ) và historySet (lịch sử phiên)
    var candidates = available.filter(function (q) {
      return !excludedSet.has(q.bankId) && !historySet.has(q.bankId);
    });

    // 2. Ưu tiên cấp 2: Nếu không đủ câu, làm mới historySet trong phiên cho nhóm này
    if (candidates.length < count) {
      bucket.forEach(function (q) { historySet.delete(q.bankId); });
      candidates = available.filter(function (q) {
        return !excludedSet.has(q.bankId);
      });
    }

    // 3. Ưu tiên cấp 3: Nếu kho qua nhiều lượt đã hết sạch câu mới so với excludedSet,
    // làm mới excludedSet đối với nhóm này để tái sử dụng câu hỏi cũ nhất,
    // đảm bảo TUYỆT ĐỐI không bao giờ trùng với các câu đã chọn trong đề hiện tại!
    if (candidates.length < count) {
      bucket.forEach(function (q) { excludedSet.delete(q.bankId); });
      candidates = available;
    }

    var pool = shuffle(rng, candidates);
    var picked = pool.slice(0, count);
    picked.forEach(function (q) {
      pickedInCurrentExam.add(q.bankId);
      excludedSet.add(q.bankId);
      historySet.add(q.bankId);
    });
    return picked;
  }

  function finalizeBankDeck(rng, rawPicked) {
    var mixed = shuffle(rng, rawPicked);
    var seenKeys = new Set();
    var deck = [];
    for (var k = 0; k < mixed.length; k++) {
      var q = cloneAndShuffleQuestion(mixed[k], rng, k + 1);
      var key = signatureOf(q);
      if (seenKeys.has(key)) {
        throw new Error("Trùng lặp câu hỏi trong đề: " + q.title);
      }
      seenKeys.add(key);
      deck.push(q);
    }
    return deck;
  }

  /* Sinh đề thi 50 câu phân hóa: 10 Dễ + 15 Trung bình + 25 Khó, xếp lộn xộn */
  function generateExam(rng, options) {
    if (typeof rng !== "function") rng = Math.random;
    options = options || {};
    var easyTarget = Number.isInteger(options.easy) ? options.easy : 10;
    var mediumTarget = Number.isInteger(options.medium) ? options.medium : 15;
    var hardTarget = Number.isInteger(options.hard) ? options.hard : 25;

    var bank = buildBank();
    var excluded = new Set(Array.isArray(options.excludeIds) ? options.excludeIds : []);
    var useHistory = options.trackHistory !== false;
    var pickedInCurrentExam = new Set();

    var specs = [
      { diff: "easy", total: easyTarget },
      { diff: "medium", total: mediumTarget },
      { diff: "hard", total: hardTarget }
    ];

    var rawPicked = [];
    for (var s = 0; s < specs.length; s++) {
      var diff = specs[s].diff;
      var total = specs[s].total;
      var basePerChap = Math.floor(total / 5);
      var rem = total % 5;
      var chapOrder = shuffle(rng, [1, 2, 3, 4, 5]);
      var hist = useHistory ? recentHistory[diff] : new Set();

      for (var c = 0; c < 5; c++) {
        var ch = chapOrder[c];
        var need = basePerChap + (c < rem ? 1 : 0);
        if (need <= 0) continue;
        var bucket = bank.filter(function (q) { return q.difficulty === diff && q.ch === ch; });
        var got = pickFromBucket(bucket, need, rng, pickedInCurrentExam, excluded, hist);
        rawPicked = rawPicked.concat(got);
      }
    }

    return finalizeBankDeck(rng, rawPicked);
  }

  /* Sinh đề Ôn tập 40 câu (8 câu/chương) rút từ toàn bộ kho 1.500 câu,
     phân bổ đủ 3 mức Dễ / Trung bình / Khó trong từng chương. */
  function generatePractice(rng, options) {
    if (typeof rng !== "function") rng = Math.random;
    options = options || {};
    var bank = buildBank();
    var excluded = new Set(Array.isArray(options.excludeIds) ? options.excludeIds : []);
    var useHistory = options.trackHistory !== false;
    var pickedInCurrent = new Set();
    var rawPicked = [];
    var chapOrder = shuffle(rng, [1, 2, 3, 4, 5]);
    var diffList = ["easy", "medium", "hard"];
    var quotas = [3, 3, 2];

    for (var c = 0; c < chapOrder.length; c++) {
      var ch = chapOrder[c];
      var dOrder = shuffle(rng, diffList);
      for (var d = 0; d < dOrder.length; d++) {
        var diff = dOrder[d];
        var need = quotas[d];
        var hist = useHistory ? recentHistory[diff] : new Set();
        var bucket = bank.filter(function (q) { return q.ch === ch && q.difficulty === diff; });
        var got = pickFromBucket(bucket, need, rng, pickedInCurrent, excluded, hist);
        rawPicked = rawPicked.concat(got);
      }
    }

    return finalizeBankDeck(rng, rawPicked);
  }

  var PER_CHAPTER = 8;

  /* Chế độ Ôn tập mặc định: giữ nguyên hợp đồng 40 câu (8 câu/chương) từ 56 template;
     nếu options.mode === 'exam' gọi generateExam; nếu options.fromBank gọi generatePractice. */
  function generate(rng, options) {
    if (options && options.mode === "exam") {
      return generateExam(rng, options);
    }
    if (options && options.fromBank) {
      return generatePractice(rng, options);
    }
    if (typeof rng !== "function") rng = Math.random;
    var chosen = [];
    for (var ch = 1; ch <= 5; ch++) {
      var pool = shuffle(rng, TEMPLATES[ch]);
      for (var i = 0; i < PER_CHAPTER; i++) chosen.push(pool[i]);
    }
    var ordered = shuffle(rng, chosen);
    var deck = [];
    for (var k = 0; k < ordered.length; k++) {
      var q = ordered[k](rng);
      q.id = "mcq-" + q.templateId + "-" + (k + 1);
      deck.push(q);
    }
    return deck;
  }

  function getBank() {
    return buildBank().map(function (q, idx) {
      return cloneAndShuffleQuestion(q, function () { return 0; }, idx + 1);
    });
  }

  global.ExamMCQ = {
    generate: generate,
    generatePractice: generatePractice,
    generateExam: generateExam,
    getBank: getBank,
    resetHistory: resetHistory,
    BANK_COUNTS: { easy: 500, medium: 500, hard: 500, total: 1500 }
  };
})(typeof window !== "undefined" ? window : globalThis);
