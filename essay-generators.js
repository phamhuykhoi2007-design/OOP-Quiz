/* Sinh biến thể trong ĐÚNG ba form ảnh: đóng gói, kế thừa, đa hình.
   ⟦...⟧ đánh dấu vị trí có thể khuyết; không xóa hàng loạt từ khóa.
   Không đọc file, gọi mạng hay AI khi người học tạo đề. */
(function (global) {
  'use strict';
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
  function finish(form, scenario, introduction, sections, code, rng, parameters) {
    var built = cloze(code, rng);
    return {
      type: 'essay', id: 'essay-v2-' + form + '-' + scenario.cls + '-' + Math.floor(rng() * 0x100000000).toString(36),
      formVersion: 2, formId: form, templateId: 'essay-' + form,
      ch: { encapsulation: 3, inheritance: 4, polymorphism: 5 }[form],
      title: 'Quản lý ' + scenario.noun + ' — ' + scenario.cls,
      introduction: introduction, sections: sections,
      requirements: [introduction].concat(sections.map(function (s) { return s.title + ': ' + s.items.join(' '); })),
      lines: built.lines, blanks: built.blanks, parameters: parameters,
      explain: 'Đề giữ đúng form ' + { encapsulation: 'đóng gói: constructor, property có kiểm tra dữ liệu, bộ đếm static; các hàm quản lý tách riêng trong Program.',
        inheritance: 'kế thừa: hai lớp con gọi base, ghi đè ToString; tính tổng bằng is và ép kiểu, không thay bằng phương thức lương virtual.',
        polymorphism: 'đa hình: lớp trừu tượng, trường giá gốc private qua property, abstract/override, virtual Xuat và gọi base.Xuat; sắp xếp qua phương thức đa hình.' }[form],
      source: 'Ảnh đề thi tự luận đã cung cấp — form ' + { encapsulation: 'quản lý sách', inheritance: 'quản lý nhân viên', polymorphism: 'quản lý sản phẩm trừu tượng' }[form]
    };
  }
  var ENCAP = [
    { cls: 'Sach', noun: 'sách của thư viện' }, { cls: 'ThietBi', noun: 'thiết bị của phòng thực hành' },
    { cls: 'DoDung', noun: 'đồ dùng của cửa hàng' }, { cls: 'VeThamQuan', noun: 'vé tham quan' },
    { cls: 'DungCu', noun: 'dụng cụ của kho' }, { cls: 'HocLieu', noun: 'học liệu của trung tâm' }
  ];
  var EMPLOYEES = ['NhanVien', 'NhanSu', 'CanBo', 'NguoiLaoDong', 'NhanVienCongTy', 'NhanVienChiNhanh'].map(function (name, i) {
    var company = ['Minh An', 'Đại Phát', 'Bình Minh', 'Hoàng Gia', 'Tân Tiến', 'Đông Phương'][i];
    return { cls: name, noun: 'nhân viên của công ty ' + company, office: name + 'VanPhong', production: name + 'SanXuat' };
  });
  var PRODUCTS = ['SanPham', 'HangHoa', 'MatHang', 'SanPhamCuaHang', 'HangKinhDoanh', 'SanPhamBan'].map(function (name, i) {
    var shop = ['An Phú', 'Minh Khang', 'Tiện Ích', 'Phúc Lộc', 'Gia Đình', 'Ánh Dương'][i];
    return { cls: name, noun: 'sản phẩm của cửa hàng ' + shop, electronic: name === 'SanPham' ? 'HangDienTu' : name + 'DienTu', food: name === 'SanPham' ? 'HangThucPham' : name + 'ThucPham' };
  });

  function encapsulation(s, rng) {
    var C = s.cls, capacity = pick(rng, [30, 40, 50, 60, 80, 100]);
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
    return finish('encapsulation', s, intro, sections, code, rng, { capacity: capacity });
  }

  function inheritance(s, rng) {
    var C = s.cls, A = s.office, B = s.production;
    var capacity = pick(rng, [30, 40, 50, 60]), divisor = pick(rng, [22, 24, 26]), fee = pick(rng, [3000, 5000, 7500, 10000]);
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
    return finish('inheritance', s, intro, sections, code, rng, { capacity: capacity, divisor: divisor, pieceRate: fee });
  }

  function polymorphism(s, rng) {
    var C = s.cls, A = s.electronic, B = s.food, capacity = pick(rng, [30, 40, 50, 60, 80]);
    var markup = pick(rng, ['1.1', '1.15', '1.2', '1.25']), fee = pick(rng, [10000, 15000, 20000, 25000]);
    var foodMarkup = pick(rng, ['1.05', '1.1', '1.15']), threshold = pick(rng, [2, 3, 5, 7]), discount = pick(rng, ['0.5', '0.6', '0.7']);
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
      { capacity: capacity, markup: markup, warrantyFee: fee, foodMarkup: foodMarkup, expiryDays: threshold, discount: discount });
  }
  var FORMS = ['encapsulation', 'inheritance', 'polymorphism'];
  function generate(rng) {
    rng = typeof rng === 'function' ? rng : Math.random;
    var forms = FORMS.concat([pick(rng, FORMS), pick(rng, FORMS)]);
    var pools = { encapsulation: shuffle(rng, ENCAP), inheritance: shuffle(rng, EMPLOYEES), polymorphism: shuffle(rng, PRODUCTS) };
    var make = { encapsulation: encapsulation, inheritance: inheritance, polymorphism: polymorphism };
    return shuffle(rng, forms).map(function (form) { return make[form](pools[form].pop(), rng); });
  }
  global.ExamEssay = { generate: generate, FORM_VERSION: 2 };
})(typeof window !== 'undefined' ? window : globalThis);
