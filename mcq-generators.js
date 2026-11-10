/* ============================================================
   Sinh câu hỏi trắc nghiệm (MCQ) cho đề thi OOP C#.
   - Kho 600 câu phân hóa: 200 Dễ (easy) + 200 Trung bình (medium) + 200 Khó (hard),
     chia đều 5 chương (40 câu/mức độ/chương = 120 câu/chương).
   - Chế độ Ôn tập (mặc định ExamMCQ.generate(rng)):
     đúng 40 câu, 8 câu/chương, 40 template khác nhau.
   - Chế độ Làm bài thi (ExamMCQ.generateExam(rng, options)):
     đúng 50 câu (10 Dễ + 15 Trung bình + 25 Khó) trộn lộn xộn,
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
     KHO 600 CÂU HỎI PHÂN HÓA (200 DỄ + 200 TRUNG BÌNH + 200 KHÓ)
     Mỗi chương có đúng 40 câu Dễ, 40 câu Trung bình, 40 câu Khó.
     Tất cả 600 câu được kiểm tra không trùng lặp (unique signature).
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

  var BANK_CACHE = null;

  function signatureOf(q) {
    return q.title.trim() + "\u0000" + (q.code ? q.code.trim() : "");
  }

  function buildBank() {
    if (BANK_CACHE) return BANK_CACHE;
    var rng = mulberry32(20261110);
    var bank = [];
    var seenSig = new Set();
    var generators = {
      easy: generateChapterEasy,
      medium: generateChapterMedium,
      hard: generateChapterHard
    };
    var levels = ["easy", "medium", "hard"];

    for (var li = 0; li < levels.length; li++) {
      var diff = levels[li];
      var countForDiff = 0;
      for (var ch = 1; ch <= 5; ch++) {
        for (var idx = 0; idx < 40; idx++) {
          var q = generators[diff](ch, idx, rng);
          var sig = signatureOf(q);
          if (seenSig.has(sig)) {
            throw new Error("Phát hiện câu hỏi trùng lặp trong kho tại " + diff + " ch" + ch + " idx" + idx);
          }
          seenSig.add(sig);
          countForDiff++;
          var serial = String(countForDiff).padStart(3, "0");
          q.bankId = "mcq-" + diff + "-" + serial;
          q.id = q.bankId;
          q.difficulty = diff;
          // Lưu đáp án gốc để có thể xáo trộn lại phương án khi bốc đề
          q._correctText = q.options[q.answer];
          bank.push(q);
        }
      }
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

    // 3. Ưu tiên cấp 3: Nếu kho qua nhiều lượt thi đã hết sạch câu mới so với excludedSet,
    // làm mới excludedSet đối với nhóm này để tái sử dụng câu hỏi cũ nhất,
    // đảm bảo TUYỆT ĐỐI không bao giờ trùng với các câu đã chọn trong đề thi hiện tại!
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

    // Xếp lộn xộn toàn bộ 50 câu (10 dễ + 15 trung bình + 25 khó)
    var mixed = shuffle(rng, rawPicked);
    var seenKeys = new Set();
    var deck = [];
    for (var k = 0; k < mixed.length; k++) {
      var q = cloneAndShuffleQuestion(mixed[k], rng, k + 1);
      var key = signatureOf(q);
      if (seenKeys.has(key)) {
        throw new Error("Trùng lặp câu hỏi trong đề thi: " + q.title);
      }
      seenKeys.add(key);
      deck.push(q);
    }
    return deck;
  }

  var PER_CHAPTER = 8;

  /* Chế độ Ôn tập mặc định: giữ nguyên hợp đồng 40 câu (8 câu/chương) từ 56 template,
     nhưng nếu truyền options.mode === 'exam' thì gọi generateExam (50 câu phân hóa). */
  function generate(rng, options) {
    if (options && options.mode === "exam") {
      return generateExam(rng, options);
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
    generateExam: generateExam,
    getBank: getBank,
    resetHistory: resetHistory,
    BANK_COUNTS: { easy: 200, medium: 200, hard: 200, total: 600 }
  };
})(typeof window !== "undefined" ? window : globalThis);
