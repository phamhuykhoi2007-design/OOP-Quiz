/* ============================================================
   Ngân hàng câu hỏi ôn tập OOP (C#) — 4 chương
   Chuẩn bị sẵn: D:\OOP-Quiz — chủ động thêm/sửa câu hỏi tại đây.
   Cấu trúc 1 câu hỏi:
   {
     id:      mã duy nhất,
     ch:      số chương (0? không dùng; 1..4),
     title:   câu hỏi hiển thị đangciale cuối,
     lines:   [ [đoạn, {b:0}, đoạn...] ]   // {b:n} = ô điền thứ n
     blanks:  [ {ok:["đáp án chấp nhận"...]} ... ]
     explain: "Giải thích khi trả lời đúng"
   }
   ============================================================ */
(function (global) {
  "use strict";

  var QUESTIONS = [

  /* =================== CHƯƠNG 1 — TỔNG QUAN =================== */
  {
    id: "c1_1", ch: 1,
    title: "Hoàn thiện khai báo lớp Sinhvien.",
    lines: [
      ["", { b: 0 }, " Sinhvien"],
      ["{"],
      ["    public string MaSV;"],
      [""],
      ["    public string HoTen;"],
      [""],
      ["    public void Xuat()"],
      ["    {"],
      ["        Console.WriteLine(HoTen);"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["class"] } ],
    explain: "Cú pháp khai báo lớp: class <TênLớp> { <các thành phần> }. Lớp là thiết kế (blueprint) chung cho các đối tượng cùng kiểu — bước đầu tiên của lập trình hướng đối tượng."
  },
  {
    id: "c1_2", ch: 1,
    title: "Điền từ khóa còn thiếu để tạo một đối tượng từ lớp Sinhvien.",
    lines: [
      ["class Sinhvien"],
      ["{"],
      ["    public string HoTen;"],
      ["    public void Xuat() { Console.WriteLine(HoTen); }"],
      ["}"],
      [""],
      ["static void Main(string[] args)"],
      ["{"],
      ["    Sinhvien sv = ", { b: 0 }, " Sinhvien();"],
      ["    sv.HoTen = \"Nguyen Van An\";"],
      ["    sv.Xuat();"],
      ["}"]
    ],
    blanks: [ { ok: ["new"] } ],
    explain: "Từ khóa new cấp phát vùng nhớ và gọi phương thức khởi tạo: Sinhvien sv = new Sinhvien(); — đối tượng là một thể hiện (instance) cụ thể của lớp."
  },
  {
    id: "c1_3", ch: 1,
    title: "Hoàn thiện code tạo thêm đối tượng thứ hai từ cùng một lớp XeDap.",
    lines: [
      ["class XeDap"],
      ["{"],
      ["    public string SoKhung;"],
      ["}"],
      [""],
      ["static void Main(string[] args)"],
      ["{"],
      ["    XeDap xe1 = new XeDap();   // xe 1"],
      ["    XeDap xe2 = ", { b: 0 }, " XeDap();   // xe 2"],
      ["    xe1.SoKhung = \"0001\";"],
      ["    xe2.SoKhung = \"0002\";"],
      ["}"]
    ],
    blanks: [ { ok: ["new"] } ],
    explain: "Từ MỘT lớp có thể tạo ra NHIỀU đối tượng (nhiều thể hiện), mỗi đối tượng có vùng nhớ và trạng thái riêng — xe1 và xe2 khác nhau về SoKhung."
  },
  {
    id: "c1_4", ch: 1,
    title: "Điền code còn thiếu để gọi phương thức của đối tượng vừa tạo.",
    lines: [
      ["class Amply"],
      ["{"],
      ["    public int SoLuong;"],
      [""],
      ["    public void TangSo() { SoLuong++; }"],
      ["}"],
      [""],
      ["static void Main(string[] args)"],
      ["{"],
      ["    Amply a = new Amply();"],
      ["    a.", { b: 0 }, "();"],
      ["}"]
    ],
    blanks: [ { ok: ["TangSo"] } ],
    explain: "Gọi phương thức (gửi thông điệp cho đối tượng): <đối_tượng>.<phương_thức>(); — ví dụ a.TangSo(). Hành vi (behavior) của đối tượng được biểu diễn bằng các phương thức."
  },
  {
    id: "c1_5", ch: 1,
    title: "Hoàn thiện phương thức khởi tạo của lớp NganHang (tên trùng với tên lớp).",
    lines: [
      ["class NganHang"],
      ["{"],
      ["    public double SoDu;"],
      [""],
      ["    public ", { b: 0 }, " ()"],
      ["    {"],
      ["        SoDu = 0;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["NganHang"] } ],
    explain: "Phương thức khởi tạo (constructor) có tên TRÙNG với tên lớp, không có kiểu trả về, được tự động gọi khi tạo đối tượng bằng new — dùng để khởi tạo giá trị ban đầu cho các thuộc tính."
  },
  {
    id: "c1_6", ch: 1,
    title: "Điền kiểu dữ liệu còn thiếu cho các thuộc tính của đối tượng ConCho.",
    lines: [
      ["class ConCho"],
      ["{"],
      ["    public ", { b: 0 }, " Ten = \"Lu\";"],
      ["    public ", { b: 1 }, " Tuoi = 2;"],
      ["    public ", { b: 2 }, " CanNang = 8.5;"],
      ["}"]
    ],
    blanks: [
      { ok: ["string"] },
      { ok: ["int"] },
      { ok: ["double"] }
    ],
    explain: "Trạng thái (state) của đối tượng được biểu diễn bằng các thuộc tính, mỗi thuộc tính có một KIỂU DỮ LIỆU: Ten là chuỗi (string), Tuoi là số nguyên (int), CanNang là số thực (double)."
  },
  {
    id: "c1_7", ch: 1,
    title: "Điền tên thuộc tính còn thiếu (khai báo trong lớp và gán giá trị cho đối tượng c).",
    lines: [
      ["class ConCho"],
      ["{"],
      ["    public string ", { b: 0 }, ";"],
      ["    public void Bark() { Console.WriteLine(Ten + \": gau gau!\"); }"],
      ["}"],
      [""],
      ["static void Main(string[] args)"],
      ["{"],
      ["    ConCho c = new ConCho();"],
      ["    c.", { b: 1 }, " = \"Lu\";"],
      ["    c.Bark();"],
      ["}"]
    ],
    blanks: [
      { ok: ["Ten"] },
      { ok: ["Ten"] }
    ],
    explain: "Truy cập thành viên của đối tượng bằng dấu chấm: <đối_tượng>.<thuộc_tính>. Cùng một cái tên (Ten) vừa khai báo thuộc tính trong lớp, vừa dùng để gán giá trị cho đối tượng."
  },
  {
    id: "c1_8", ch: 1,
    title: "Điền chỉ thị truy cập còn thiếu: SoDu của TaiKhoan KHÔNG được xem/sửa trực tiếp từ bên ngoài.",
    lines: [
      ["class TaiKhoan"],
      ["{"],
      ["    ", { b: 0 }, " double SoDu;   // bên ngoài KHÔNG truy cập được"],
      [""],
      ["    public bool Rut(double soTien)"],
      ["    {"],
      ["        if (soTien <= SoDu)"],
      ["        {"],
      ["            SoDu = SoDu - soTien;"],
      ["            return true;"],
      ["        }"],
      ["        return false;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["private"] } ],
    explain: "Đóng gói (encapsulation): che dấu dữ liệu bằng private, bên ngoài chỉ thao tác qua phương thức công khai (Rut). Thành viên không khai báo chỉ thị truy cập thì mặc định là private."
  },
  {
    id: "c1_9", ch: 1,
    title: "Điền tên lớp cơ sở còn thiếu cho lớp Meo.",
    lines: [
      ["class DongVat"],
      ["{"],
      ["    public void Sinh() { Console.WriteLine(\"Dang sinh...\"); }"],
      ["}"],
      [""],
      ["class Meo : ", { b: 0 }],
      ["{"],
      ["    public void Keu() { Console.WriteLine(\"Meo meo\"); }"],
      ["}"]
    ],
    blanks: [ { ok: ["DongVat"] } ],
    explain: "Tính thừa kế (inheritance): class <lớp_con> : <lớp_cha>. Lớp dẫn xuất (Meo) thừa hưởng các thành phần của lớp cơ sở (DongVat) và dùng như của chính mình."
  },
  {
    id: "c1_10", ch: 1,
    title: "Điền từ khóa còn thiếu để khai báo tập hành vi chưa cài đặt IKyNang.",
    lines: [
      ["", { b: 0 }, " IKyNang"],
      ["{"],
      ["    void Hoc();"],
      ["}"],
      [""],
      ["class Nguoi : IKyNang"],
      ["{"],
      ["    public void Hoc() { Console.WriteLine(\"Dang hoc OOP...\"); }"],
      ["}"]
    ],
    blanks: [ { ok: ["interface"] } ],
    explain: "Interface chỉ chứa KHAI BÁO phương thức (chưa cài đặt); lớp thực thi interface bằng dấu \":\" thì phải cài đặt đầy đủ các phương thức đã khai báo."
  },
  {
    id: "c1_11", ch: 1,
    title: "Điền tên lớp còn thiếu: tham chiếu lớp cha trỏ đến đối tượng lớp con (đa hình đối tượng).",
    lines: [
      ["class DongVat"],
      ["{"],
      ["    public void Sinh() { Console.WriteLine(\"Dang sinh...\"); }"],
      ["}"],
      [""],
      ["class Meo : DongVat"],
      ["{"],
      ["    public void Keu() { Console.WriteLine(\"Meo meo\"); }"],
      ["}"],
      [""],
      ["static void Main(string[] args)"],
      ["{"],
      ["    DongVat dv = new ", { b: 0 }, "();"],
      ["    dv.Sinh();"],
      ["}"]
    ],
    blanks: [ { ok: ["Meo"] } ],
    explain: "Đa hình đối tượng: tham chiếu của lớp cha (DongVat dv) có thể trỏ đến đối tượng của lớp dẫn xuất (new Meo()). Cùng một thông điệp nhưng mỗi kiểu đối tượng thực thi theo cách riêng."
  },
  {
    id: "c1_12", ch: 1,
    title: "Hoàn thiện code: đối tượng tk1 chuyển tiền cho đối tượng tk2.",
    lines: [
      ["class TaiKhoan"],
      ["{"],
      ["    public double SoDu;"],
      [""],
      ["    public void ChuyenTien(TaiKhoan tkNhan, double soTien)"],
      ["    {"],
      ["        SoDu = SoDu - soTien;"],
      ["        tkNhan.SoDu = tkNhan.SoDu + soTien;"],
      ["    }"],
      ["}"],
      [""],
      ["static void Main(string[] args)"],
      ["{"],
      ["    TaiKhoan tk1 = new TaiKhoan();"],
      ["    TaiKhoan tk2 = new TaiKhoan();"],
      ["    tk1.ChuyenTien(", { b: 0 }, ", 100);"],
      ["}"]
    ],
    blanks: [ { ok: ["tk2"] } ],
    explain: "Các đối tượng tương tác với nhau: phương thức của một đối tượng nhận THAM SỐ là đối tượng khác và thao tác trên dữ liệu của nó — tk1 gửi thông điệp ChuyenTien, kết quả cộng vào SoDu của tk2."
  },

  /* =================== CHƯƠNG 2 — LỚP VÀ ĐỐI TƯỢNG =================== */
  {
    id: "c2_1", ch: 2,
    title: "Hoàn thiện khai báo lớp HinhChuNhat.",
    lines: [
      ["", { b: 0 }, " HinhChuNhat"],
      ["{"],
      ["    public float Dai;"],
      [""],
      ["    public float Rong;"],
      [""],
      ["    public float Chuvi()"],
      ["    {"],
      ["        return (Dai + Rong) * 2;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["class"] } ],
    explain: "Cú pháp khai báo lớp: class <TênLớp> { <các thành phần của lớp>; }. Lớp bắt đầu bằng từ khóa class theo sau là tên lớp."
  },
  {
    id: "c2_2", ch: 2,
    title: "Điền từ khóa còn thiếu để khai báo phương thức Main().",
    lines: [
      ["class Program"],
      ["{"],
      ["    ", { b: 0 }, " void Main(string[] args)"],
      ["    {"],
      ["        HinhChuNhat h = new HinhChuNhat();"],
      ["        h.Nhap();"],
      ["        h.Xuat();"],
      ["        Console.ReadLine();"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["static"] } ],
    explain: "Main() là điểm bắt đầu chương trình điều hành, được gọi trước khi có bất kỳ đối tượng nào nên phải là phương thức tĩnh: static void Main(...)."
  },
  {
    id: "c2_3", ch: 2,
    title: "Hoàn thiện chương trình tạo đối tượng và gọi phương thức của đối tượng.",
    lines: [
      ["static void Main(string[] args)"],
      ["{"],
      ["    HinhChuNhat h = ", { b: 0 }, " HinhChuNhat();"],
      [""],
      ["    h.", { b: 1 }, "();"],
      [""],
      ["    Console.WriteLine(\"Chu vi HCN: {0}\", h.Chuvi());"],
      ["    Console.ReadLine();"]
    ],
    blanks: [
      { ok: ["new"] },
      { ok: ["Nhap"] }
    ],
    explain: "Tạo đối tượng bằng từ khóa new: HinhChuNhat h = new HinhChuNhat(); Gọi phương thức: <đối_tượng>.<phương_thức>() — ví dụ h.Nhap();"
  },
  {
    id: "c2_4", ch: 2,
    title: "Điền phương thức còn thiếu để chuyển chuỗi nhập vào thành số thực.",
    lines: [
      ["public void Nhap()"],
      ["{"],
      ["    Console.WriteLine(\"Nhap chieu dai hinh chu nhat :\");"],
      ["    Dai = float.", { b: 0 }, " (Console.ReadLine());"],
      [""],
      ["    Console.WriteLine(\"Nhap chieu rong hinh chu nhat :\");"],
      ["    Rong = float.Parse(Console.ReadLine());"],
      ["}"]
    ],
    blanks: [ { ok: ["Parse"] } ],
    explain: "Console.ReadLine() trả về chuỗi; float.Parse(...) chuyển chuỗi thành số thực (float). Tương tự có double.Parse, int.Parse."
  },
  {
    id: "c2_5", ch: 2,
    title: "Hoàn thiện phương thức khởi tạo không tham số cho lớp Hocsinh (tên trùng với tên lớp).",
    lines: [
      ["class Hocsinh"],
      ["{"],
      ["    public double Weight;"],
      ["    public double Height;"],
      [""],
      ["    public ", { b: 0 }, " ()"],
      ["    {"],
      ["        Weight = 40;"],
      ["        Height = 150;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["Hocsinh"] } ],
    explain: "Phương thức khởi tạo (constructor) có tên trùng với tên lớp, không có kiểu trả về, được tự động gọi khi khởi tạo đối tượng. Thường dùng để khởi tạo giá trị mặc định."
  },
  {
    id: "c2_6", ch: 2,
    title: "Hoàn thiện phương thức khởi tạo có tham số của lớp Hocsinh.",
    lines: [
      ["public Hocsinh(int w, int h)"],
      ["{"],
      ["    ", { b: 0 }, " = w;"],
      [""],
      ["    Height = h;"]
    ],
    blanks: [ { ok: ["Weight"] } ],
    explain: "Constructor có đối số: khi khởi tạo đối tượng phải truyền đủ tham số — Hocsinh hs2 = new Hocsinh(48, 160); — gán giá trị cho thuộc tính bên trong lớp."
  },
  {
    id: "c2_7", ch: 2,
    title: "Điền ký tự còn thiếu để khai báo phương thức hủy (destructor).",
    lines: [
      ["class Hocsinh"],
      ["{"],
      ["    public Hocsinh()"],
      ["    {"],
      ["        Weight = 40;"],
      ["    }"],
      [""],
      ["    ", { b: 0 }, " Hocsinh()"],
      ["    {"],
      ["        Console.WriteLine(\"Doi tuong Hocsinh da bi huy.\");"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["~"] } ],
    explain: "Phương thức hủy có tên trùng tên lớp và thêm dấu \"~\" phía trước; không có kiểu trả về; được gọi tự động qua bộ thu dọn rác GC. Mỗi lớp chỉ có duy nhất 1 destructor."
  },
  {
    id: "c2_8", ch: 2,
    title: "Điền từ khóa còn thiếu để khởi tạo đối tượng (ví dụ lớp Time).",
    lines: [
      ["System.DateTime currentTime = System.DateTime.Now;"],
      [""],
      ["Time t = ", { b: 0 }, " Time(currentTime);"],
      ["t.DisplayCurrentTime();"]
    ],
    blanks: [ { ok: ["new"] } ],
    explain: "new cấp phát vùng nhớ và gọi constructor: Time t = new Time(currentTime); — hàm tạo nhận tham số kiểu DateTime để gán cho các thành phần dữ liệu."
  },
  {
    id: "c2_9", ch: 2,
    title: "Điền chỉ thị truy cập còn thiếu để thuộc tính Weight KHÔNG thể truy cập từ phương thức Main().",
    lines: [
      ["class Hocsinh"],
      ["{"],
      ["    ", { b: 0 }, " double Weight;"],
      [""],
      ["    public double Height;"],
      ["}"]
    ],
    blanks: [ { ok: ["private"] } ],
    explain: "private: chỉ các phương thức bên trong lớp mới truy cập được. Nếu thành phần không khai báo chỉ thị truy cập thì mặc định là private."
  },
  {
    id: "c2_10", ch: 2,
    title: "Hoàn thiện khởi tạo đối tượng Hocsinh khi lớp có constructor CÓ tham số.",
    lines: [
      ["class Hocsinh"],
      ["{"],
      ["    public int Weight;"],
      ["    public int Height;"],
      [""],
      ["    public Hocsinh(int w, int h)"],
      ["    {"],
      ["        Weight = w;"],
      ["        Height = h;"],
      ["    }"],
      ["}"],
      [""],
      ["static void Main(string[] args)"],
      ["{"],
      ["    Hocsinh hs2 = ", { b: 0 }, " Hocsinh(48, 160);"],
      ["}"]
    ],
    blanks: [ { ok: ["new"] } ],
    explain: "Khi lớp có constructor có tham số, khởi tạo đối tượng phải truyền ĐỦ tham số theo đúng thứ tự: Hocsinh hs2 = new Hocsinh(48, 160); — từ khóa new gọi constructor và cấp phát vùng nhớ."
  },
  {
    id: "c2_11", ch: 2,
    title: "Điền chỉ thị truy cập còn thiếu theo mô tả ở ghi chú bên cạnh.",
    lines: [
      ["class HinhChuNhat"],
      ["{"],
      ["    ", { b: 0 }, " double Dai;   // truy cập được trong"],
      ["                                 // cùng 1 assembly "]
    ],
    blanks: [ { ok: ["internal"] } ],
    explain: "internal cho phép truy cập từ mọi lớp trong cùng một assembly — tương tự public nhưng giới hạn phạm vi trong khối kết hợp."
  },
  {
    id: "c2_12", ch: 2,
    title: "Điền chỉ thị truy cập còn thiếu để lớp hcn kế thừa truy cập được trường _dai.",
    lines: [
      ["class Shape"],
      ["{"],
      ["    ", { b: 0 }, " int _dai;"],
      ["}"],
      [""],
      ["class hcn : Shape"],
      ["{"],
      ["    public int TinhDientich()"],
      ["    {"],
      ["        return (_dai * _rong);   // truy cập được"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["protected"] } ],
    explain: "protected giống private nhưng cho phép lớp con (lớp dẫn xuất) truy cập đến thành viên của lớp cha."
  },

  /* =================== CHƯƠNG 3 — ĐÓNG GÓI =================== */
  {
    id: "c3_1", ch: 3,
    title: "Điền chỉ thị truy cập còn thiếu để thuộc tính truy cập được từ phương thức Main().",
    lines: [
      ["class HinhChuNhat"],
      ["{"],
      ["    ", { b: 0 }, " double Dai;"],
      [""],
      ["    ", { b: 0 }, " double Rong;"],
      [""],
      ["    public double Tinhdientich()"],
      ["    {"],
      ["        return Dai * Rong;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["public"] } ],
    explain: "public: không hạn chế — thành viên có thể truy cập ở bất kỳ nơi nào, kể cả từ phương thức Main() của lớp khác."
  },
  {
    id: "c3_2", ch: 3,
    title: "Hoàn thiện phương thức truy vấn cho thuộc tính MASV.",
    lines: [
      ["class Sinhvien"],
      ["{"],
      ["    private string MASV;"],
      [""],
      ["    public string getMASV()"],
      ["    {"],
      ["        ", { b: 0 }, " MASV;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["return"] } ],
    explain: "Phương thức truy vấn (get) giúp xem dữ liệu của một thuộc tính: chỉ cần trả về giá trị của thuộc tính, kiểu trả về trùng kiểu thuộc tính, không có tham số."
  },
  {
    id: "c3_3", ch: 3,
    title: "Điền tên phương thức còn thiếu theo quy ước đặt tên phương thức cập nhật.",
    lines: [
      ["class Sinhvien"],
      ["{"],
      ["    private double DiemCSLT;"],
      [""],
      ["    public void ", { b: 0 }, "DiemCSLT(double diemcslt)"],
      ["    {"],
      ["        DiemCSLT = diemcslt;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["set"] } ],
    explain: "Phương thức cập nhật bắt đầu bằng set + tên thuộc tính (setDiemCSLT); kiểu trả về void, có 1 tham số trùng kiểu dữ liệu của thuộc tính."
  },
  {
    id: "c3_4", ch: 3,
    title: "Hoàn thiện property diemcslt của lớp Sinhvien.",
    lines: [
      ["public double diemcslt"],
      ["{"],
      ["    ", { b: 0 }, " { return DiemCSLT; }"],
      [""],
      ["    ", { b: 1 }, " { DiemCSLT = ", { b: 2 }, "; }"]
    ],
    blanks: [
      { ok: ["get"] },
      { ok: ["set"] },
      { ok: ["value"] }
    ],
    explain: "Property gồm get (tương đương phương thức truy vấn) và set (tương đương phương thức cập nhật); từ khóa value đại diện cho giá trị người dùng gán vào property."
  },
  {
    id: "c3_5", ch: 3,
    title: "Điền từ khóa còn thiếu để khai báo biến dùng chung cho mọi đối tượng (đếm số học sinh).",
    lines: [
      ["class Hocsinh"],
      ["{"],
      ["    private string ten;"],
      [""],
      ["    public ", { b: 0 }, " int Count = 0;"],
      [""],
      ["    public Hocsinh()"],
      ["    {"],
      ["        ten = Console.ReadLine();"],
      ["        Count++;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["static"] } ],
    explain: "Thành viên tĩnh (static) là thành viên của lớp (không phải của đối tượng): khởi tạo 1 lần, dùng chung cho mọi đối tượng, gọi thông qua tên lớp."
  },
  {
    id: "c3_6", ch: 3,
    title: "Hoàn thiện cách gọi phương thức tĩnh LuyThua trong Main().",
    lines: [
      ["class Program"],
      ["{"],
      ["    static void Main(string[] args)"],
      ["    {"],
      ["        Console.WriteLine(", { b: 0 }, ".", { b: 1 }, "(3, 3));"],
      ["    }"],
      ["}"]
    ],
    blanks: [
      { ok: ["Tinhtoan"] },
      { ok: ["LuyThua"] }
    ],
    explain: "Hàm tĩnh được gọi thông qua tên lớp (Tinhtoan.LuyThua(3,3)) mà không cần khởi tạo đối tượng nào — tránh lãng phí bộ nhớ."
  },
  {
    id: "c3_7", ch: 3,
    title: "Điền từ khóa còn thiếu để khai báo lớp tĩnh (chỉ chứa thành phần tĩnh, không thể tạo đối tượng).",
    lines: [
      ["", { b: 0 }, " class Tinhtoan"],
      ["{"],
      ["    public static long LuyThua(int CoSo, int SoMu)"],
      ["    {"],
      ["        long KetQua = 1;"],
      ["        for (int i = 0; i < SoMu; i++)"],
      ["        {"],
      ["            KetQua *= CoSo;"],
      ["        }"],
      ["        return KetQua;"],
      ["    }"]
    ],
    blanks: [ { ok: ["static"] } ],
    explain: "Lớp tĩnh (static class) chỉ chứa thành phần tĩnh và không thể new đối tượng — thường dùng cho các lớp tiện ích như lớp Math (PI, Pow, Sqrt...)."
  },
  {
    id: "c3_8", ch: 3,
    title: "Điền từ khóa còn thiếu để truyền tham chiếu cho tham số của phương thức.",
    lines: [
      ["static void Hoan_vi(", { b: 0 }, " int a, ", { b: 1 }, " int b)"],
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
    explain: "Truyền tham trị không thay đổi được x, y bên ngoài. Dùng từ khóa ref (hoặc out) để truyền tham chiếu: Hoan_vi(ref int a, ref int b)."
  },
  {
    id: "c3_9", ch: 3,
    title: "Hoàn thiện cách gọi phương thức Hoan_vi để x, y bị thay đổi sau khi gọi.",
    lines: [
      ["int x = 3;"],
      ["int y = 4;"],
      [""],
      ["Hoan_vi(", { b: 0 }, " x, ", { b: 1 }, " y);"]
    ],
    blanks: [
      { ok: ["ref"] },
      { ok: ["ref"] }
    ],
    explain: "Khi tham số khai báo với ref thì đối số khi gọi cũng phải kèm từ khóa ref: Hoan_vi(ref x, ref y); — mọi thay đổi trong phương thức ảnh hưởng đến x, y."
  },
  {
    id: "c3_10", ch: 3,
    title: "Điền tham chiếu còn thiếu để tránh xung đột tên giữa tham số và biến dữ liệu của đối tượng.",
    lines: [
      ["public People(string name, int old, double height)"],
      ["{"],
      ["    ", { b: 0 }, " .name = name;"],
      [""],
      ["    ", { b: 1 }, " .old = old;"],
      [""],
      ["    ", { b: 2 }, " .height = height;"]
    ],
    blanks: [
      { ok: ["this"] },
      { ok: ["this"] },
      { ok: ["this"] }
    ],
    explain: "this trỏ đến đối tượng đang thực thi phương thức; dùng this.name = name (nếu gán name = this.name không quan trọng) khi tham số trùng tên biến dữ liệu."
  },
  {
    id: "c3_11", ch: 3,
    title: "Hoàn thiện khai báo chỉ mục (indexer) cho lớp IndexedNames.",
    lines: [
      ["class IndexedNames"],
      ["{"],
      ["    private string[] namelist = new string[10];"],
      [""],
      ["    public string ", { b: 0 }, "[int index]"],
      ["    {"],
      ["        get { ... }   // thân hàm đọc"],
      ["        set { ... }   // thân hàm ghi"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["this"] } ],
    explain: "Cú pháp chỉ mục: public KiểuTrảVề this[DanhSáchThamSố] { get {...} set {...} } — cho phép đối tượng dùng toán tử [] như mảng: names[0] = \"Nguyen Van An\";"
  },
  {
    id: "c3_12", ch: 3,
    title: "Hoàn thiện thuộc tính dạng auto property.",
    lines: [
      ["class HinhChuNhat"],
      ["{"],
      ["    public double Dai { ", { b: 0 }, "; ", { b: 1 }, "; }"],
      [""],
      ["    public double Rong { get; set; }"],
      ["}"]
    ],
    blanks: [
      { ok: ["get"] },
      { ok: ["set"] }
    ],
    explain: "Auto property: public double Dai { get; set; } — cách viết rút gọn của property khi không cần xử lý thêm trong get/set."
  },

  /* =================== CHƯƠNG 4 — KẾ THỪA =================== */
  {
    id: "c4_1", ch: 4,
    title: "Điền từ khóa còn thiếu để định nghĩa phiên bản mới của phương thức Xuat() và gọi phương thức Xuat() của lớp cơ sở.",
    lines: [
      ["class XeCar : XeHoi"],
      ["{"],
      ["    int SoHanhKhach;"],
      [""],
      ["    ", { b: 0 }, " ", { b: 1 }, " void Xuat()"],
      ["    {"],
      ["        ", { b: 2 }, " .Xuat();"],
      [""],
      ["        Console.WriteLine(\", {0} cho ngoi\", SoHanhKhach);"],
      ["    }"],
      ["}"]
    ],
    blanks: [
      { ok: ["public"] },
      { ok: ["new"] },
      { ok: ["base"] }
    ],
    explain: "Từ khóa new che dấu (khai báo phiên bản mới) phương thức Xuat() kế thừa từ lớp XeHoi; từ khóa base gọi đến thành phần của lớp cơ sở: base.Xuat();"
  },
  {
    id: "c4_2", ch: 4,
    title: "Hoàn thiện chương trình.",
    lines: [
      ["", { b: 0 }, " IPayment"],
      ["{"],
      ["    void Pay();"],
      [""],
      ["}"],
      [""],
      ["class CreditCard : ", { b: 1 }],
      ["{"],
      ["    public void ", { b: 2 }, "()"],
      ["    {"],
      ["        Console.WriteLine(\"Payment successful\");"],
      ["    }"],
      ["}"]
    ],
    blanks: [
      { ok: ["interface"] },
      { ok: ["IPayment"] },
      { ok: ["Pay"] }
    ],
    explain: "interface khai báo tập hành vi chưa cài đặt (void Pay();). Lớp thực thi interface bằng dấu \":\" (class CreditCard : IPayment) và phải cài đặt phương thức Pay(). Trong C#, C# không hỗ trợ đa kế thừa nhưng hỗ trợ thực thi nhiều interface."
  },
  {
    id: "c4_3", ch: 4,
    title: "Điền tên lớp còn thiếu để khai báo lớp dẫn xuất kế thừa lớp cơ sở.",
    lines: [
      ["class Point2D"],
      ["{"],
      ["    public int x, y;"],
      ["    public void Xuat2D() { ... }"],
      ["}"],
      [""],
      ["class Point3D : ", { b: 0 }],
      ["{"],
      ["    public int z;"],
      ["    public void Xuat3D() { ... }"]
    ],
    blanks: [ { ok: ["Point2D"] } ],
    explain: "Cú pháp: class <Tênlớpcon> : <Tênlớpcơsở> { }. Lớp dẫn xuất kế thừa các thành phần public/protected của lớp cơ sở, không cần khai báo lại x, y."
  },
  {
    id: "c4_4", ch: 4,
    title: "Điền từ khóa còn thiếu để gọi phương thức khởi tạo của lớp cơ sở.",
    lines: [
      ["class Point3D : Point2D"],
      ["{"],
      ["    public int z;"],
      [""],
      ["    public Point3D(int a, int b, int c) : ", { b: 0 }, "(a, b)"],
      ["    {"],
      ["        z = c;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["base"] } ],
    explain: "Khi lớp cơ sở có constructor có tham số, lớp dẫn xuất phải gọi qua từ khóa base: Point3D(...) : base(a, b). 2 tham số đầu gán cho x, y kế thừa, tham số còn lại cho z."
  },
  {
    id: "c4_5", ch: 4,
    title: "Điền tên lớp còn thiếu: phương thức hủy của lớp nào được gọi TRƯỚC khi kết thúc?",
    lines: [
      ["class Cha"],
      ["{"],
      ["    ~Cha() { Console.WriteLine(\"Cha da bi huy\"); }"],
      ["}"],
      [""],
      ["class Con : Cha"],
      ["{"],
      ["    ~Con() { Console.WriteLine(\"Con da bi huy\"); }"],
      ["}"],
      [""],
      ["static void Main(string[] args)"],
      ["{"],
      ["    Con c = new Con();"],
      ["}"],
      [""],
      ["// Khi kết thúc, phương thức hủy của lớp ", { b: 0 }, " được gọi trước."]
    ],
    blanks: [ { ok: ["Con"] } ],
    explain: "Thứ tự hủy NGƯỢC với thứ tự khởi tạo: constructor Cha chạy trước rồi đến Con; khi kết thúc chương trình, destructor của lớp dẫn xuất (Con) được gọi trước, sau đó mới đến lớp cơ sở (Cha)."
  },
  {
    id: "c4_6", ch: 4,
    title: "Điền tên phương thức còn thiếu: Point3D gọi phương thức kế thừa từ lớp Point2D.",
    lines: [
      ["class Point2D"],
      ["{"],
      ["    public int x, y;"],
      ["    public void Xuat2D() { Console.WriteLine(x + \", \" + y); }"],
      ["}"],
      [""],
      ["class Point3D : Point2D"],
      ["{"],
      ["    public int z;"],
      ["    public void Xuat3D() { Console.WriteLine(x + \", \" + y + \", \" + z); }"],
      ["}"],
      [""],
      ["static void Main(string[] args)"],
      ["{"],
      ["    Point3D p = new Point3D();"],
      ["    p.", { b: 0 }, "();   // phương thức kế thừa từ lớp Point2D"],
      ["}"]
    ],
    blanks: [ { ok: ["Xuat2D"] } ],
    explain: "Lớp dẫn xuất kế thừa các phương thức public/protected của lớp cơ sở và gọi như phương thức của chính mình: p.Xuat2D() hoạt động dù Xuat2D được khai báo trong Point2D."
  },
  {
    id: "c4_7", ch: 4,
    title: "Điền từ khóa còn thiếu để che dấu thuộc tính DienTich kế thừa từ lớp cơ sở.",
    lines: [
      ["class HinhTron"],
      ["{"],
      ["    public double DienTich;"],
      ["}"],
      [""],
      ["class HinhCau : HinhTron"],
      ["{"],
      ["    public ", { b: 0 }, " double DienTich;"],
      ["}"]
    ],
    blanks: [ { ok: ["new"] } ],
    explain: "Khai báo thành phần trùng tên lớp cơ sở → trình biên dịch cảnh báo \"keyword new is required\". Đặt từ khóa new để che dấu thành viên lớp cơ sở (ví dụ bài 1: hình cầu che dấu đi các thuộc tính diện tích)."
  },
  {
    id: "c4_8", ch: 4,
    title: "Điền code còn thiếu: tham chiếu lớp cơ sở trỏ đến đối tượng của lớp dẫn xuất.",
    lines: [
      ["static void Main(string[] args)"],
      ["{"],
      ["    XeCar c = new XeCar(150, \"49A-4444\", \"Toyota\", 24);"],
      [""],
      ["    XeHoi h = ", { b: 0 }, ";"],
      [""],
      ["    h.Xuat();   // gọi phương thức Xuat() của lớp XeHoi"],
      ["}"]
    ],
    blanks: [ { ok: ["c"] } ],
    explain: "Tham chiếu thuộc lớp cơ sở (XeHoi h) có thể trỏ đến đối tượng lớp dẫn xuất (c) nhưng chỉ được truy cập các thành phần khai báo trong lớp cơ sở — nền tảng của đa hình đối tượng."
  },
  {
    id: "c4_9", ch: 4,
    title: "Hoàn thiện khai báo 2 interface và lớp Chim thực thi cả hai.",
    lines: [
      ["", { b: 0 }, " IKeu"],
      ["{"],
      ["    void Keu();"],
      ["}"],
      [""],
      ["", { b: 1 }, " IBay"],
      ["{"],
      ["    void Bay();"],
      ["}"],
      [""],
      ["class Chim : IKeu, IBay"],
      ["{"],
      ["    public void Keu() { Console.WriteLine(\"Lac lac\"); }"],
      ["    public void Bay() { Console.WriteLine(\"Dang bay...\"); }"],
      ["}"]
    ],
    blanks: [
      { ok: ["interface"] },
      { ok: ["interface"] }
    ],
    explain: "C# KHÔNG hỗ trợ đa kế thừa (1 lớp : nhiều lớp) nhưng cho phép 1 lớp thực thi NHIỀU interface cùng lúc: class Chim : IKeu, IBay — mỗi interface khai báo bằng từ khóa interface."
  },
  {
    id: "c4_10", ch: 4,
    title: "Điền chỉ thị truy cập còn thiếu: vì sao câu lệnh x = x - 1 bị báo lỗi khi kế thừa?",
    lines: [
      ["class ClassA"],
      ["{"],
      ["    ", { b: 0 }, " int x = 5;"],
      ["}"],
      [""],
      ["class ClassB : ClassA"],
      ["{"],
      ["    public void GiamX()"],
      ["    {"],
      ["        x = x - 1;   // BỊ BÁO LỖI!"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["private"] } ],
    explain: "Thành viên private của lớp cơ sở KHÔNG được kế thừa → ClassB không dùng được x. Muốn kế thừa phải khai báo protected int x = 5 hoặc public int x = 5."
  },
  {
    id: "c4_11", ch: 4,
    title: "Hoàn thiện chương trình khai báo một interface và thực thi nó.",
    lines: [
      ["", { b: 0 }, " ICalculator"],
      ["{"],
      ["    double Sum(double a, double b);"],
      ["}"],
      [""],
      ["class Calculator : ICalculator"],
      ["{"],
      ["    public double Sum(double a, double b)"],
      ["    {"],
      ["        return a + b;"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["interface"] } ],
    explain: "Khai báo interface bằng từ khóa interface (chỉ có khai báo, không có thân phương thức); lớp thực thi bằng dấu \":\" và cài đặt toàn bộ phương thức."
  },
  {
    id: "c4_12", ch: 4,
    title: "Hoàn thiện khai báo LuyThua phiên bản thứ hai (đa hình phương thức — trùng tên, khác danh sách tham số).",
    lines: [
      ["static class Tinhtoan"],
      ["{"],
      ["    public static int LuyThua(int Coso, int Somu)"],
      ["    {"],
      ["        int kq = 1;"],
      ["        for (int i = 0; i < Somu; i++) kq = kq * Coso;"],
      ["        return kq;"],
      ["    }"],
      [""],
      ["    public static int ", { b: 0 }, "(int Coso)"],
      ["    {"],
      ["        return LuyThua(Coso, 2);"],
      ["    }"],
      ["}"]
    ],
    blanks: [ { ok: ["LuyThua"] } ],
    explain: "Đa hình phương thức (overload): nhiều phương thức TRÙNG TÊN, phân biệt bởi danh sách tham số (số lượng/kiểu khác nhau). Gọi LuyThua(3) → phiên bản 1 tham số; LuyThua(3, 4) → phiên bản 2 tham số."
  }

  ];

  // Suy ra độ rộng gợi ý của mỗi ô điền (xấp xỉ theo đáp án dài nhất)
  QUESTIONS.forEach(function (q) {
    q.blanks.forEach(function (b) {
      if (!b.w) {
        b.w = Math.max.apply(null, b.ok.map(function (s) { return s.length; }));
      }
    });
  });

  global.QUESTIONS = QUESTIONS;
})(typeof window !== "undefined" ? window : globalThis);
