/* Sinh biến thể và kho 300 câu tự luận trong ĐÚNG ba form ảnh: đóng gói, kế thừa, đa hình.
   ⟦...⟧ đánh dấu vị trí có thể khuyết; không xóa hàng loạt từ khóa.
   Không đọc file, gọi mạng hay AI khi người học tạo đề. */
(function (global) {
  'use strict';

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, a) { return a[Math.floor(rng() * a.length)]; }
  function shuffle(rng, a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var HELP = {
    class: 'Khai báo lớp.', private: 'Trường chỉ truy cập trực tiếp bên trong lớp khai báo.',
    protected: 'Cho phép lớp dẫn xuất truy cập trường của lớp cơ sở.', public: 'Thành viên được truy cập công khai.',
    static: 'Thành viên thuộc lớp; các hàm static của Program dùng chung mảng và biến đếm.',
    abstract: 'Thành viên trừu tượng không có thân hàm; lớp cụ thể phải cài đặt.',
    virtual: 'Cho phép lớp dẫn xuất ghi đè phương thức.', override: 'Ghi đè phương thức của lớp cơ sở.',
    base: 'Gọi constructor hoặc phương thức của lớp cơ sở.', this: 'Tham chiếu đến đối tượng hiện tại.',
    get: 'Đọc giá trị thuộc tính.', set: 'Ghi giá trị thuộc tính.', value: 'Giá trị đang được gán cho thuộc tính.',
    new: 'Tạo đối tượng hoặc mảng mới.', return: 'Kết thúc hàm; trả giá trị nếu hàm có kiểu trả về.',
    if: 'Kiểm tra điều kiện trước khi thực hiện nhánh.', else: 'Thực hiện nhánh khi điều kiện không thỏa.',
    is: 'Kiểm tra kiểu thực tế trước khi ép kiểu.', for: 'Duyệt các phần tử trong mảng.',
    do: 'Bắt đầu vòng lặp chạy ít nhất một lần.', while: 'Điều kiện tiếp tục vòng lặp.',
    switch: 'Phân nhánh theo lựa chọn menu.', case: 'Một lựa chọn của menu.',
    break: 'Kết thúc nhánh switch.', default: 'Xử lý lựa chọn không có trong menu.',
    string: 'Kiểu chuỗi.', double: 'Kiểu số thực.', int: 'Kiểu số nguyên.', void: 'Hàm không trả giá trị.'
  };

  function explanation(answer) {
    if (HELP[answer]) return HELP[answer];
    if (/^\d/.test(answer)) return 'Số liệu được quy định trong đề: ' + answer + '.';
    if (/^[A-Za-z_]\w*$/.test(answer)) return 'Tên thành viên/biến theo đề và khung chương trình; phải phân biệt hoa/thường: ' + answer + '.';
    return 'Hoàn thiện biểu thức theo yêu cầu và các biến trong khung code: ' + answer + '.';
  }

  function cloze(marked, rng) {
    var candidates = [], rows = marked.trim().split('\n');
    rows.forEach(function (line, row) {
      var re = /⟦([^⟧]+)⟧/g, m;
      while ((m = re.exec(line))) candidates.push({ row: row, offset: m.index, answer: m[1] });
    });
    if (candidates.length < 45) throw new Error('Form tự luận thiếu vị trí điền khuyết.');
    var count = Math.min(candidates.length, 60 + Math.floor(rng() * 21));
    var chosen = new Set(), important = ['class', 'private', 'public', 'static', 'new', 'get', 'set',
      'base', 'override', 'abstract', 'virtual', 'return', 'if', 'for', 'switch', 'case', 'do', 'while'];
    important.forEach(function (word) {
      var matches = candidates.map(function (c, i) { return c.answer === word ? i : -1; }).filter(function (i) { return i >= 0; });
      if (matches.length) chosen.add(pick(rng, matches));
    });
    shuffle(rng, candidates.map(function (_, i) { return i; })).forEach(function (i) { if (chosen.size < count) chosen.add(i); });
    var cursor = 0, blanks = [];
    var lines = rows.map(function (line) {
      var re = /⟦([^⟧]+)⟧/g, last = 0, segments = [], m;
      while ((m = re.exec(line))) {
        if (m.index > last) segments.push(line.slice(last, m.index));
        if (chosen.has(cursor)) {
          segments.push({ b: blanks.length });
          blanks.push({ ok: [m[1]], explain: explanation(m[1]) });
        } else segments.push(m[1]);
        cursor++; last = re.lastIndex;
      }
      if (last < line.length) segments.push(line.slice(last));
      return segments.length ? segments : [''];
    });
    return { lines: lines, blanks: blanks };
  }

  function finish(form, scenario, introduction, sections, code, rng, parameters, bankId) {
    var built = cloze(code, rng);
    var suffix = bankId ? bankId : Math.floor(rng() * 0x100000000).toString(36);
    return {
      type: 'essay',
      id: 'essay-v2-' + form + '-' + scenario.cls + '-' + suffix,
      bankId: bankId || ('essay-v2-' + form + '-' + scenario.cls + '-' + suffix),
      domainClass: scenario.cls,
      formVersion: 2,
      formId: form,
      templateId: 'essay-' + form,
      ch: { encapsulation: 3, inheritance: 4, polymorphism: 5 }[form],
      title: 'Quản lý ' + scenario.noun + ' — ' + scenario.cls,
      introduction: introduction,
      sections: sections,
      requirements: [introduction].concat(sections.map(function (s) { return s.title + ': ' + s.items.join(' '); })),
      lines: built.lines,
      blanks: built.blanks,
      parameters: parameters,
      explain: 'Đề giữ đúng form ' + {
        encapsulation: 'đóng gói: constructor, property có kiểm tra dữ liệu, bộ đếm static; các hàm quản lý tách riêng trong Program.',
        inheritance: 'kế thừa: hai lớp con gọi base, ghi đè ToString; tính tổng bằng is và ép kiểu, không thay bằng phương thức lương virtual.',
        polymorphism: 'đa hình: lớp trừu tượng, trường giá gốc private qua property, abstract/override, virtual Xuat và gọi base.Xuat; sắp xếp qua phương thức đa hình.'
      }[form],
      source: 'Ảnh đề thi tự luận đã cung cấp — form ' + {
        encapsulation: 'quản lý sách',
        inheritance: 'quản lý nhân viên',
        polymorphism: 'quản lý sản phẩm trừu tượng'
      }[form]
    };
  }

  // 25 ngữ cảnh lớp cho mỗi form (tổng cộng 75 hệ lớp khác nhau, nhân 4 biến thể tham số/ô trống = 300 câu tự luận)
  var ENCAP = [
    { cls: 'Sach', noun: 'sách của thư viện' },
    { cls: 'ThietBi', noun: 'thiết bị của phòng thực hành' },
    { cls: 'DoDung', noun: 'đồ dùng của cửa hàng' },
    { cls: 'VeThamQuan', noun: 'vé tham quan khu du lịch' },
    { cls: 'DungCu', noun: 'dụng cụ của kho kỹ thuật' },
    { cls: 'HocLieu', noun: 'học liệu của trung tâm' },
    { cls: 'TaiLieu', noun: 'tài liệu của phòng lưu trữ' },
    { cls: 'GiaoTrinh', noun: 'giáo trình của khoa CNTT' },
    { cls: 'MayTinh', noun: 'máy tính của phòng máy' },
    { cls: 'BanGhe', noun: 'bàn ghế của giảng đường' },
    { cls: 'LinhKien', noun: 'linh kiện của xưởng điện tử' },
    { cls: 'PhuTung', noun: 'phụ tùng của trạm bảo dưỡng' },
    { cls: 'ThuocMen', noun: 'thuốc men của nhà thuốc' },
    { cls: 'VatTu', noun: 'vật tư của công trình' },
    { cls: 'NhacCu', noun: 'nhạc cụ của câu lạc bộ' },
    { cls: 'DoChoi', noun: 'đồ chơi của siêu thị thiếu nhi' },
    { cls: 'CayCanh', noun: 'cây cảnh của vườn ươm' },
    { cls: 'TranhAnh', noun: 'tranh ảnh của phòng trưng bày' },
    { cls: 'DongHo', noun: 'đồng hồ của cửa hàng phụ kiện' },
    { cls: 'MatKinh', noun: 'mắt kính của tiệm kính thuốc' },
    { cls: 'BaloTui', noun: 'balo túi xách của shop thời trang' },
    { cls: 'GiayDep', noun: 'giày dép của cửa hàng thể thao' },
    { cls: 'MyPham', noun: 'mỹ phẩm của quầy chăm sóc da' },
    { cls: 'VanPhongPham', noun: 'văn phòng phẩm của nhà sách' },
    { cls: 'QuaLuuNiem', noun: 'quà lưu niệm của gian hàng du lịch' }
  ];

  var EMPLOYEE_SPECS = [
    ['NhanVien', 'Minh An'],
    ['NhanSu', 'Đại Phát'],
    ['CanBo', 'Bình Minh'],
    ['NguoiLaoDong', 'Hoàng Gia'],
    ['NhanVienCongTy', 'Tân Tiến'],
    ['NhanVienChiNhanh', 'Đông Phương'],
    ['VienChuc', 'Thành Công'],
    ['CongNhanVien', 'Phú Quý'],
    ['ChuyenVien', 'An Khang'],
    ['KyThuatVien', 'Việt Tiến'],
    ['DieuPhoiVien', 'Nam Việt'],
    ['QuanTriVien', 'Bắc Á'],
    ['GiamSatVien', 'Trường Sơn'],
    ['ThanhVienDoan', 'Hải Đăng'],
    ['CongTacVien', 'Sao Mai'],
    ['LaoDongChinh', 'Hưng Thịnh'],
    ['NhanVienKhoi', 'Thiên Long'],
    ['NhanSuTapDoan', 'Hòa Phát'],
    ['CanBoXuong', 'Thành Đạt'],
    ['NhanVienNhaMay', 'Quang Minh'],
    ['NhanVienKhuVuc', 'Bảo Việt'],
    ['NhanSuBoPhan', 'Thái Bình'],
    ['CanBoNganh', 'Hồng Hà'],
    ['NhanVienDonVi', 'Cửu Long'],
    ['LaoDongHopDong', 'Phương Nam']
  ];
  var EMPLOYEES = EMPLOYEE_SPECS.map(function (pair) {
    var name = pair[0], company = pair[1];
    return {
      cls: name,
      noun: 'nhân viên của công ty ' + company,
      office: name + 'VanPhong',
      production: name + 'SanXuat'
    };
  });

  var PRODUCT_SPECS = [
    ['SanPham', 'An Phú'],
    ['HangHoa', 'Minh Khang'],
    ['MatHang', 'Tiện Ích'],
    ['SanPhamCuaHang', 'Phúc Lộc'],
    ['HangKinhDoanh', 'Gia Đình'],
    ['SanPhamBan', 'Ánh Dương'],
    ['HangTieuDung', 'Bách Hóa'],
    ['MatHangSieuThi', 'Sao Việt'],
    ['SanPhamPhanPhoi', 'Tâm An'],
    ['HangBanLe', 'Vạn Phúc'],
    ['SanPhamNhapKhau', 'Toàn Cầu'],
    ['MatHangNoiDia', 'Quê Hương'],
    ['HangTrungBay', 'Kim Cương'],
    ['SanPhamChuyenDung', 'Đại Việt'],
    ['HangKhuyenMai', 'Mùa Xuân'],
    ['MatHangChinhHang', 'Tín Nghĩa'],
    ['SanPhamDaiLy', 'Phú Thành'],
    ['HangPhanPhoi', 'Ngọc Châu'],
    ['MatHangBanSi', 'Thuận Phát'],
    ['SanPhamChuLuc', 'Hoàng Kim'],
    ['HangThietYeu', 'Bình An'],
    ['MatHangGiaDung', 'Hạnh Phúc'],
    ['SanPhamQuayKe', 'Thanh Bình'],
    ['HangLuuKho', 'Trường Thịnh'],
    ['MatHangTieuChuan', 'Đông Đô']
  ];
  var PRODUCTS = PRODUCT_SPECS.map(function (pair) {
    var name = pair[0], shop = pair[1];
    return {
      cls: name,
      noun: 'sản phẩm của cửa hàng ' + shop,
      electronic: name === 'SanPham' ? 'HangDienTu' : name + 'DienTu',
      food: name === 'SanPham' ? 'HangThucPham' : name + 'ThucPham'
    };
  });

  function encapsulation(s, rng, presetParams, bankId) {
    var C = s.cls;
    var capacity = (presetParams && presetParams.capacity) || pick(rng, [30, 40, 50, 60, 80, 100]);
    var intro = 'Viết chương trình console quản lý ' + s.noun + ', lưu trong mảng một chiều, thao tác qua menu. Hoàn thiện các ô trống trong chương trình theo đúng yêu cầu dưới đây.';
    var sections = [
      { title: '1. Lớp ' + C + ' (đóng gói)', items: [
        'Các trường private: _ma, _ten (string), _gia (double). Trường private static int _dem khởi tạo 0, đếm số đối tượng đã tạo.',
        'Constructor public ' + C + '(string ma, string ten, double gia): gán _ma, _ten trực tiếp; gán giá qua this.Gia để được kiểm tra; sau đó tăng _dem.',
        'Các thuộc tính public: Ma chỉ đọc trả về _ma; Ten đọc/ghi _ten, chỉ nhận value không rỗng bằng !string.IsNullOrWhiteSpace(value); Gia đọc/ghi _gia, chỉ nhận value > 0. Thuộc tính public static int Dem chỉ đọc trả về _dem.',
        'Phương thức public void Xuat() in mã, tên, giá bằng Console.WriteLine.'
      ] },
      { title: '2. Lớp Program', items: [
        'Khai báo static mảng ds kiểu ' + C + ' gồm ' + capacity + ' phần tử và static int n = 0 (số phần tử đang dùng). Các hàm dưới đây đều là static.',
        'int Tim(string ma): duyệt i từ 0 đến n - 1, trả về vị trí đầu tiên có ds[i].Ma == ma; không thấy trả về -1.',
        'void Them(): nếu n >= ds.Length thì báo "Danh sach da day" và return; ngược lại nhập ma, ten, gia, tạo đối tượng vào ds[n], rồi tăng n.',
        'void XuatDS(): duyệt bằng for và gọi ds[i].Xuat().',
        'void CapNhatGia(): nhập mã ma, dùng Tim để lấy vị trí vt; nếu vt == -1 thì báo "Khong thay" và return; ngược lại nhập giá mới và gán qua ds[vt].Gia.',
        'void TongGia(): cộng dồn ds[i].Gia vào biến double tong rồi in; sau đó in số đối tượng đã tạo bằng ' + C + '.Dem.',
        'void Main(): khai báo int chon, dùng do ... while (chon != 0), switch với menu 1. Thêm, 2. Xuất, 3. Cập nhật giá, 4. Tổng giá, 0. Thoát; case 0 in "Tam biet", nhánh default in "Sai lua chon". Main chỉ gọi các hàm quản lý, không viết gộp xử lý vào các case.'
      ] }
    ];
    var code = `using System;

⟦class⟧ ${C}
{
    ⟦private⟧ ⟦string⟧ _ma;
    ⟦private⟧ string _ten;
    private ⟦double⟧ _gia;
    private ⟦static⟧ ⟦int⟧ _dem = 0;

    ⟦public⟧ ⟦${C}⟧(string ma, string ten, double gia)
    {
        ⟦_ma⟧ = ma;
        ⟦_ten⟧ = ten;
        ⟦this⟧.⟦Gia⟧ = gia;
        ⟦_dem⟧++;
    }

    ⟦public⟧ string ⟦Ma⟧ { ⟦get⟧ { ⟦return⟧ _ma; } }
    public string ⟦Ten⟧
    {
        ⟦get⟧ { return ⟦_ten⟧; }
        ⟦set⟧ { if (!⟦string⟧.⟦IsNullOrWhiteSpace⟧(⟦value⟧)) _ten = ⟦value⟧; }
    }
    public ⟦double⟧ ⟦Gia⟧
    {
        ⟦get⟧ { ⟦return⟧ _gia; }
        ⟦set⟧ { ⟦if⟧ (⟦value > 0⟧) _gia = ⟦value⟧; }
    }
    ⟦public⟧ ⟦static⟧ int ⟦Dem⟧ { get { return ⟦_dem⟧; } }

    public ⟦void⟧ ⟦Xuat⟧()
    {
        Console.⟦WriteLine⟧(_ma + " - " + _ten + " - " + _gia);
    }
}

⟦class⟧ Program
{
    ⟦static⟧ ⟦${C}⟧[] ds = ⟦new⟧ ${C}[⟦${capacity}⟧];
    ⟦static⟧ ⟦int⟧ n = 0;

    static ⟦int⟧ ⟦Tim⟧(string ma)
    {
        ⟦for⟧ (int i = 0; ⟦i < n⟧; i++)
            ⟦if⟧ (ds[i].⟦Ma⟧ == ma) ⟦return⟧ i;
        return ⟦-1⟧;
    }

    ⟦static⟧ void ⟦Them⟧()
    {
        ⟦if⟧ (n >= ds.⟦Length⟧) { Console.WriteLine("Danh sach da day"); ⟦return⟧; }
        Console.Write("Ma: "); ⟦string⟧ ma = Console.⟦ReadLine⟧();
        Console.Write("Ten: "); string ten = Console.ReadLine();
        Console.Write("Gia: "); ⟦double⟧ gia = double.⟦Parse⟧(Console.ReadLine());
        ds[n] = ⟦new⟧ ⟦${C}⟧(ma, ten, gia);
        ⟦n⟧++;
    }

    static ⟦void⟧ ⟦XuatDS⟧()
    {
        ⟦for⟧ (int i = 0; i < n; i++) ds[i].⟦Xuat⟧();
    }

    ⟦static⟧ void ⟦CapNhatGia⟧()
    {
        Console.Write("Ma: "); string ma = Console.ReadLine();
        ⟦int⟧ vt = ⟦Tim⟧(ma);
        ⟦if⟧ (⟦vt == -1⟧) { Console.WriteLine("Khong thay"); ⟦return⟧; }
        Console.Write("Gia moi: ");
        ds[vt].⟦Gia⟧ = double.⟦Parse⟧(Console.ReadLine());
    }

    static void ⟦TongGia⟧()
    {
        ⟦double⟧ tong = 0;
        ⟦for⟧ (int i = 0; i < n; i++) tong += ⟦ds[i].Gia⟧;
        Console.WriteLine("Tong: " + ⟦tong⟧);
        Console.WriteLine("So doi tuong da tao: " + ⟦${C}⟧.⟦Dem⟧);
    }

    ⟦static⟧ void Main()
    {
        int chon;
        ⟦do⟧
        {
            Console.WriteLine("1. Them 2. Xuat 3. Cap nhat gia 4. Tong gia 0. Thoat");
            chon = int.⟦Parse⟧(Console.ReadLine());
            ⟦switch⟧ (chon)
            {
                ⟦case⟧ 1: ⟦Them⟧(); break;
                case 2: ⟦XuatDS⟧(); ⟦break⟧;
                case 3: ⟦CapNhatGia⟧(); break;
                ⟦case⟧ 4: ⟦TongGia⟧(); break;
                case 0: Console.WriteLine("Tam biet"); break;
                ⟦default⟧: Console.WriteLine("Sai lua chon"); ⟦break⟧;
            }
        } ⟦while⟧ (⟦chon != 0⟧);
    }
}`;
    return finish('encapsulation', s, intro, sections, code, rng, { capacity: capacity }, bankId);
  }

  function inheritance(s, rng, presetParams, bankId) {
    var C = s.cls, A = s.office, B = s.production;
    var capacity = (presetParams && presetParams.capacity) || pick(rng, [30, 40, 50, 60]);
    var divisor = (presetParams && presetParams.divisor) || pick(rng, [22, 24, 26]);
    var fee = (presetParams && presetParams.pieceRate) || pick(rng, [3000, 5000, 7500, 10000]);
    var intro = 'Viết chương trình console quản lý ' + s.noun + '. Có hai loại: nhân viên văn phòng (lương cơ bản chia ' + divisor + ' nhân số ngày công) và nhân viên sản xuất (lương cơ bản cộng số sản phẩm nhân ' + fee + '). Hai lớp con kế thừa ' + C + '. Dữ liệu lưu trong mảng một chiều kiểu lớp cơ sở, thao tác qua menu.';
    var sections = [
      { title: '1. Lớp ' + C, items: [
        'Các trường private string _ma, _ten; trường protected double _luongCB để lớp con dùng trực tiếp.',
        'Constructor public ' + C + '(string ma, string ten, double luongCB) gán cả ba trường.',
        'Thuộc tính public string Ma chỉ đọc; public string Ten đọc và ghi.',
        'Ghi đè public override string ToString() trả về chuỗi gồm _ma, _ten và _luongCB, ngăn cách bởi " - ". Lớp cơ sở không khai báo phương thức lương virtual.'
      ] },
      { title: '2. Lớp ' + A + ' kế thừa ' + C, items: [
        'Trường private int _ngayCong. Constructor public nhận string ma, string ten, double luongCB, int ngayCong, gọi : base(ma, ten, luongCB), rồi gán _ngayCong.',
        'Phương thức public double LuongThucLinh() trả về _luongCB / ' + divisor + ' * _ngayCong.',
        'Ghi đè ToString(): return base.ToString() + " - Ngay cong: " + _ngayCong.'
      ] },
      { title: '3. Lớp ' + B + ' kế thừa ' + C, items: [
        'Trường private int _soSP. Constructor public nhận string ma, string ten, double luongCB, int soSP, gọi base, rồi gán _soSP.',
        'Phương thức public double LuongThucLinh() trả về _luongCB + _soSP * ' + fee + '.',
        'Ghi đè ToString(): return base.ToString() + " - San pham: " + _soSP.'
      ] },
      { title: '4. Lớp Program', items: [
        'Khai báo static mảng ds kiểu ' + C + ' gồm ' + capacity + ' phần tử và static int n = 0. Các hàm sau đều là static.',
        'void Them(): nếu mảng đầy thì báo "Danh sach da day" và return; nhập ma, ten, luongCB, loai. Loại 1 nhập int them là ngày công để tạo ' + A + '; loại 2 nhập int them là số sản phẩm để tạo ' + B + '. Từ chối loại khác bằng thông báo "Sai loai" và return. Lưu vào ds[n], tăng n.',
        'void XuatDS(): dùng for và Console.WriteLine(ds[i]) để gọi ToString của từng phần tử.',
        'void TongLuong(): dùng double tong = 0; nếu ds[i] is ' + A + ' thì ép kiểu (' + A + ')ds[i] và cộng LuongThucLinh(); ngược lại ép sang ' + B + ' rồi cộng. In tong. Không thay thao tác is/ép kiểu bằng phương thức virtual.',
        'void DemSanXuat(): dùng int dem = 0, toán tử is để đếm các đối tượng ' + B + ', rồi in dem.',
        'void Main(): int chon, vòng do ... while (chon != 0), switch: 1. Them(), 2. XuatDS(), 3. TongLuong(), 4. DemSanXuat(), 0. in "Tam biet" và thoát; default in "Sai lua chon".'
      ] }
    ];
    var code = `using System;

⟦class⟧ ${C}
{
    ⟦private⟧ ⟦string⟧ _ma;
    private string _ten;
    ⟦protected⟧ ⟦double⟧ _luongCB;
    ⟦public⟧ ⟦${C}⟧(string ma, string ten, double luongCB)
    {
        ⟦_ma⟧ = ma; ⟦_ten⟧ = ten; ⟦_luongCB⟧ = luongCB;
    }
    public ⟦string⟧ ⟦Ma⟧ { ⟦get⟧ { ⟦return⟧ _ma; } }
    ⟦public⟧ string ⟦Ten⟧ { get { return _ten; } ⟦set⟧ { _ten = ⟦value⟧; } }
    ⟦public⟧ ⟦override⟧ string ⟦ToString⟧()
    {
        return _ma + " - " + _ten + " - " + ⟦_luongCB⟧;
    }
}

⟦class⟧ ${A} : ⟦${C}⟧
{
    ⟦private⟧ ⟦int⟧ _ngayCong;
    public ⟦${A}⟧(string ma, string ten, double luongCB, ⟦int⟧ ngayCong)
        : ⟦base⟧(ma, ten, luongCB)
    {
        ⟦_ngayCong⟧ = ngayCong;
    }
    ⟦public⟧ ⟦double⟧ ⟦LuongThucLinh⟧() { ⟦return⟧ ⟦_luongCB / ${divisor} * _ngayCong⟧; }
    public ⟦override⟧ string ToString()
    {
        return ⟦base⟧.⟦ToString⟧() + " - Ngay cong: " + _ngayCong;
    }
}

⟦class⟧ ${B} : ⟦${C}⟧
{
    ⟦private⟧ int ⟦_soSP⟧;
    public ⟦${B}⟧(string ma, string ten, double luongCB, int soSP)
        : ⟦base⟧(ma, ten, luongCB)
    {
        _soSP = ⟦soSP⟧;
    }
    public ⟦double⟧ ⟦LuongThucLinh⟧() { return ⟦_luongCB + _soSP * ${fee}⟧; }
    ⟦public⟧ ⟦override⟧ string ToString()
    {
        return ⟦base.ToString()⟧ + " - San pham: " + _soSP;
    }
}

⟦class⟧ Program
{
    ⟦static⟧ ⟦${C}⟧[] ds = ⟦new⟧ ${C}[⟦${capacity}⟧];
    ⟦static⟧ ⟦int⟧ n = 0;
    ⟦static⟧ void ⟦Them⟧()
    {
        ⟦if⟧ (n >= ds.⟦Length⟧) { Console.WriteLine("Danh sach da day"); ⟦return⟧; }
        Console.Write("Ma: "); string ma = Console.⟦ReadLine⟧();
        Console.Write("Ten: "); ⟦string⟧ ten = Console.ReadLine();
        Console.Write("Luong co ban: "); double luongCB = double.⟦Parse⟧(Console.ReadLine());
        Console.Write("Loai (1-Van phong, 2-San xuat): "); ⟦int⟧ loai = int.Parse(Console.ReadLine());
        ⟦if⟧ (loai != 1 && loai != 2) { Console.WriteLine("Sai loai"); ⟦return⟧; }
        Console.Write("Ngay cong hoac so SP: "); int them = int.⟦Parse⟧(Console.ReadLine());
        ⟦if⟧ (loai == 1) ds[n] = ⟦new⟧ ⟦${A}⟧(ma, ten, luongCB, them);
        ⟦else⟧ ds[n] = ⟦new⟧ ⟦${B}⟧(ma, ten, luongCB, them);
        ⟦n⟧++;
    }

    static ⟦void⟧ ⟦XuatDS⟧()
    {
        ⟦for⟧ (int i = 0; i < n; i++) Console.⟦WriteLine⟧(ds[i]);
    }

    ⟦static⟧ void ⟦TongLuong⟧()
    {
        ⟦double⟧ tong = 0;
        ⟦for⟧ (int i = 0; i < n; i++)
        {
            ⟦if⟧ (ds[i] ⟦is⟧ ⟦${A}⟧)
                tong += ((⟦${A}⟧)ds[i]).⟦LuongThucLinh⟧();
            ⟦else⟧
                tong += ((⟦${B}⟧)ds[i]).⟦LuongThucLinh⟧();
        }
        Console.WriteLine("Tong luong: " + ⟦tong⟧);
    }

    static void ⟦DemSanXuat⟧()
    {
        ⟦int⟧ dem = 0;
        ⟦for⟧ (int i = 0; i < n; i++)
            ⟦if⟧ (ds[i] ⟦is⟧ ⟦${B}⟧) ⟦dem⟧++;
        Console.WriteLine("So NV san xuat: " + ⟦dem⟧);
    }

    ⟦static⟧ void Main()
    {
        int chon;
        ⟦do⟧
        {
            Console.WriteLine("1. Them 2. Xuat 3. Tong luong 4. Dem NV san xuat 0. Thoat");
            chon = int.⟦Parse⟧(Console.ReadLine());
            ⟦switch⟧ (chon)
            {
                ⟦case⟧ 1: ⟦Them⟧(); break;
                case 2: ⟦XuatDS⟧(); ⟦break⟧;
                case 3: ⟦TongLuong⟧(); break;
                ⟦case⟧ 4: ⟦DemSanXuat⟧(); break;
                case 0: Console.WriteLine("Tam biet"); break;
                ⟦default⟧: Console.WriteLine("Sai lua chon"); ⟦break⟧;
            }
        } ⟦while⟧ (⟦chon != 0⟧);
    }
}`;
    return finish('inheritance', s, intro, sections, code, rng,
      { capacity: capacity, divisor: divisor, pieceRate: fee }, bankId);
  }

  function polymorphism(s, rng, presetParams, bankId) {
    var C = s.cls, A = s.electronic, B = s.food;
    var capacity = (presetParams && presetParams.capacity) || pick(rng, [30, 40, 50, 60, 80]);
    var markup = (presetParams && presetParams.markup) || pick(rng, ['1.18', '1.2', '1.25', '1.3']);
    var fee = (presetParams && presetParams.warrantyFee) || pick(rng, [10000, 15000, 20000, 25000]);
    var foodMarkup = (presetParams && presetParams.foodMarkup) || pick(rng, ['1.05', '1.1', '1.15']);
    var threshold = (presetParams && presetParams.expiryDays) || pick(rng, [2, 3, 5, 7]);
    var discount = (presetParams && presetParams.discount) || pick(rng, ['0.5', '0.6', '0.7']);
    var intro = 'Viết chương trình console quản lý ' + s.noun + '. Có hai loại: hàng điện tử (giá gốc nhân ' + markup + ' cộng số tháng bảo hành nhân ' + fee + ') và hàng thực phẩm (giá gốc nhân ' + foodMarkup + '; nếu còn hạn từ ' + threshold + ' ngày trở xuống thì giá này nhân ' + discount + '). Mỗi loại tự tính giá bán nên lớp cơ sở là lớp trừu tượng. Dữ liệu lưu trong mảng một chiều kiểu lớp cơ sở, thao tác qua menu.';
    var sections = [
      { title: '1. Lớp trừu tượng ' + C, items: [
        'Các trường private: string _ma, _ten và double _giaGoc. Không đổi _giaGoc thành protected.',
        'Constructor public ' + C + '(string ma, string ten, double giaGoc): gán _ma, _ten trực tiếp; gán giá qua this.GiaGoc để được kiểm tra.',
        'Thuộc tính public: string Ma chỉ đọc; double GiaGoc đọc/ghi, phần set chỉ nhận value > 0.',
        'Phương thức thuần ảo public abstract double TinhGiaBan(); không có thân hàm.',
        'Phương thức ảo public virtual void Xuat(): in _ma, _ten và TinhGiaBan(), ngăn cách bởi " - ".'
      ] },
      { title: '2. Lớp ' + A + ' kế thừa ' + C, items: [
        'Trường private int _thangBH. Constructor public nhận string ma, string ten, double giaGoc, int thangBH, gọi : base(ma, ten, giaGoc), rồi gán _thangBH.',
        'Ghi đè public override double TinhGiaBan() theo công thức GiaGoc * ' + markup + ' + _thangBH * ' + fee + ', dùng thuộc tính GiaGoc của lớp cơ sở.',
        'Lớp này dùng Xuat() kế thừa; không cần khai báo lại Xuat().'
      ] },
      { title: '3. Lớp ' + B + ' kế thừa ' + C, items: [
        'Trường private int _conHan là số ngày còn hạn. Constructor public nhận string ma, string ten, double giaGoc, int conHan, gọi base, rồi gán _conHan.',
        'Ghi đè TinhGiaBan(): khai báo double gia = GiaGoc * ' + foodMarkup + '; nếu _conHan <= ' + threshold + ' thì return gia * ' + discount + '; ngược lại return gia.',
        'Ghi đè public override void Xuat(): gọi base.Xuat() trước, rồi Console.WriteLine("Con han: " + _conHan).'
      ] },
      { title: '4. Lớp Program', items: [
        'Khai báo static mảng ds kiểu ' + C + ' gồm ' + capacity + ' phần tử và static int n = 0. Các hàm sau đều là static.',
        'void Them(): nếu mảng đầy thì báo "Danh sach da day" và return; nhập ma, ten, giaGoc, loai. Loại 1 nhập int them là tháng bảo hành để tạo ' + A + '; loại 2 nhập int them là ngày còn hạn để tạo ' + B + '. Loại khác báo "Sai loai" và return. Lưu vào ds[n], tăng n.',
        'void XuatDS(): duyệt bằng for và gọi ds[i].Xuat() để thể hiện đa hình.',
        'void SapXepGiamDan(): hai vòng for lồng nhau, i < n - 1 và j = i + 1; nếu ds[i].TinhGiaBan() < ds[j].TinhGiaBan() thì đổi chỗ qua biến tam kiểu ' + C + '. Sau khi sắp xếp phải gọi XuatDS().',
        'void TongGiaTri(): cộng dồn ds[i].TinhGiaBan() vào double tong rồi in tong.',
        'void Main(): int chon, do ... while (chon != 0), switch: 1. Them(), 2. XuatDS(), 3. SapXepGiamDan(), 4. TongGiaTri(), 0. in "Tam biet" và thoát; default in "Sai lua chon".'
      ] }
    ];
    var code = `using System;

⟦abstract⟧ ⟦class⟧ ${C}
{
    ⟦private⟧ ⟦string⟧ _ma;
    private string _ten;
    ⟦private⟧ ⟦double⟧ _giaGoc;
    ⟦public⟧ ⟦${C}⟧(string ma, string ten, double giaGoc)
    {
        ⟦_ma⟧ = ma; _ten = ⟦ten⟧; ⟦this⟧.⟦GiaGoc⟧ = giaGoc;
    }
    public ⟦string⟧ ⟦Ma⟧ { ⟦get⟧ { ⟦return⟧ _ma; } }
    public double ⟦GiaGoc⟧
    {
        ⟦get⟧ { return ⟦_giaGoc⟧; }
        ⟦set⟧ { ⟦if⟧ (⟦value > 0⟧) _giaGoc = ⟦value⟧; }
    }
    ⟦public⟧ ⟦abstract⟧ ⟦double⟧ ⟦TinhGiaBan⟧();
    public ⟦virtual⟧ ⟦void⟧ ⟦Xuat⟧()
    {
        Console.WriteLine(_ma + " - " + _ten + " - " + ⟦TinhGiaBan⟧());
    }
}

⟦class⟧ ${A} : ⟦${C}⟧
{
    ⟦private⟧ ⟦int⟧ _thangBH;
    public ⟦${A}⟧(string ma, string ten, double giaGoc, int thangBH)
        : ⟦base⟧(ma, ten, giaGoc)
    {
        ⟦_thangBH⟧ = thangBH;
    }
    ⟦public⟧ ⟦override⟧ double ⟦TinhGiaBan⟧()
    {
        ⟦return⟧ ⟦GiaGoc * ${markup} + _thangBH * ${fee}⟧;
    }
}

⟦class⟧ ${B} : ⟦${C}⟧
{
    ⟦private⟧ int ⟦_conHan⟧;
    public ⟦${B}⟧(string ma, string ten, double giaGoc, ⟦int⟧ conHan)
        : ⟦base⟧(ma, ten, giaGoc)
    {
        _conHan = ⟦conHan⟧;
    }
    public ⟦override⟧ ⟦double⟧ ⟦TinhGiaBan⟧()
    {
        double gia = ⟦GiaGoc * ${foodMarkup}⟧;
        ⟦if⟧ (⟦_conHan <= ${threshold}⟧) return ⟦gia * ${discount}⟧;
        ⟦return⟧ ⟦gia⟧;
    }
    ⟦public⟧ ⟦override⟧ void ⟦Xuat⟧()
    {
        ⟦base⟧.⟦Xuat⟧();
        Console.WriteLine("Con han: " + ⟦_conHan⟧);
    }
}

⟦class⟧ Program
{
    ⟦static⟧ ⟦${C}⟧[] ds = ⟦new⟧ ${C}[⟦${capacity}⟧];
    ⟦static⟧ int n = 0;
    static ⟦void⟧ ⟦Them⟧()
    {
        ⟦if⟧ (n >= ds.⟦Length⟧) { Console.WriteLine("Danh sach da day"); ⟦return⟧; }
        Console.Write("Ma: "); ⟦string⟧ ma = Console.ReadLine();
        Console.Write("Ten: "); string ten = Console.⟦ReadLine⟧();
        Console.Write("Gia goc: "); ⟦double⟧ giaGoc = double.⟦Parse⟧(Console.ReadLine());
        Console.Write("Loai (1-Dien tu, 2-Thuc pham): "); int loai = int.Parse(Console.ReadLine());
        ⟦if⟧ (loai != 1 && loai != 2) { Console.WriteLine("Sai loai"); ⟦return⟧; }
        Console.Write("Thang BH hoac ngay con han: "); int them = int.⟦Parse⟧(Console.ReadLine());
        ⟦if⟧ (loai == 1) ds[n] = ⟦new⟧ ⟦${A}⟧(ma, ten, giaGoc, them);
        ⟦else⟧ ds[n] = ⟦new⟧ ⟦${B}⟧(ma, ten, giaGoc, them);
        ⟦n⟧++;
    }

    ⟦static⟧ void ⟦XuatDS⟧()
    {
        ⟦for⟧ (int i = 0; i < n; i++) ds[i].⟦Xuat⟧();
    }

    static void ⟦SapXepGiamDan⟧()
    {
        ⟦for⟧ (int i = 0; i < ⟦n - 1⟧; i++)
            for (int j = ⟦i + 1⟧; j < n; j++)
                ⟦if⟧ (⟦ds[i].TinhGiaBan() < ds[j].TinhGiaBan()⟧)
                {
                    ⟦${C}⟧ tam = ⟦ds[i]⟧;
                    ds[i] = ⟦ds[j]⟧;
                    ds[j] = ⟦tam⟧;
                }
        ⟦XuatDS⟧();
    }

    ⟦static⟧ void ⟦TongGiaTri⟧()
    {
        ⟦double⟧ tong = 0;
        ⟦for⟧ (int i = 0; i < n; i++) tong += ⟦ds[i].TinhGiaBan()⟧;
        Console.WriteLine("Tong: " + ⟦tong⟧);
    }

    static void Main()
    {
        int chon;
        ⟦do⟧
        {
            Console.WriteLine("1. Them 2. Xuat 3. Sap xep giam dan 4. Tong gia tri 0. Thoat");
            chon = int.⟦Parse⟧(Console.ReadLine());
            ⟦switch⟧ (chon)
            {
                ⟦case⟧ 1: ⟦Them⟧(); break;
                case 2: ⟦XuatDS⟧(); ⟦break⟧;
                case 3: ⟦SapXepGiamDan⟧(); break;
                ⟦case⟧ 4: ⟦TongGiaTri⟧(); break;
                case 0: Console.WriteLine("Tam biet"); break;
                ⟦default⟧: Console.WriteLine("Sai lua chon"); ⟦break⟧;
            }
        } ⟦while⟧ (⟦chon != 0⟧);
    }
}`;
    return finish('polymorphism', s, intro, sections, code, rng,
      { capacity: capacity, markup: markup, warrantyFee: fee, foodMarkup: foodMarkup, expiryDays: threshold, discount: discount }, bankId);
  }

  // =========================================================================
  // 50 BÀI TỰ LUẬN BỔ SUNG THEO 3 FORM ẢNH ĐỀ THI MỚI (DUE E-Study):
  // - 18 bài Giao diện & Chiến lược (DonHang / IGiamGia / ThanhToan)
  // - 16 bài Kế thừa & Toán tử as (Xe / Oto / XeTai)
  // - 16 bài Đóng gói & Ngoại lệ try/catch (TaiKhoan)
  // =========================================================================

  var STRATEGY_SPECS = [
    ['DonHang', 'đơn hàng bán lẻ', 'IGiamGia', 'GiamSoLuong', 'GiamThanhVien', 'GiamDonLon', 'ThanhToan', 10, '0.1', '0.05', 5000000, 200000],
    ['HoaDonBan', 'hóa đơn siêu thị', 'IUuDaiHD', 'GiamSoLuongHD', 'GiamThanhVienHD', 'GiamHoaDonLon', 'TinhTienHD', 8, '0.08', '0.05', 3000000, 150000],
    ['VeMayBay', 'vé máy bay trực tuyến', 'IKhuyenMaiVe', 'GiamSoLuongVe', 'GiamHoiVienVe', 'GiamVeGiaTriCao', 'ThanhToanVe', 5, '0.12', '0.06', 8000000, 350000],
    ['PhieuMuaHang', 'phiếu mua hàng tại quầy', 'IChietKhauPM', 'GiamSoLuongPM', 'GiamKhachQuenPM', 'GiamPhieuLonPM', 'ThuNganPM', 12, '0.1', '0.04', 4000000, 180000],
    ['DangKyKhoaHoc', 'đăng ký khóa học tin học', 'IHocBongKH', 'GiamSoMonKH', 'GiamHocVienCuKH', 'GiamHocPhiLonKH', 'QuyetToanKH', 3, '0.15', '0.07', 6000000, 300000],
    ['DatPhongKS', 'phiếu đặt phòng khách sạn', 'IGiamGiaPhong', 'GiamSoDemPhong', 'GiamThanhVienKS', 'GiamHoaDonKS', 'ThanhToanKS', 4, '0.1', '0.05', 7000000, 250000],
    ['VanDonGiaoHang', 'vận đơn giao hàng nhanh', 'ICuocUuDaiVD', 'GiamSoKienVD', 'GiamDoiTacVD', 'GiamDonCuocLon', 'CuocPhiVD', 15, '0.12', '0.05', 4500000, 200000],
    ['VeXemPhim', 'đặt vé rạp chiếu phim', 'IUuDaiRap', 'GiamSoVeRap', 'GiamThanhVienRap', 'GiamComboLonRap', 'QuayVeRap', 6, '0.1', '0.08', 1200000, 80000],
    ['PhieuThueXe', 'hợp đồng thuê xe tự lái', 'IGiamPhiThue', 'GiamSoNgayThue', 'GiamKhachVipXe', 'GiamHopDongLonXe', 'QuyetToanXe', 7, '0.15', '0.05', 9000000, 400000],
    ['HoaDonDienTu', 'hóa đơn thiết bị điện tử', 'IChietKhauDT', 'GiamSoLuongDT', 'GiamThanhVienDT', 'GiamDonLonDT', 'ThanhToanDT', 5, '0.08', '0.04', 15000000, 500000],
    ['DonDatTiec', 'đơn đặt bàn tiệc cưới', 'IUuDaiTiec', 'GiamSoBanTiec', 'GiamThanhVienTiec', 'GiamTiecLon', 'ThanhToanTiec', 20, '0.1', '0.05', 50000000, 2000000],
    ['VeTauHoa', 'vé tàu hỏa liên tỉnh', 'IGiamGiaTau', 'GiamSoVeTau', 'GiamThanhVienTau', 'GiamChuyenLonTau', 'ThanhToanTau', 10, '0.1', '0.06', 3500000, 150000],
    ['DonHangSi', 'đơn hàng phân phối sỉ', 'IChietKhauSi', 'GiamSoThungSi', 'GiamDaiLySi', 'GiamDonSiLon', 'KeToanSi', 25, '0.12', '0.05', 20000000, 800000],
    ['PhieuSuaChua', 'phiếu bảo trì sửa chữa', 'IGiamPhiSC', 'GiamSoHangMucSC', 'GiamKhachThanSC', 'GiamPhieuLonSC', 'ThuPhiSC', 4, '0.1', '0.05', 2500000, 120000],
    ['DatSanTheThao', 'phiếu đặt sân thể thao', 'IUuDaiSan', 'GiamSoGioSan', 'GiamHoiVienSan', 'GiamLichLonSan', 'TinhTienSan', 6, '0.12', '0.05', 2000000, 100000],
    ['GoiCuocMang', 'đăng ký gói cước viễn thông', 'IGiamCuocMang', 'GiamSoThangMang', 'GiamThanhVienMang', 'GiamGoiLonMang', 'ThanhToanMang', 12, '0.15', '0.05', 3600000, 200000],
    ['DonInAn', 'đơn hàng in ấn quảng cáo', 'IChietKhauIn', 'GiamSoBanIn', 'GiamKhachQuenIn', 'GiamDonInLon', 'ThanhToanIn', 50, '0.1', '0.04', 5500000, 250000],
    ['PhieuNhapKho', 'đơn đặt hàng nhà cung cấp', 'IUuDaiNhap', 'GiamSoLoNhap', 'GiamDoiTacNhap', 'GiamDonNhapLon', 'ThanhToanNhap', 10, '0.09', '0.05', 12000000, 450000]
  ];

  var FLEET_AS_SPECS = [
    ['Xe', 'xe của công ty vận tải', 'Oto', 'XeTai', 30, 1990, '0.02', 100000, '0.03', 50000],
    ['PhuongTien', 'phương tiện của hợp tác xã', 'XeCon', 'XeKhach', 35, 1995, '0.025', 120000, '0.035', 60000],
    ['TauThuy', 'tàu thủy của cảng vụ', 'TauKhach', 'TauHang', 25, 2000, '0.02', 150000, '0.03', 80000],
    ['PhiCo', 'máy bay của hãng hàng không', 'PhiCoKhach', 'PhiCoHang', 20, 2005, '0.015', 200000, '0.025', 90000],
    ['ThietBiYTe', 'thiết bị y tế của bệnh viện', 'MaySieuAm', 'MayXQuang', 40, 2010, '0.03', 80000, '0.04', 70000],
    ['MayCongTrinh', 'máy móc của đội thi công', 'MayXuc', 'MayCau', 30, 2002, '0.025', 110000, '0.035', 65000],
    ['ContainerVT', 'container của bãi logistics', 'ContKho', 'ContLanh', 50, 2008, '0.02', 90000, '0.04', 75000],
    ['XeChuyenDung', 'xe chuyên dụng của đội cứu hộ', 'XeCuuThuong', 'XeCuuHoa', 25, 2005, '0.02', 100000, '0.03', 55000],
    ['ToaNha', 'tài sản nhà của ban quản lý', 'NhaPho', 'CaoOcVanPhong', 30, 1998, '0.015', 130000, '0.025', 85000],
    ['KhoLuuTru', 'kho bãi của hệ thống phân phối', 'KhoThuong', 'KhoDongLanh', 40, 2004, '0.02', 95000, '0.035', 60000],
    ['ThietBiMang', 'thiết bị mạng của trung tâm dữ liệu', 'BoDinhTuyen', 'BoChuyenMach', 45, 2012, '0.03', 50000, '0.04', 45000],
    ['MayInVanPhong', 'máy in của phòng hành chính', 'MayInLaser', 'MayInPhun', 35, 2010, '0.02', 60000, '0.03', 40000],
    ['BoLuuDien', 'bộ lưu điện của nhà máy', 'UpsGiaDinh', 'UpsCongNghiep', 30, 2011, '0.025', 70000, '0.035', 50000],
    ['DongCo', 'động cơ của xưởng cơ khí', 'DongCoXang', 'DongCoDien', 40, 2000, '0.02', 85000, '0.03', 65000],
    ['HeThongBom', 'máy bơm của trạm cấp nước', 'BomNuoc', 'BomHoaChat', 30, 2006, '0.025', 75000, '0.035', 55000],
    ['ThietBiNang', 'thiết bị nâng của tòa nhà', 'ThangMay', 'CauTrucHang', 25, 2003, '0.02', 140000, '0.03', 95000]
  ];

  var ACCOUNT_SPECS = [
    ['TaiKhoan', 'tài khoản ngân hàng', 30],
    ['ViDienTu', 'ví điện tử thanh toán', 40],
    ['TheThanhVien', 'thẻ thành viên tích điểm', 50],
    ['QuyLop', 'quỹ thu chi của lớp học', 25],
    ['TaiKhoanTietKiem', 'sổ tiết kiệm cá nhân', 35],
    ['TheMuaSam', 'thẻ mua sắm trả trước', 45],
    ['NganSachDuAn', 'ngân sách các dự án', 20],
    ['QuyKhuyenHoc', 'quỹ khuyến học của khoa', 30],
    ['TheQuaTang', 'thẻ quà tặng điện tử', 60],
    ['TaiKhoanTichLuy', 'tài khoản tích lũy sinh viên', 40],
    ['QuyBaoTri', 'quỹ bảo trì chung cư', 25],
    ['SoDuHocPhi', 'tài khoản học phí sinh viên', 50],
    ['TaiKhoanGiaoDich', 'tài khoản giao dịch trực tuyến', 35],
    ['QuyCongDoan', 'quỹ công đoàn đơn vị', 30],
    ['TheTraTruoc', 'thẻ trả trước nội bộ', 40],
    ['ViThanhToan', 'ví thanh toán học đường', 30]
  ];

  function strategyInterface(spec, rng, bankId) {
    var C = spec[0], noun = spec[1], IF = spec[2];
    var S1 = spec[3], S2 = spec[4], S3 = spec[5], SVC = spec[6];
    var minQty = spec[7], pctQty = spec[8], pctVip = spec[9], bigMin = spec[10], bigOff = spec[11];
    var scenario = { cls: C, noun: noun };
    var intro = 'Viết chương trình console thanh toán ' + noun + '. Các kiểu giảm giá thay đổi theo chính sách nên được tách thành các chiến lược cài đặt cùng một interface ' + IF + '. Lớp dịch vụ ' + SVC + ' không tự tính giảm giá mà nhận mảng một chiều các chiến lược từ bên ngoài.';
    var sections = [
      { title: '1. Lớp ' + C + ' (đóng gói)', items: [
        'Các trường private: _ma (chuỗi), _donGia (double), _soLuong (số nguyên).',
        'Hàm khởi tạo public ' + C + '(string ma, double donGia, int soLuong) và ném ArgumentException nếu ma rỗng hoặc toàn khoảng trắng (string.IsNullOrWhiteSpace), donGia nhỏ hơn 0, hoặc soLuong nhỏ hơn hoặc bằng 0; nếu hợp lệ thì gán ba trường.',
        'Thuộc tính public chỉ đọc: Ma, DonGia, SoLuong.',
        'Phương thức public double TongTien() trả về đơn giá nhân số lượng.'
      ] },
      { title: '2. Interface ' + IF, items: [
        'Khai báo phương thức double TinhGiam(' + C + ' d, bool laThanhVien) trả về số tiền giảm (0 nếu không áp dụng).',
        'Không khai báo trường thể hiện hoặc thân phương thức trong hợp đồng.'
      ] },
      { title: '3. Ba lớp chiến lược cài đặt ' + IF + ' (phương thức public TinhGiam)', items: [
        S1 + ': nếu số lượng d.SoLuong >= ' + minQty + ' thì trả về d.TongTien() nhân ' + pctQty + '; ngược lại trả về 0.',
        S2 + ': nếu laThanhVien đúng thì trả về d.TongTien() nhân ' + pctVip + '; ngược lại trả về 0.',
        S3 + ': nếu d.TongTien() >= ' + bigMin + ' thì trả về ' + bigOff + '; ngược lại trả về 0.'
      ] },
      { title: '4. Lớp ' + SVC, items: [
        'Trường private ' + IF + '[] _ds; hàm khởi tạo public ' + SVC + '(' + IF + '[] ds) gán mảng vào _ds.',
        'Phương thức public double TinhTien(' + C + ' d, bool laThanhVien): gán tong = d.TongTien(), double giam = 0; dùng foreach với biến g in _ds cộng g.TinhGiam(d, laThanhVien) vào giam; nếu giam > tong thì gán giam = tong; trả về tong - giam.'
      ] },
      { title: '5. Lớp Program', items: [
        'Hàm static void Mua(bool tv) dùng try ... catch (Exception ex) in ex.Message khi lỗi: nhập ma, donGia, soLuong; tạo ' + C + '; tạo mảng chienLuoc kiểu ' + IF + '[] gồm ba đối tượng ' + S1 + ', ' + S2 + ', ' + S3 + '; tạo ' + SVC + ' và in kết quả TinhTien(d, tv).',
        'Main(): vòng do ... while với biến chon (menu 1. Khach thuong, 2. Khach thanh vien, 0. Thoat); dùng switch có case 0 in "Tam biet" và nhánh default in "Sai lua chon".'
      ] }
    ];
    var code = `using System;

⟦class⟧ ${C}
{
    ⟦private⟧ ⟦string⟧ _ma;
    ⟦private⟧ ⟦double⟧ _donGia;
    private ⟦int⟧ _soLuong;

    ⟦public⟧ ⟦${C}⟧(string ma, double donGia, int soLuong)
    {
        ⟦if⟧ (⟦string⟧.⟦IsNullOrWhiteSpace⟧(ma) || donGia < 0 || soLuong <= 0)
            ⟦throw⟧ ⟦new⟧ ⟦ArgumentException⟧("Du lieu sai");
        ⟦_ma⟧ = ma; ⟦_donGia⟧ = donGia; ⟦_soLuong⟧ = soLuong;
    }

    ⟦public⟧ string ⟦Ma⟧ { ⟦get⟧ { ⟦return⟧ _ma; } }
    public ⟦double⟧ ⟦DonGia⟧ { ⟦get⟧ { return _donGia; } }
    public ⟦int⟧ ⟦SoLuong⟧ { get { ⟦return⟧ _soLuong; } }

    ⟦public⟧ ⟦double⟧ ⟦TongTien⟧() { ⟦return⟧ ⟦_donGia * _soLuong⟧; }
}

⟦interface⟧ ${IF}
{
    ⟦double⟧ ⟦TinhGiam⟧(${C} d, bool laThanhVien);
}

⟦class⟧ ${S1} : ⟦${IF}⟧
{
    ⟦public⟧ double TinhGiam(${C} d, bool laThanhVien)
    {
        ⟦if⟧ (d.⟦SoLuong⟧ >= ${minQty}) ⟦return⟧ d.⟦TongTien⟧() * ${pctQty};
        return 0;
    }
}

⟦class⟧ ${S2} : ⟦${IF}⟧
{
    ⟦public⟧ double TinhGiam(${C} d, bool laThanhVien)
    {
        ⟦if⟧ (⟦laThanhVien⟧) return d.⟦TongTien⟧() * ${pctVip};
        return 0;
    }
}

⟦class⟧ ${S3} : ⟦${IF}⟧
{
    public double TinhGiam(${C} d, bool laThanhVien)
    {
        ⟦if⟧ (d.TongTien() >= ⟦${bigMin}⟧) return ${bigOff};
        ⟦return⟧ 0;
    }
}

⟦class⟧ ${SVC}
{
    ⟦private⟧ ⟦${IF}⟧[] ⟦_ds⟧;
    ⟦public⟧ ${SVC}(${IF}[] ds) { ⟦_ds⟧ = ds; }

    ⟦public⟧ ⟦double⟧ ⟦TinhTien⟧(${C} d, bool laThanhVien)
    {
        ⟦double⟧ tong = d.TongTien();
        double giam = 0;
        ⟦foreach⟧ (⟦${IF}⟧ g ⟦in⟧ _ds)
            giam += g.⟦TinhGiam⟧(d, laThanhVien);
        ⟦if⟧ (giam > tong) giam = tong;
        ⟦return⟧ tong - giam;
    }
}

⟦class⟧ Program
{
    ⟦static⟧ ⟦void⟧ ⟦Mua⟧(bool tv)
    {
        ⟦try⟧
        {
            Console.Write("Ma: "); string ma = Console.⟦ReadLine⟧();
            Console.Write("Don gia: "); double gia = double.⟦Parse⟧(Console.ReadLine());
            Console.Write("So luong: "); int sl = int.Parse(Console.ReadLine());
            ${C} d = ⟦new⟧ ⟦${C}⟧(ma, gia, sl);
            ${IF}[] chienLuoc = ⟦new⟧ ${IF}[] { new ⟦${S1}⟧(), new ⟦${S2}⟧(), new ⟦${S3}⟧() };
            ${SVC} tt = new ⟦${SVC}⟧(chienLuoc);
            Console.WriteLine("Tong tien: " + tt.⟦TinhTien⟧(d, tv));
        }
        ⟦catch⟧ (⟦Exception⟧ ex) { Console.WriteLine(ex.⟦Message⟧); }
    }

    ⟦static⟧ void Main()
    {
        int chon;
        ⟦do⟧
        {
            Console.WriteLine("1. Khach thuong 2. Khach thanh vien 0. Thoat");
            chon = int.⟦Parse⟧(Console.ReadLine());
            ⟦switch⟧ (chon)
            {
                ⟦case⟧ 1: ⟦Mua⟧(⟦false⟧); break;
                ⟦case⟧ 2: Mua(⟦true⟧); ⟦break⟧;
                case 0: Console.WriteLine("Tam biet"); break;
                ⟦default⟧: Console.WriteLine("Sai lua chon"); ⟦break⟧;
            }
        } ⟦while⟧ (⟦chon != 0⟧);
    }
}`;
    var q = finish('polymorphism', scenario, intro, sections, code, rng, {
      minQty: minQty, qtyDiscount: pctQty, vipDiscount: pctVip, bigOrderMin: bigMin, bigOrderOff: bigOff
    }, bankId);
    q.source = 'Ảnh đề thi tự luận DUE E-Study — form Interface & Chiến lược (' + C + ' / ' + IF + ')';
    q.explain = 'Đề theo đúng form ảnh Chiến lược & Giao diện: lớp đóng gói ném ArgumentException kiểm tra dữ liệu, interface khai báo hợp đồng chung, 3 lớp chiến lược cài đặt và lớp dịch vụ tổng hợp qua foreach + try/catch.';
    return q;
  }

  function inheritanceAsMin(spec, rng, bankId) {
    var C = spec[0], noun = spec[1], A = spec[2], B = spec[3];
    var cap = spec[4], minYear = spec[5], rA = spec[6], fA = spec[7], rB = spec[8], fB = spec[9];
    var scenario = { cls: C, noun: noun };
    var intro = 'Viết chương trình console quản lý ' + noun + '. Có hai loại: ' + A + ' (phí bảo trì bằng ' + rA + ' giá cơ bản cộng số chỗ/định mức nhân ' + fA + ') và ' + B + ' (phí bảo trì bằng ' + rB + ' giá cơ bản cộng tải trọng/công suất nhân ' + fB + '). Hai lớp con kế thừa lớp ' + C + '. Dữ liệu lưu trong mảng một chiều kiểu lớp cơ sở, thao tác qua menu.';
    var sections = [
      { title: '1. Lớp ' + C, items: [
        'Các trường private: _bienSo (chuỗi), _nam (số nguyên); trường protected double _giaCB (số thực).',
        'Hàm khởi tạo public ' + C + '(string bienSo, int nam, double giaCB): gán _bienSo và _giaCB trực tiếp, gán năm qua thuộc tính Nam bằng this.Nam.',
        'Thuộc tính public: BienSo (chỉ đọc trả về _bienSo); Nam (đọc và ghi, phần set chỉ nhận value >= ' + minYear + ').',
        'Ghi đè public override string ToString() trả về _bienSo, _nam và _giaCB ngăn cách bởi " - ".'
      ] },
      { title: '2. Lớp ' + A + ' kế thừa ' + C, items: [
        'Trường private int _soCho; hàm khởi tạo public nhận (string bienSo, int nam, double giaCB, int soCho), gọi : base(bienSo, nam, giaCB) và gán _soCho.',
        'Phương thức public double PhiBaoTri() trả về _giaCB * ' + rA + ' + _soCho * ' + fA + '.',
        'Ghi đè ToString(): return base.ToString() + " - So cho: " + _soCho;'
      ] },
      { title: '3. Lớp ' + B + ' kế thừa ' + C, items: [
        'Trường private double _taiTrong; hàm khởi tạo public nhận (string bienSo, int nam, double giaCB, double taiTrong), gọi : base(bienSo, nam, giaCB) và gán _taiTrong.',
        'Phương thức public double PhiBaoTri() trả về _giaCB * ' + rB + ' + _taiTrong * ' + fB + '.',
        'Ghi đè ToString(): return base.ToString() + " - Tai trong: " + _taiTrong;'
      ] },
      { title: '4. Lớp Program', items: [
        'Khai báo static mảng ds kiểu ' + C + '[] gồm ' + cap + ' phần tử và static int n = 0.',
        'void Them(): nếu n >= ds.Length thì báo "Day" và return; ngược lại nhập bienSo, nam, giaCB, loai (1 là ' + A + ', 2 là ' + B + ') và thông số them (int/double); tạo đối tượng tương ứng lưu vào ds[n] rồi tăng n.',
        'void XuatDS(): duyệt bằng for và gọi Console.WriteLine(ds[i]) để in từng phần tử.',
        'void TongPhiBaoTri(): dùng double tong = 0; với mỗi phần tử dùng toán tử as thử ép sang ' + A + ' vào biến o; nếu o != null thì cộng o.PhiBaoTri() vào tong, ngược lại ép ((' + B + ')ds[i]).PhiBaoTri(); rồi in tong.',
        'void XeCuNhat(): nếu n == 0 báo "Rong" và return; gán ' + C + ' min = ds[0], duyệt i từ 1 đến n - 1 tìm phần tử có ds[i].Nam < min.Nam rồi in min.',
        'void Main(): vòng do ... while với biến chon (menu 1. Them, 2. Xuat, 3. Tong phi bao tri, 4. Cu nhat, 0. Thoat); dùng switch có case 0 in "Tam biet" và nhánh default in "Sai lua chon".'
      ] }
    ];
    var code = `using System;

⟦class⟧ ${C}
{
    ⟦private⟧ ⟦string⟧ _bienSo;
    private ⟦int⟧ _nam;
    ⟦protected⟧ ⟦double⟧ _giaCB;

    ⟦public⟧ ⟦${C}⟧(string bienSo, int nam, double giaCB)
    {
        ⟦_bienSo⟧ = bienSo;
        ⟦_giaCB⟧ = giaCB;
        ⟦this⟧.⟦Nam⟧ = nam;
    }

    public ⟦string⟧ ⟦BienSo⟧ { ⟦get⟧ { return ⟦_bienSo⟧; } }
    ⟦public⟧ ⟦int⟧ ⟦Nam⟧
    {
        get { ⟦return⟧ _nam; }
        ⟦set⟧ { ⟦if⟧ (⟦value >= ${minYear}⟧) ⟦_nam⟧ = value; }
    }

    ⟦public⟧ ⟦override⟧ string ⟦ToString⟧()
    {
        return _bienSo + " - " + _nam + " - " + ⟦_giaCB⟧;
    }
}

⟦class⟧ ${A} : ⟦${C}⟧
{
    ⟦private⟧ int ⟦_soCho⟧;

    public ⟦${A}⟧(string bienSo, int nam, double giaCB, int soCho) : ⟦base⟧(bienSo, nam, giaCB)
    {
        ⟦_soCho⟧ = soCho;
    }

    ⟦public⟧ ⟦double⟧ ⟦PhiBaoTri⟧() { return ⟦_giaCB⟧ * ${rA} + ⟦_soCho⟧ * ${fA}; }
    ⟦public⟧ override string ToString() { return ⟦base⟧.⟦ToString⟧() + " - So cho: " + _soCho; }
}

⟦class⟧ ${B} : ⟦${C}⟧
{
    ⟦private⟧ double ⟦_taiTrong⟧;

    public ⟦${B}⟧(string bienSo, int nam, double giaCB, double taiTrong) : ⟦base⟧(bienSo, nam, giaCB)
    {
        ⟦_taiTrong⟧ = taiTrong;
    }

    public double ⟦PhiBaoTri⟧() { return ⟦_giaCB⟧ * ${rB} + ⟦_taiTrong⟧ * ${fB}; }
    public override string ToString() { return base.ToString() + " - Tai trong: " + _taiTrong; }
}

⟦class⟧ Program
{
    ⟦static⟧ ⟦${C}⟧[] ds = ⟦new⟧ ⟦${C}⟧[${cap}];
    ⟦static⟧ int n = 0;

    static void Them()
    {
        ⟦if⟧ (n >= ds.⟦Length⟧) { Console.WriteLine("Day"); ⟦return⟧; }
        Console.Write("Bien so: "); ⟦string⟧ bs = Console.ReadLine();
        Console.Write("Nam: "); int nam = int.Parse(Console.ReadLine());
        Console.Write("Gia CB: "); ⟦double⟧ gia = double.Parse(Console.ReadLine());
        Console.Write("Loai (1-${A}, 2-${B}): "); int loai = int.Parse(Console.ReadLine());
        Console.Write("So cho hoac tai trong: "); double them = double.Parse(Console.ReadLine());
        ⟦if⟧ (loai == 1) ds[n] = ⟦new⟧ ⟦${A}⟧(bs, nam, gia, (int)them);
        ⟦else⟧ ds[n] = new ⟦${B}⟧(bs, nam, gia, them);
        ⟦n⟧++;
    }

    static void XuatDS()
    {
        ⟦for⟧ (int i = 0; i < n; i++) Console.WriteLine(ds[i]);
    }

    static void TongPhiBaoTri()
    {
        double tong = 0;
        for (int i = 0; i < n; i++)
        {
            ${A} o = ds[i] ⟦as⟧ ${A};
            if (o != ⟦null⟧) tong += o.⟦PhiBaoTri⟧();
            ⟦else⟧ tong += ((⟦${B}⟧)ds[i]).PhiBaoTri();
        }
        Console.WriteLine("Tong phi: " + ⟦tong⟧);
    }

    static void XeCuNhat()
    {
        if (n == 0) { Console.WriteLine("Rong"); return; }
        ⟦${C}⟧ min = ds[0];
        for (int i = 1; i < n; i++)
            if (ds[i].⟦Nam⟧ < min.Nam) ⟦min⟧ = ds[i];
        Console.WriteLine(min);
    }

    static void Main()
    {
        int chon;
        ⟦do⟧
        {
            Console.WriteLine("1. Them 2. Xuat 3. Tong phi bao tri 4. Cu nhat 0. Thoat");
            chon = int.Parse(Console.ReadLine());
            ⟦switch⟧ (chon)
            {
                ⟦case⟧ 1: ⟦Them⟧(); break;
                ⟦case⟧ 2: ⟦XuatDS⟧(); break;
                ⟦case⟧ 3: ⟦TongPhiBaoTri⟧(); break;
                ⟦case⟧ 4: ⟦XeCuNhat⟧(); break;
                case 0: Console.WriteLine("Tam biet"); break;
                ⟦default⟧: Console.WriteLine("Sai lua chon"); break;
            }
        } ⟦while⟧ (chon != 0);
    }
}`;
    var q = finish('inheritance', scenario, intro, sections, code, rng, {
      capacity: cap, minYear: minYear, rateA: rA, feeA: fA, rateB: rB, feeB: fB
    }, bankId);
    q.source = 'Ảnh đề thi tự luận DUE E-Study — form Kế thừa & toán tử as (' + C + ' / ' + A + ' / ' + B + ')';
    q.explain = 'Đề theo đúng form ảnh Kế thừa nâng cao: kiểm tra giá trị setter Nam, lớp dẫn xuất gọi : base(...), ghi đè base.ToString(), dùng toán tử as kiểm tra null trước khi ép kiểu tính tổng và tìm phần tử Nam nhỏ nhất.';
    return q;
  }

  function encapsulationChecked(spec, rng, bankId) {
    var C = spec[0], noun = spec[1], cap = spec[2];
    var scenario = { cls: C, noun: noun };
    var intro = 'Viết chương trình console quản lý ' + noun + ', lưu trong mảng một chiều, thao tác qua menu. Số dư chỉ được thay đổi qua các phương thức nạp và rút tiền.';
    var sections = [
      { title: '1. Lớp ' + C + ' (đóng gói)', items: [
        'Các trường private: _soTK (chuỗi), _chuTK (chuỗi), _soDu (số thực). Trường private static int _tongTK khởi tạo 0.',
        'Hàm khởi tạo public ' + C + '(string soTK, string chuTK, double soDu) ném ArgumentException("Du lieu sai") nếu soTK rỗng hoặc toàn khoảng trắng (string.IsNullOrWhiteSpace) hoặc soDu < 0; nếu hợp lệ thì gán ba trường và tăng _tongTK.',
        'Thuộc tính public chỉ đọc: SoTK, ChuTK, SoDu; thuộc tính public static int TongTK chỉ đọc trả về _tongTK.',
        'Phương thức public bool NapTien(double tien): nếu tien <= 0 trả về false; ngược lại cộng vào _soDu và trả về true.',
        'Phương thức public bool RutTien(double tien): nếu tien <= 0 hoặc tien > _soDu trả về false; ngược lại trừ _soDu và trả về true.',
        'Phương thức public void Xuat() in _soTK, _chuTK, _soDu ngăn cách bởi " - ".'
      ] },
      { title: '2. Lớp Program', items: [
        'Khai báo static mảng ds kiểu ' + C + '[] gồm ' + cap + ' phần tử và static int n = 0.',
        'static int Tim(string so): duyệt for tìm vị trí có ds[i].SoTK == so, không thấy trả về -1.',
        'static void MoTK(): nếu mảng đầy (n >= ds.Length) báo "Day" và return; ngược lại nhập so, chu, du, tạo đối tượng trong khối try ... catch (Exception ex) (in ex.Message khi lỗi); thành công thì lưu vào ds[n] rồi tăng n.',
        'static void GiaoDich(): nhập so, dùng Tim; nếu vt == -1 báo "Khong thay" và return; thấy thì nhập loại (1-Nap, 2-Rut) và số tiền, gọi NapTien/RutTien vào biến bool ok, in "Thanh cong" hoặc "That bai".',
        'static void XuatDS(): duyệt bằng for và gọi ds[i].Xuat(), sau đó in ' + C + '.TongTK.',
        'void Main(): vòng do ... while với biến chon (menu 1. Mo TK, 2. Giao dich, 3. Xuat, 0. Thoat); dùng switch có case 0 in "Tam biet" và nhánh default in "Sai lua chon".'
      ] }
    ];
    var code = `using System;

⟦class⟧ ${C}
{
    ⟦private⟧ ⟦string⟧ _soTK;
    private ⟦string⟧ _chuTK;
    ⟦private⟧ ⟦double⟧ _soDu;
    private ⟦static⟧ ⟦int⟧ _tongTK = 0;

    ⟦public⟧ ⟦${C}⟧(string soTK, string chuTK, double soDu)
    {
        if (⟦string⟧.⟦IsNullOrWhiteSpace⟧(soTK) || soDu < 0) ⟦throw⟧ ⟦new⟧ ⟦ArgumentException⟧("Du lieu sai");
        ⟦_soTK⟧ = soTK; ⟦_chuTK⟧ = chuTK; ⟦_soDu⟧ = soDu;
        ⟦_tongTK⟧++;
    }

    ⟦public⟧ string ⟦SoTK⟧ { ⟦get⟧ { ⟦return⟧ _soTK; } }
    ⟦public⟧ string ⟦ChuTK⟧ { get { return ⟦_chuTK⟧; } }
    ⟦public⟧ double ⟦SoDu⟧ { get { return ⟦_soDu⟧; } }
    public ⟦static⟧ int ⟦TongTK⟧ { get { return ⟦_tongTK⟧; } }

    ⟦public⟧ ⟦bool⟧ ⟦NapTien⟧(double tien)
    {
        ⟦if⟧ (tien <= 0) ⟦return⟧ ⟦false⟧;
        _soDu += tien;
        return ⟦true⟧;
    }

    ⟦public⟧ ⟦bool⟧ ⟦RutTien⟧(double tien)
    {
        if (tien <= 0 ⟦||⟧ tien > ⟦_soDu⟧) return false;
        _soDu ⟦-=⟧ tien;
        return true;
    }

    ⟦public⟧ ⟦void⟧ ⟦Xuat⟧()
    {
        Console.WriteLine(⟦_soTK⟧ + " - " + ⟦_chuTK⟧ + " - " + ⟦_soDu⟧);
    }
}

⟦class⟧ Program
{
    ⟦static⟧ ⟦${C}⟧[] ds = ⟦new⟧ ⟦${C}⟧[${cap}];
    ⟦static⟧ int n = 0;

    static ⟦int⟧ ⟦Tim⟧(string so)
    {
        ⟦for⟧ (int i = 0; i < n; i++)
            if (ds[i].⟦SoTK⟧ == so) ⟦return⟧ i;
        return -1;
    }

    static void MoTK()
    {
        ⟦if⟧ (n >= ds.⟦Length⟧) { Console.WriteLine("Day"); ⟦return⟧; }
        Console.Write("So TK: "); string so = Console.ReadLine();
        Console.Write("Chu TK: "); string chu = Console.ReadLine();
        Console.Write("So du: "); double du = double.Parse(Console.ReadLine());
        ⟦try⟧
        {
            ds[n] = new ${C}(so, chu, du);
            n++;
        }
        ⟦catch⟧ (⟦Exception⟧ ex) { Console.WriteLine(ex.⟦Message⟧); }
    }

    static void GiaoDich()
    {
        Console.Write("So TK: "); string so = Console.ReadLine();
        int vt = ⟦Tim⟧(so);
        if (vt == -1) { Console.WriteLine("Khong thay"); ⟦return⟧; }
        Console.Write("Loai (1-Nap, 2-Rut): "); int loai = int.Parse(Console.ReadLine());
        Console.Write("So tien: "); double tien = double.Parse(Console.ReadLine());
        ⟦bool⟧ ok;
        if (loai == 1) ok = ds[vt].⟦NapTien⟧(tien);
        ⟦else⟧ ok = ds[vt].⟦RutTien⟧(tien);
        Console.WriteLine(ok ? "Thanh cong" : "That bai");
    }

    static void XuatDS()
    {
        for (int i = 0; i < n; i++) ds[i].⟦Xuat⟧();
        Console.WriteLine("Tong TK: " + ⟦${C}⟧.⟦TongTK⟧);
    }

    static void Main()
    {
        int chon;
        ⟦do⟧
        {
            Console.WriteLine("1. Mo TK 2. Giao dich 3. Xuat 0. Thoat");
            chon = int.Parse(Console.ReadLine());
            ⟦switch⟧ (chon)
            {
                ⟦case⟧ 1: ⟦MoTK⟧(); break;
                ⟦case⟧ 2: ⟦GiaoDich⟧(); break;
                ⟦case⟧ 3: ⟦XuatDS⟧(); break;
                case 0: Console.WriteLine("Tam biet"); break;
                ⟦default⟧: Console.WriteLine("Sai lua chon"); break;
            }
        } ⟦while⟧ (chon != 0);
    }
}`;
    var q = finish('encapsulation', scenario, intro, sections, code, rng, { capacity: cap }, bankId);
    q.source = 'Ảnh đề thi tự luận DUE E-Study — form Đóng gói & Ngoại lệ (' + C + ')';
    q.explain = 'Đề theo đúng form ảnh Đóng gói bảo vệ số dư: constructor ném ArgumentException khi dữ liệu sai, bắt Exception ở hàm MoTK(), thuộc tính chỉ đọc và cập nhật qua NapTien/RutTien trả về bool.';
    return q;
  }

  var FORMS = ['encapsulation', 'inheritance', 'polymorphism'];
  var BANK_CACHE = null;

  function cloneEssay(q) {
    return {
      type: q.type,
      id: q.id,
      bankId: q.bankId,
      domainClass: q.domainClass,
      formVersion: q.formVersion,
      formId: q.formId,
      templateId: q.templateId,
      ch: q.ch,
      title: q.title,
      introduction: q.introduction,
      sections: q.sections.map(function (s) { return { title: s.title, items: s.items.slice() }; }),
      requirements: q.requirements.slice(),
      lines: q.lines.map(function (line) {
        return line.map(function (seg) { return typeof seg === 'string' ? seg : { b: seg.b }; });
      }),
      blanks: q.blanks.map(function (b) { return { ok: b.ok.slice(), explain: b.explain }; }),
      parameters: Object.assign({}, q.parameters),
      explain: q.explain,
      source: q.source
    };
  }

  function buildBank() {
    if (BANK_CACHE) return BANK_CACHE;
    var bank = [];
    var encapCaps = [25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 90, 100, 110, 120, 140, 150, 160, 180, 200, 250];
    var inhCaps = [30, 40, 50, 60, 70, 80, 90, 100];
    var inhDivisors = [20, 22, 24, 25, 26, 28, 30];
    var inhFees = [3000, 4000, 5000, 6000, 7500, 8000, 10000, 12000, 15000];
    var polyCaps = [30, 40, 50, 60, 70, 80, 90, 100];
    var polyMarkups = ['1.18', '1.2', '1.22', '1.25', '1.28', '1.3', '1.35'];
    var polyFees = [10000, 12000, 15000, 18000, 20000, 25000, 30000];
    var polyFoodMarkups = ['1.05', '1.08', '1.1', '1.12', '1.15'];
    var polyThresholds = [2, 3, 4, 5, 6, 7, 10];
    var polyDiscounts = ['0.5', '0.6', '0.65', '0.7', '0.75', '0.8'];

    var serial = 0;

    // 100 câu Đóng gói (25 lớp × 4 biến thể)
    for (var i = 0; i < 100; i++) {
      serial++;
      var cIdx = i % ENCAP.length;
      var v = Math.floor(i / ENCAP.length);
      var cap = encapCaps[(cIdx + v * 5) % encapCaps.length];
      var bId = 'essay-bank-' + String(serial).padStart(3, '0');
      var itemRng = mulberry32(100000 + serial * 97);
      bank.push(encapsulation(ENCAP[cIdx], itemRng, { capacity: cap }, bId));
    }

    // 100 câu Kế thừa (25 lớp × 4 biến thể)
    for (var j = 0; j < 100; j++) {
      serial++;
      var eIdx = j % EMPLOYEES.length;
      var v2 = Math.floor(j / EMPLOYEES.length);
      var bId2 = 'essay-bank-' + String(serial).padStart(3, '0');
      var itemRng2 = mulberry32(200000 + serial * 101);
      bank.push(inheritance(EMPLOYEES[eIdx], itemRng2, {
        capacity: inhCaps[(eIdx + v2 * 2) % inhCaps.length],
        divisor: inhDivisors[(eIdx + v2 * 2) % inhDivisors.length],
        pieceRate: inhFees[(eIdx + v2 * 2) % inhFees.length]
      }, bId2));
    }

    // 100 câu Đa hình (25 lớp × 4 biến thể)
    for (var k = 0; k < 100; k++) {
      serial++;
      var pIdx = k % PRODUCTS.length;
      var v3 = Math.floor(k / PRODUCTS.length);
      var bId3 = 'essay-bank-' + String(serial).padStart(3, '0');
      var itemRng3 = mulberry32(300000 + serial * 103);
      bank.push(polymorphism(PRODUCTS[pIdx], itemRng3, {
        capacity: polyCaps[(pIdx + v3 * 2) % polyCaps.length],
        markup: polyMarkups[(pIdx + v3 * 2) % polyMarkups.length],
        warrantyFee: polyFees[(pIdx + v3 * 2) % polyFees.length],
        foodMarkup: polyFoodMarkups[(pIdx + v3) % polyFoodMarkups.length],
        expiryDays: polyThresholds[(pIdx + v3 * 2) % polyThresholds.length],
        discount: polyDiscounts[(pIdx + v3) % polyDiscounts.length]
      }, bId3));
    }

    // 18 câu Giao diện & Chiến lược (form ảnh DonHang / IGiamGia)
    for (var s1 = 0; s1 < STRATEGY_SPECS.length; s1++) {
      serial++;
      var bIdS = 'essay-bank-' + String(serial).padStart(3, '0');
      bank.push(strategyInterface(STRATEGY_SPECS[s1], mulberry32(400000 + serial * 107), bIdS));
    }

    // 16 câu Kế thừa + as + Tìm min (form ảnh Xe / Oto / XeTai)
    for (var s2 = 0; s2 < FLEET_AS_SPECS.length; s2++) {
      serial++;
      var bIdF = 'essay-bank-' + String(serial).padStart(3, '0');
      bank.push(inheritanceAsMin(FLEET_AS_SPECS[s2], mulberry32(500000 + serial * 109), bIdF));
    }

    // 16 câu Đóng gói + ArgumentException + try/catch (form ảnh TaiKhoan)
    for (var s3 = 0; s3 < ACCOUNT_SPECS.length; s3++) {
      serial++;
      var bIdA = 'essay-bank-' + String(serial).padStart(3, '0');
      bank.push(encapsulationChecked(ACCOUNT_SPECS[s3], mulberry32(600000 + serial * 113), bIdA));
    }

    BANK_CACHE = bank;
    return BANK_CACHE;
  }

  var recentHistory = {
    encapsulation: new Set(),
    inheritance: new Set(),
    polymorphism: new Set()
  };

  function resetHistory() {
    recentHistory.encapsulation.clear();
    recentHistory.inheritance.clear();
    recentHistory.polymorphism.clear();
  }

  function generateFromBank(rng, options) {
    rng = typeof rng === 'function' ? rng : Math.random;
    options = options || {};
    var bank = buildBank();
    var excluded = new Set(Array.isArray(options.excludeIds) ? options.excludeIds : []);
    var useHistory = options.trackHistory !== false;
    var usedClasses = new Set();

    var forms = shuffle(rng, FORMS.concat([pick(rng, FORMS), pick(rng, FORMS)]));
    var picked = [];

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      var hist = useHistory ? recentHistory[form] : new Set();
      var candidates = bank.filter(function (q) {
        return q.formId === form &&
          !usedClasses.has(q.domainClass) &&
          !excluded.has(q.bankId) &&
          !excluded.has(q.id) &&
          !hist.has(q.bankId);
      });
      if (!candidates.length) {
        if (useHistory) hist.clear();
        candidates = bank.filter(function (q) {
          return q.formId === form &&
            !usedClasses.has(q.domainClass) &&
            !excluded.has(q.bankId) &&
            !excluded.has(q.id);
        });
      }
      if (!candidates.length) {
        candidates = bank.filter(function (q) {
          return q.formId === form && !usedClasses.has(q.domainClass);
        });
      }
      if (!candidates.length) {
        candidates = bank.filter(function (q) {
          return q.formId === form;
        });
      }
      var chosen = pick(rng, candidates) || bank[0];
      usedClasses.add(chosen.domainClass);
      excluded.add(chosen.bankId);
      if (useHistory) hist.add(chosen.bankId);
      picked.push(cloneEssay(chosen));
    }

    return picked;
  }

  function generate(rng, options) {
    if (options && (options.mode === 'exam' || options.fromBank || options.trackHistory || Array.isArray(options.excludeIds))) {
      return generateFromBank(rng, options);
    }
    rng = typeof rng === 'function' ? rng : Math.random;
    var forms = FORMS.concat([pick(rng, FORMS), pick(rng, FORMS)]);
    var pools = { encapsulation: shuffle(rng, ENCAP), inheritance: shuffle(rng, EMPLOYEES), polymorphism: shuffle(rng, PRODUCTS) };
    var make = { encapsulation: encapsulation, inheritance: inheritance, polymorphism: polymorphism };
    return shuffle(rng, forms).map(function (form) { return make[form](pools[form].pop(), rng); });
  }

  function getBank() {
    return buildBank().map(cloneEssay);
  }

  global.ExamEssay = {
    generate: generate,
    generateExam: generateFromBank,
    getBank: getBank,
    resetHistory: resetHistory,
    FORM_VERSION: 2,
    BANK_COUNTS: { encapsulation: 116, inheritance: 116, polymorphism: 118, total: 350 }
  };
})(typeof window !== 'undefined' ? window : globalThis);
