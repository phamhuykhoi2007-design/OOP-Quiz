/* ============================================================
   Sinh đề ngẫu nhiên — bộ template điền khuyết CODE
   Mỗi template: { id, chs: [các chương thích hợp], make(rng) }
   make() trả về 1 câu hỏi hợp lệ (schema như questions.js).
   Câu hỏi sinh ra ĐẾN ĐÂY trước khi nộp lại, id do app.js ghi đè.
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- tiện ích chung ---------- */
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function tok(n) { return { b: n }; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function low(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  // Tính độ rộng gợi ý cho từng ô điền (theo đáp án dài nhất)
  function finalize(q) {
    q.blanks.forEach(function (b) {
      if (!b.w) b.w = Math.max.apply(null, b.ok.map(function (s) { return s.length; }));
    });
    return q;
  }

  /* ---------- kho dữ liệu chung ---------- */
  // fields: [tên, kiểu, giá-trị-khởi-tạo-ghi-ra-code]
  var CLASSES = [
    { name: "HinhChuNhat", obj: "hcn", fields: [["Dai", "double", "12.5"], ["Rong", "double", "5.5"]], m: "Dientich" },
    { name: "Hocsinh", obj: "hs", fields: [["Ten", "string", '"Lu"'], ["Tuoi", "int", "16"]], m: "Hienthi" },
    { name: "Sinhvien", obj: "sv", fields: [["MASV", "string", '"SV01"'], ["DiemTB", "double", "7.5"]], m: "Hienthi" },
    { name: "Sach", obj: "b1", fields: [["TuaSach", "string", '"Toan roi rac"'], ["SoTrang", "int", "120"]], m: "Hienthi" },
    { name: "Meo", obj: "meo", fields: [["Ten", "string", '"Kitty"'], ["CanNang", "double", "4.5"]], m: "Keu" },
    { name: "TaiKhoan", obj: "tk", fields: [["SoDu", "double", "500.5"], ["SoTK", "string", '"0123"']], m: "Rut" },
    { name: "Nguoi", obj: "nv", fields: [["HoTen", "string", '"Tran An"'], ["Tuoi", "int", "20"]], m: "Hienthi" },
    { name: "XeDap", obj: "xd", fields: [["SoKhung", "string", '"0007"'], ["SoVanh", "int", "26"]], m: "Dung" }
  ];

  // [tên interface, phương thức duy nhất, lớp cài đặt]
  var IFACES = [
    ["IKyNang", "Hoc", "Nguoi"],
    ["IPayment", "Pay", "CreditCard"],
    ["IStore", "Luu", "CuaHang"],
    ["IGiaiTri", "Chay", "GameApp"]
  ];

  // [lớp cha, lớp con]
  var PAIRS = [
    ["DongVat", "Meo"],
    ["Cha", "Con"],
    ["Point2D", "Point3D"],
    ["Nguoi", "Sinhvien"],
    ["Xe", "XeDap"],
    ["Shape", "HinhVuong"]
  ];

  // lớp tĩnh tiện ích: [tên lớp, tên hàm, kiểu trả về]
  var HLP = [
    ["Tinhtoan", "LuyThua", "long"],
    ["Thongke", "Trungbinh", "double"]
  ];

  /* ============================================================ */
  var TEMPLATES = [

  /* ---------- khai báo lớp ---------- */
  {
    id: "tclass",
    chs: [1, 2],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      return finalize({
        id: "g" + this.id + "-0",
        ch: pick(rng, this.chs),
        title: "Hoàn thiện khai báo lớp " + C.name + ".",
        lines: [
          ["", { b: 0 }, " " + C.name],
          ["{"],
          ["    public " + C.fields[0][1] + " " + C.fields[0][0] + ";"],
          [""],
          ["    public " + C.fields[1][1] + " " + C.fields[1][0] + ";"],
          [""],
          ["    public void " + C.m + "()"],
          ["    {"],
          ["        // code cua phuong thuc"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["class"] } ],
        explain: "Cú pháp khai báo lớp: class <TênLớp> { <các thành phần của lớp>; } — từ khóa class mở đầu cho mọi lớp trong C#."
      });
    }
  },

  /* ---------- tạo đối tượng (new, không tham số) ---------- */
  {
    id: "tnew-call",
    chs: [1, 2],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      return finalize({
        id: "g" + this.id + "-0",
        ch: pick(rng, this.chs),
        title: "Điền từ khóa còn thiếu để tạo đối tượng từ lớp " + C.name + ".",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    public " + C.fields[0][1] + " " + C.fields[0][0] + ";"],
          ["}"],
          [""],
          ["static void Main(string[] args)"],
          ["{"],
          ["    " + C.name + " " + C.obj + " = ", { b: 0 }, " " + C.name + "();"],
          ["    " + C.obj + "." + C.fields[0][0] + " = " + C.fields[0][2] + ";"],
          ["}"]
        ],
        blanks: [ { ok: ["new"] } ],
        explain: "Từ khóa new cấp phát vùng nhớ và gọi phương thức khởi tạo: " + C.name + " " + C.obj + " = new " + C.name + "(); — đối tượng là thể hiện cụ thể của lớp."
      });
    }
  },

  /* ---------- kiểu dữ liệu thuộc tính ---------- */
  {
    id: "tfieldType",
    chs: [1, 2],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      var i = Math.floor(rng() * 2);
      var f = C.fields[i], g = C.fields[1 - i];
      return finalize({
        id: "g" + this.id + "-0",
        ch: pick(rng, this.chs),
        title: "Điền kiểu dữ liệu còn thiếu cho thuộc tính " + f[0] + " của lớp " + C.name + ".",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    public ", { b: 0 }, " " + f[0] + " = " + f[2] + ";"],
          ["    public " + g[1] + " " + g[0] + ";"],
          ["}"]
        ],
        blanks: [ { ok: [f[1]] } ],
        explain: "Nhìn giá trị khởi tạo suy ra kiểu: " + f[2] + (f[1] === "string" ? " là chuỗi nằm trong dấu nháy kép → string." : (f[1] === "double" ? " là số có dấu chấm thập phân → double." : " là số nguyên dùng để đếm → int."))
      });
    }
  },

  /* ---------- constructor không tham số ---------- */
  {
    id: "tctorNA",
    chs: [2],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện phương thức khởi tạo KHÔNG tham số của lớp " + C.name + " (gán giá trị mặc định).",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    public " + C.fields[0][1] + " " + C.fields[0][0] + ";"],
          [""],
          ["    public " + C.fields[1][1] + " " + C.fields[1][0] + ";"],
          [""],
          ["    public ", { b: 0 }, " ()"],
          ["    {"],
          ["        " + C.fields[0][0] + " = " + C.fields[0][2] + ";"],
          ["        " + C.fields[1][0] + " = " + C.fields[1][2] + ";"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: [C.name] } ],
        explain: "Phương thức khởi tạo có tên TRÙNG với tên lớp (" + C.name + "), không có kiểu trả về, được tự động gọi khi tạo đối tượng — dùng để gán giá trị mặc định cho thuộc tính."
      });
    }
  },

  /* ---------- constructor có tham số ---------- */
  {
    id: "tctorArgs",
    chs: [2],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện phương thức khởi tạo CÓ tham số của lớp " + C.name + ".",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    public " + C.fields[0][1] + " " + C.fields[0][0] + ";"],
          [""],
          ["    public " + C.fields[1][1] + " " + C.fields[1][0] + ";"],
          [""],
          ["    public ", { b: 0 }, "(" + C.fields[0][1] + " w, " + C.fields[1][1] + " h)"],
          ["    {"],
          ["        " + C.fields[0][0] + " = w;"],
          ["        " + C.fields[1][0] + " = h;"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: [C.name] } ],
        explain: "Constructor có đối số: tên trùng tên lớp (" + C.name + "), tham số truyền vào được gán cho các thuộc tính bên trong. Khởi tạo đối tượng phải truyền đủ: new " + C.name + "(...);"
      });
    }
  },

  /* ---------- new + gọi constructor có tham số ---------- */
  {
    id: "tctorNew",
    chs: [2],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện khởi tạo đối tượng " + C.name + " bằng constructor có tham số.",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    public " + C.name + "(" + C.fields[0][1] + " a, " + C.fields[1][1] + " b)"],
          ["    {"],
          ["        " + C.fields[0][0] + " = a;"],
          ["        " + C.fields[1][0] + " = b;"],
          ["    }"],
          ["}"],
          [""],
          ["static void Main(string[] args)"],
          ["{"],
          ["    " + C.name + " " + C.obj + " = ", { b: 0 }, " " + C.name + "(" + C.fields[0][2] + ", " + C.fields[1][2] + ");"],
          ["}"]
        ],
        blanks: [ { ok: ["new"] } ],
        explain: "Khi lớp có constructor có tham số, khởi tạo phải truyền ĐỦ tham số theo đúng thứ tự: new " + C.name + "(" + C.fields[0][2] + ", " + C.fields[1][2] + ");"
      });
    }
  },

  /* ---------- phương thức hủy ---------- */
  {
    id: "tdestroy",
    chs: [2, 4],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      return finalize({
        id: "g" + this.id + "-0",
        ch: pick(rng, this.chs),
        title: "Điền ký tự còn thiếu để khai báo phương thức hủy của lớp " + C.name + ".",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    public " + C.name + "() { ... }"],
          [""],
          ["    ", { b: 0 }, " " + C.name + "()"],
          ["    {"],
          ["        Console.WriteLine(\"Doi tuong da bi huy.\");"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["~"] } ],
        explain: "Phương thức hủy có tên trùng tên lớp và thêm dấu \"~\" ở phía trước; không có kiểu trả về; mỗi lớp chỉ có DUY NHẤT 1 destructor, GC tự gọi khi thu dọn đối tượng."
      });
    }
  },

  /* ---------- chỉ thị truy cập (4 biến thể) ---------- */
  {
    id: "taccess",
    chs: [2, 3, 4],
    make: function (rng) {
      var k = Math.floor(rng() * 4);
      var P = pick(rng, PAIRS);
      var C = pick(rng, CLASSES);

      if (k === 0) {
        var fn = C.fields[0][0], ft = C.fields[0][1];
        return finalize({
          id: "g" + this.id + "-0",
          ch: pick(rng, this.chs),
          title: "Điền chỉ thị truy cập còn thiếu: thuộc tính " + fn + " KHÔNG được truy cập từ bên ngoài lớp.",
          lines: [
            ["class " + C.name],
            ["{"],
            ["    ", { b: 0 }, " " + ft + " " + fn + ";"],
            [""],
            ["    public void " + C.m + "() { /* dung duoc binh thuong */ }"],
            ["}"],
            [""],
            ["static void Main(string[] args)"],
            ["{"],
            ["    " + C.name + " " + C.obj + " = new " + C.name + "();"],
            ["    " + C.obj + "." + fn + " = " + C.fields[0][2] + ";   // BAO LOI!"],
            ["}"]
          ],
          blanks: [ { ok: ["private"] } ],
          explain: "private: chỉ các phương thức BÊN TRONG lớp truy cập được; dòng " + C.obj + "." + fn + " từ Main() báo lỗi. Thành viên không khai báo chỉ thị truy cập thì mặc định là private."
        });
      }

      if (k === 1) {
        var fn2 = C.fields[1][0], ft2 = C.fields[1][1];
        return finalize({
          id: "g" + this.id + "-1",
          ch: pick(rng, this.chs),
          title: "Điền chỉ thị truy cập còn thiếu: thuộc tính " + fn2 + " truy cập được từ Main() của LỚP KHÁC.",
          lines: [
            ["class " + C.name],
            ["{"],
            ["    ", { b: 0 }, " " + ft2 + " " + fn2 + ";"],
            ["}"],
            [""],
            ["static void Main(string[] args)"],
            ["{"],
            ["    " + C.name + " " + C.obj + " = new " + C.name + "();"],
            ["    " + C.obj + "." + fn2 + " = " + C.fields[1][2] + ";   // hoat dong tot"],
            ["}"]
          ],
          blanks: [ { ok: ["public"] } ],
          explain: "public: không hạn chế — thành viên truy cập được ở bất kỳ đâu, kể cả từ Main() của lớp khác."
        });
      }

      if (k === 2) {
        var fn3 = C.fields[0][0], ft3 = C.fields[0][1];
        return finalize({
          id: "g" + this.id + "-2",
          ch: pick(rng, this.chs),
          title: "Điền chỉ thị truy cập còn thiếu: " + fn3 + " truy cập được bởi mọi lớp trong CÙNG 1 assembly.",
          lines: [
            ["class " + C.name],
            ["{"],
            ["    ", { b: 0 }, " " + ft3 + " " + fn3 + ";   // cung 1 assembly"],
            ["}"]
          ],
          blanks: [ { ok: ["internal"] } ],
          explain: "internal cho phép truy cập từ mọi lớp TRONG CÙNG MỘT assembly — tương tự public nhưng giới hạn phạm vi trong khối kết hợp."
        });
      }

      // k === 3 — protected: lớp dẫn xuất dùng được
      var fn4 = "x";
      return finalize({
        id: "g" + this.id + "-3",
        ch: pick(rng, this.chs),
        title: "Điền chỉ thị truy cập còn thiếu: " + fn4 + " dùng được trong lớp dẫn xuất '" + P[1] + "'.",
        lines: [
          ["class " + P[0]],
          ["{"],
          ["    ", { b: 0 }, " int " + fn4 + " = 5;"],
          ["}"],
          [""],
          ["class " + P[1] + " : " + P[0]],
          ["{"],
          ["    public void Giam()"],
          ["    {"],
          ["        " + fn4 + " = " + fn4 + " - 1;   // khong bao loi"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["protected"] } ],
        explain: "protected giống private nhưng cho phép lớp DẪN XUẤT truy cập thành viên của lớp cha. Nếu là private thì lớp con cũng không nhìn thấy."
      });
    }
  },

  /* ---------- phương thức Main tĩnh ---------- */
  {
    id: "tmain",
    chs: [2, 3],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      return finalize({
        id: "g" + this.id + "-0",
        ch: pick(rng, this.chs),
        title: "Điền từ khóa còn thiếu cho phương thức Main() — điểm bắt đầu chương trình.",
        lines: [
          ["class Program"],
          ["{"],
          ["    ", { b: 0 }, " void Main(string[] args)"],
          ["    {"],
          ["        " + C.name + " " + C.obj + " = new " + C.name + "();"],
          ["        " + C.obj + "." + C.m + "();"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["static"] } ],
        explain: "Main() được gọi TRƯỚC khi có bất kỳ đối tượng nào nên phải là phương thức tĩnh: static void Main(string[] args)."
      });
    }
  },

  /* ---------- phương thức getter ---------- */
  {
    id: "tgetter",
    chs: [3],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      var f = C.fields[0];
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện phương thức truy vấn (get) cho thuộc tính " + f[0] + ".",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    private " + f[1] + " " + f[0] + ";"],
          [""],
          ["    public " + f[1] + " get" + cap(f[0]) + "()"],
          ["    {"],
          ["        ", { b: 0 }, " " + f[0] + ";"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["return"] } ],
        explain: "Phương thức truy vấn chỉ cần trả về giá trị thuộc tính: return " + f[0] + "; — kiểu trả về trùng kiểu thuộc tính, không có tham số."
      });
    }
  },

  /* ---------- phương thức setter ---------- */
  {
    id: "tsetter",
    chs: [3],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      var f = C.fields[0], pn = low(f[0]);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Điền tiền tố còn thiếu của phương thức cập nhật cho thuộc tính " + f[0] + ".",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    private " + f[1] + " " + f[0] + ";"],
          [""],
          ["    public void ", { b: 0 }, cap(f[0]), "(" + f[1] + " " + pn + ")"],
          ["    {"],
          ["        " + f[0] + " = " + pn + ";"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["set"] } ],
        explain: "Quy ước phương thức cập nhật: set + tên thuộc tính (set" + cap(f[0]) + "); kiểu trả về void, có 1 tham số trùng kiểu thuộc tính."
      });
    }
  },

  /* ---------- property đầy đủ ---------- */
  {
    id: "tprop",
    chs: [3],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      var f = C.fields[0], pn = cap(f[0]);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện property " + pn + " của lớp " + C.name + ".",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    private " + f[1] + " " + f[0] + ";"],
          [""],
          ["    public " + f[1] + " " + pn],
          ["    {"],
          ["        ", { b: 0 }, " { return " + f[0] + "; }"],
          [""],
          ["        ", { b: 1 }, " { " + f[0] + " = ", { b: 2 }, "; }"],
          ["    }"],
          ["}"]
        ],
        blanks: [
          { ok: ["get"] },
          { ok: ["set"] },
          { ok: ["value"] }
        ],
        explain: "Property gồm get (tương đương phương thức truy vấn) và set (tương đương phương thức cập nhật); trong set, từ khóa value đại diện cho giá trị đang được gán vào property."
      });
    }
  },

  /* ---------- auto property ---------- */
  {
    id: "tautoprop",
    chs: [3],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      var f = C.fields[0];
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện thuộc tính dạng auto property của lớp " + C.name + ".",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    public " + f[1] + " " + f[0] + " { ", { b: 0 }, "; ", { b: 1 }, "; }"],
          ["    public " + C.fields[1][1] + " " + C.fields[1][0] + " { get; set; }"],
          ["}"]
        ],
        blanks: [
          { ok: ["get"] },
          { ok: ["set"] }
        ],
        explain: "Auto property: public <Kiểu> <Tên> { get; set; } — cách viết rút gọn của property khi không cần xử lý thêm trong get/set."
      });
    }
  },

  /* ---------- biến tĩnh (static field) ---------- */
  {
    id: "tstaticvar",
    chs: [2, 3],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      return finalize({
        id: "g" + this.id + "-0",
        ch: pick(rng, this.chs),
        title: "Điền từ khóa còn thiếu: " + C.obj + "Count đếm số đối tượng đã tạo, dùng chung cho MỌI đối tượng.",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    private string " + C.fields[0][0] + ";"],
          [""],
          ["    public ", { b: 0 }, " int " + C.obj + "Count = 0;"],
          [""],
          ["    public " + C.name + "()"],
          ["    {"],
          ["        " + C.obj + "Count++;   // tang 1 moi lan tao doi tuong"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["static"] } ],
        explain: "Thành viên tĩnh (static) thuộc về LỚP chứ không thuộc từng đối tượng: khởi tạo 1 lần, mọi đối tượng dùng chung, có thể truy cập qua tên lớp."
      });
    }
  },

  /* ---------- gọi thành phần tĩnh qua tên lớp ---------- */
  {
    id: "tstaticcall",
    chs: [3],
    make: function (rng) {
      var h = pick(rng, HLP);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện lời gọi phương thức tĩnh trong Main() (dùng tên lớp, KHÔNG cần tạo đối tượng).",
        lines: [
          ["static class " + h[0]],
          ["{"],
          ["    public static " + h[2] + " " + h[1] + "(int x, int y) { ... }"],
          ["}"],
          [""],
          ["static void Main(string[] args)"],
          ["{"],
          ["    Console.WriteLine(", { b: 0 }, ".", { b: 1 }, "(3, 4));"],
          ["}"]
        ],
        blanks: [
          { ok: [h[0]] },
          { ok: [h[1]] }
        ],
        explain: "Hàm tĩnh được gọi thông qua TÊN LỚP: " + h[0] + "." + h[1] + "(3, 4) — không cần (và không thể) khởi tạo đối tượng nào."
      });
    }
  },

  /* ---------- lớp tĩnh ---------- */
  {
    id: "tstaticclass",
    chs: [3],
    make: function (rng) {
      var h = pick(rng, HLP);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Điền từ khóa còn thiếu để khai báo lớp tĩnh (chỉ chứa thành phần tĩnh).",
        lines: [
          ["", { b: 0 }, " class " + h[0]],
          ["{"],
          ["    public static " + h[2] + " " + h[1] + "(int x, int y) { ... }"],
          ["}"]
        ],
        blanks: [ { ok: ["static"] } ],
        explain: "Lớp tĩnh (static class) chỉ chứa thành phần tĩnh và KHÔNG thể new đối tượng — thường dùng cho các lớp tiện ích như Math (PI, Pow, Sqrt...)."
      });
    }
  },

  /* ---------- truyền tham chiếu ref (khai báo / lời gọi) ---------- */
  {
    id: "tref",
    chs: [3],
    make: function (rng) {
      var mn = pick(rng, ["Hoan_vi", "Doi_cho", "Swap"]);
      var k = Math.floor(rng() * 2);

      if (k === 0) {
        return finalize({
          id: "g" + this.id + "-0",
          ch: this.chs[0],
          title: "Điền từ khóa còn thiếu để phương thức THAY ĐỔI được giá trị của biến truyền vào.",
          lines: [
            ["static void " + mn + "(", { b: 0 }, " int a, ", { b: 1 }, " int b)"],
            ["{"],
            ["    int temp = a;"],
            ["    a = b;"],
            ["    b = temp;"],
            ["}"]
          ],
          blanks: [
            { ok: ["ref"] },
            { ok: ["ref"] }
          ],
          explain: "Truyền THAM TRỊ thì chỉ bản sao được thay đổi, x, y bên ngoài giữ nguyên. Dùng từ khóa ref (hoặc out) để truyền THAM CHIẾU: " + mn + "(ref int a, ref int b)."
        });
      }
      return finalize({
        id: "g" + this.id + "-1",
        ch: this.chs[0],
        title: "Điền từ khóa còn thiếu: sau lời gọi, x và y được hoán đổi THỰC SỰ.",
        lines: [
          ["int x = 3;"],
          ["int y = 4;"],
          [""],
          [mn, "(", { b: 0 }, " x, ", { b: 1 }, " y);"]
        ],
        blanks: [
          { ok: ["ref"] },
          { ok: ["ref"] }
        ],
        explain: "Khi tham số khai báo với ref thì ĐỐI SỐ khi gọi cũng phải kèm từ khóa ref: " + mn + "(ref x, ref y); — mọi thay đổi trong phương thức tác động thẳng vào x, y."
      });
    }
  },

  /* ---------- từ khóa this ---------- */
  {
    id: "tthis",
    chs: [3],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      var f = C.fields[0], pn = low(f[0]);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Điền tham chiếu còn thiếu để phân biệt tham số với thuộc tính '" + f[0] + "'.",
        lines: [
          ["class " + C.name],
          ["{"],
          ["    public " + f[1] + " " + f[0] + ";"],
          [""],
          ["    public " + C.name + "(" + f[1] + " " + pn + ")"],
          ["    {"],
          ["        ", { b: 0 }, "." + f[0] + " = " + pn + ";"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["this"] } ],
        explain: "this trỏ đến đối tượng ĐANG thực thi phương thức; dùng this." + f[0] + " = " + pn + " để phân biệt thuộc tính của đối tượng với tham số trùng tên."
      });
    }
  },

  /* ---------- chỉ mục (indexer) ---------- */
  {
    id: "tindexer",
    chs: [3],
    make: function (rng) {
      var cls = pick(rng, ["IndexedNames", "DanhSachTen"]);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện khai báo chỉ mục (indexer) cho lớp " + cls + ".",
        lines: [
          ["class " + cls],
          ["{"],
          ["    private string[] namelist = new string[10];"],
          [""],
          ["    public string ", { b: 0 }, "[int index]"],
          ["    {"],
          ["        get { return namelist[index]; }"],
          ["        set { namelist[index] = value; }"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["this"] } ],
        explain: "Cú pháp chỉ mục: public KiểuTrảVề this[DanhSáchThamSố] { get {...} set {...} } — đối tượng dùng toán tử [] như mảng: names[0] = \"An\";"
      });
    }
  },

  /* ---------- Parse chuỗi thành số ---------- */
  {
    id: "tparse",
    chs: [2],
    make: function (rng) {
      var C = pick(rng, CLASSES);
      var f = (C.fields[0][1] !== "string") ? C.fields[0] : C.fields[1];
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện phương thức Nhap(): chuyển chuỗi nhập vào thành số cho thuộc tính " + f[0] + ".",
        lines: [
          ["public void Nhap()"],
          ["{"],
          ["    Console.WriteLine(\"Nhap " + f[0] + " :\");"],
          ["    " + f[0] + " = " + f[1] + ".", { b: 0 }, "(Console.ReadLine());"],
          ["}"]
        ],
        blanks: [ { ok: ["Parse"] } ],
        explain: "Console.ReadLine() trả về CHUỖI; dùng " + f[1] + ".Parse(...) để chuyển thành số. Tương tự có int.Parse, double.Parse, float.Parse."
      });
    }
  },

  /* ---------- tên lớp cơ sở trong kế thừa ---------- */
  {
    id: "tinherit",
    chs: [1, 4],
    make: function (rng) {
      var P = pick(rng, PAIRS);
      var bm = pick(rng, ["Xuat", "Hienthi"]);
      var dm = pick(rng, ["QuanLy", "XuLy"]);
      return finalize({
        id: "g" + this.id + "-0",
        ch: pick(rng, this.chs),
        title: "Điền tên lớp cơ sở còn thiếu cho lớp '" + P[1] + "'.",
        lines: [
          ["class " + P[0]],
          ["{"],
          ["    public void " + bm + "() { ... }"],
          ["}"],
          [""],
          ["class " + P[1] + " : ", { b: 0 }],
          ["{"],
          ["    public void " + dm + "() { ... }"],
          ["}"]
        ],
        blanks: [ { ok: [P[0]] } ],
        explain: "Cú pháp kế thừa: class <LớpCon> : <LớpCha>. '" + P[1] + "' thừa hưởng các thành phần public/protected của '" + P[0] + "' và dùng như của chính mình."
      });
    }
  },

  /* ---------- gọi constructor lớp cơ sở (base) ---------- */
  {
    id: "tbasector",
    chs: [2, 4],
    make: function (rng) {
      var P = pick(rng, PAIRS);
      return finalize({
        id: "g" + this.id + "-0",
        ch: pick(rng, this.chs),
        title: "Điền từ khóa còn thiếu để gọi phương thức khởi tạo của lớp cơ sở.",
        lines: [
          ["class " + P[0]],
          ["{"],
          ["    public " + P[0] + "(int a, int b) { ... }"],
          ["}"],
          [""],
          ["class " + P[1] + " : " + P[0]],
          ["{"],
          ["    public " + P[1] + "(int a, int b, int c) : ", { b: 0 }, "(a, b)"],
          ["    {"],
          ["        // c: thuoc tinh rieng cua lop " + P[1]],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["base"] } ],
        explain: "Khi lớp cơ sở có constructor CÓ THAM SỐ, lớp dẫn xuất phải gọi qua từ khóa base: " + P[1] + "(...) : base(a, b) — 2 tham số đầu cho thành phần kế thừa, tham số còn lại cho thuộc tính riêng."
      });
    }
  },

  /* ---------- từ khóa new che dấu phương thức ---------- */
  {
    id: "tnewhide",
    chs: [4],
    make: function (rng) {
      var P = pick(rng, PAIRS);
      var bm = pick(rng, ["Xuat", "Hienthi"]);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Điền từ khóa còn thiếu để che dấu (khai báo phiên bản MỚI) phương thức kế thừa.",
        lines: [
          ["class " + P[0]],
          ["{"],
          ["    public void " + bm + "() { ... }"],
          ["}"],
          [""],
          ["class " + P[1] + " : " + P[0]],
          ["{"],
          ["    public ", { b: 0 }, " void " + bm + "() { ... }"],
          ["}"]
        ],
        blanks: [ { ok: ["new"] } ],
        explain: "Khai báo lại thành phần trùng tên với lớp cơ sở → trình biên dịch sẽ cảnh báo \"keyword new is required\". Đặt từ khóa new để che dấu thành viên kế thừa một cách chủ đích."
      });
    }
  },

  /* ---------- gọi base trong phương thức bị che dấu ---------- */
  {
    id: "tbasecall",
    chs: [4],
    make: function (rng) {
      var P = pick(rng, PAIRS);
      var bm = pick(rng, ["Xuat", "Hienthi"]);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Điền code còn thiếu để gọi phiên bản của lớp cơ sở bên trong phương thức được che dấu.",
        lines: [
          ["class " + P[1] + " : " + P[0]],
          ["{"],
          ["    public new void " + bm + "()"],
          ["    {"],
          ["        ", { b: 0 }, "." + bm + "();"],
          ["        Console.WriteLine(\"Phan rieng cua lop con\");"],
          ["    }"],
          ["}"]
        ],
        blanks: [ { ok: ["base"] } ],
        explain: "Từ khóa base gọi thành phần của LỚP CƠ SỞ: base." + bm + "(); — giữ nguyên phiên bản cũ rồi bổ sung phần riêng cho lớp con."
      });
    }
  },

  /* ---------- interface đơn ---------- */
  {
    id: "tiface",
    chs: [4],
    make: function (rng) {
      var I = pick(rng, IFACES);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Điền từ khóa còn thiếu để khai báo tập hành vi chưa cài đặt '" + I[0] + "'.",
        lines: [
          ["", { b: 0 }, " " + I[0]],
          ["{"],
          ["    void " + I[1] + "();"],
          ["}"],
          [""],
          ["class " + I[2] + " : " + I[0]],
          ["{"],
          ["    public void " + I[1] + "() { ... }"],
          ["}"]
        ],
        blanks: [ { ok: ["interface"] } ],
        explain: "Interface chỉ chứa KHAI BÁO phương thức (không có thân hàm). Lớp thực thi bằng dấu \":\" (" + I[2] + " : " + I[0] + ") và phải cài đặt đầy đủ các phương thức đã khai báo."
      });
    }
  },

  /* ---------- tham chiếu lớp cha trỏ đối tượng lớp con ---------- */
  {
    id: "tbasesref",
    chs: [4],
    make: function (rng) {
      var P = pick(rng, PAIRS);
      var on = pick(rng, ["d", "c", "x"]);
      var bn = pick(rng, ["p", "b", "v"]);
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Điền biến còn thiếu: tham chiếu lớp '" + P[0] + "' TRỎ đến đối tượng của lớp dẫn xuất.",
        lines: [
          ["static void Main(string[] args)"],
          ["{"],
          ["    " + P[1] + " " + on + " = new " + P[1] + "();"],
          [""],
          ["    " + P[0] + " " + bn + " = ", { b: 0 }, ";"],
          ["    " + bn + ".Xuat();   // phương thức của lớp cơ sở"],
          ["}"]
        ],
        blanks: [ { ok: [on] } ],
        explain: "Tham chiếu kiểu LỚP CHA (" + bn + ") có thể trỏ đến đối tượng lớp CON (" + on + "), nhưng chỉ truy cập được các thành phần khai báo trong lớp cơ sở — nền tảng của đa hình đối tượng."
      });
    }
  },

  /* ---------- nhiều interface ---------- */
  {
    id: "tifaces2",
    chs: [4],
    make: function (rng) {
      var i1 = Math.floor(rng() * IFACES.length);
      var i2 = (i1 + 1 + Math.floor(rng() * (IFACES.length - 1))) % IFACES.length;
      var A = IFACES[i1], B = IFACES[i2];
      return finalize({
        id: "g" + this.id + "-0",
        ch: this.chs[0],
        title: "Hoàn thiện khai báo 2 interface và lớp '" + A[2] + "' thực thi cả hai.",
        lines: [
          ["", { b: 0 }, " " + A[0]],
          ["{"],
          ["    void " + A[1] + "();"],
          ["}"],
          [""],
          ["", { b: 1 }, " " + B[0]],
          ["{"],
          ["    void " + B[1] + "();"],
          ["}"],
          [""],
          ["class " + A[2] + " : " + A[0] + ", " + B[0]],
          ["{"],
          ["    public void " + A[1] + "() { ... }"],
          ["    public void " + B[1] + "() { ... }"],
          ["}"]
        ],
        blanks: [
          { ok: ["interface"] },
          { ok: ["interface"] }
        ],
        explain: "C# KHÔNG cho phép 1 lớp kế thừa nhiều lớp cùng lúc, nhưng cho phép thực thi NHIỀU interface: class " + A[2] + " : " + A[0] + ", " + B[0] + " — mỗi interface khai báo bằng từ khóa interface."
      });
    }
  }

  ];

  global.TEMPLATES = TEMPLATES;
})(typeof window !== "undefined" ? window : globalThis);
