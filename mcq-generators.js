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

  var DIFF_VI = {
    easy: "Dễ",
    theory: "Lý thuyết C#",
    output: "Dự đoán kết quả",
    upcasting: "Upcasting",
    downcasting: "Downcasting"
  };

  // 140 câu Dễ chọn lọc không trùng lặp từ kho lý thuyết trước đó
  var THEORY_EASY_140 = [
    [2, 0, 2, "Constructor The(int m, string ten) có bao nhiêu tham số?", "Có một tham số", "Không có tham số", "Có hai tham số", "Có ba tham số", 2],
    [2, 0, 3, "Tên constructor của một lớp C# tuân theo quy tắc nào?", "Có tên do người viết chọn", "Có dấu ~ trước tên lớp", "Trùng tên biến nhận đối tượng", "Trùng tên lớp", 3],
    [2, 0, 6, "Cặp dấu nào dùng trong cú pháp truy cập theo chỉ mục?", "[]", "{}", ";", "()", 0],
    [2, 0, 13, "Từ khóa nào đứng ở vị trí kiểu trả về của phương thức không trả giá trị?", "new", "public", "void", "class", 2],
    [2, 0, 15, "Constructor The(int m) có bao nhiêu tham số?", "Có hai tham số", "Có một tham số", "Có ba tham số", "Không có tham số", 1],
    [2, 0, 16, "Nếu thực hiện riêng hai lần new Mau(), có bao nhiêu thể hiện Mau mới được tạo?", "Ba thể hiện", "Một thể hiện", "Hai thể hiện", "Không tạo thể hiện", 2],
    [2, 0, 17, "Đâu là lời gọi Ghi trên m với đối số 5?", "m.Doc(5)", "m.Ghi(5)", "m.Doc()", "m.Ghi()", 1],
    [2, 0, 19, "Nếu thực hiện một lần new Mau(), có bao nhiêu thể hiện Mau mới được tạo?", "Một thể hiện", "Không tạo thể hiện", "Ba thể hiện", "Hai thể hiện", 0],
    [2, 0, 21, "Constructor The(int m, string ten, bool bat) có bao nhiêu tham số?", "Không có tham số", "Có một tham số", "Có hai tham số", "Có ba tham số", 3],
    [2, 0, 22, "Từ khóa nào có thể đặt đầu khai báo để mở quyền truy cập thành viên?", "void", "public", "class", "new", 1],
    [2, 0, 30, "Đâu là lời gọi Doc trên m với đối số 5?", "m.Ghi()", "m.Doc(5)", "m.Doc()", "m.Ghi(5)", 1],
    [2, 0, 33, "Khai báo riêng Mau a; tạo bao nhiêu thể hiện Mau?", "Hai thể hiện", "Không tạo thể hiện", "Ba thể hiện", "Một thể hiện", 1],
    [2, 0, 34, "Đâu là lời gọi Ghi trên m với danh sách đối số rỗng?", "m.Ghi()", "m.Ghi(5)", "m.Doc(5)", "m.Doc()", 0],
    [2, 0, 35, "Đâu là lời gọi Doc trên m với danh sách đối số rỗng?", "m.Doc(5)", "m.Ghi(5)", "m.Doc()", "m.Ghi()", 2],
    [2, 0, 38, "Constructor The() có bao nhiêu tham số?", "Có một tham số", "Có hai tham số", "Không có tham số", "Có ba tham số", 2],
    [2, 0, 39, "Từ khóa nào đứng trước tên lớp trong biểu thức tạo thể hiện?", "public", "new", "class", "void", 1],
    [2, 0, 41, "Nếu thực hiện riêng ba lần new Mau(), có bao nhiêu thể hiện Mau mới được tạo?", "Hai thể hiện", "Ba thể hiện", "Một thể hiện", "Không tạo thể hiện", 1],
    [2, 0, 43, "Cú pháp tên finalizer của lớp C# có đặc điểm gì?", "Trùng tên lớp", "Có dấu ~ trước tên lớp", "Có tên do người viết chọn", "Trùng tên biến nhận đối tượng", 1],
    [2, 0, 44, "Một người hiểu nhầm rằng khai báo Hop h = new Hop() đòi hỏi constructor tên h. Họ đang nhầm tên constructor với gì?", "Trùng tên biến nhận đối tượng", "Có tên do người viết chọn", "Trùng tên lớp", "Có dấu ~ trước tên lớp", 0],
    [2, 0, 46, "Cặp dấu nào bao quanh thân lớp?", ";", "[]", "()", "{}", 3],
    [2, 0, 49, "Tên của một phương thức thường như KiemTra được xác định thế nào?", "Trùng tên lớp", "Trùng tên biến nhận đối tượng", "Có dấu ~ trước tên lớp", "Có tên do người viết chọn", 3],
    [2, 0, 50, "Dấu nào kết thúc một khai báo trường đơn giản như int dem?", ";", "{}", "[]", "()", 0],
    [2, 0, 51, "Cặp dấu nào bao quanh danh sách tham số của phương thức?", "{}", "[]", "()", ";", 2],
    [2, 0, 56, "Từ khóa nào đứng trước tên lớp trong khai báo lớp thường?", "class", "void", "new", "public", 0],
    [3, 0, 65, "Theo quy ước tên trong bài giảng, tên nào thích hợp để truy vấn trạng thái bool đang mở?", "SetMuc(int muc)", "Dong()", "GetMuc()", "IsMo()", 3],
    [3, 0, 67, "Chỉ thị nào xét assembly mà không xét quan hệ dẫn xuất?", "private", "internal", "protected internal", "protected", 1],
    [3, 0, 68, "Phần khai báo nào phù hợp cho chỉ mục nhận một khóa chuỗi?", "Doc(int i)", "this[int i]", "this[string key]", "this[int i, int j]", 2],
    [3, 0, 70, "Trong thân CapNhat(int muc), muc là tên của thành phần nào?", "Tên kiểu", "Tên biến thể hiện", "Tên tham số", "Tên trường hỗ trợ", 2],
    [3, 0, 72, "Nếu Tong là trường public static của BoDem, cú pháp đọc phù hợp là gì?", "BoDem.DocTong()", "BoDem.Tong", "b.Muc", "b.Tang()", 1],
    [3, 0, 73, "Nếu DocTong là phương thức public static của BoDem, gọi nó bằng cú pháp nào?", "BoDem.DocTong()", "BoDem.Tong", "b.Tang()", "b.Muc", 0],
    [3, 0, 74, "Phần khai báo nào phù hợp cho chỉ mục nhận hai số nguyên?", "this[int i]", "this[string key]", "Doc(int i)", "this[int i, int j]", 3],
    [3, 0, 78, "Trong BoDem.DocTong(), BoDem đứng trước dấu chấm với tư cách gì?", "Tên trường hỗ trợ", "Tên tham số", "Tên kiểu", "Tên biến thể hiện", 2],
    [3, 0, 80, "Cú pháp nào khai báo một lớp trừu tượng?", "interface", "abstract class", "static class", "class", 1],
    [3, 0, 81, "Một setter gán _muc = value thực hiện chức năng gì?", "Truy vấn", "Lưu trữ dữ liệu", "Kiểm tra dữ liệu", "Cập nhật", 3],
    [3, 0, 84, "Trong accessor set, value biểu thị gì?", "Giá trị đang gán qua set", "Tham số x", "Một chỉ số int", "Trường x của đối tượng", 0],
    [3, 0, 86, "Từ khóa namespace tổ chức tên kiểu theo đơn vị nào?", "Lớp", "Thể hiện", "Namespace", "Assembly", 2],
    [3, 0, 90, "Với ref int và một đối số hợp lệ, quyền của phương thức đối với biến của người gọi là gì?", "Cho phép đọc và ghi biến của người gọi", "Tham chiếu đối tượng hiện tại", "Sao chép giá trị", "Bắt buộc gán tham số đầu ra", 0],
    [3, 0, 91, "Trong void CapNhat(int x), nếu tên trùng với trường, x viết riêng trong thân chỉ đến gì?", "Trường x của đối tượng", "Một chỉ số int", "Tham số x", "Giá trị đang gán qua set", 2],
    [3, 0, 92, "Trong phương thức có tham số muc trùng tên trường, dòng nào lưu đối số vào trường?", "return this.muc", "muc = muc", "this.muc = 0", "this.muc = muc", 3],
    [3, 0, 93, "Điều kiện tối thiểu đối với danh sách tham số chỉ mục là gì?", "Có ít nhất một tham số", "Có thể chỉ có get", "Dùng cú pháp [] khi gọi", "Có thể nạp chồng", 0],
    [3, 0, 95, "Chỉ thị nào dùng quyền kế thừa mà tự nó không cấp quyền cho lớp ngoài hệ phân cấp trong cùng assembly?", "internal", "protected internal", "protected", "private", 2],
    [3, 0, 96, "Theo quy ước tên trong bài giảng, tên nào thích hợp để cập nhật mức bằng tham số int?", "GetMuc()", "SetMuc(int muc)", "Dong()", "IsMo()", 1],
    [3, 0, 97, "Nhận định nào mô tả khả năng tạo chỉ mục chỉ đọc?", "Dùng cú pháp [] khi gọi", "Có thể chỉ có get", "Có thể nạp chồng", "Có ít nhất một tham số", 1],
    [3, 0, 99, "Trong cùng phương thức, dòng nào chỉ tự gán tham số cho chính nó?", "return this.muc", "muc = muc", "this.muc = 0", "this.muc = muc", 1],
    [3, 0, 100, "Nếu Muc là property thể hiện của BoDem, đọc nó trên b bằng cú pháp nào?", "b.Muc", "BoDem.DocTong()", "b.Tang()", "BoDem.Tong", 0],
    [3, 0, 102, "Từ khóa nào mở khai báo một kiểu hợp đồng giao diện?", "abstract class", "static class", "class", "interface", 3],
    [3, 0, 104, "Phạm vi chứa trực tiếp khai báo trường private trong ví dụ một kiểu đơn giản là gì?", "Namespace", "Lớp", "Assembly", "Thể hiện", 1],
    [3, 0, 106, "Khi một lớp có chỉ mục int và chỉ mục string, nó sử dụng khả năng nào?", "Dùng cú pháp [] khi gọi", "Có thể nạp chồng", "Có thể chỉ có get", "Có ít nhất một tham số", 1],
    [3, 0, 108, "Dòng nào gán hằng số vào trường thể hiện muc?", "this.muc = muc", "return this.muc", "muc = muc", "this.muc = 0", 3],
    [3, 0, 109, "Property public có get và set đều public cho phép thao tác nào từ bên ngoài?", "Đọc và ghi từ bên ngoài", "Đọc từ bên ngoài", "Gọi như một phương thức", "Ghi từ bên ngoài", 0],
    [3, 0, 110, "Cú pháp nào khai báo một lớp tĩnh?", "interface", "class", "static class", "abstract class", 2],
    [3, 0, 113, "Trong property Muc dùng get { return _muc; }, _muc thường là tên của thành phần nào?", "Tên biến thể hiện", "Tên tham số", "Tên kiểu", "Tên trường hỗ trợ", 3],
    [3, 0, 114, "Theo quy ước tên trong bài giảng, tên nào thích hợp để đọc mức hiện tại?", "GetMuc()", "SetMuc(int muc)", "Dong()", "IsMo()", 0],
    [3, 0, 118, "Trường private _muc giữ mức hiện tại thực hiện chức năng gì?", "Truy vấn", "Lưu trữ dữ liệu", "Kiểm tra dữ liệu", "Cập nhật", 1],
    [3, 0, 120, "Trong bốn lựa chọn, phần đầu khai báo nào dùng cho lớp thường?", "class", "abstract class", "interface", "static class", 0],
    [3, 0, 123, "Một getter chỉ trả về _muc thực hiện chức năng gì?", "Kiểm tra dữ liệu", "Cập nhật", "Lưu trữ dữ liệu", "Truy vấn", 3],
    [3, 0, 124, "Chỉ thị nào cho phép truy cập theo điều kiện protected hoặc internal?", "protected", "private", "internal", "protected internal", 3],
    [3, 0, 127, "Trong void CapNhat(int x), this.x dùng để chỉ gì?", "Giá trị đang gán qua set", "Một chỉ số int", "Trường x của đối tượng", "Tham số x", 2],
    [3, 0, 129, "Trong chỉ mục this[int i], i biểu thị gì?", "Một chỉ số int", "Giá trị đang gán qua set", "Tham số x", "Trường x của đối tượng", 0],
    [3, 0, 131, "Phần khai báo nào là đầu của một phương thức có tên riêng và nhận một số nguyên?", "this[string key]", "this[int i]", "Doc(int i)", "this[int i, int j]", 2],
    [3, 0, 132, "Trong b.DocMuc(), nếu b đã giữ một đối tượng BoDem thì b đứng trước dấu chấm với tư cách gì?", "Tên kiểu", "Tên biến thể hiện", "Tên tham số", "Tên trường hỗ trợ", 1],
    [3, 0, 133, "Property public chỉ có get cho phép thao tác nào từ bên ngoài?", "Gọi như một phương thức", "Đọc từ bên ngoài", "Đọc và ghi từ bên ngoài", "Ghi từ bên ngoài", 1],
    [3, 0, 135, "Dấu hiệu cú pháp nào xuất hiện khi bên gọi truy cập chỉ mục?", "Có thể nạp chồng", "Có ít nhất một tham số", "Dùng cú pháp [] khi gọi", "Có thể chỉ có get", 2],
    [3, 0, 136, "Khi truyền int theo tham trị, giá trị được chuyển vào tham số thế nào?", "Bắt buộc gán tham số đầu ra", "Cho phép đọc và ghi biến của người gọi", "Tham chiếu đối tượng hiện tại", "Sao chép giá trị", 3],
    [3, 0, 139, "Property public chỉ có set cho phép thao tác nào từ bên ngoài?", "Đọc từ bên ngoài", "Đọc và ghi từ bên ngoài", "Gọi như một phương thức", "Ghi từ bên ngoài", 3],
    [3, 0, 141, "Tên nào thể hiện hành động đóng trực tiếp theo tên gọi, không theo mẫu truy vấn hoặc cập nhật trong ba lựa chọn còn lại?", "Dong()", "SetMuc(int muc)", "IsMo()", "GetMuc()", 0],
    [3, 0, 142, "Trong biểu thức this.X, this đại diện cho gì?", "Lớp", "Assembly", "Thể hiện", "Namespace", 2],
    [3, 0, 143, "Phương thức khai báo out int có nghĩa vụ gì khi trả về bình thường?", "Cho phép đọc và ghi biến của người gọi", "Tham chiếu đối tượng hiện tại", "Bắt buộc gán tham số đầu ra", "Sao chép giá trị", 2],
    [3, 0, 144, "Trong hàm trả về int, dòng nào trả về trường thể hiện muc?", "muc = muc", "this.muc = muc", "return this.muc", "this.muc = 0", 2],
    [3, 0, 145, "Điều kiện if (value >= 0) trong setter thực hiện chức năng gì?", "Truy vấn", "Lưu trữ dữ liệu", "Kiểm tra dữ liệu", "Cập nhật", 2],
    [3, 0, 148, "Trong phương thức thể hiện, this biểu thị điều gì?", "Cho phép đọc và ghi biến của người gọi", "Sao chép giá trị", "Bắt buộc gán tham số đầu ra", "Tham chiếu đối tượng hiện tại", 3],
    [3, 0, 149, "Ranh giới mà internal sử dụng gọi là gì?", "Thể hiện", "Lớp", "Namespace", "Assembly", 3],
    [3, 0, 150, "Nếu Tang là phương thức thể hiện của BoDem, gọi nó trên b bằng cú pháp nào?", "BoDem.DocTong()", "b.Tang()", "BoDem.Tong", "b.Muc", 1],
    [3, 0, 151, "Với phương thức truy vấn GetM() thay cho property, bên gọi dùng cách nào?", "Đọc và ghi từ bên ngoài", "Đọc từ bên ngoài", "Ghi từ bên ngoài", "Gọi như một phương thức", 3],
    [3, 0, 153, "Trong bốn lựa chọn, chỉ thị nào phù hợp nhất để giấu trường khỏi cả lớp dẫn xuất?", "protected", "internal", "protected internal", "private", 3],
    [3, 0, 156, "Phần khai báo nào phù hợp cho chỉ mục nhận một số nguyên?", "this[string key]", "this[int i]", "this[int i, int j]", "Doc(int i)", 1],
    [4, 0, 159, "Một lớp C# được khai báo tối đa bao nhiêu lớp cơ sở trực tiếp?", "Không có giới hạn cố định ở mức bài giảng", "Hai", "Không có", "Một", 3],
    [4, 0, 161, "Khai báo nào tạo lớp A kế thừa B?", "class A : B", "class B : A", "class B", "interface B : A", 0],
    [4, 0, 162, "Nếu chỉ viết class X : A và A không thực thi giao diện nào, X thực thi trực tiếp bao nhiêu giao diện?", "Không có giới hạn cố định ở mức bài giảng", "Không có", "Một", "Hai", 1],
    [4, 0, 163, "Nếu B dùng new M() che M() của A và biến b có kiểu B, b.M() chọn phiên bản nào?", "Chọn phiên bản cơ sở", "Cảnh báo che khuất", "Lỗi không truy cập được", "Chọn phiên bản dẫn xuất", 3],
    [4, 0, 168, "Nếu B khai báo M cùng chữ ký M không ảo của A mà bỏ new, trình biên dịch thường đưa ra điều gì?", "Cảnh báo che khuất", "Chọn phiên bản dẫn xuất", "Chọn phiên bản cơ sở", "Lỗi không truy cập được", 0],
    [4, 0, 170, "Khai báo class X : A, I, J với A là lớp và I, J là giao diện thực thi bao nhiêu giao diện trực tiếp?", "Không có", "Hai", "Không có giới hạn cố định ở mức bài giảng", "Một", 1],
    [4, 0, 171, "Trong public int Id;, Id thuộc loại thành viên nào mà B có thể truy cập?", "Constructor thể hiện", "Trường public", "Phương thức public", "Finalizer", 1],
    [4, 0, 173, "Trong B, base.M() gọi phiên bản nào nếu A khai báo M và là lớp cơ sở trực tiếp?", "Chọn phiên bản dẫn xuất", "Lỗi không truy cập được", "Cảnh báo che khuất", "Chọn phiên bản cơ sở", 3],
    [4, 0, 176, "Nhận định nào đúng về số giao diện khác nhau mà một lớp có thể liệt kê theo quy tắc kế thừa của bài giảng?", "Không có", "Không có giới hạn cố định ở mức bài giảng", "Hai", "Một", 1],
    [4, 0, 177, "Giả sử A là giao diện, khai báo nào tạo giao diện B kế thừa A?", "class A : B", "class B", "class B : A", "interface B : A", 3],
    [4, 0, 179, "Thành viên nào có dạng ~A() và không thể gọi trực tiếp từ B?", "Trường public", "Constructor thể hiện", "Finalizer", "Phương thức public", 2],
    [4, 0, 182, "Với B b đã giữ đối tượng, khi chạy A a = b; điều gì xảy ra với đối tượng ban đầu?", "Thay đổi kiểu thực", "Tạo bản sao", "Giữ nguyên đối tượng", "Tạo đối tượng lớp cơ sở mới", 2],
    [4, 0, 191, "Thành viên nào có thể được B gọi qua : base(...) nhưng phải được khai báo như một constructor riêng nếu B cần cùng chữ ký?", "Constructor thể hiện", "Finalizer", "Phương thức public", "Trường public", 0],
    [4, 0, 193, "Trong public void HienThi() { }, HienThi thuộc loại thành viên nào mà B có thể gọi?", "Phương thức public", "Trường public", "Constructor thể hiện", "Finalizer", 0],
    [4, 0, 198, "Khai báo nào tạo lớp B mà không nêu lớp cơ sở tường minh?", "class A : B", "class B", "interface B : A", "class B : A", 1],
    [4, 0, 201, "Trong lớp dẫn xuất bình thường, cố đọc trực tiếp trường private của lớp cơ sở dẫn đến điều gì?", "Chọn phiên bản cơ sở", "Chọn phiên bản dẫn xuất", "Cảnh báo che khuất", "Lỗi không truy cập được", 3],
    [4, 0, 203, "Cụm từ nào mô tả một hiểu nhầm về tác dụng của phép gán tham chiếu sang biến lớp cơ sở?", "Tạo đối tượng lớp cơ sở mới", "Giữ nguyên đối tượng", "Thay đổi kiểu thực", "Tạo bản sao", 2],
    [4, 0, 204, "Trong A a = new A();, biểu thức bên phải thực hiện gì?", "Tạo đối tượng lớp cơ sở mới", "Tạo bản sao", "Thay đổi kiểu thực", "Giữ nguyên đối tượng", 0],
    [4, 0, 214, "Thao tác nào được mô tả bởi cụm từ sao chép đối tượng sang một thể hiện khác?", "Giữ nguyên đối tượng", "Tạo đối tượng lớp cơ sở mới", "Tạo bản sao", "Thay đổi kiểu thực", 2],
    [4, 0, 215, "Khai báo nào tạo lớp B kế thừa A?", "class B", "interface B : A", "class A : B", "class B : A", 3],
    [5, 0, 217, "Giả sử C thực thi I.M. Sau I a = new C();, a.M() thuộc trường hợp nào?", "Lỗi tạo thể hiện", "Khai báo hợp đồng", "Khai báo biến hợp lệ", "Lời gọi hợp lệ và có cài đặt", 3],
    [5, 0, 218, "Trong A a = new B(); với B : A, A giữ vai trò nào trong quan hệ kế thừa?", "Biến tham chiếu", "Lớp cơ sở", "Phiên bản ghi đè", "Lớp dẫn xuất", 1],
    [5, 0, 222, "Tên nào theo quy ước đặt tên giao diện trong bài giảng?", "static class TruyenTin", "ITruyenTin", "abstract class TruyenTin", "TruyenTin", 1],
    [5, 0, 226, "Nếu B có override M(), thân B.M() đóng vai trò gì?", "Lớp dẫn xuất", "Phiên bản ghi đè", "Biến tham chiếu", "Lớp cơ sở", 1],
    [5, 0, 228, "Lớp tiện ích chuẩn nào chứa các hàm như Sqrt và Pow?", "System.Type", "System.Math", "System.String", "System.Object", 1],
    [5, 0, 229, "Thành viên nào cung cấp thông tin kiểu của thể hiện hiện tại?", "Finalize()", "ToString()", "MemberwiseClone()", "GetType()", 3],
    [5, 0, 230, "Lớp thường đã cung cấp đủ bản cài đặt cần thiết để tạo đối tượng được gọi là gì?", "Phương thức ảo có thân", "Lớp triển khai cụ thể", "Hợp đồng giao diện", "Lớp trừu tượng trung gian", 1],
    [5, 0, 232, "Câu lệnh new I() khi I là interface thuộc trường hợp nào?", "Lỗi tạo thể hiện", "Khai báo hợp đồng", "Lời gọi hợp lệ và có cài đặt", "Khai báo biến hợp lệ", 0],
    [5, 0, 234, "Trong thân phương thức, dòng I a; khi I là interface thuộc trường hợp nào?", "Lời gọi hợp lệ và có cài đặt", "Khai báo hợp đồng", "Lỗi tạo thể hiện", "Khai báo biến hợp lệ", 3],
    [5, 0, 236, "Kiểu nào là kiểu trả về của GetType() trên một đối tượng?", "System.Math", "System.Type", "System.String", "System.Object", 1],
    [5, 0, 238, "Mức truy cập nào dùng để cho phép lớp con gọi một phương thức của lớp trừu tượng theo quan hệ dẫn xuất?", "protected", "private", "internal", "public", 0],
    [5, 0, 239, "Khai báo nào tạo lớp thường A?", "interface A", "abstract class A", "class A", "static class A", 2],
    [5, 0, 244, "Dòng void M(); trong thân interface cổ điển thuộc trường hợp nào?", "Khai báo hợp đồng", "Khai báo biến hợp lệ", "Lời gọi hợp lệ và có cài đặt", "Lỗi tạo thể hiện", 0],
    [5, 0, 245, "Trong mô hình bài giảng, giao diện dùng chủ yếu để mô tả điều gì?", "Hợp đồng hành vi", "Trạng thái dùng chung của lớp cơ sở", "Phiên bản mặc định", "Thể hiện cụ thể", 0],
    [5, 0, 247, "Khai báo nào tạo lớp trừu tượng A?", "interface A", "class A", "static class A", "abstract class A", 3],
    [5, 0, 249, "Trong mô hình giao diện cổ điển, thành viên hợp đồng void M(); mặc định có mức truy cập nào?", "public", "private", "internal", "protected", 0],
    [5, 0, 250, "Khai báo nào tạo giao diện A?", "abstract class A", "interface A", "static class A", "class A", 1],
    [5, 0, 251, "Trong public void Gui() { }, public mô tả yếu tố nào?", "Quyền truy cập", "Chữ ký phương thức", "Thân phương thức", "Tên giao diện", 0],
    [5, 0, 252, "Mức truy cập nào phù hợp nhất cho phương thức trợ giúp chỉ dùng trong lớp khai báo?", "internal", "private", "protected", "public", 1],
    [5, 0, 253, "Trong interface IThongBao { }, IThongBao giữ vai trò gì?", "Thân phương thức", "Tên giao diện", "Quyền truy cập", "Chữ ký phương thức", 1],
    [5, 0, 254, "Khai báo nào cho phép lớp TruyenTin định nghĩa một khung chung mà không tạo trực tiếp đối tượng?", "ITruyenTin", "TruyenTin", "abstract class TruyenTin", "static class TruyenTin", 2],
    [5, 0, 255, "Một giao diện có thể liệt kê những kiểu nào ở danh sách kế thừa?", "Nhiều giao diện", "Chỉ một lớp", "Một lớp và nhiều giao diện", "Không thể dùng tên lớp ở vế new", 0],
    [5, 0, 256, "Tên nào phù hợp cho một lớp thường triển khai việc truyền tin?", "abstract class TruyenTin", "TruyenTin", "static class TruyenTin", "ITruyenTin", 1],
    [5, 0, 257, "Với lớp A trừu tượng, phát biểu nào đúng về new A()?", "Chỉ một lớp", "Không thể dùng tên lớp ở vế new", "Một lớp và nhiều giao diện", "Nhiều giao diện", 1],
    [5, 0, 259, "Kiểu nào nằm ở gốc phân cấp các lớp C#?", "System.Type", "System.Object", "System.String", "System.Math", 1],
    [5, 0, 264, "Trường thể hiện khai báo trong lớp trừu tượng có thể biểu diễn phần gì cho các lớp dẫn xuất?", "Trạng thái dùng chung của lớp cơ sở", "Phiên bản mặc định", "Hợp đồng hành vi", "Thể hiện cụ thể", 0],
    [5, 0, 267, "Một lớp trừu tượng có thể nêu tối đa những loại kiểu cơ sở nào?", "Không thể dùng tên lớp ở vế new", "Nhiều giao diện", "Một lớp và nhiều giao diện", "Chỉ một lớp", 2],
    [5, 0, 269, "Trong lớp cơ sở, public virtual void M() { } là dạng thành viên nào?", "Lớp triển khai cụ thể", "Lớp trừu tượng trung gian", "Hợp đồng giao diện", "Phương thức ảo có thân", 3],
    [5, 0, 272, "Trong cùng khai báo, B giữ vai trò nào trong quan hệ kế thừa?", "Phiên bản ghi đè", "Biến tham chiếu", "Lớp cơ sở", "Lớp dẫn xuất", 3],
    [5, 0, 273, "Đối tượng tạo bằng new trên một lớp thực thi giao diện là gì?", "Hợp đồng hành vi", "Phiên bản mặc định", "Thể hiện cụ thể", "Trạng thái dùng chung của lớp cơ sở", 2],
    [5, 0, 275, "Thành viên nào gắn với cơ chế finalization?", "ToString()", "GetType()", "Finalize()", "MemberwiseClone()", 2],
    [5, 0, 280, "C# cho phép một lớp kế thừa trực tiếp bao nhiêu kiểu thuộc loại lớp?", "Một lớp và nhiều giao diện", "Không thể dùng tên lớp ở vế new", "Chỉ một lớp", "Nhiều giao diện", 2],
    [5, 0, 282, "Trong lớp thực thi, khối { } của Gui dùng để chứa gì?", "Chữ ký phương thức", "Tên giao diện", "Thân phương thức", "Quyền truy cập", 2],
    [5, 0, 283, "Trong interface I { void Gui(); }, void Gui(); cung cấp phần nào của hợp đồng?", "Quyền truy cập", "Tên giao diện", "Chữ ký phương thức", "Thân phương thức", 2],
    [5, 0, 284, "Mức truy cập nào dành cho mã cùng assembly kể cả khi không kế thừa?", "internal", "private", "public", "protected", 0],
    [5, 0, 285, "Trong cùng khai báo, a đóng vai trò gì?", "Lớp dẫn xuất", "Phiên bản ghi đè", "Biến tham chiếu", "Lớp cơ sở", 2],
    [5, 0, 291, "Tên đầy đủ của kiểu string là gì?", "System.Object", "System.Math", "System.String", "System.Type", 2],
    [5, 0, 292, "Khai báo nào tạo lớp tiện ích tĩnh A?", "interface A", "abstract class A", "class A", "static class A", 3],
    [5, 0, 293, "Khai báo nào phù hợp cho một lớp TruyenTin chỉ chứa các hàm tiện ích tĩnh?", "TruyenTin", "abstract class TruyenTin", "ITruyenTin", "static class TruyenTin", 3],
    [5, 0, 295, "Thân phương thức virtual ở lớp cơ sở cung cấp điều gì trước khi có override?", "Hợp đồng hành vi", "Trạng thái dùng chung của lớp cơ sở", "Thể hiện cụ thể", "Phiên bản mặc định", 3],
    [5, 0, 297, "Thành viên nào thường được ghi đè để trình bày nội dung đối tượng dưới dạng văn bản?", "Finalize()", "MemberwiseClone()", "ToString()", "GetType()", 2],
    [5, 0, 298, "Một lớp nằm giữa lớp cơ sở và lớp cụ thể, vẫn được đánh dấu abstract, thuộc vai trò nào?", "Hợp đồng giao diện", "Phương thức ảo có thân", "Lớp trừu tượng trung gian", "Lớp triển khai cụ thể", 2],
    [5, 0, 299, "Trong interface I { void M(); }, lời khai báo M() đại diện cho điều gì?", "Hợp đồng giao diện", "Lớp trừu tượng trung gian", "Phương thức ảo có thân", "Lớp triển khai cụ thể", 0],
    [5, 0, 300, "Thành viên nào của object tạo bản sao nông?", "Finalize()", "ToString()", "GetType()", "MemberwiseClone()", 3]
  ];

  // 60 đoạn mã C# dùng cho 300 câu đọc mã (201..500)
  var SNIPPETS_60 = [
    "class Goc {\n    public virtual string M() { return \"G\"; }\n}\nclass Nhanh : Goc {\n    public override string M() { return base.M() + \"N\"; }\n}\nclass Canh : Nhanh {\n    public override string M() { return base.M() + \"C\"; }\n}\n\nGoc a = new Canh();\nGoc b = new Nhanh();\nNhanh c = new Canh();",
    "class A { public string M() { return \"G\"; } }\nclass B : A { public new string M() { return \"B\"; } }\nclass C : B { public new string M() { return \"C\"; } }\n\nC c = new C();\nB b = c;\nA a = c;",
    "class A {\n    public int X;\n    public A(int n) { X = n * 2; }\n}\nclass B : A {\n    public int Y;\n    public B(int n) : base(n + 1) { Y = X + n; }\n    public B() : this(2) { Y++; }\n}\n\nB b = new B();\nB c = new B(3);",
    "abstract class Lenh {\n    protected int n = 4;\n    public abstract int Tinh();\n    public int KetQua() { return n + Tinh(); }\n}\nclass A : Lenh {\n    public override int Tinh() { return n * 2; }\n}\nclass B : Lenh {\n    public override int Tinh() { return n - 1; }\n}\n\nLenh a = new A();\nLenh b = new B();",
    "interface IBat { string Lenh(); }\ninterface ITat { string Lenh(); }\nclass CongTac : IBat, ITat {\n    string IBat.Lenh() { return \"B\"; }\n    string ITat.Lenh() { return \"T\"; }\n    public string Lenh() { return \"C\"; }\n}\n\nCongTac c = new CongTac();\nIBat b = c;\nITat t = c;",
    "interface I { string M(); }\nclass A : I { public string M() { return \"A\"; } }\nclass B : A { public new string M() { return \"B\"; } }\nclass C : B, I { public new string M() { return \"C\"; } }\n\nB b = new B();\nC c = new C();\nI x = b;\nI y = c;",
    "interface IDoc { int Doc(); }\ninterface IGhi { void Ghi(int n); }\ninterface IBoNho : IDoc, IGhi { }\nclass Kho : IBoNho {\n    private int n = 2;\n    public int Doc() { return n; }\n    public void Ghi(int x) { n = x + 1; }\n}\n\nIBoNho k = new Kho();\nIDoc d = k;\nIGhi g = k;",
    "interface IDoc { int Muc { get; } }\nclass May : IDoc {\n    public int Muc { get; protected set; }\n    public May() { Muc = 3; }\n}\nclass CamBien : May {\n    public CamBien() { Muc += 4; }\n    public void Tang(int n) { Muc += n; }\n}\n\nCamBien c = new CamBien();\nIDoc d = c;\nMay m = c;",
    "class A { public int N = 1; }\nclass B : A { public new int N = 3; }\n\nB b = new B();\nA a = b;",
    "class A {\n    public virtual string M(int n) { return \"A\"; }\n    public string M(string s) { return \"X\"; }\n}\nclass B : A {\n    public override string M(int n) { return \"B\"; }\n    public new string M(string s) { return \"Y\"; }\n}\n\nB b = new B();\nA a = b;",
    "class A {\n    public virtual int M() { return 2; }\n    public int N() { return M() + 1; }\n}\nclass B : A {\n    public override int M() { return 5; }\n}\nclass C : A {\n    public new int M() { return 8; }\n}\n\nA a = new B();\nC c = new C();",
    "interface IBang {\n    int SoLuong { get; }\n    int this[int i] { get; }\n}\nclass Bang : IBang {\n    private int[] a = { 2, 5, 8 };\n    public int SoLuong { get { return a.Length; } }\n    public int this[int i] { get { return a[i]; } }\n}\n\nIBang b = new Bang();",
    "class A {\n    public static int Tong;\n    public int So;\n    public A() { So = ++Tong; }\n}\nclass B : A {\n    public B() { Tong += 2; }\n}\n\nA a = new A();\nB b = new B();\nA c = new A();",
    "class A {\n    public override string ToString() { return \"A\"; }\n}\nclass B : A {\n    public override string ToString() { return base.ToString() + \"B\"; }\n}\nclass C : B { }\n\nobject a = new A();\nobject b = new B();\nobject c = new C();",
    "class A { public virtual int M() { return 1; } }\nclass B : A { public new virtual int M() { return 4; } }\nclass C : B { public override int M() { return base.M() + 3; } }\n\nC c = new C();\nA a = c;\nB b = c;",
    "class A {\n    public int X;\n    public A(int x) { X = x; }\n}\nclass B : A {\n    public int Y;\n    public B(int n) : base(n + 1) { Y = X * 2; }\n}\nclass C : B {\n    public int Z;\n    public C(int n) : base(n - 1) { Z = X + Y; }\n}\n\nC c = new C(4);",
    "class A {\n    public virtual int Phi(int n) { return n + 2; }\n}\nclass B : A {\n    public override int Phi(int n) { return base.Phi(n) * 2; }\n}\nclass C : B {\n    public override int Phi(int n) { return base.Phi(n) - 1; }\n}\n\nA a = new B();\nB b = new C();",
    "interface IBoDem {\n    void Tang(int x);\n    int Doc();\n}\nclass A : IBoDem {\n    protected int n = 1;\n    public virtual void Tang(int x) { n += x; }\n    public int Doc() { return n; }\n}\nclass B : A {\n    public override void Tang(int x) { n += 2 * x; }\n}\n\nIBoDem a = new A();\nIBoDem b = new B();",
    "interface IDoi { int Doi(int x); }\nclass GapDoi : IDoi { public int Doi(int x) { return x * 2; } }\nclass CongBa : IDoi { public int Doi(int x) { return x + 3; } }\n\nIDoi[] a = { new GapDoi(), new CongBa() };",
    "interface IA { int Dem(); }\ninterface IB { int Dem(); }\nclass DemChung : IA, IB {\n    private int n = 2;\n    public int Dem() { return ++n; }\n}\n\nDemChung x = new DemChung();\nIA a = x;\nIB b = x;",
    "class A {\n    public virtual int P { get { return 2; } }\n    public int Gap() { return P * 2; }\n}\nclass B : A {\n    public override int P { get { return base.P + 3; } }\n}\n\nA a = new A();\nA b = new B();",
    "class A {\n    public virtual int this[int i] { get { return i + 1; } }\n}\nclass B : A {\n    public override int this[int i] { get { return base[i] * 2; } }\n}\n\nA a = new A();\nA b = new B();",
    "class A { public A() { Console.Write(\"A\"); } }\nclass B : A { public B() { Console.Write(\"B\"); } }\nclass C : B {\n    public C() { Console.Write(\"C\"); }\n    public void M() { Console.Write(\"B\"); }\n}",
    "interface ITinh { int Tinh(int x); }\nclass A : ITinh {\n    public virtual int Tinh(int x) { return x + 1; }\n}\nclass B : A {\n    public override int Tinh(int x) { return x * 3; }\n}\nclass XuLy {\n    public static int ApDung(ITinh t, int x) { return t.Tinh(x) + 2; }\n}\n\nITinh a = new A();\nITinh b = new B();",
    "class Goc { public int N = 2; }\nclass Con : Goc { }\n\nCon c = new Con();\nGoc a = c;\nobject o = a;",
    "class A { public int So = 1; }\nclass B : A { }\nclass XuLy {\n    public static int Dat(A a, int n) { a.So = n; return a.So; }\n    public static int Tang(A a) { return ++a.So; }\n}\n\nB b = new B();",
    "class Mau { public virtual string Nhan() { return \"A\"; } }\nclass MauDo : Mau {\n    public override string Nhan() { return \"B\"; }\n}\nclass Tao {\n    public static Mau Lay() { return new MauDo(); }\n}\n\nMau m = Tao.Lay();\nobject o = m;",
    "class A { }\nclass B : A { }\nclass Chon {\n    public static string M(object x) { return \"O\"; }\n    public static string M(A x) { return \"A\"; }\n    public static string M(B x) { return \"B\"; }\n}\n\nB b = new B();\nA a = b;\nobject o = b;",
    "class Nen { public int So = 2; }\nclass Giua : Nen { }\nclass Cuoi : Giua { }\n\nCuoi x = new Cuoi();\nGiua y = x;\nNen z = y;\nobject o = z;",
    "interface IDoc { int Doc(); }\nclass Tep : IDoc {\n    public int N = 3;\n    public int Doc() { return N + 1; }\n}\n\nTep t = new Tep();\nIDoc d = t;\nobject o = d;",
    "interface ICha { int M(); }\ninterface ICon : ICha { int N(); }\nclass Mau : ICon {\n    public int M() { return 2; }\n    public int N() { return 5; }\n}\n\nICon c = new Mau();\nICha a = c;\nobject o = a;",
    "interface IDoc { int Doc(); }\ninterface IGhi { void Ghi(int x); }\nclass Kho : IDoc, IGhi {\n    private int n = 2;\n    public int Doc() { return n; }\n    public void Ghi(int x) { n = x; }\n}\nclass Doi {\n    public static void Gap(IDoc d, IGhi g) { g.Ghi(d.Doc() * 2); }\n}\n\nKho k = new Kho();\nIDoc d = k;\nIGhi g = k;",
    "class Nen {\n    public virtual string M() { return \"A\"; }\n}\nclass Nhanh : Nen {\n    public override string M() { return \"B\"; }\n}\n\nNhanh b = new Nhanh();\nNen[] a = { b, new Nen() };",
    "interface ITinh { int M(int n); }\nclass Cong : ITinh { public int M(int n) { return n + 2; } }\nclass Nhan : ITinh { public int M(int n) { return n * 2; } }\n\nCong c = new Cong();\nITinh[] a = { c, new Nhan() };",
    "class A { public int X = 2; }\nclass B : A { public new int X = 6; }\n\nB b = new B();\nA a = b;",
    "class A {\n    public virtual int P { get { return 3; } }\n}\nclass B : A {\n    public override int P { get { return base.P + 2; } }\n}\n\nB b = new B();\nA a = b;",
    "interface I { }\nclass B : I { }\nclass Chon {\n    public static string M(B x) { return \"B\"; }\n    public static string M(I x) { return \"I\"; }\n    public static string M(object x) { return \"O\"; }\n}\n\nB b = new B();\nI i = b;\nobject o = i;",
    "class A {\n    public virtual int Gia(int n) { return n; }\n}\nclass B : A {\n    public override int Gia(int n) { return n + 3; }\n}\nclass XuLy {\n    public static int Phi(A x, int n) { return x.Gia(n) * 2; }\n}\n\nB b = new B();\nA a = b;",
    "interface I { string M(); }\nclass A { public string M() { return \"A\"; } }\nclass B : A, I {\n    string I.M() { return \"I\"; }\n    public new string M() { return \"C\"; }\n}\n\nB b = new B();\nA a = b;\nI i = b;",
    "class A { }\nclass B : A { }\nclass Kieu {\n    public static string Tinh<T>(T x) { return typeof(T).Name; }\n}\n\nB b = new B();\nA a = b;\nvar x = a;\nvar y = (object)b;",
    "class Goc { }\nclass Con : Goc { }\n\nCon c = null;\nGoc a = c;\nobject o = a;",
    "class A { public virtual string M() { return \"A\"; } }\nclass B : A { public override string M() { return \"B\"; } }\nclass C : A { public override string M() { return \"C\"; } }\n\nB b = new B();\nA a = b;\nA p = a;\na = new C();",
    "class A { }\nclass B : A { public string M() { return \"B\"; } }\nclass C : A { public string M() { return \"C\"; } }\n\nA a = new B();\nA b = new C();",
    "class A { }\nclass B : A { public int N = 7; }\n\nA a = new B();\nA b = new A();",
    "class A { }\nclass B : A { public int N = 4; }\nclass C : A { public int N = 7; }\nclass Doc {\n    public static int M(A x) {\n        if (x is B) return ((B)x).N;\n        if (x is C) return ((C)x).N;\n        return 0;\n    }\n}\n\nA a = new B();\nA b = new C();",
    "interface I { string M(); }\nclass B : I {\n    public string M() { return \"B\"; }\n    public string Rieng() { return \"A\"; }\n}\nclass C : I { public string M() { return \"C\"; } }\n\nI x = new B();\nI y = new C();",
    "interface IDoc { string Doc(); }\ninterface IGhi { string Ghi(); }\nclass Kho : IDoc, IGhi {\n    public string Doc() { return \"D\"; }\n    public string Ghi() { return \"G\"; }\n}\nclass Tep : IDoc { public string Doc() { return \"K\"; } }\n\nIDoc x = new Kho();\nIDoc y = new Tep();",
    "interface ICha { int M(); }\ninterface ICon : ICha { int N(); }\nclass CoBan : ICha { public int M() { return 2; } }\nclass NangCao : ICon {\n    public int M() { return 3; }\n    public int N() { return 6; }\n}\n\nICha a = new CoBan();\nICha b = new NangCao();",
    "class A { public int N = 3; }\nclass B : A { public void Tang() { N += 2; } }\n\nB b = new B();\nA a = b;\nB c = (B)a;",
    "class A { public string M() { return \"A\"; } }\nclass B : A { public new string M() { return \"B\"; } }\nclass C : B { public new string M() { return \"C\"; } }\n\nA a = new C();",
    "class A { public virtual string M() { return \"A\"; } }\nclass B : A {\n    public override string M() { return \"B\"; }\n    public string Them() { return \"C\"; }\n}\n\nA a = new B();\nB b = (B)a;\nobject o = b;",
    "class A { public int X = 1; }\nclass B : A { public int Y = 3; }\nclass C : B { public int Z = 5; }\n\nA a = new C();\nA b = new B();",
    "class A { }\nclass B : A { public int N = 4; }\n\nA a = null;\nA b = new B();",
    "class A { }\nclass B : A { public int N = 3; }\nclass C : A { public int N = 6; }\n\nA[] a = { new B(), new A(), new C(), null };",
    "class A { }\nclass B : A { }\nclass Chon {\n    public static string M(A x) { return \"A\"; }\n    public static string M(B x) { return \"B\"; }\n    public static string M(object x) { return \"O\"; }\n}\n\nA a = new B();\nobject o = a;",
    "interface I { int Doc(); }\nclass A { public int N = 2; }\nclass B : A, I { public int Doc() { return N + 3; } }\nclass C : I { public int Doc() { return 9; } }\n\nI a = new B();\nI b = new C();",
    "interface IA { string M(); }\ninterface IB { string M(); }\nclass C : IA, IB {\n    string IA.M() { return \"A\"; }\n    string IB.M() { return \"B\"; }\n}\n\nC c = new C();\nobject o = c;\nIA a = c;",
    "class A { }\nclass B : A { }\nclass C : B { }\n\nA a = new C();\nA b = new B();",
    "class A { }\nclass B : A { public int So = 5; }\nclass C : A { public int So = 8; }\n\nA a = new B();\nB b = (B)a;\na = new C();",
    "interface I { int Doc(); }\nclass Bang : I {\n    private int[] a = { 2, 4, 6 };\n    public int Doc() { return a[0]; }\n    public int this[int i] { get { return a[i]; } }\n}\nclass Hang : I { public int Doc() { return 5; } }\n\nI a = new Bang();\nI b = new Hang();"
  ];

  // 500 câu trắc nghiệm C# lý thuyết và đọc mã (5 đáp án A..E)
  // [ch, category, num, snippetIdx, title, o0, o1, o2, o3, o4, ansIdx]
  var WORD_500 = [
    [2, "theory", 1, -1, "Trong lớp K, đâu là constructor không tham số?", "public static int Dem() { return 0; }", "public void KiemTra() { }", "public K() { }", "~K() { }", "public K(int n) { }", 2],
    [2, "theory", 2, -1, "Trong khai báo void Ghi(int n), n đóng vai trò gì?", "Tên lớp", "Đối số", "Tên tham số", "Tên biến", "Tên phương thức", 2],
    [2, "theory", 3, -1, "Biến khai báo trực tiếp trong thân lớp để lưu dữ liệu gọi là gì?", "Phương thức", "Thuộc tính (property)", "Trường", "Đối tượng", "Lớp", 2],
    [2, "theory", 4, -1, "Trong public int Dem(int n) { return n; }, int ngay trước Dem là phần nào?", "Mức truy cập", "Tham số", "Kiểu trả về", "Thân phương thức", "Tên phương thức", 2],
    [2, "theory", 5, -1, "Vai trò điển hình của constructor là gì?", "Cập nhật một giá trị", "Tổ chức định nghĩa kiểu", "Khởi tạo thể hiện", "Hoàn tất đối tượng", "Đọc một giá trị", 2],
    [2, "theory", 6, -1, "Trong lớp K, đâu là finalizer?", "public void KiemTra() { }", "public K(int n) { }", "~K() { }", "public static int Dem() { return 0; }", "public K() { }", 2],
    [2, "theory", 7, -1, "Accessor get của property chạy vào thời điểm nào trong biểu thức đọc p.X?", "Khi GC thực hiện finalization", "Khi gọi rõ tên qua dấu chấm", "Khi ghi thuộc tính", "Khi tạo thể hiện", "Khi đọc thuộc tính", 4],
    [2, "theory", 8, -1, "Trong lệnh Muc m = new Muc(4), vai trò của Muc là gì?", "Tên phương thức", "Đối số", "Tên tham số", "Tên lớp", "Tên biến", 3],
    [2, "theory", 9, -1, "Kiểu trả về nào biểu diễn một chuỗi văn bản?", "double", "void", "int", "string", "bool", 3],
    [2, "theory", 10, -1, "Trong public int Dem(int n) { return n; }, public xác định điều gì?", "Tham số", "Mức truy cập", "Tên phương thức", "Thân phương thức", "Kiểu trả về", 1],
    [2, "theory", 11, -1, "Một thể hiện cụ thể được tạo từ một lớp gọi là gì?", "Lớp", "Đối tượng", "Phương thức", "Trường", "Thuộc tính (property)", 1],
    [2, "theory", 12, -1, "Giữa Mau() và Mau(int n), yếu tố nào phân biệt hai chữ ký?", "Tên constructor", "Số lượng tham số", "Tên tham số", "Kiểu trả về", "Kiểu tham số", 1],
    [2, "theory", 13, -1, "Trong lớp K, đâu là phương thức tĩnh trả về int?", "public K(int n) { }", "public static int Dem() { return 0; }", "~K() { }", "public void KiemTra() { }", "public K() { }", 1],
    [2, "theory", 14, -1, "Với hai biến Hop đã khai báo, câu lệnh a = b; minh họa thao tác nào?", "Khai báo biến cục bộ", "Khai báo một lớp", "Tạo thể hiện", "Gán tham chiếu có sẵn", "Gọi phương thức thể hiện", 3],
    [2, "theory", 15, -1, "Thân phương thức thường Doc chạy lúc nào khi mã dùng biểu thức x.Doc()?", "Khi gọi rõ tên qua dấu chấm", "Khi GC thực hiện finalization", "Khi tạo thể hiện", "Khi ghi thuộc tính", "Khi đọc thuộc tính", 0],
    [2, "theory", 16, -1, "Cụm class Hop { } minh họa thao tác nào?", "Khai báo một lớp", "Gọi phương thức thể hiện", "Tạo thể hiện", "Gán tham chiếu có sẵn", "Khai báo biến cục bộ", 0],
    [2, "theory", 17, -1, "Giữa Mau(int n) và Mau(string n), yếu tố nào phân biệt hai chữ ký?", "Số lượng tham số", "Kiểu tham số", "Kiểu trả về", "Tên constructor", "Tên tham số", 1],
    [2, "theory", 18, -1, "Khái niệm nào áp dụng cho phương thức thường nhưng không có ở khai báo constructor?", "Số lượng tham số", "Kiểu tham số", "Kiểu trả về", "Tên tham số", "Tên constructor", 2],
    [2, "theory", 19, -1, "Trong lớp K, đâu là phương thức thường có kiểu trả về void?", "public K() { }", "public K(int n) { }", "~K() { }", "public static int Dem() { return 0; }", "public void KiemTra() { }", 4],
    [2, "theory", 20, -1, "Trong public int Dem(int n) { return n; }, Dem là phần nào?", "Mức truy cập", "Kiểu trả về", "Thân phương thức", "Tham số", "Tên phương thức", 4],
    [2, "theory", 21, -1, "Trong public int Dem(int n) { return n; }, khối { return n; } là phần nào?", "Kiểu trả về", "Tham số", "Mức truy cập", "Thân phương thức", "Tên phương thức", 3],
    [2, "theory", 22, -1, "Trong lớp K, đâu là constructor nhận một tham số int?", "public void KiemTra() { }", "~K() { }", "public K() { }", "public K(int n) { }", "public static int Dem() { return 0; }", 3],
    [2, "theory", 23, -1, "Một phương thức truy vấn thường đảm nhận vai trò nào?", "Đọc một giá trị", "Khởi tạo thể hiện", "Hoàn tất đối tượng", "Tổ chức định nghĩa kiểu", "Cập nhật một giá trị", 0],
    [2, "theory", 24, -1, "Trong public int Dem(int n) { return n; }, int n là phần nào?", "Tham số", "Kiểu trả về", "Thân phương thức", "Mức truy cập", "Tên phương thức", 0],
    [2, "theory", 25, -1, "Khuôn mô tả trạng thái và hành vi chung của các thể hiện gọi là gì?", "Lớp", "Trường", "Thuộc tính (property)", "Đối tượng", "Phương thức", 0],
    [2, "theory", 26, -1, "Khai báo public int Doc() { return 1; } trong lớp Pin minh họa thành phần nào?", "Finalizer do người lập trình khai báo", "Constructor ngầm định", "Constructor không tham số viết tường minh", "Constructor có tham số", "Phương thức thường", 4],
    [2, "theory", 27, -1, "Finalizer đã khai báo có thể được hệ thống chạy ở thời điểm nào?", "Khi GC thực hiện finalization", "Khi ghi thuộc tính", "Khi đọc thuộc tính", "Khi tạo thể hiện", "Khi gọi rõ tên qua dấu chấm", 0],
    [2, "theory", 28, -1, "Thân constructor thể hiện chạy ở giai đoạn nào?", "Khi GC thực hiện finalization", "Khi tạo thể hiện", "Khi gọi rõ tên qua dấu chấm", "Khi đọc thuộc tính", "Khi ghi thuộc tính", 1],
    [2, "theory", 29, -1, "Riêng câu lệnh Hop a; trong thân một phương thức thực hiện thao tác nào?", "Khai báo biến cục bộ", "Khai báo một lớp", "Gọi phương thức thể hiện", "Tạo thể hiện", "Gán tham chiếu có sẵn", 0],
    [2, "theory", 30, -1, "Lớp thường không khai báo constructor thể hiện sẽ được trình biên dịch cung cấp thành phần nào?", "Phương thức thường", "Constructor ngầm định", "Constructor không tham số viết tường minh", "Finalizer do người lập trình khai báo", "Constructor có tham số", 1],
    [2, "theory", 31, -1, "Kiểu trả về nào phù hợp với một số thực dấu phẩy động có độ chính xác kép?", "double", "bool", "void", "string", "int", 0],
    [2, "theory", 32, -1, "Accessor set của property chạy lúc nào trong phép gán p.X = 3?", "Khi gọi rõ tên qua dấu chấm", "Khi đọc thuộc tính", "Khi tạo thể hiện", "Khi ghi thuộc tính", "Khi GC thực hiện finalization", 3],
    [2, "theory", 33, -1, "Kiểu trả về nào biểu diễn kết quả đúng hoặc sai?", "void", "bool", "string", "int", "double", 1],
    [2, "theory", 34, -1, "Thành viên nào cung cấp cú pháp đọc hoặc gán giá trị qua accessor?", "Đối tượng", "Thuộc tính (property)", "Trường", "Lớp", "Phương thức", 1],
    [2, "theory", 35, -1, "Một phương thức gán trạng thái mới thường đảm nhận vai trò nào?", "Cập nhật một giá trị", "Hoàn tất đối tượng", "Khởi tạo thể hiện", "Đọc một giá trị", "Tổ chức định nghĩa kiểu", 0],
    [2, "theory", 36, -1, "Khai báo public Pin() { } trong lớp Pin minh họa thành phần nào?", "Finalizer do người lập trình khai báo", "Constructor không tham số viết tường minh", "Constructor ngầm định", "Phương thức thường", "Constructor có tham số", 1],
    [2, "theory", 37, -1, "Khai báo ~Pin() { } trong lớp Pin minh họa thành phần nào?", "Constructor không tham số viết tường minh", "Constructor có tham số", "Constructor ngầm định", "Phương thức thường", "Finalizer do người lập trình khai báo", 4],
    [2, "theory", 38, -1, "Finalizer tham gia vào giai đoạn nào của vòng đời thể hiện?", "Đọc một giá trị", "Hoàn tất đối tượng", "Khởi tạo thể hiện", "Tổ chức định nghĩa kiểu", "Cập nhật một giá trị", 1],
    [2, "theory", 39, -1, "Vai trò của khối class Hop { ... } đối với khai báo các thành viên là gì?", "Hoàn tất đối tượng", "Khởi tạo thể hiện", "Đọc một giá trị", "Tổ chức định nghĩa kiểu", "Cập nhật một giá trị", 3],
    [2, "theory", 40, -1, "Trong biểu thức m.Doc(), vai trò của Doc là gì?", "Tên biến", "Đối số", "Tên tham số", "Tên lớp", "Tên phương thức", 4],
    [2, "theory", 41, -1, "Trong lệnh Muc m = new Muc(4), vai trò của m là gì?", "Tên biến", "Tên lớp", "Tên phương thức", "Đối số", "Tên tham số", 0],
    [2, "theory", 42, -1, "Biểu thức new Hop() thực hiện thao tác nào?", "Gán tham chiếu có sẵn", "Khai báo một lớp", "Tạo thể hiện", "Gọi phương thức thể hiện", "Khai báo biến cục bộ", 2],
    [2, "theory", 43, -1, "Kiểu trả về nào phù hợp khi kết quả là số nguyên 32 bit có dấu?", "void", "bool", "int", "string", "double", 2],
    [2, "theory", 44, -1, "Giữa Mau(int n) và Mau(int m), yếu tố nào thay đổi nhưng không phân biệt được hai chữ ký?", "Số lượng tham số", "Tên constructor", "Kiểu tham số", "Tên tham số", "Kiểu trả về", 3],
    [2, "theory", 45, -1, "Câu lệnh a.Mo() minh họa thao tác nào?", "Gán tham chiếu có sẵn", "Khai báo biến cục bộ", "Tạo thể hiện", "Khai báo một lớp", "Gọi phương thức thể hiện", 4],
    [2, "theory", 46, -1, "Khai báo public Pin(int cap) { } trong lớp Pin minh họa thành phần nào?", "Constructor không tham số viết tường minh", "Constructor ngầm định", "Constructor có tham số", "Phương thức thường", "Finalizer do người lập trình khai báo", 2],
    [2, "theory", 47, -1, "Trong biểu thức m.Ghi(4), vai trò của 4 là gì?", "Đối số", "Tên biến", "Tên phương thức", "Tên lớp", "Tên tham số", 0],
    [2, "theory", 48, -1, "Từ khóa nào cho biết phương thức không trả về giá trị?", "string", "void", "double", "int", "bool", 1],
    [2, "theory", 49, -1, "Nhóm lệnh có tên dùng để thực hiện một tác vụ của lớp gọi là gì?", "Lớp", "Đối tượng", "Thuộc tính (property)", "Trường", "Phương thức", 4],
    [2, "theory", 50, -1, "Giữa Mau(int n) và Mau(string n), phần Mau biểu thị điều gì?", "Kiểu trả về", "Tên constructor", "Kiểu tham số", "Số lượng tham số", "Tên tham số", 1],
    [3, "theory", 51, -1, "Trong lệnh m[2] = \"A\", \"A\" là gì?", "Từ khóa chỉ mục", "Đối số chỉ mục", "Kiểu phần tử", "Giá trị cần ghi", "Kiểu chỉ số", 3],
    [3, "theory", 52, -1, "Một đối số trong lời gọi CapNhat(7) có nguồn gốc từ đâu?", "Thuộc hợp đồng của interface", "Thuộc kiểu và dùng chung", "Do người gọi truyền vào", "Thuộc riêng từng thể hiện", "Thuộc phạm vi thân phương thức", 2],
    [3, "theory", 53, -1, "Trong lệnh m[2] = \"A\", 2 là gì?", "Kiểu phần tử", "Từ khóa chỉ mục", "Giá trị cần ghi", "Kiểu chỉ số", "Đối số chỉ mục", 4],
    [3, "theory", 54, -1, "Trong phần khai báo string this[int i], this đảm nhận vai trò cú pháp gì?", "Kiểu chỉ số", "Kiểu phần tử", "Từ khóa chỉ mục", "Giá trị cần ghi", "Đối số chỉ mục", 2],
    [3, "theory", 55, -1, "Chỉ thị nào giới hạn truy cập thành viên theo cùng assembly?", "internal", "protected internal", "public", "private", "protected", 0],
    [3, "theory", 56, -1, "Cấu hình nào mở cả hai thao tác đọc và ghi ra bên ngoài?", "private set", "Chỉ có get", "protected set", "public get và public set", "Chỉ có set", 3],
    [3, "theory", 57, -1, "Trong khai báo string this[int i], int là gì?", "Kiểu chỉ số", "Giá trị cần ghi", "Đối số chỉ mục", "Từ khóa chỉ mục", "Kiểu phần tử", 0],
    [3, "theory", 58, -1, "public int Doc() { return 1; } là thành viên loại nào?", "Finalizer", "Phương thức tĩnh", "Constructor tĩnh", "Constructor thể hiện", "Phương thức thể hiện", 4],
    [3, "theory", 59, -1, "Cấu hình nào có thao tác gán nhưng không có thao tác đọc?", "Chỉ có get", "public get và public set", "private set", "protected set", "Chỉ có set", 4],
    [3, "theory", 60, -1, "Từ khóa nào đánh dấu phương thức có thể gọi qua tên lớp mà không cần đối tượng nhận?", "ref", "out", "this", "Không có từ khóa ở đối số", "static", 4],
    [3, "theory", 61, -1, "Khi truyền một int theo giá trị bằng cú pháp mặc định, trước đối số có gì?", "Không có từ khóa ở đối số", "ref", "out", "static", "this", 0],
    [3, "theory", 62, -1, "Khai báo ~Kho() { } là loại thành viên nào?", "Constructor tĩnh", "Constructor thể hiện", "Phương thức thể hiện", "Finalizer", "Phương thức tĩnh", 3],
    [3, "theory", 63, -1, "Thành viên có cú pháp int M { get; set; } thuộc loại nào?", "Phương thức truy vấn", "Property", "Phương thức cập nhật", "Trường hỗ trợ", "Chỉ mục", 1],
    [3, "theory", 64, -1, "public static int Doc() { return 1; } là thành viên loại nào?", "Phương thức tĩnh", "Finalizer", "Constructor tĩnh", "Constructor thể hiện", "Phương thức thể hiện", 0],
    [3, "theory", 65, -1, "Chỉ định nào đặt setter của property public theo quyền protected?", "Chỉ có set", "public get và public set", "protected set", "Chỉ có get", "private set", 2],
    [3, "theory", 66, -1, "Trường private _m mà các accessor đọc hoặc ghi đóng vai trò gì?", "Phương thức cập nhật", "Phương thức truy vấn", "Chỉ mục", "Property", "Trường hỗ trợ", 4],
    [3, "theory", 67, -1, "Biểu thức nào gán 2 vào property Muc?", "o[2]", "o.Doc(2)", "o[2] = 5", "o.Muc = 2", "o.Muc", 3],
    [3, "theory", 68, -1, "Phương thức SetM(int m) chỉ cập nhật _m đóng vai trò gì?", "Phương thức cập nhật", "Property", "Chỉ mục", "Trường hỗ trợ", "Phương thức truy vấn", 0],
    [3, "theory", 69, -1, "Biểu thức nào gán 5 qua setter của chỉ mục có đối số 2?", "o[2] = 5", "o.Muc = 2", "o[2]", "o.Muc", "o.Doc(2)", 0],
    [3, "theory", 70, -1, "Thành viên nào cung cấp cú pháp truy cập dạng x[i] cho một đối tượng?", "Phương thức truy vấn", "Chỉ mục", "Trường hỗ trợ", "Property", "Phương thức cập nhật", 1],
    [3, "theory", 71, -1, "Với property public có cả hai accessor, chỉ định nào cho phép bên ngoài đọc nhưng chỉ lớp được dùng setter?", "Chỉ có get", "public get và public set", "protected set", "Chỉ có set", "private set", 4],
    [3, "theory", 72, -1, "Biểu thức nào gọi phương thức Doc với đối số 2?", "o[2]", "o.Doc(2)", "o.Muc", "o[2] = 5", "o.Muc = 2", 1],
    [3, "theory", 73, -1, "Trong lớp Kho, static Kho() { } là thành viên loại nào?", "Constructor tĩnh", "Phương thức tĩnh", "Phương thức thể hiện", "Finalizer", "Constructor thể hiện", 0],
    [3, "theory", 74, -1, "Biểu thức nào đọc phần tử qua chỉ mục của o?", "o.Muc = 2", "o.Muc", "o[2] = 5", "o.Doc(2)", "o[2]", 4],
    [3, "theory", 75, -1, "Trong phương thức thể hiện, từ khóa nào chỉ đối tượng hiện tại?", "static", "set", "this", "value", "get", 2],
    [3, "theory", 76, -1, "Accessor nào xử lý thao tác gán giá trị vào property?", "static", "get", "this", "value", "set", 4],
    [3, "theory", 77, -1, "Khi truyền chính đối tượng đang chạy phương thức thể hiện, dùng biểu thức nào?", "static", "out", "ref", "this", "Không có từ khóa ở đối số", 3],
    [3, "theory", 78, -1, "Giấu dữ liệu và cung cấp cách truy cập có kiểm soát là nguyên lý nào?", "Ghi đè", "Đa hình", "Kế thừa", "Che khuất", "Đóng gói", 4],
    [3, "theory", 79, -1, "Từ khóa nào dùng để truyền một biến đã gán theo tham chiếu để phương thức có thể đọc và ghi?", "this", "out", "Không có từ khóa ở đối số", "ref", "static", 3],
    [3, "theory", 80, -1, "Một biến cục bộ khai báo trong thân phương thức thuộc phạm vi nào?", "Do người gọi truyền vào", "Thuộc riêng từng thể hiện", "Thuộc hợp đồng của interface", "Thuộc phạm vi thân phương thức", "Thuộc kiểu và dùng chung", 3],
    [3, "theory", 81, -1, "Từ khóa nào đánh dấu một thành viên thuộc về kiểu và được chia sẻ giữa các thể hiện?", "this", "static", "get", "value", "set", 1],
    [3, "theory", 82, -1, "Trong thân set, từ khóa nào biểu thị giá trị đang được gán?", "this", "set", "get", "static", "value", 4],
    [3, "theory", 83, -1, "Xây dựng một lớp từ lớp cơ sở là cơ chế nào?", "Ghi đè", "Đa hình", "Che khuất", "Kế thừa", "Đóng gói", 3],
    [3, "theory", 84, -1, "Với kiểu chứa có thể truy cập, chỉ thị nào mở quyền truy cập thành viên rộng nhất?", "protected", "protected internal", "internal", "private", "public", 4],
    [3, "theory", 85, -1, "Một trường thể hiện không tĩnh có quan hệ thế nào với các đối tượng của lớp?", "Thuộc hợp đồng của interface", "Do người gọi truyền vào", "Thuộc riêng từng thể hiện", "Thuộc phạm vi thân phương thức", "Thuộc kiểu và dùng chung", 2],
    [3, "theory", 86, -1, "Khai báo override M() để thay phiên bản của phương thức ảo là cơ chế nào?", "Kế thừa", "Đa hình", "Che khuất", "Ghi đè", "Đóng gói", 3],
    [3, "theory", 87, -1, "Chỉ thị nào cho lớp dẫn xuất truy cập thành viên theo quy tắc kế thừa?", "protected internal", "protected", "internal", "private", "public", 1],
    [3, "theory", 88, -1, "Một trường static có quan hệ thế nào với các đối tượng của lớp?", "Thuộc phạm vi thân phương thức", "Thuộc riêng từng thể hiện", "Thuộc kiểu và dùng chung", "Thuộc hợp đồng của interface", "Do người gọi truyền vào", 2],
    [3, "theory", 89, -1, "Từ khóa nào diễn tả tham số đầu ra mà phương thức phải gán trước khi trở về bình thường?", "static", "this", "out", "ref", "Không có từ khóa ở đối số", 2],
    [3, "theory", 90, -1, "Cấu hình nào cho phép đọc và hoàn toàn không khai báo setter?", "Chỉ có get", "Chỉ có set", "public get và public set", "private set", "protected set", 0],
    [3, "theory", 91, -1, "Chỉ thị nào cho truy cập nếu thỏa ít nhất một trong hai điều kiện protected và internal?", "public", "private", "protected internal", "internal", "protected", 2],
    [3, "theory", 92, -1, "Trong khai báo string this[int i], string là gì?", "Kiểu chỉ số", "Kiểu phần tử", "Từ khóa chỉ mục", "Đối số chỉ mục", "Giá trị cần ghi", 1],
    [3, "theory", 93, -1, "Phương thức GetM() chỉ trả về _m đóng vai trò gì?", "Phương thức cập nhật", "Phương thức truy vấn", "Property", "Trường hỗ trợ", "Chỉ mục", 1],
    [3, "theory", 94, -1, "Accessor nào trả về giá trị khi đọc property?", "set", "this", "get", "static", "value", 2],
    [3, "theory", 95, -1, "Trong lớp Kho, public Kho() { } là thành viên loại nào?", "Phương thức thể hiện", "Finalizer", "Constructor thể hiện", "Phương thức tĩnh", "Constructor tĩnh", 2],
    [3, "theory", 96, -1, "Biểu thức nào chỉ đọc property Muc của o?", "o.Muc", "o.Doc(2)", "o.Muc = 2", "o[2] = 5", "o[2]", 0],
    [3, "theory", 97, -1, "Khai báo new M() để chọn phiên bản riêng theo kiểu tham chiếu là cơ chế nào?", "Kế thừa", "Đa hình", "Đóng gói", "Ghi đè", "Che khuất", 4],
    [3, "theory", 98, -1, "Một khai báo phương thức không thân trong interface cổ điển thuộc về phần nào của thiết kế?", "Thuộc phạm vi thân phương thức", "Thuộc kiểu và dùng chung", "Thuộc hợp đồng của interface", "Thuộc riêng từng thể hiện", "Do người gọi truyền vào", 2],
    [3, "theory", 99, -1, "Cơ chế nào cho phép cùng lời gọi qua kiểu chung chạy các bản cài đặt khác nhau theo đối tượng thực?", "Ghi đè", "Đóng gói", "Kế thừa", "Che khuất", "Đa hình", 4],
    [3, "theory", 100, -1, "Chỉ thị nào giới hạn truy cập thành viên trong chính kiểu khai báo theo các ví dụ cơ bản?", "protected internal", "public", "private", "protected", "internal", 2],
    [4, "theory", 101, -1, "Chỉ thị nào khóa quyền truy cập trực tiếp của một lớp dẫn xuất thông thường?", "Truy cập private", "Truy cập internal", "Truy cập protected", "Truy cập protected internal", "Truy cập public", 0],
    [4, "theory", 102, -1, "Trong base.M(), dấu nào nối base với M?", "Dấu ngoặc tròn", "Dấu chấm phẩy", "Dấu chấm", "Dấu hai chấm", "Dấu phẩy", 2],
    [4, "theory", 103, -1, "Chỉ thị nào cấp quyền khi mã cùng assembly hoặc thỏa quy tắc protected?", "Truy cập protected", "Truy cập public", "Truy cập protected internal", "Truy cập private", "Truy cập internal", 2],
    [4, "theory", 104, -1, "Trong class LenhDacBiet : Lenh, LenhDacBiet giữ vai trò gì?", "Giao diện", "Lớp cơ sở", "Lớp dẫn xuất", "Lớp cùng cấp", "Lớp cơ sở gián tiếp", 2],
    [4, "theory", 105, -1, "Trong : base(x, y), cặp dấu nào bao quanh danh sách đối số?", "Dấu chấm", "Dấu hai chấm", "Dấu phẩy", "Dấu ngoặc tròn", "Dấu chấm phẩy", 3],
    [4, "theory", 106, -1, "Thành viên nào có bản cài đặt mặc định và có thể được ghi đè trong lớp dẫn xuất?", "Constructor lớp cơ sở", "Constructor lớp dẫn xuất", "Finalizer lớp dẫn xuất", "Phương thức ảo", "Finalizer lớp cơ sở", 3],
    [4, "theory", 107, -1, "Trong A a = new B(), B xác định điều gì về đối tượng được tạo?", "Tên phương thức", "Danh sách đối số", "Kiểu thực của đối tượng", "Kiểu khai báo của biến", "Tên của biến", 2],
    [4, "theory", 108, -1, "Trong class B : A, dấu nào ngăn tên lớp dẫn xuất với danh sách kiểu cơ sở?", "Dấu phẩy", "Dấu chấm", "Dấu ngoặc tròn", "Dấu chấm phẩy", "Dấu hai chấm", 4],
    [4, "theory", 109, -1, "Trong cùng cây phân cấp, C là gì đối với B?", "Lớp dẫn xuất gián tiếp", "Lớp ngoài hệ phân cấp", "Lớp cơ sở gián tiếp", "Lớp cơ sở trực tiếp", "Lớp dẫn xuất trực tiếp", 4],
    [4, "theory", 110, -1, "Dòng nào dùng phép ép kiểu tường minh từ biến a kiểu A sang B?", "A a = new A()", "B b = new B()", "A a = b", "B b = (B)a", "A a = new B()", 3],
    [4, "theory", 111, -1, "Nếu C : B và B : A, C giữ vai trò gì đối với A?", "Lớp cơ sở gián tiếp", "Lớp dẫn xuất trực tiếp", "Lớp dẫn xuất gián tiếp", "Lớp ngoài hệ phân cấp", "Lớp cơ sở trực tiếp", 2],
    [4, "theory", 112, -1, "Dòng nào tạo B và dùng biến có kiểu khai báo B để giữ nó?", "A a = b", "B b = (B)a", "A a = new B()", "B b = new B()", "A a = new A()", 3],
    [4, "theory", 113, -1, "Từ khóa nào đánh dấu phương thức ghi đè phương thức ảo thừa hưởng?", "override", "base", "new", "this", "abstract", 0],
    [4, "theory", 114, -1, "B thực hiện base.M() trong phương thức riêng. Đây là thao tác gì?", "Che khuất thành viên trùng", "Gọi hành vi lớp cơ sở", "Dùng lại thành viên chung", "Thêm hành vi riêng", "Ghi đè phương thức ảo", 1],
    [4, "theory", 115, -1, "Từ khóa nào gọi phiên bản lớp cơ sở trong base.M()?", "override", "new", "abstract", "base", "this", 3],
    [4, "theory", 116, -1, "Một phương thức chung được viết ở A để B và C dùng lại minh họa lợi ích gì?", "Thêm hành vi riêng", "Dùng lại thành viên chung", "Che khuất thành viên trùng", "Gọi hành vi lớp cơ sở", "Ghi đè phương thức ảo", 1],
    [4, "theory", 117, -1, "Trong : base(x, y), dấu nào phân tách x với y?", "Dấu chấm", "Dấu hai chấm", "Dấu phẩy", "Dấu ngoặc tròn", "Dấu chấm phẩy", 2],
    [4, "theory", 118, -1, "Trong class B : A, phần public B() { } thuộc thành phần nào?", "Constructor lớp cơ sở", "Finalizer lớp cơ sở", "Constructor lớp dẫn xuất", "Finalizer lớp dẫn xuất", "Phương thức ảo", 2],
    [4, "theory", 119, -1, "Trong a.Doc(), Doc là phần nào của lời gọi?", "Kiểu thực của đối tượng", "Tên phương thức", "Kiểu khai báo của biến", "Tên của biến", "Danh sách đối số", 1],
    [4, "theory", 120, -1, "Trong cùng cây phân cấp, A là gì đối với C?", "Lớp ngoài hệ phân cấp", "Lớp cơ sở trực tiếp", "Lớp dẫn xuất gián tiếp", "Lớp dẫn xuất trực tiếp", "Lớp cơ sở gián tiếp", 4],
    [4, "theory", 121, -1, "Từ khóa nào đánh dấu lớp cơ sở chỉ dùng qua thể hiện của lớp cụ thể dẫn xuất?", "this", "override", "base", "new", "abstract", 4],
    [4, "theory", 122, -1, "Từ khóa nào đặt trước khai báo để biểu thị che khuất có chủ ý?", "override", "new", "base", "this", "abstract", 1],
    [4, "theory", 123, -1, "Nếu D không thuộc nhánh A, B, C, D là gì đối với nhánh này?", "Lớp dẫn xuất trực tiếp", "Lớp dẫn xuất gián tiếp", "Lớp ngoài hệ phân cấp", "Lớp cơ sở gián tiếp", "Lớp cơ sở trực tiếp", 2],
    [4, "theory", 124, -1, "B dùng override M() để thay hành vi đã được A khai báo virtual. Đây là thao tác gì?", "Thêm hành vi riêng", "Dùng lại thành viên chung", "Gọi hành vi lớp cơ sở", "Che khuất thành viên trùng", "Ghi đè phương thức ảo", 4],
    [4, "theory", 125, -1, "Kiểu được khai báo bằng interface và có thể được một lớp thực thi gọi là gì?", "Lớp cùng cấp", "Giao diện", "Lớp cơ sở", "Lớp cơ sở gián tiếp", "Lớp dẫn xuất", 1],
    [4, "theory", 126, -1, "Trong A a = new B(), A xác định điều gì về a?", "Tên phương thức", "Kiểu thực của đối tượng", "Tên của biến", "Kiểu khai báo của biến", "Danh sách đối số", 3],
    [4, "theory", 127, -1, "Khi chuỗi finalization chạy với đối tượng B : A và cả hai có finalizer, thành phần nào chạy trước?", "Finalizer lớp dẫn xuất", "Constructor lớp cơ sở", "Phương thức ảo", "Constructor lớp dẫn xuất", "Finalizer lớp cơ sở", 0],
    [4, "theory", 128, -1, "Trong khai báo trường int n;, dấu nào kết thúc khai báo?", "Dấu hai chấm", "Dấu ngoặc tròn", "Dấu chấm phẩy", "Dấu phẩy", "Dấu chấm", 2],
    [4, "theory", 129, -1, "Trong class LenhDacBiet : Lenh, Lenh giữ vai trò gì?", "Lớp cơ sở gián tiếp", "Giao diện", "Lớp dẫn xuất", "Lớp cơ sở", "Lớp cùng cấp", 3],
    [4, "theory", 130, -1, "Initializer nào gọi constructor không tham số khác trong chính lớp?", ": this()", "Không ghi initializer", ": this(n)", ": base(n)", ": base()", 0],
    [4, "theory", 131, -1, "Trong A a = new B(), a là gì?", "Tên của biến", "Tên phương thức", "Danh sách đối số", "Kiểu thực của đối tượng", "Kiểu khai báo của biến", 0],
    [4, "theory", 132, -1, "Khi tạo đối tượng B : A, thân constructor A là thân của thành phần nào?", "Constructor lớp cơ sở", "Finalizer lớp cơ sở", "Constructor lớp dẫn xuất", "Phương thức ảo", "Finalizer lớp dẫn xuất", 0],
    [4, "theory", 133, -1, "Trong cùng chuỗi finalization, thành phần nào chạy sau ~B()?", "Phương thức ảo", "Finalizer lớp cơ sở", "Constructor lớp cơ sở", "Constructor lớp dẫn xuất", "Finalizer lớp dẫn xuất", 1],
    [4, "theory", 134, -1, "Initializer nào chuyển n đến constructor của lớp cơ sở?", ": this()", "Không ghi initializer", ": this(n)", ": base(n)", ": base()", 3],
    [4, "theory", 135, -1, "Dòng nào thực hiện upcasting bằng cách gán một biến b kiểu B đã có sẵn vào biến mới kiểu A?", "B b = new B()", "A a = new B()", "A a = new A()", "A a = b", "B b = (B)a", 3],
    [4, "theory", 136, -1, "Trường hợp nào để trình biên dịch ngầm chọn base() cho constructor của lớp dẫn xuất?", ": this()", "Không ghi initializer", ": this(n)", ": base(n)", ": base()", 1],
    [4, "theory", 137, -1, "Trong A a = new B(n), phần n giữa hai dấu ngoặc là gì?", "Danh sách đối số", "Tên phương thức", "Kiểu thực của đối tượng", "Tên của biến", "Kiểu khai báo của biến", 0],
    [4, "theory", 138, -1, "Chỉ thị nào cho phép bên ngoài dùng thành viên qua đối tượng nếu kiểu chứa cũng truy cập được?", "Truy cập public", "Truy cập internal", "Truy cập private", "Truy cập protected", "Truy cập protected internal", 0],
    [4, "theory", 139, -1, "Từ khóa nào dùng để gọi constructor khác của cùng lớp trong : this(...) ?", "this", "new", "abstract", "base", "override", 0],
    [4, "theory", 140, -1, "Hai lớp độc lập cùng dẫn xuất trực tiếp từ Lenh có quan hệ gì với nhau trong cây phân cấp?", "Lớp dẫn xuất", "Giao diện", "Lớp cơ sở gián tiếp", "Lớp cơ sở", "Lớp cùng cấp", 4],
    [4, "theory", 141, -1, "Initializer nào chuyển n đến constructor khác trong chính lớp?", ": this(n)", ": base()", ": this()", ": base(n)", "Không ghi initializer", 0],
    [4, "theory", 142, -1, "B khai báo new M() khi A đã có M(). Đây là thao tác gì?", "Che khuất thành viên trùng", "Dùng lại thành viên chung", "Ghi đè phương thức ảo", "Thêm hành vi riêng", "Gọi hành vi lớp cơ sở", 0],
    [4, "theory", 143, -1, "Dòng nào tạo đúng một đối tượng có kiểu thực A?", "B b = new B()", "A a = new B()", "A a = new A()", "B b = (B)a", "A a = b", 2],
    [4, "theory", 144, -1, "Chỉ thị nào cho lớp khác cùng assembly dùng thành viên mà không cần kế thừa?", "Truy cập public", "Truy cập protected internal", "Truy cập private", "Truy cập internal", "Truy cập protected", 3],
    [4, "theory", 145, -1, "Chỉ thị nào thường mở thành viên cho lớp dẫn xuất ở assembly khác theo quy tắc kế thừa?", "Truy cập internal", "Truy cập public", "Truy cập protected", "Truy cập private", "Truy cập protected internal", 2],
    [4, "theory", 146, -1, "Initializer nào gọi constructor không tham số của lớp cơ sở?", ": this(n)", ": this()", "Không ghi initializer", ": base()", ": base(n)", 3],
    [4, "theory", 147, -1, "Giả sử B : A và cả hai tạo được, dòng nào thể hiện gán đối tượng B vào biến kiểu A ngay khi tạo?", "B b = new B()", "A a = new B()", "A a = new A()", "A a = b", "B b = (B)a", 1],
    [4, "theory", 148, -1, "Giả sử C : B và B : A. B là gì đối với C?", "Lớp ngoài hệ phân cấp", "Lớp cơ sở trực tiếp", "Lớp dẫn xuất gián tiếp", "Lớp cơ sở gián tiếp", "Lớp dẫn xuất trực tiếp", 1],
    [4, "theory", 149, -1, "B có thêm phương thức ChiB() để thực hiện việc A không có. Đây là thao tác gì?", "Thêm hành vi riêng", "Gọi hành vi lớp cơ sở", "Che khuất thành viên trùng", "Ghi đè phương thức ảo", "Dùng lại thành viên chung", 0],
    [4, "theory", 150, -1, "Cho Lenh : TacVu và LenhDacBiet : Lenh, TacVu giữ vai trò gì đối với LenhDacBiet?", "Giao diện", "Lớp cùng cấp", "Lớp cơ sở gián tiếp", "Lớp dẫn xuất", "Lớp cơ sở", 2],
    [5, "theory", 151, -1, "Từ khóa nào ghi đè phương thức ảo thừa hưởng?", "abstract", "virtual", "override", "interface", "new", 2],
    [5, "theory", 152, -1, "Phương thức nào cung cấp mã băm?", "MemberwiseClone()", "Equals()", "GetType()", "GetHashCode()", "ToString()", 3],
    [5, "theory", 153, -1, "Một kiểu dùng interface để biểu diễn hợp đồng chung thuộc loại nào?", "Phương thức trừu tượng", "Lớp cụ thể", "Phương thức ảo có thân", "Lớp trừu tượng", "Giao diện", 4],
    [5, "theory", 154, -1, "Từ khóa nào biểu thị che khuất thành viên thừa hưởng?", "override", "interface", "abstract", "virtual", "new", 4],
    [5, "theory", 155, -1, "Phương thức nào trả về chuỗi biểu diễn đối tượng?", "GetType()", "GetHashCode()", "Equals()", "ToString()", "MemberwiseClone()", 3],
    [5, "theory", 156, -1, "Việc thiết lập giá trị ban đầu của thể hiện thuộc giai đoạn nào?", "Đa hình", "Kế thừa", "Khởi tạo", "Đóng gói", "Finalization", 2],
    [5, "theory", 157, -1, "Một lớp đánh dấu abstract thuộc loại nào?", "Giao diện", "Lớp cụ thể", "Phương thức ảo có thân", "Lớp trừu tượng", "Phương thức trừu tượng", 3],
    [5, "theory", 158, -1, "Khi A và B đều là lớp, class B : A minh họa quan hệ nào?", "Lớp thực thi giao diện", "Lớp kế thừa và thực thi interface", "Lớp kế thừa lớp", "Giao diện kế thừa giao diện", "Giao diện làm kiểu tham chiếu", 2],
    [5, "theory", 159, -1, "Thành viên nào có cùng tên, mức truy cập và số tham số, nhưng sai kiểu trả về so với hợp đồng void Gui()?", "public void Gui(int n) { }", "public int Gui() { return 1; }", "public void Gui() { }", "private void Gui() { }", "public static void Gui() { }", 1],
    [5, "theory", 160, -1, "Việc runtime chạy finalizer đã khai báo thuộc cơ chế nào?", "Đóng gói", "Kế thừa", "Khởi tạo", "Finalization", "Đa hình", 3],
    [5, "theory", 161, -1, "Khai báo nào là phương thức trừu tượng trong lớp trừu tượng?", "public static void M() { }", "public void M() { }", "public virtual void M() { }", "public override void M() { }", "public abstract void M();", 4],
    [5, "theory", 162, -1, "Khai báo nào tạo phương thức ảo có bản cài đặt gốc?", "public abstract void M();", "public void M() { }", "public override void M() { }", "public static void M() { }", "public virtual void M() { }", 4],
    [5, "theory", 163, -1, "Phương thức nào trả về thông tin kiểu thực?", "GetType()", "ToString()", "Equals()", "GetHashCode()", "MemberwiseClone()", 0],
    [5, "theory", 164, -1, "Trong khai báo void M(int n), int n là gì?", "Kiểu thực", "Kiểu khai báo", "Tham số hình thức", "Giá trị trả về", "Tên thành viên", 2],
    [5, "theory", 165, -1, "Thành viên khai báo public virtual int Doc() { return 1; } thuộc loại nào?", "Giao diện", "Phương thức ảo có thân", "Lớp trừu tượng", "Lớp cụ thể", "Phương thức trừu tượng", 1],
    [5, "theory", 166, -1, "Đâu là khai báo hợp đồng property chỉ đọc?", "void Gui();", "int Muc { get; }", "int muc;", "string this[int i] { get; }", "int Muc { get; set; }", 1],
    [5, "theory", 167, -1, "Giả sử I là giao diện. class C : I minh họa quan hệ nào?", "Lớp kế thừa và thực thi interface", "Giao diện kế thừa giao diện", "Lớp thực thi giao diện", "Giao diện làm kiểu tham chiếu", "Lớp kế thừa lớp", 2],
    [5, "theory", 168, -1, "Phương thức nào kiểm tra quan hệ tương đương?", "MemberwiseClone()", "GetType()", "Equals()", "ToString()", "GetHashCode()", 2],
    [5, "theory", 169, -1, "Với interface I khai báo void Gui(), thành viên nào thực thi ngầm định đúng hợp đồng?", "private void Gui() { }", "public void Gui(int n) { }", "public void Gui() { }", "public static void Gui() { }", "public int Gui() { return 1; }", 2],
    [5, "theory", 170, -1, "Từ khóa nào khai báo một kiểu hợp đồng có thể được nhiều lớp thực thi?", "virtual", "abstract", "override", "interface", "new", 3],
    [5, "theory", 171, -1, "Cơ chế nào xây dựng một lớp mới dựa trên thành viên và hành vi của một lớp cơ sở?", "Kế thừa", "Khởi tạo", "Đa hình", "Finalization", "Đóng gói", 0],
    [5, "theory", 172, -1, "Thành viên nào có đúng tên và danh sách tham số nhưng sai vì là static?", "public static void Gui() { }", "public void Gui(int n) { }", "private void Gui() { }", "public void Gui() { }", "public int Gui() { return 1; }", 0],
    [5, "theory", 173, -1, "Thành viên nào có đúng tên và danh sách tham số nhưng không đủ quyền để thực thi ngầm định?", "public void Gui() { }", "private void Gui() { }", "public int Gui() { return 1; }", "public void Gui(int n) { }", "public static void Gui() { }", 1],
    [5, "theory", 174, -1, "Đâu là khai báo hợp đồng chỉ mục chỉ đọc?", "int muc;", "int Muc { get; }", "int Muc { get; set; }", "void Gui();", "string this[int i] { get; }", 4],
    [5, "theory", 175, -1, "Khi A là lớp, I là interface, class C : A, I minh họa quan hệ nào?", "Lớp thực thi giao diện", "Giao diện kế thừa giao diện", "Giao diện làm kiểu tham chiếu", "Lớp kế thừa và thực thi interface", "Lớp kế thừa lớp", 3],
    [5, "theory", 176, -1, "Khi cả I và J là giao diện, interface J : I minh họa quan hệ nào?", "Lớp kế thừa lớp", "Giao diện làm kiểu tham chiếu", "Giao diện kế thừa giao diện", "Lớp kế thừa và thực thi interface", "Lớp thực thi giao diện", 2],
    [5, "theory", 177, -1, "Cùng một lời gọi trên kiểu chung thực hiện khác nhau theo đối tượng thực minh họa đặc điểm nào?", "Kế thừa", "Đóng gói", "Finalization", "Đa hình", "Khởi tạo", 3],
    [5, "theory", 178, -1, "Tính năng nào cho phép lớp trừu tượng yêu cầu lớp con cụ thể viết thân phương thức?", "Có thể khai báo phương thức không thân", "Có thể khai báo constructor", "Có thể chứa phương thức có thân", "Có thể chứa trường thể hiện", "Không thể tạo thể hiện trực tiếp", 0],
    [5, "theory", 179, -1, "Sau khi đã chọn được phương thức ảo để gọi, yếu tố nào quyết định bản override chạy?", "Kiểu khai báo", "Tham số hình thức", "Tên thành viên", "Kiểu thực", "Giá trị trả về", 3],
    [5, "theory", 180, -1, "Từ khóa nào khai báo phương thức chưa có thân trong lớp trừu tượng?", "new", "interface", "abstract", "override", "virtual", 2],
    [5, "theory", 181, -1, "Trong mô hình giao diện chỉ khai báo hợp đồng, đâu là chữ ký của một phương thức?", "int muc;", "string this[int i] { get; }", "void Gui();", "int Muc { get; set; }", "int Muc { get; }", 2],
    [5, "theory", 182, -1, "Giấu trạng thái sau property là ví dụ của nguyên lý nào?", "Finalization", "Đa hình", "Khởi tạo", "Kế thừa", "Đóng gói", 4],
    [5, "theory", 183, -1, "Khai báo nào tạo phương thức thuộc về kiểu và gọi được qua tên lớp?", "public virtual void M() { }", "public void M() { }", "public abstract void M();", "public static void M() { }", "public override void M() { }", 3],
    [5, "theory", 184, -1, "Một phương thức khai báo abstract trong lớp và kết thúc bằng dấu chấm phẩy thuộc loại nào?", "Lớp cụ thể", "Lớp trừu tượng", "Phương thức trừu tượng", "Giao diện", "Phương thức ảo có thân", 2],
    [5, "theory", 185, -1, "Một lớp thường tạo được thể hiện và đã thực hiện mọi nghĩa vụ trừu tượng thuộc loại nào?", "Phương thức ảo có thân", "Giao diện", "Lớp trừu tượng", "Lớp cụ thể", "Phương thức trừu tượng", 3],
    [5, "theory", 186, -1, "Khai báo nào tạo phương thức thường không ảo và có thân?", "public static void M() { }", "public virtual void M() { }", "public override void M() { }", "public abstract void M();", "public void M() { }", 4],
    [5, "theory", 187, -1, "Khai báo nào là hợp đồng property vừa đọc vừa ghi?", "int Muc { get; }", "int Muc { get; set; }", "int muc;", "void Gui();", "string this[int i] { get; }", 1],
    [5, "theory", 188, -1, "Trong int M() { return 3; }, số 3 là gì?", "Tham số hình thức", "Kiểu khai báo", "Kiểu thực", "Giá trị trả về", "Tên thành viên", 3],
    [5, "theory", 189, -1, "Khi kiểm tra a có được phép gọi thành viên nào, trình biên dịch bắt đầu từ kiểu gì của a?", "Tên thành viên", "Giá trị trả về", "Kiểu thực", "Kiểu khai báo", "Tham số hình thức", 3],
    [5, "theory", 190, -1, "Khai báo nào thay phiên bản của phương thức ảo thừa hưởng?", "public abstract void M();", "public override void M() { }", "public virtual void M() { }", "public static void M() { }", "public void M() { }", 1],
    [5, "theory", 191, -1, "Phương thức nào của object tạo bản sao nông khi được gọi từ bên trong lớp dẫn xuất?", "ToString()", "GetHashCode()", "GetType()", "MemberwiseClone()", "Equals()", 3],
    [5, "theory", 192, -1, "Giới hạn nào áp dụng khi viết new trực tiếp với tên lớp trừu tượng?", "Có thể khai báo constructor", "Có thể chứa trường thể hiện", "Có thể chứa phương thức có thân", "Không thể tạo thể hiện trực tiếp", "Có thể khai báo phương thức không thân", 3],
    [5, "theory", 193, -1, "Tính năng nào cho phép lớp trừu tượng thiết lập trạng thái ban đầu khi tạo một lớp con?", "Có thể khai báo phương thức không thân", "Có thể khai báo constructor", "Không thể tạo thể hiện trực tiếp", "Có thể chứa phương thức có thân", "Có thể chứa trường thể hiện", 1],
    [5, "theory", 194, -1, "Từ khóa nào khai báo phương thức ảo có thân mặc định ở lớp cơ sở?", "new", "virtual", "override", "abstract", "interface", 1],
    [5, "theory", 195, -1, "Khi C thực thi I, trong I x = new C();, I đóng vai trò gì?", "Lớp kế thừa và thực thi interface", "Giao diện kế thừa giao diện", "Lớp thực thi giao diện", "Giao diện làm kiểu tham chiếu", "Lớp kế thừa lớp", 3],
    [5, "theory", 196, -1, "Đặc điểm nào cho phép lớp trừu tượng cung cấp hành vi mặc định bằng một phương thức thường?", "Có thể chứa trường thể hiện", "Có thể khai báo phương thức không thân", "Có thể khai báo constructor", "Có thể chứa phương thức có thân", "Không thể tạo thể hiện trực tiếp", 3],
    [5, "theory", 197, -1, "Đâu là khai báo một trường thể hiện, thuộc loại dữ liệu giao diện không chứa?", "void Gui();", "int muc;", "int Muc { get; set; }", "int Muc { get; }", "string this[int i] { get; }", 1],
    [5, "theory", 198, -1, "Thành viên nào có đúng tên và là public nhưng khác danh sách tham số?", "public int Gui() { return 1; }", "public void Gui() { }", "private void Gui() { }", "public void Gui(int n) { }", "public static void Gui() { }", 3],
    [5, "theory", 199, -1, "Trong lời gọi x.M(), M xác định điều gì trong phép tra cứu thành viên?", "Tham số hình thức", "Giá trị trả về", "Tên thành viên", "Kiểu khai báo", "Kiểu thực", 2],
    [5, "theory", 200, -1, "Tính năng nào giúp lớp trừu tượng lưu trạng thái riêng của từng đối tượng?", "Có thể chứa phương thức có thân", "Có thể khai báo constructor", "Có thể khai báo phương thức không thân", "Không thể tạo thể hiện trực tiếp", "Có thể chứa trường thể hiện", 4],
    [5, "output", 201, 0, "Console.Write(a.M());", "GNC", "NC", "GNCC", "GG", "NCC", 0],
    [5, "output", 202, 0, "Console.Write(b.M());", "GN", "GG", "NC", "NCC", "N", 0],
    [5, "output", 203, 0, "Console.Write(c.M() + b.M());", "GNCC", "GNC", "GN", "NCC", "GNCGN", 4],
    [5, "output", 204, 0, "Console.Write(a.M() + new Goc().M());", "GNC", "GNCC", "GNCG", "GG", "NCC", 2],
    [5, "output", 205, 0, "Console.Write(a.M() == c.M() ? \"C\" : \"N\");", "C", "G", "NC", "GN", "N", 0],
    [4, "output", 206, 1, "Console.Write(a.M());", "CB", "G", "B", "C", "GB", 1],
    [4, "output", 207, 1, "Console.Write(b.M() + c.M());", "BC", "CG", "GB", "GC", "CB", 0],
    [4, "output", 208, 1, "Console.Write(c.M() + a.M());", "BC", "GC", "CG", "BG", "GB", 2],
    [4, "output", 209, 1, "Console.Write(a.M() + b.M() + c.M());", "BG", "GBC", "CG", "GC", "CB", 1],
    [4, "output", 210, 1, "Console.Write(b.M() == c.M() ? \"C\" : \"B\");", "GB", "B", "C", "GC", "G", 1],
    [3, "output", 211, 2, "Console.Write(b.X);", "5", "4", "8", "6", "7", 3],
    [3, "output", 212, 2, "Console.Write(b.Y);", "8", "7", "9", "10", "11", 2],
    [3, "output", 213, 2, "Console.Write(c.X);", "10", "7", "6", "8", "9", 3],
    [3, "output", 214, 2, "Console.Write(c.Y);", "9", "12", "10", "11", "13", 3],
    [3, "output", 215, 2, "Console.Write(b.Y + c.X);", "15", "16", "17", "18", "19", 2],
    [5, "output", 216, 3, "Console.Write(a.Tinh());", "7", "8", "10", "6", "9", 1],
    [5, "output", 217, 3, "Console.Write(b.KetQua());", "9", "6", "5", "8", "7", 4],
    [5, "output", 218, 3, "Console.Write(a.KetQua() - b.KetQua());", "6", "3", "4", "7", "5", 4],
    [5, "output", 219, 3, "Console.Write(b.Tinh() + a.Tinh());", "10", "12", "9", "11", "13", 3],
    [5, "output", 220, 3, "Console.Write(a.KetQua() - b.Tinh());", "10", "7", "8", "9", "11", 3],
    [5, "output", 221, 4, "Console.Write(c.Lenh());", "T", "CC", "B", "TB", "C", 4],
    [5, "output", 222, 4, "Console.Write(b.Lenh() + t.Lenh());", "BT", "BC", "CC", "BB", "TT", 0],
    [5, "output", 223, 4, "Console.Write(t.Lenh() + c.Lenh());", "TC", "TT", "CC", "CT", "BB", 0],
    [5, "output", 224, 4, "Console.Write(b.Lenh() + c.Lenh() + t.Lenh());", "TBC", "BB", "BCT", "CC", "BTC", 2],
    [5, "output", 225, 4, "Console.Write(b.Lenh() == c.Lenh() ? \"B\" : \"C\");", "CT", "C", "B", "T", "TT", 1],
    [5, "output", 226, 5, "Console.Write(x.M());", "A", "CA", "C", "B", "BA", 0],
    [5, "output", 227, 5, "Console.Write(y.M());", "AB", "C", "A", "CB", "B", 1],
    [5, "output", 228, 5, "Console.Write(b.M() + x.M());", "AA", "BA", "CA", "AC", "AB", 1],
    [5, "output", 229, 5, "Console.Write(((B)c).M() + y.M());", "CA", "CB", "AA", "AB", "BC", 4],
    [5, "output", 230, 5, "Console.Write(((A)c).M() + c.M() + y.M());", "BB", "ACC", "BA", "ABC", "CA", 1],
    [5, "output", 231, 6, "Console.Write(d.Doc());", "0", "3", "2", "1", "4", 2],
    [5, "output", 232, 6, "g.Ghi(4); Console.Write(k.Doc());", "5", "4", "3", "6", "7", 0],
    [5, "output", 233, 6, "k.Ghi(d.Doc()); Console.Write(d.Doc());", "5", "1", "4", "2", "3", 4],
    [5, "output", 234, 6, "g.Ghi(3); k.Ghi(d.Doc()); Console.Write(d.Doc());", "6", "7", "4", "3", "5", 4],
    [5, "output", 235, 6, "g.Ghi(6); Console.Write(d.Doc() + k.Doc());", "14", "12", "15", "13", "11", 0],
    [5, "output", 236, 7, "Console.Write(d.Muc);", "7", "9", "5", "8", "6", 0],
    [5, "output", 237, 7, "c.Tang(2); Console.Write(m.Muc);", "11", "10", "9", "8", "7", 2],
    [5, "output", 238, 7, "c.Tang(-3); Console.Write(d.Muc);", "2", "6", "5", "4", "3", 3],
    [5, "output", 239, 7, "Console.Write(new May().Muc + d.Muc);", "12", "11", "10", "9", "8", 2],
    [5, "output", 240, 7, "c.Tang(1); Console.Write(d.Muc + m.Muc);", "16", "14", "11", "15", "12", 0],
    [3, "output", 241, 8, "Console.Write(a.N + b.N);", "5", "4", "2", "6", "3", 1],
    [3, "output", 242, 8, "a.N = 5; Console.Write(b.N);", "5", "1", "3", "4", "2", 2],
    [3, "output", 243, 8, "b.N = 8; Console.Write(a.N);", "2", "4", "3", "1", "0", 3],
    [3, "output", 244, 8, "a.N += b.N; Console.Write(a.N + b.N);", "9", "6", "5", "8", "7", 4],
    [3, "output", 245, 8, "b.N += a.N; Console.Write(((A)b).N * b.N);", "3", "4", "6", "2", "5", 1],
    [5, "output", 246, 9, "Console.Write(a.M(1));", "AB", "A", "Y", "B", "X", 3],
    [5, "output", 247, 9, "Console.Write(a.M(\"1\"));", "Y", "B", "BA", "X", "A", 3],
    [5, "output", 248, 9, "Console.Write(b.M(\"1\") + a.M(\"1\"));", "XY", "XB", "YX", "AY", "YB", 2],
    [5, "output", 249, 9, "Console.Write(a.M(2) + b.M(\"2\"));", "YB", "AB", "BY", "YX", "XY", 2],
    [5, "output", 250, 9, "Console.Write(b.M(2) + b.M(\"2\"));", "BY", "BX", "AY", "BA", "BB", 0],
    [5, "output", 251, 10, "Console.Write(a.N());", "8", "5", "6", "4", "7", 2],
    [5, "output", 252, 10, "Console.Write(c.N());", "3", "4", "1", "5", "2", 0],
    [5, "output", 253, 10, "Console.Write(c.M());", "7", "8", "9", "6", "10", 1],
    [5, "output", 254, 10, "Console.Write(a.M() + c.N());", "7", "8", "9", "6", "10", 1],
    [5, "output", 255, 10, "Console.Write(a.N() + ((A)c).M());", "8", "6", "7", "10", "9", 0],
    [5, "output", 256, 11, "Console.Write(b.SoLuong);", "5", "3", "2", "4", "1", 1],
    [5, "output", 257, 11, "Console.Write(b[b.SoLuong - 1]);", "6", "10", "7", "8", "9", 3],
    [5, "output", 258, 11, "Console.Write(b[0] + b[1]);", "6", "8", "5", "7", "9", 3],
    [5, "output", 259, 11, "Console.Write(b[2] - b[0]);", "6", "5", "4", "7", "8", 0],
    [5, "output", 260, 11, "Console.Write(b[b[0]] + b.SoLuong);", "10", "12", "9", "13", "11", 4],
    [3, "output", 261, 12, "Console.Write(A.Tong);", "5", "4", "3", "7", "6", 0],
    [3, "output", 262, 12, "Console.Write(a.So + b.So);", "2", "4", "1", "5", "3", 4],
    [3, "output", 263, 12, "Console.Write(c.So - b.So);", "2", "1", "4", "3", "5", 3],
    [3, "output", 264, 12, "Console.Write(a.So + b.So + c.So);", "6", "10", "7", "8", "9", 3],
    [3, "output", 265, 12, "b.So = 9; Console.Write(A.Tong + b.So);", "11", "12", "13", "14", "15", 3],
    [5, "output", 266, 13, "Console.Write(a.ToString());", "A", "B", "CB", "AC", "C", 0],
    [5, "output", 267, 13, "Console.Write(b.ToString());", "AB", "AC", "BA", "BC", "CB", 0],
    [5, "output", 268, 13, "Console.Write(a.ToString() + c.ToString());", "ABAC", "BCA", "ABC", "BA", "AAB", 4],
    [5, "output", 269, 13, "Console.Write(b.ToString() + c.ToString());", "ABC", "ABAC", "ABAB", "BCA", "AB", 2],
    [5, "output", 270, 13, "Console.Write(b.ToString() == c.ToString() ? \"AB\" : \"C\");", "BA", "AB", "CB", "BC", "AC", 1],
    [5, "output", 271, 14, "Console.Write(a.M());", "2", "4", "3", "1", "0", 3],
    [5, "output", 272, 14, "Console.Write(b.M());", "5", "7", "8", "6", "9", 1],
    [5, "output", 273, 14, "Console.Write(a.M() + b.M());", "7", "6", "8", "9", "10", 2],
    [5, "output", 274, 14, "Console.Write(new B().M() + c.M());", "11", "13", "9", "10", "12", 0],
    [5, "output", 275, 14, "Console.Write(b.M() * a.M() + c.M());", "16", "12", "14", "13", "15", 2],
    [3, "output", 276, 15, "Console.Write(c.X);", "6", "4", "3", "5", "2", 1],
    [3, "output", 277, 15, "Console.Write(c.Y);", "10", "9", "8", "7", "6", 2],
    [3, "output", 278, 15, "Console.Write(c.Z);", "13", "12", "14", "10", "11", 1],
    [3, "output", 279, 15, "Console.Write(new B(4).Y);", "12", "8", "9", "10", "11", 3],
    [3, "output", 280, 15, "Console.Write(new C(2).Z + c.Z);", "16", "19", "20", "17", "18", 4],
    [5, "output", 281, 16, "Console.Write(a.Phi(3));", "12", "10", "11", "9", "8", 1],
    [5, "output", 282, 16, "Console.Write(b.Phi(3));", "11", "8", "7", "10", "9", 4],
    [5, "output", 283, 16, "Console.Write(a.Phi(0) + b.Phi(0));", "8", "9", "7", "5", "6", 2],
    [5, "output", 284, 16, "Console.Write(b.Phi(2) - a.Phi(2));", "1", "2", "-1", "0", "3", 2],
    [5, "output", 285, 16, "Console.Write(new A().Phi(4) + b.Phi(1));", "11", "12", "9", "10", "13", 0],
    [5, "output", 286, 17, "a.Tang(3); Console.Write(a.Doc());", "2", "5", "3", "4", "6", 3],
    [5, "output", 287, 17, "b.Tang(3); Console.Write(b.Doc());", "7", "9", "5", "8", "6", 0],
    [5, "output", 288, 17, "a.Tang(2); b.Tang(2); Console.Write(a.Doc() + b.Doc());", "10", "9", "8", "6", "7", 2],
    [5, "output", 289, 17, "b.Tang(2); b.Tang(-1); Console.Write(b.Doc());", "2", "1", "3", "5", "4", 2],
    [5, "output", 290, 17, "b.Tang(4); Console.Write(b.Doc() - a.Doc());", "10", "8", "7", "9", "6", 1],
    [5, "output", 291, 18, "Console.Write(a[0].Doi(4));", "7", "6", "9", "10", "8", 4],
    [5, "output", 292, 18, "Console.Write(a[1].Doi(4));", "9", "7", "8", "5", "6", 1],
    [5, "output", 293, 18, "Console.Write(a[1].Doi(a[0].Doi(2)));", "6", "8", "7", "9", "5", 2],
    [5, "output", 294, 18, "Console.Write(a[0].Doi(a[1].Doi(2)));", "12", "8", "11", "10", "9", 3],
    [5, "output", 295, 18, "Console.Write(a[0].Doi(3) - a[1].Doi(3));", "2", "1", "0", "3", "4", 2],
    [5, "output", 296, 19, "Console.Write(a.Dem());", "5", "2", "4", "1", "3", 4],
    [5, "output", 297, 19, "Console.Write(a.Dem() + b.Dem());", "6", "5", "9", "7", "8", 3],
    [5, "output", 298, 19, "b.Dem(); Console.Write(x.Dem());", "5", "6", "4", "2", "3", 2],
    [5, "output", 299, 19, "a.Dem(); x.Dem(); Console.Write(b.Dem());", "4", "3", "7", "6", "5", 4],
    [5, "output", 300, 19, "Console.Write(a.Dem() * b.Dem());", "12", "13", "10", "14", "11", 0],
    [5, "output", 301, 20, "Console.Write(b.P);", "4", "6", "5", "7", "3", 2],
    [5, "output", 302, 20, "Console.Write(a.Gap());", "4", "5", "2", "3", "6", 0],
    [5, "output", 303, 20, "Console.Write(b.Gap());", "11", "9", "10", "8", "12", 2],
    [5, "output", 304, 20, "Console.Write(a.P + b.P);", "6", "9", "7", "8", "5", 2],
    [5, "output", 305, 20, "Console.Write(b.Gap() - a.Gap());", "4", "5", "7", "8", "6", 4],
    [5, "output", 306, 21, "Console.Write(a[2]);", "4", "2", "5", "1", "3", 4],
    [5, "output", 307, 21, "Console.Write(b[2]);", "8", "5", "4", "7", "6", 4],
    [5, "output", 308, 21, "Console.Write(b[0] + b[1]);", "6", "4", "5", "8", "7", 0],
    [5, "output", 309, 21, "Console.Write(b[a[2]]);", "9", "7", "8", "10", "6", 2],
    [5, "output", 310, 21, "Console.Write(b[3] - a[1]);", "6", "5", "7", "4", "8", 0],
    [4, "output", 311, 22, "new A();", "B", "BC", "AB", "A", "C", 3],
    [4, "output", 312, 22, "new B();", "BC", "AC", "ACB", "B", "AB", 4],
    [4, "output", 313, 22, "new C();", "ABCD", "AC", "ABCB", "ABC", "ACB", 3],
    [4, "output", 314, 22, "new C().M();", "ABCB", "ABC", "ABCC", "ABCBC", "ABCD", 0],
    [4, "output", 315, 22, "C c = new C(); c.M(); Console.Write(\"C\");", "ABCC", "ACB", "ABCB", "ABCD", "ABCBC", 4],
    [5, "output", 316, 23, "Console.Write(XuLy.ApDung(a, 4));", "6", "8", "9", "5", "7", 4],
    [5, "output", 317, 23, "Console.Write(XuLy.ApDung(b, 4));", "14", "15", "16", "13", "12", 0],
    [5, "output", 318, 23, "Console.Write(XuLy.ApDung(b, a.Tinh(2)));", "9", "10", "13", "12", "11", 4],
    [5, "output", 319, 23, "Console.Write(XuLy.ApDung(a, b.Tinh(2)));", "10", "7", "8", "11", "9", 4],
    [5, "output", 320, 23, "Console.Write(XuLy.ApDung(b, 1) + XuLy.ApDung(a, 1));", "10", "11", "8", "7", "9", 4],
    [4, "upcasting", 321, 24, "Console.Write(a.GetType().Name);", "Object", "True", "Con", "False", "Goc", 2],
    [4, "upcasting", 322, 24, "Console.Write(o.GetType().Name + \" \" + a.GetType().Name);", "Con Goc", "Goc Con", "Goc Goc", "Object", "Con Con", 4],
    [4, "upcasting", 323, 24, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(c, o), o is Con, a.GetType() == typeof(Goc)));", "True True True", "True False True", "True True False", "False False True", "True False False", 2],
    [4, "upcasting", 324, 24, "a.N = 7; Console.Write(c.N);", "1", "Con Goc", "2", "5", "7", 4],
    [4, "upcasting", 325, 24, "c.N += 3; Console.Write(a.N);", "1", "7", "2", "Object", "5", 4],
    [4, "upcasting", 326, 25, "Console.Write(XuLy.Dat(b, 5));", "7", "6", "4", "5", "3", 3],
    [4, "upcasting", 327, 25, "Console.Write(XuLy.Tang(b));", "4", "1", "3", "2", "5", 3],
    [4, "upcasting", 328, 25, "XuLy.Tang(b); Console.Write(b.So);", "4", "2", "1", "5", "3", 1],
    [4, "upcasting", 329, 25, "XuLy.Dat(b, 7); Console.Write(XuLy.Tang(b));", "7", "8", "6", "10", "9", 1],
    [4, "upcasting", 330, 25, "A a = b; XuLy.Dat(a, 4); Console.Write(a.So + b.So);", "6", "7", "10", "8", "9", 3],
    [4, "upcasting", 331, 26, "Console.Write(m.Nhan());", "BA", "B", "AA", "BB", "A", 1],
    [4, "upcasting", 332, 26, "Console.Write(m.GetType().Name);", "MauDo", "True", "Object", "False", "Mau", 0],
    [4, "upcasting", 333, 26, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(m, o), o is Mau, o.GetType() == typeof(Mau)));", "True True True", "False True True", "False False False", "True True False", "True False False", 3],
    [4, "upcasting", 334, 26, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(m, Tao.Lay()), m is MauDo, o is MauDo));", "False True True", "True False False", "False True False", "False False False", "True True True", 0],
    [4, "upcasting", 335, 26, "Console.Write(new Mau().Nhan() + Tao.Lay().Nhan());", "BB", "A", "AA", "BA", "AB", 4],
    [4, "upcasting", 336, 27, "Console.Write(Chon.M(b));", "AA", "O", "B", "A", "AO", 2],
    [4, "upcasting", 337, 27, "Console.Write(Chon.M(a));", "BB", "A", "O", "B", "OA", 1],
    [4, "upcasting", 338, 27, "Console.Write(Chon.M(o));", "B", "A", "OO", "OA", "O", 4],
    [4, "upcasting", 339, 27, "Console.Write(Chon.M(a) + Chon.M(b));", "OA", "AB", "OO", "BO", "AA", 1],
    [4, "upcasting", 340, 27, "Console.Write(Chon.M(o) + Chon.M(a));", "OA", "BB", "OO", "BO", "BA", 0],
    [4, "upcasting", 341, 28, "Console.Write(z.GetType().Name);", "True", "Cuoi", "Giua", "Nen", "False", 1],
    [4, "upcasting", 342, 28, "Console.Write(y.GetType().Name + \" \" + z.GetType().Name);", "Object", "Nen Cuoi", "Nen Nen", "Giua Cuoi", "Cuoi Cuoi", 4],
    [4, "upcasting", 343, 28, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(x, z), z is Giua, o.GetType() == typeof(Nen)));", "False True False", "True False False", "True True True", "True True False", "False False True", 3],
    [4, "upcasting", 344, 28, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(y, new Giua()), y is Cuoi, o is Giua));", "True False False", "False True True", "False True False", "False False True", "True True True", 1],
    [4, "upcasting", 345, 28, "z.So = 5; Console.Write(x.So);", "4", "True", "3", "5", "2", 3],
    [5, "upcasting", 346, 29, "Console.Write(d.Doc());", "3", "5", "6", "4", "2", 3],
    [5, "upcasting", 347, 29, "Console.Write(d.GetType().Name);", "Object", "True", "False", "IDoc", "Tep", 4],
    [5, "upcasting", 348, 29, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(t, o), o is IDoc, d.GetType() == typeof(Tep)));", "True False True", "True True True", "False False False", "False True True", "True False False", 1],
    [5, "upcasting", 349, 29, "t.N = 5; Console.Write(d.Doc());", "8", "4", "6", "9", "5", 2],
    [5, "upcasting", 350, 29, "Console.Write(t.Doc() + d.Doc());", "5", "9", "8", "6", "4", 2],
    [5, "upcasting", 351, 30, "Console.Write(a.M());", "0", "3", "2", "1", "4", 2],
    [5, "upcasting", 352, 30, "Console.Write(c.M() + c.N());", "4", "7", "6", "5", "8", 1],
    [5, "upcasting", 353, 30, "Console.Write(a.GetType().Name);", "Mau", "True", "ICon", "ICha", "False", 0],
    [5, "upcasting", 354, 30, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(c, a), a is ICon, a.GetType() == typeof(ICha)));", "False True True", "True True False", "True False False", "False False True", "False True False", 1],
    [5, "upcasting", 355, 30, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(o, new Mau()), o is ICha, o is ICon));", "True False True", "False True False", "False False False", "True False False", "False True True", 4],
    [5, "upcasting", 356, 31, "Doi.Gap(k, k); Console.Write(k.Doc());", "2", "4", "3", "6", "5", 1],
    [5, "upcasting", 357, 31, "Doi.Gap(d, g); Doi.Gap(d, g); Console.Write(d.Doc());", "7", "8", "10", "6", "9", 1],
    [5, "upcasting", 358, 31, "g.Ghi(3); Doi.Gap(k, g); Console.Write(k.Doc());", "8", "6", "5", "7", "4", 1],
    [5, "upcasting", 359, 31, "Kho p = new Kho(); p.Ghi(5); Doi.Gap(p, k); Console.Write(d.Doc());", "8", "9", "12", "11", "10", 4],
    [5, "upcasting", 360, 31, "Kho p = new Kho(); Doi.Gap(k, p); Console.Write(d.Doc() + p.Doc());", "6", "7", "8", "4", "5", 0],
    [4, "upcasting", 361, 32, "Console.Write(a[0].M());", "B", "BA", "BB", "AB", "A", 0],
    [4, "upcasting", 362, 32, "Console.Write(a[1].M() + a[0].M());", "BA", "AB", "AA", "B", "BB", 1],
    [4, "upcasting", 363, 32, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(b, a[0]), a[0] is Nhanh, a[1] is Nhanh));", "False True True", "False False True", "True True False", "False True False", "False False False", 2],
    [4, "upcasting", 364, 32, "Console.Write(a[0].GetType().Name);", "AB", "Nen", "False", "Nhanh", "True", 3],
    [4, "upcasting", 365, 32, "a[0] = a[1]; Console.Write(a[0].M() + b.M());", "AB", "B", "AA", "BB", "BA", 0],
    [5, "upcasting", 366, 33, "Console.Write(a[0].M(3));", "3", "5", "4", "6", "7", 1],
    [5, "upcasting", 367, 33, "Console.Write(a[1].M(3));", "7", "8", "5", "6", "4", 3],
    [5, "upcasting", 368, 33, "Console.Write(a[0].M(a[1].M(2)));", "4", "8", "7", "6", "5", 3],
    [5, "upcasting", 369, 33, "Console.Write(a[1].GetType().Name);", "False", "Nhan", "True", "ITinh", "Cong", 1],
    [5, "upcasting", 370, 33, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(c, a[0]), a[1] is Cong, a[1] is Nhan));", "True False True", "False False False", "True True True", "True True False", "True False False", 0],
    [4, "upcasting", 371, 34, "Console.Write(a.X);", "0", "4", "1", "2", "3", 3],
    [4, "upcasting", 372, 34, "Console.Write(a.X + b.X);", "7", "6", "8", "9", "10", 2],
    [4, "upcasting", 373, 34, "a.X = 7; Console.Write(b.X);", "6", "8", "5", "4", "7", 0],
    [4, "upcasting", 374, 34, "b.X = 4; Console.Write(a.X + b.X);", "5", "6", "4", "7", "8", 1],
    [4, "upcasting", 375, 34, "a.X++; b.X++; Console.Write(a.X + b.X);", "12", "9", "8", "11", "10", 4],
    [4, "upcasting", 376, 35, "Console.Write(a.P);", "7", "6", "5", "3", "4", 2],
    [4, "upcasting", 377, 35, "Console.Write(a.P + b.P);", "8", "11", "10", "9", "12", 2],
    [4, "upcasting", 378, 35, "Console.Write(new A().P + a.P);", "6", "7", "10", "8", "9", 3],
    [4, "upcasting", 379, 35, "Console.Write(b.P - new A().P);", "3", "2", "0", "1", "4", 1],
    [4, "upcasting", 380, 35, "Console.Write(a.P * 2 - new A().P);", "5", "9", "7", "8", "6", 2],
    [5, "upcasting", 381, 36, "Console.Write(Chon.M(i));", "I", "O", "IO", "B", "BI", 0],
    [5, "upcasting", 382, 36, "Console.Write(Chon.M(b) + Chon.M(i));", "OI", "BI", "IB", "BB", "OO", 1],
    [5, "upcasting", 383, 36, "Console.Write(Chon.M(o) + Chon.M(i));", "IB", "II", "OO", "BO", "OI", 4],
    [5, "upcasting", 384, 36, "Console.Write(Chon.M((object)b));", "B", "II", "IB", "O", "I", 3],
    [5, "upcasting", 385, 36, "Console.Write(Chon.M((I)b) + Chon.M(b));", "IB", "BI", "IO", "OI", "BB", 0],
    [4, "upcasting", 386, 37, "Console.Write(XuLy.Phi(b, 2));", "12", "11", "8", "10", "9", 3],
    [4, "upcasting", 387, 37, "Console.Write(XuLy.Phi(new A(), 2));", "4", "6", "5", "3", "2", 0],
    [4, "upcasting", 388, 37, "Console.Write(XuLy.Phi(a, 4) - XuLy.Phi(new A(), 4));", "4", "7", "8", "6", "5", 3],
    [4, "upcasting", 389, 37, "Console.Write(a.Gia(1) + XuLy.Phi(b, 1));", "12", "14", "13", "11", "10", 0],
    [4, "upcasting", 390, 37, "Console.Write(XuLy.Phi(b, a.Gia(0)));", "10", "11", "14", "13", "12", 4],
    [5, "upcasting", 391, 38, "Console.Write(i.M());", "C", "AA", "I", "A", "AC", 2],
    [5, "upcasting", 392, 38, "Console.Write(a.M() + i.M());", "CI", "AI", "IA", "AA", "IC", 1],
    [5, "upcasting", 393, 38, "Console.Write(b.M() + a.M());", "IA", "CA", "CC", "IC", "AA", 1],
    [5, "upcasting", 394, 38, "Console.Write(i.M() + b.M());", "IC", "CC", "CI", "CA", "AC", 0],
    [5, "upcasting", 395, 38, "Console.Write(((I)b).M() + i.M());", "IA", "AA", "CI", "IC", "II", 4],
    [4, "upcasting", 396, 39, "Console.Write(Kieu.Tinh(b));", "AB", "AA", "I", "A", "B", 4],
    [4, "upcasting", 397, 39, "Console.Write(Kieu.Tinh(x));", "AO", "I", "B", "A", "BB", 3],
    [4, "upcasting", 398, 39, "Console.Write(Kieu.Tinh(y));", "AB", "Object", "True", "BB", "False", 1],
    [4, "upcasting", 399, 39, "Console.Write(x.GetType().Name);", "AB", "A", "I", "B", "BA", 3],
    [4, "upcasting", 400, 39, "Console.Write(Kieu.Tinh(x) + x.GetType().Name);", "AO", "BB", "BA", "AB", "AA", 3],
    [4, "upcasting", 401, 40, "Console.Write(string.Format(\"{0} {1} {2}\", a == null, c is Con, o == null));", "True True True", "False False False", "True False True", "True False False", "False True False", 2],
    [4, "upcasting", 402, 40, "Console.Write(string.Format(\"{0} {1} {2}\", o != null, a is Con, a == null));", "False False False", "True True True", "False True True", "False False True", "True False True", 3],
    [4, "upcasting", 403, 40, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(c, o), o is Con, a == null));", "True False True", "False False True", "True True False", "True False False", "False False False", 0],
    [4, "upcasting", 404, 40, "Console.Write(string.Format(\"{0} {1} {2}\", a == null, o is Con, c == null));", "True True False", "True True True", "False False False", "True False False", "True False True", 4],
    [4, "upcasting", 405, 40, "Console.Write(string.Format(\"{0} {1} {2}\", a is Goc, o == null, object.ReferenceEquals(o, a)));", "False False False", "True False True", "True True False", "False False True", "False True True", 4],
    [4, "upcasting", 406, 41, "Console.Write(a.M());", "B", "C", "AB", "A", "BA", 1],
    [4, "upcasting", 407, 41, "Console.Write(p.M());", "C", "BB", "CC", "A", "B", 4],
    [4, "upcasting", 408, 41, "Console.Write(a.M() + p.M());", "AC", "CA", "BB", "AB", "CB", 4],
    [4, "upcasting", 409, 41, "Console.Write(string.Format(\"{0} {1} {2}\", object.ReferenceEquals(a, b), a is C, p is B));", "True True True", "False True False", "False False True", "False True True", "False False False", 3],
    [4, "upcasting", 410, 41, "Console.Write(object.ReferenceEquals(p, b) ? b.M() + p.M() : \"AC\");", "CA", "AB", "BA", "CB", "BB", 4],
    [4, "downcasting", 411, 42, "Console.Write(((B)a).M());", "BC", "NullReferenceException", "A", "C", "B", 4],
    [4, "downcasting", 412, 42, "Console.Write(((B)b).M());", "BC", "C", "InvalidCastException", "null", "NullReferenceException", 2],
    [4, "downcasting", 413, 42, "Console.Write(((C)b).M());", "BB", "B", "C", "A", "InvalidCastException", 2],
    [4, "downcasting", 414, 42, "Console.Write((a as C) == null ? \"null\" : (a as C).M());", "CB", "BC", "NullReferenceException", "InvalidCastException", "null", 4],
    [4, "downcasting", 415, 42, "Console.Write(((B)a).M() + ((C)b).M());", "BC", "CB", "CC", "BB", "NullReferenceException", 0],
    [4, "downcasting", 416, 43, "Console.Write(((B)a).N);", "NullReferenceException", "7", "0", "3", "B", 1],
    [4, "downcasting", 417, 43, "Console.Write(((B)b).N);", "B", "InvalidCastException", "NullReferenceException", "0", "null", 1],
    [4, "downcasting", 418, 43, "Console.Write((b as B) == null ? \"null\" : \"B\");", "InvalidCastException", "0", "NullReferenceException", "A", "null", 4],
    [4, "downcasting", 419, 43, "Console.Write((b as B).N);", "A", "InvalidCastException", "NullReferenceException", "B", "null", 2],
    [4, "downcasting", 420, 43, "Console.Write((a as B).N - 4);", "InvalidCastException", "null", "7", "3", "0", 3],
    [4, "downcasting", 421, 44, "Console.Write(Doc.M(a));", "6", "3", "2", "4", "5", 3],
    [4, "downcasting", 422, 44, "Console.Write(Doc.M(b));", "8", "7", "5", "6", "9", 1],
    [4, "downcasting", 423, 44, "Console.Write(Doc.M(new A()));", "0", "2", "1", "4", "3", 0],
    [4, "downcasting", 424, 44, "Console.Write(Doc.M(null));", "0", "1", "4", "3", "2", 0],
    [4, "downcasting", 425, 44, "Console.Write(Doc.M(a) + Doc.M(b));", "8", "10", "11", "9", "12", 2],
    [5, "downcasting", 426, 45, "Console.Write(((B)x).Rieng());", "B", "I", "C", "A", "InvalidCastException", 3],
    [5, "downcasting", 427, 45, "Console.Write(((B)x).Rieng() + x.M());", "AB", "BC", "CB", "AC", "NullReferenceException", 0],
    [5, "downcasting", 428, 45, "Console.Write(((B)y).Rieng());", "NullReferenceException", "CB", "AB", "I", "InvalidCastException", 4],
    [5, "downcasting", 429, 45, "Console.Write(((C)y).M() + x.M());", "CB", "BC", "InvalidCastException", "AB", "AC", 0],
    [5, "downcasting", 430, 45, "Console.Write((y as B) == null ? y.M() : \"A\");", "C", "I", "NullReferenceException", "B", "A", 0],
    [5, "downcasting", 431, 46, "Console.Write(((IGhi)x).Ghi());", "D", "G", "GD", "K", "NullReferenceException", 1],
    [5, "downcasting", 432, 46, "Console.Write(((IGhi)y).Ghi());", "K", "null", "InvalidCastException", "NullReferenceException", "DG", 2],
    [5, "downcasting", 433, 46, "Console.Write((y as IGhi) == null ? \"null\" : (y as IGhi).Ghi());", "KD", "null", "NullReferenceException", "K", "InvalidCastException", 1],
    [5, "downcasting", 434, 46, "Console.Write(x.Doc() + ((IGhi)x).Ghi());", "KD", "DK", "NullReferenceException", "DG", "GD", 3],
    [5, "downcasting", 435, 46, "Console.Write(y.Doc() + (x as IGhi).Ghi());", "KD", "InvalidCastException", "KG", "DK", "GD", 2],
    [5, "downcasting", 436, 47, "Console.Write(((ICon)b).N());", "6", "7", "5", "InvalidCastException", "4", 0],
    [5, "downcasting", 437, 47, "Console.Write(((ICon)a).N());", "InvalidCastException", "NullReferenceException", "5", "2", "4", 0],
    [5, "downcasting", 438, 47, "Console.Write((a as ICon) == null ? a.M() : 0);", "InvalidCastException", "3", "2", "4", "1", 2],
    [5, "downcasting", 439, 47, "Console.Write((b as ICon).M() + (b as ICon).N());", "9", "7", "NullReferenceException", "6", "8", 0],
    [5, "downcasting", 440, 47, "Console.Write((a is ICon) ? ((ICon)a).N() : ((ICon)b).N() - 1);", "NullReferenceException", "3", "4", "6", "5", 4],
    [4, "downcasting", 441, 48, "c.Tang(); Console.Write(a.N);", "5", "7", "6", "3", "4", 0],
    [4, "downcasting", 442, 48, "a.N = 8; Console.Write(c.N);", "8", "9", "7", "6", "10", 0],
    [4, "downcasting", 443, 48, "c.Tang(); b.Tang(); Console.Write(c.N);", "5", "6", "9", "8", "7", 4],
    [4, "downcasting", 444, 48, "Console.Write(object.ReferenceEquals(b, c) ? a.N : 0);", "5", "2", "3", "4", "1", 2],
    [4, "downcasting", 445, 48, "B d = (B)a; d.N = 6; Console.Write(b.N + c.N);", "12", "8", "10", "11", "9", 0],
    [4, "downcasting", 446, 49, "Console.Write(a.M());", "CA", "B", "BC", "A", "C", 3],
    [4, "downcasting", 447, 49, "Console.Write(((B)a).M());", "A", "NullReferenceException", "B", "AB", "C", 2],
    [4, "downcasting", 448, 49, "Console.Write(((C)a).M());", "NullReferenceException", "BC", "B", "A", "C", 4],
    [4, "downcasting", 449, 49, "Console.Write(((B)a).M() + ((C)a).M());", "AC", "BC", "CA", "CB", "NullReferenceException", 1],
    [4, "downcasting", 450, 49, "Console.Write(a.M() + (a as B).M());", "BA", "CA", "NullReferenceException", "AB", "BC", 3],
    [4, "downcasting", 451, 50, "Console.Write(a.M());", "A", "B", "C", "BC", "CB", 1],
    [4, "downcasting", 452, 50, "Console.Write(b.M() + b.Them());", "CB", "BC", "AA", "BA", "AC", 1],
    [4, "downcasting", 453, 50, "Console.Write(((A)o).M() + ((B)o).M());", "AC", "BC", "InvalidCastException", "CA", "BB", 4],
    [4, "downcasting", 454, 50, "Console.Write(((B)o).Them() + a.M());", "InvalidCastException", "CB", "BB", "CC", "CA", 1],
    [4, "downcasting", 455, 50, "Console.Write((o as B).Them());", "BA", "A", "InvalidCastException", "B", "C", 4],
    [4, "downcasting", 456, 51, "Console.Write(((B)a).Y);", "2", "1", "3", "NullReferenceException", "4", 2],
    [4, "downcasting", 457, 51, "Console.Write(((C)a).X + ((C)a).Z);", "7", "6", "InvalidCastException", "4", "5", 1],
    [4, "downcasting", 458, 51, "Console.Write(((C)b).Z);", "9", "8", "1", "InvalidCastException", "NullReferenceException", 3],
    [4, "downcasting", 459, 51, "Console.Write((b as C) == null ? ((B)b).Y + b.X : 0);", "4", "3", "6", "InvalidCastException", "5", 0],
    [4, "downcasting", 460, 51, "Console.Write(((C)a).Z + ((B)a).Y);", "9", "7", "10", "NullReferenceException", "8", 4],
    [4, "downcasting", 461, 52, "Console.Write(((B)a) == null ? \"null\" : \"B\");", "null", "5", "NullReferenceException", "0", "InvalidCastException", 0],
    [4, "downcasting", 462, 52, "Console.Write(((B)a).N);", "NullReferenceException", "null", "0", "1", "InvalidCastException", 0],
    [4, "downcasting", 463, 52, "Console.Write((a as B) == null ? 0 : 1);", "InvalidCastException", "0", "3", "2", "1", 1],
    [4, "downcasting", 464, 52, "Console.Write((a is B) ? ((B)a).N : ((B)b).N);", "3", "6", "5", "NullReferenceException", "4", 4],
    [4, "downcasting", 465, 52, "Console.Write((b as B).N + ((B)b).N);", "6", "InvalidCastException", "7", "5", "8", 4],
    [4, "downcasting", 466, 53, "Console.Write(((B)a[0]).N);", "5", "4", "2", "3", "NullReferenceException", 3],
    [4, "downcasting", 467, 53, "Console.Write(((B)a[1]).N);", "NullReferenceException", "12", "3", "6", "InvalidCastException", 4],
    [4, "downcasting", 468, 53, "Console.Write(((C)a[2]).N + ((B)a[0]).N);", "11", "NullReferenceException", "8", "9", "10", 3],
    [4, "downcasting", 469, 53, "Console.Write((a[3] as C) == null ? 0 : 1);", "1", "0", "InvalidCastException", "2", "3", 1],
    [4, "downcasting", 470, 53, "Console.Write((a[2] as B) == null ? ((C)a[2]).N - 1 : 0);", "5", "6", "NullReferenceException", "3", "4", 0],
    [4, "downcasting", 471, 54, "Console.Write(Chon.M(a));", "A", "OO", "B", "O", "BO", 0],
    [4, "downcasting", 472, 54, "Console.Write(Chon.M((B)a));", "O", "BA", "B", "A", "InvalidCastException", 2],
    [4, "downcasting", 473, 54, "Console.Write(Chon.M((A)o) + Chon.M((B)o));", "BB", "InvalidCastException", "OB", "AB", "AO", 3],
    [4, "downcasting", 474, 54, "Console.Write(Chon.M(o as B) + Chon.M(o));", "AB", "InvalidCastException", "OB", "OA", "BO", 4],
    [4, "downcasting", 475, 54, "Console.Write(Chon.M(a as B) + Chon.M(a));", "BA", "BO", "OB", "InvalidCastException", "AO", 0],
    [5, "downcasting", 476, 55, "Console.Write(((A)a).N);", "3", "1", "InvalidCastException", "4", "2", 4],
    [5, "downcasting", 477, 55, "Console.Write(((B)a).Doc());", "4", "7", "NullReferenceException", "6", "5", 4],
    [5, "downcasting", 478, 55, "Console.Write(((A)b).N);", "2", "NullReferenceException", "4", "5", "InvalidCastException", 4],
    [5, "downcasting", 479, 55, "Console.Write((a as A).N + a.Doc());", "InvalidCastException", "9", "8", "7", "6", 3],
    [5, "downcasting", 480, 55, "Console.Write((b as A) == null ? b.Doc() : 0);", "7", "9", "10", "8", "InvalidCastException", 1],
    [5, "downcasting", 481, 56, "Console.Write(((IA)o).M());", "A", "NullReferenceException", "B", "BB", "BA", 0],
    [5, "downcasting", 482, 56, "Console.Write(((IB)o).M());", "B", "BA", "NullReferenceException", "A", "BB", 0],
    [5, "downcasting", 483, 56, "Console.Write(((IB)a).M() + a.M());", "BA", "BB", "AA", "AB", "NullReferenceException", 0],
    [5, "downcasting", 484, 56, "Console.Write((o as IB).M() + ((IA)o).M());", "AA", "BA", "BB", "NullReferenceException", "AB", 1],
    [5, "downcasting", 485, 56, "Console.Write(((IA)(C)o).M() + ((IB)(C)o).M());", "BB", "NullReferenceException", "AB", "AA", "BA", 2],
    [4, "downcasting", 486, 57, "Console.Write(string.Format(\"{0} {1} {2}\", a is B, a is C, a.GetType() == typeof(B)));", "True True True", "False False True", "False True False", "True False False", "True True False", 4],
    [4, "downcasting", 487, 57, "Console.Write(string.Format(\"{0} {1} {2}\", b is A, b is C, b.GetType() == typeof(B)));", "False True True", "True False True", "True True False", "True False False", "False True False", 1],
    [4, "downcasting", 488, 57, "Console.Write(string.Format(\"{0} {1} {2}\", a is A, b is B, a.GetType() == typeof(C)));", "False True False", "False False True", "True False True", "True True False", "True True True", 4],
    [4, "downcasting", 489, 57, "Console.Write(string.Format(\"{0} {1} {2}\", (a as B) is C, (b as C) == null, a.GetType() == b.GetType()));", "False False False", "False True True", "False True False", "True True False", "True False True", 3],
    [4, "downcasting", 490, 57, "Console.Write(string.Format(\"{0} {1} {2}\", ((B)a) is C, ((A)b) is C, ((B)a).GetType() == typeof(C)));", "False False False", "True False True", "True False False", "False True False", "False True True", 1],
    [4, "downcasting", 491, 58, "Console.Write(b.So);", "3", "5", "4", "6", "7", 1],
    [4, "downcasting", 492, 58, "Console.Write(((C)a).So);", "9", "NullReferenceException", "8", "10", "7", 2],
    [4, "downcasting", 493, 58, "Console.Write(((B)a).So);", "NullReferenceException", "4", "2", "8", "InvalidCastException", 4],
    [4, "downcasting", 494, 58, "Console.Write((a as B) == null ? b.So + 1 : 0);", "NullReferenceException", "6", "5", "4", "7", 1],
    [4, "downcasting", 495, 58, "Console.Write(b.So + ((C)a).So);", "NullReferenceException", "14", "11", "12", "13", 4],
    [5, "downcasting", 496, 59, "Console.Write(((Bang)a)[1]);", "3", "6", "4", "5", "NullReferenceException", 2],
    [5, "downcasting", 497, 59, "Console.Write(((Bang)b)[1]);", "6", "11", "4", "InvalidCastException", "NullReferenceException", 3],
    [5, "downcasting", 498, 59, "Console.Write((a as Bang)[2] + a.Doc());", "8", "9", "10", "7", "InvalidCastException", 0],
    [5, "downcasting", 499, 59, "Console.Write((b as Bang) == null ? b.Doc() : 0);", "4", "5", "6", "NullReferenceException", "3", 1],
    [5, "downcasting", 500, 59, "Console.Write(a.Doc() + ((Bang)a)[0]);", "NullReferenceException", "2", "5", "4", "3", 3]
  ];

  var BANK_CACHE = null;

  function signatureOf(q) {
    return q.title.trim() + "\u0000" + (q.code ? q.code.trim() : "");
  }

  function registerBankQuestion(bank, seenSig, countByDiff, q, contextLabel) {
    var sig = signatureOf(q);
    if (seenSig.has(sig)) {
      throw new Error("Trùng câu hỏi trong kho (" + contextLabel + "): " + q.title);
    }
    if (!Array.isArray(q.options) || q.options.length < 4 || q.options.length > 5 ||
        new Set(q.options).size !== q.options.length) {
      throw new Error("Đáp án không hợp lệ ở " + contextLabel + ": " + q.title);
    }
    seenSig.add(sig);
    countByDiff[q.difficulty] = (countByDiff[q.difficulty] || 0) + 1;
    var serial = String(countByDiff[q.difficulty]).padStart(3, "0");
    q.bankId = "mcq-" + q.difficulty + "-" + serial;
    q.id = q.bankId;
    q._correctText = q.options[q.answer];
    bank.push(q);
  }

  function buildBank() {
    if (BANK_CACHE) return BANK_CACHE;
    var rng = mulberry32(20261110);
    var bank = [];
    var seenSig = new Set();
    var countByDiff = { easy: 0, theory: 0, output: 0, upcasting: 0, downcasting: 0 };

    // 1. 200 câu Dễ sinh theo mẫu chương 1..5 (40 câu/chương)
    for (var ch = 1; ch <= 5; ch++) {
      for (var idx = 0; idx < 40; idx++) {
        var q = generateChapterEasy(ch, idx, rng);
        q.difficulty = "easy";
        registerBankQuestion(bank, seenSig, countByDiff, q, "easy ch" + ch + " idx" + idx);
      }
    }

    // 2. 140 câu Dễ chọn lọc không trùng lặp từ kho lý thuyết trước
    for (var ti = 0; ti < THEORY_EASY_140.length; ti++) {
      var row = THEORY_EASY_140[ti];
      var qCh = row[0];
      var qNum = row[2];
      var qOpts = [row[4], row[5], row[6], row[7]];
      var qAns = row[8];
      var correctText = qOpts[qAns];
      registerBankQuestion(bank, seenSig, countByDiff, {
        type: "mcq",
        id: "",
        ch: qCh,
        difficulty: "easy",
        title: row[3],
        options: qOpts,
        answer: qAns,
        explain: "Đáp án đúng là: " + JSON.stringify(correctText) + " (Câu " + qNum + " · Mức Dễ · " + SRC[qCh] + ").",
        source: SRC[qCh] + " · Kho Dễ chọn lọc (Câu " + qNum + ")",
        templateId: "kb900-q" + qNum
      }, "kb900-q" + qNum);
    }

    // 3. 500 câu C# Lý thuyết và Đọc mã (5 lựa chọn A..E)
    for (var wi = 0; wi < WORD_500.length; wi++) {
      var w = WORD_500[wi];
      var wCh = w[0];
      var wCat = w[1];
      var wNum = w[2];
      var wSnippetIdx = w[3];
      var wOpts = [w[5], w[6], w[7], w[8], w[9]];
      var wAns = w[10];
      var wCorrectText = wOpts[wAns];
      var item = {
        type: "mcq",
        id: "",
        ch: wCh,
        difficulty: wCat,
        title: w[4],
        options: wOpts,
        answer: wAns,
        explain: "Đáp án đúng là: " + JSON.stringify(wCorrectText) + " (Câu " + wNum + "/500 · " + DIFF_VI[wCat] + " · " + SRC[wCh] + ").",
        source: SRC[wCh] + " · 500 câu C# Lý thuyết & Đọc mã (Câu " + wNum + ")",
        templateId: "w500-q" + wNum
      };
      if (wSnippetIdx >= 0) item.code = SNIPPETS_60[wSnippetIdx];
      registerBankQuestion(bank, seenSig, countByDiff, item, "w500-q" + wNum);
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

  var recentHistory = {
    easy: new Set(),
    theory: new Set(),
    output: new Set(),
    upcasting: new Set(),
    downcasting: new Set()
  };

  function resetHistory() {
    Object.keys(recentHistory).forEach(function (k) { recentHistory[k].clear(); });
  }

  function pickFreshOnly(bucket, count, rng, pickedInCurrentExam, excludedSet, historySet) {
    if (count <= 0) return [];
    var candidates = bucket.filter(function (q) {
      return !pickedInCurrentExam.has(q.bankId) &&
        !excludedSet.has(q.bankId) &&
        !historySet.has(q.bankId);
    });
    var pool = shuffle(rng, candidates);
    var picked = pool.slice(0, count);
    picked.forEach(function (q) {
      pickedInCurrentExam.add(q.bankId);
      excludedSet.add(q.bankId);
      historySet.add(q.bankId);
    });
    return picked;
  }

  function pickFromBucket(bucket, count, rng, pickedInCurrentExam, excludedSet, historySet) {
    if (count <= 0) return [];
    var available = bucket.filter(function (q) {
      return !pickedInCurrentExam.has(q.bankId);
    });

    var candidates = available.filter(function (q) {
      return !excludedSet.has(q.bankId) && !historySet.has(q.bankId);
    });

    if (candidates.length < count) {
      bucket.forEach(function (q) { historySet.delete(q.bankId); });
      candidates = available.filter(function (q) {
        return !excludedSet.has(q.bankId);
      });
    }

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

  /* Sinh đề thi 50 câu cân đối 5 nhóm (16 Dễ + 10 Lý thuyết + 8 Dự đoán + 8 Upcasting + 8 Downcasting), xếp lộn xộn */
  function generateExam(rng, options) {
    if (typeof rng !== "function") rng = Math.random;
    options = options || {};
    var specs = [
      { diff: "easy", total: Number.isInteger(options.easy) ? options.easy : 16 },
      { diff: "theory", total: Number.isInteger(options.theory) ? options.theory : 10 },
      { diff: "output", total: Number.isInteger(options.output) ? options.output : 8 },
      { diff: "upcasting", total: Number.isInteger(options.upcasting) ? options.upcasting : 8 },
      { diff: "downcasting", total: Number.isInteger(options.downcasting) ? options.downcasting : 8 }
    ];

    var bank = buildBank();
    var excluded = new Set(Array.isArray(options.excludeIds) ? options.excludeIds : []);
    var useHistory = options.trackHistory !== false;
    var pickedInCurrentExam = new Set();
    var rawPicked = [];

    for (var s = 0; s < specs.length; s++) {
      var diff = specs[s].diff;
      var total = specs[s].total;
      if (total <= 0) continue;
      var catPool = bank.filter(function (q) { return q.difficulty === diff; });
      var activeChs = shuffle(rng, [1, 2, 3, 4, 5].filter(function (ch) {
        return catPool.some(function (q) { return q.ch === ch; });
      }));
      var hist = useHistory ? recentHistory[diff] : new Set();
      var basePerChap = Math.floor(total / activeChs.length);
      var rem = total % activeChs.length;
      var gotTotal = 0;

      for (var c = 0; c < activeChs.length; c++) {
        var ch = activeChs[c];
        var need = basePerChap + (c < rem ? 1 : 0);
        if (need <= 0) continue;
        var bucket = catPool.filter(function (q) { return q.ch === ch; });
        var got = pickFreshOnly(bucket, need, rng, pickedInCurrentExam, excluded, hist);
        rawPicked = rawPicked.concat(got);
        gotTotal += got.length;
      }
      if (gotTotal < total) {
        var freshRest = pickFreshOnly(catPool, total - gotTotal, rng, pickedInCurrentExam, excluded, hist);
        rawPicked = rawPicked.concat(freshRest);
        gotTotal += freshRest.length;
      }
      if (gotTotal < total) {
        var extra = pickFromBucket(catPool, total - gotTotal, rng, pickedInCurrentExam, excluded, hist);
        rawPicked = rawPicked.concat(extra);
      }
    }

    return finalizeBankDeck(rng, rawPicked);
  }

  /* Sinh đề Ôn tập 40 câu (8 câu/chương) rút cân đối từ kho 840 câu (340 Dễ + 500 câu mới) */
  function generatePractice(rng, options) {
    if (typeof rng !== "function") rng = Math.random;
    options = options || {};
    var bank = buildBank();
    var excluded = new Set(Array.isArray(options.excludeIds) ? options.excludeIds : []);
    var useHistory = options.trackHistory !== false;
    var pickedInCurrent = new Set();
    var rawPicked = [];
    var chapOrder = shuffle(rng, [1, 2, 3, 4, 5]);

    var chapterPlan = {
      1: { easy: 8 },
      2: { easy: 4, theory: 4 },
      3: { easy: 3, theory: 3, output: 2 },
      4: { easy: 2, theory: 2, output: 1, upcasting: 2, downcasting: 1 },
      5: { easy: 2, theory: 2, output: 2, upcasting: 1, downcasting: 1 }
    };

    for (var c = 0; c < chapOrder.length; c++) {
      var ch = chapOrder[c];
      var plan = chapterPlan[ch];
      var cats = shuffle(rng, Object.keys(plan));
      for (var d = 0; d < cats.length; d++) {
        var diff = cats[d];
        var need = plan[diff];
        var hist = useHistory ? recentHistory[diff] : new Set();
        var bucket = bank.filter(function (q) { return q.ch === ch && q.difficulty === diff; });
        var got = pickFromBucket(bucket, need, rng, pickedInCurrent, excluded, hist);
        rawPicked = rawPicked.concat(got);
      }
    }

    return finalizeBankDeck(rng, rawPicked);
  }

  var PER_CHAPTER = 8;

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
    DIFF_VI: DIFF_VI,
    BANK_COUNTS: { easy: 340, theory: 200, output: 120, upcasting: 90, downcasting: 90, total: 840 }
  };
})(typeof window !== "undefined" ? window : globalThis);
