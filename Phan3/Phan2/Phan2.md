Ok, giờ tới đoạn “đầu não” của hệ thống format nè 😎\
Bước này mà làm chuẩn thì sau này ép Word đúng 100% không run tay.

Mình sẽ đi như này:

1. Mục tiêu của tầng profile format
1. Cấu trúc tổng thể của một profile format
1. Thiết kế chi tiết từng phần trong JSON profile
1. Cơ chế map từ doc\_nodes → profile → Word
1. Cơ chế kế thừa, ghi đè giữa các profile
1. Kiểm tra lại: với thiết kế này, có đạt được mục tiêu ban đầu không
-----
**1. Mục tiêu của tầng profile format**

Profile format là “bộ luật định dạng” cho tài liệu. Nó phải:

- Tách hoàn toàn khỏi nội dung, khỏi AI
- Diễn tả được **mọi quy định format** của một trường/khoa:
  - Lề, khổ giấy, số trang
  - Font, cỡ chữ, giãn dòng
  - Cách viết tiêu đề chương, mục
  - Cách đánh số chương, mục, hình, bảng, phương trình
  - Kiểu của mục lục, danh mục hình/bảng…
- Cho phép:
  - Có profile mặc định theo trường, khoa, loại báo cáo
  - Người dùng tinh chỉnh một phần (nếu cho phép)
- Dùng được cho 2 việc:
  - Xuất file Word: nhìn node → nhìn profile → tạo đoạn Word đúng 100%
  - Kiểm tra file Word: đọc Word → so với profile → báo nơi sai.

    Nói ngắn: **một profile = một bộ luật format đầy đủ, có thể “biên dịch” và “chấm điểm” tài liệu.**

    -----
    **2. Cấu trúc tổng thể của một profile format**

    Một profile format mình chia thành các khối:

- Thông tin chung: id, tên, phạm vi áp dụng
- Thiết lập trang: khổ giấy, lề, số trang, đầu trang/chân trang
- Bộ kiểu chữ (styles): font, size, giãn dòng, canh lề cho từng loại thành phần
- Luật đánh số: chương, mục, hình, bảng, phương trình…
- Luật sinh các phần tự động: mục lục, danh mục hình/bảng…
- Bảng map: node\_type + semantic\_role + level → style\_key, numbering\_key

Cấu trúc JSON sơ bộ:

{

`  `"id": "vnu\_cntt\_do\_an\_2025",

`  `"name": "ĐH X - Khoa CNTT - Đồ án tốt nghiệp 2025",

`  `"scope": {

`    `"school\_id": "dh\_x",

`    `"faculty\_id": "cntt",

`    `"program\_type": "do\_an\_tot\_nghiep"

`  `},

`  `"page": { ... },

`  `"styles": { ... },

`  `"numbering": { ... },

`  `"generated": { ... },

`  `"mapping": { ... }

}

Sau đây mình đi sâu từng phần.

-----
**3. Thiết kế chi tiết từng phần trong JSON profile**

**3.1. Phần page: khổ giấy, lề, số trang**

Đây là phần quy định những thứ chung cho cả tài liệu.

Ví dụ:

"page": {

`  `"size": "A4",

`  `"orientation": "portrait",

`  `"margin": {

`    `"top": 2.5,

`    `"bottom": 2.5,

`    `"left": 3.5,

`    `"right": 2.0

`  `},

`  `"header": {

`    `"enabled": true,

`    `"different\_first\_page": true,

`    `"content": null

`  `},

`  `"footer": {

`    `"enabled": true,

`    `"different\_first\_page": true,

`    `"page\_number": {

`      `"position": "bottom\_center",

`      `"start\_from": 1,

`      `"apply\_from\_section": "main"

`    `}

`  `},

`  `"paragraph\_defaults": {

`    `"font": "Times New Roman",

`    `"size": 13,

`    `"line\_spacing": 1.5,

`    `"align": "justify",

`    `"spacing\_before": 0,

`    `"spacing\_after": 0,

`    `"first\_line\_indent": 1.25

`  `}

}

Giải thích:

- margin: đầy đủ 4 lề, đơn vị cm
- footer.page\_number.apply\_from\_section = "main": ví dụ nhiều trường yêu cầu:
  - Phần đầu không đánh số hoặc đánh kiểu La Mã
  - Phần nội dung chính bắt đầu đếm 1 trở đi

paragraph\_defaults là giá trị mặc định cho đoạn văn thường, để sau chỉ override khi cần.

-----
**3.2. Phần styles: bộ kiểu chữ cho từng loại thành phần**

Đây là nơi định nghĩa các style\_key mà doc\_nodes sẽ trỏ tới.

Ví dụ:

"styles": {

`  `"TitleMain": {

`    `"based\_on\_default": false,

`    `"font": "Times New Roman",

`    `"size": 16,

`    `"bold": true,

`    `"italic": false,

`    `"all\_caps": true,

`    `"align": "center",

`    `"line\_spacing": 1.5,

`    `"spacing\_before": 0,

`    `"spacing\_after": 12

`  `},

`  `"ChapterHeading": {

`    `"based\_on\_default": false,

`    `"font": "Times New Roman",

`    `"size": 16,

`    `"bold": true,

`    `"all\_caps": true,

`    `"align": "center",

`    `"line\_spacing": 1.5,

`    `"spacing\_before": 24,

`    `"spacing\_after": 12,

`    `"keep\_with\_next": true

`  `},

`  `"SectionLevel1": {

`    `"based\_on\_default": true,

`    `"font": "Times New Roman",

`    `"size": 14,

`    `"bold": true,

`    `"align": "left",

`    `"spacing\_before": 12,

`    `"spacing\_after": 6

`  `},

`  `"SectionLevel2": {

`    `"based\_on\_default": true,

`    `"font": "Times New Roman",

`    `"size": 13,

`    `"bold": true,

`    `"italic": false,

`    `"align": "left",

`    `"spacing\_before": 6,

`    `"spacing\_after": 3

`  `},

`  `"BodyText": {

`    `"based\_on\_default": true

`  `},

`  `"FigureCaption": {

`    `"based\_on\_default": true,

`    `"size": 12,

`    `"italic": true,

`    `"align": "center",

`    `"spacing\_before": 6,

`    `"spacing\_after": 6

`  `},

`  `"TableCaption": {

`    `"based\_on\_default": true,

`    `"size": 12,

`    `"bold": true,

`    `"align": "center",

`    `"spacing\_before": 6,

`    `"spacing\_after": 6

`  `},

`  `"ReferenceItem": {

`    `"based\_on\_default": true,

`    `"hanging\_indent": 1.0,

`    `"spacing\_before": 0,

`    `"spacing\_after": 3

`  `}

}

Giải thích:

- Mỗi khóa dưới styles là một style\_key: "BodyText", "ChapterHeading",…
- based\_on\_default = true nghĩa là lấy từ page.paragraph\_defaults, chỉ override chỗ nào khai báo.
- Các thuộc tính quan trọng:
  - font, size, bold, italic, underline, all\_caps
  - align: left, right, center, justify
  - line\_spacing: ví dụ 1.5 dòng
  - spacing\_before, spacing\_after: khoảng cách trước/sau đoạn (pt)
  - first\_line\_indent, left\_indent, right\_indent
  - keep\_with\_next: giữ không tách khỏi dòng kế tiếp (dùng cho tiêu đề)
  - outline\_level: giúp Word hiểu cấp độ tiêu đề nếu cần

Engine xuất Word sẽ:

- Tạo style tương ứng trong file docx
- Áp cho đoạn phù hợp.
-----
**3.3. Phần numbering: luật đánh số chương, mục, hình, bảng**

Đây là nơi quyết định việc:

- Chương hiển thị dạng gì
- Mục hiển thị dạng gì
- Hình, bảng đánh số theo chương hay toàn văn…

Ví dụ:

"numbering": {

`  `"chapter": {

`    `"pattern": "CHƯƠNG {n}: {title}",

`    `"scope": "document",

`    `"start\_from": 1

`  `},

`  `"section\_level\_1": {

`    `"pattern": "{chapter}.{n}",

`    `"scope": "chapter",

`    `"start\_from": 1

`  `},

`  `"section\_level\_2": {

`    `"pattern": "{chapter}.{section\_1}.{n}",

`    `"scope": "section\_level\_1",

`    `"start\_from": 1

`  `},

`  `"figure": {

`    `"pattern": "Hình {chapter}.{n}",

`    `"scope": "chapter",

`    `"start\_from": 1,

`    `"caption\_prefix": "",

`    `"caption\_suffix": ""

`  `},

`  `"table": {

`    `"pattern": "Bảng {chapter}.{n}",

`    `"scope": "chapter",

`    `"start\_from": 1

`  `},

`  `"equation": {

`    `"pattern": "({chapter}.{n})",

`    `"scope": "chapter",

`    `"start\_from": 1,

`    `"align": "right"

`  `}

}

Giải thích:

- pattern: chuỗi mẫu, engine sẽ thay các biến:
  - n: số thứ tự trong phạm vi
  - chapter: số chương hiện tại
  - section\_1, section\_2: số mục cha…
- scope:
  - "document": đếm từ đầu đến cuối tài liệu
  - "chapter": mỗi chương reset lại 1
  - "section\_level\_1": trong mỗi mục 1.x, đánh số lại…
- Với figure, table, engine sẽ:
  - Tính số tương ứng
  - Tạo dòng chú thích: "Hình 2.3: Sơ đồ kiến trúc hệ thống"
  - Bám theo style FigureCaption hoặc TableCaption.
-----
**3.4. Phần generated: luật sinh mục lục, danh mục hình/bảng…**

Các phần như mục lục không cho user gõ tay, mà sinh tự động từ cây doc\_nodes, theo luật trong generated.

Ví dụ:

"generated": {

`  `"toc": {

`    `"enabled": true,

`    `"include": [

`      `{ "node\_type": "chapter" },

`      `{ "node\_type": "section", "max\_level": 2 }

`    `],

`    `"styles": {

`      `"chapter": "TOCLevel1",

`      `"section\_level\_1": "TOCLevel2",

`      `"section\_level\_2": "TOCLevel3"

`    `},

`    `"page\_number\_align": "right",

`    `"leader": "dots"

`  `},

`  `"figure\_list": {

`    `"enabled": true,

`    `"style": "FigureListItem",

`    `"caption\_source": "figure",

`    `"include\_number": true

`  `},

`  `"table\_list": {

`    `"enabled": true,

`    `"style": "TableListItem",

`    `"caption\_source": "table",

`    `"include\_number": true

`  `}

}

Giải thích:

- toc.include quy định những node nào đưa vào mục lục, tới cấp độ mấy
- styles quy định dòng tương ứng trong mục lục dùng style nào
- page\_number\_align, leader để tạo hiệu ứng chấm chấm dẫn tới số trang.
-----
**3.5. Phần mapping: cầu nối giữa doc\_nodes và profile**

Đây là phần rất quan trọng:\
Từ node\_type, semantic\_role, level → chọn ra style\_key, numbering\_key, một số cờ đặc biệt.

Ví dụ:

"mapping": {

`  `"chapter": {

`    `"default": {

`      `"style\_key": "ChapterHeading",

`      `"numbering\_key": "chapter",

`      `"show\_number": true

`    `}

`  `},

`  `"section": {

`    `"level\_1": {

`      `"style\_key": "SectionLevel1",

`      `"numbering\_key": "section\_level\_1",

`      `"show\_number": true

`    `},

`    `"level\_2": {

`      `"style\_key": "SectionLevel2",

`      `"numbering\_key": "section\_level\_2",

`      `"show\_number": true

`    `}

`  `},

`  `"paragraph": {

`    `"default": {

`      `"style\_key": "BodyText"

`    `},

`    `"by\_semantic\_role": {

`      `"front\_acknowledgement": {

`        `"style\_key": "BodyText"

`      `},

`      `"front\_abstract\_vi": {

`        `"style\_key": "BodyText"

`      `},

`      `"front\_declaration": {

`        `"style\_key": "BodyText"

`      `},

`      `"back\_reference\_item": {

`        `"style\_key": "ReferenceItem"

`      `}

`    `}

`  `},

`  `"figure": {

`    `"default": {

`      `"caption\_style\_key": "FigureCaption",

`      `"numbering\_key": "figure"

`    `}

`  `},

`  `"table": {

`    `"default": {

`      `"caption\_style\_key": "TableCaption",

`      `"numbering\_key": "table"

`    `}

`  `},

`  `"cover\_page": {

`    `"fields": {

`      `"school\_name": { "style\_key": "CoverSchoolName" },

`      `"faculty\_name": { "style\_key": "CoverFacultyName" },

`      `"title\_main": { "style\_key": "TitleMain" },

`      `"student\_info": { "style\_key": "CoverStudentInfo" },

`      `"teacher\_info": { "style\_key": "CoverTeacherInfo" },

`      `"year": { "style\_key": "CoverYear" }

`    `}

`  `}

}

Cách sử dụng mapping khi xuất Word:

- Lấy 1 node từ doc\_nodes, ví dụ:
  - node\_type = section
  - level = 1
  - semantic\_role = null
- Engine tìm:
  - Nhánh mapping.section.level\_1 → ra style\_key = SectionLevel1, numbering\_key = section\_level\_1
  - Nếu có semantic\_role đặc biệt và bạn khai trong by\_semantic\_role, sẽ override style\_key.
- Với paragraph:
  - Nếu semantic\_role là back\_reference\_item → dùng ReferenceItem
  - Nếu không → dùng BodyText.

Về mặt thiết kế, đây chính là “bảng quyết định”:

“Node loại X, vai trò Y, cấp Z → áp style nào, đánh số kiểu gì.”

Sau này nếu một trường yêu cầu đoạn tóm tắt khác style, ta chỉ cần sửa profile, không đổi code.

-----
**4. Engine sử dụng profile như thế nào?**

**4.1. Khi xuất Word**

Quy trình:

1. Đọc documents và cây doc\_nodes
1. Đọc profile format tương ứng
1. Đối với mỗi node:
   1. Tìm mapping phù hợp
   1. Lấy style\_key, numbering\_key
   1. Nếu có numbering\_key, dùng mục numbering để tính chuỗi số và tiêu đề
1. Dùng thư viện xử lý docx:
   1. Tạo đoạn, gán style
   1. Chèn text với số chương, số mục, chú thích hình/bảng…
   1. Áp lề, header, footer, số trang, sinh mục lục/danh mục…

Vì tất cả đều là **quy tắc mã hoá**, nên kết quả đầu ra là xác định, không phụ thuộc “hứng” của AI.

**4.2. Khi kiểm tra một file Word**

Nếu bạn làm chức năng chấm lại:

1. Đọc docx → chuyển thành cây tương tự doc\_nodes hoặc ít nhất là list đoạn, style, nội dung
1. Dựa vào vị trí, nội dung, bạn khôi phục lại:
   1. Đoạn nào là chapter, đoạn nào là section, đoạn nào là body
   1. Đoạn nào là caption hình, caption bảng…
1. So sánh với profile:
   1. Đo style ứng với loại đó
   1. Đo lề trang, giãn dòng, số trang…
1. Sinh báo cáo:
   1. Danh sách lỗi:
      1. “Chương 2: đang font 14, quy định 16”
      1. “Đoạn văn ở trang 5: giãn dòng 1.15, quy định 1.5”
      1. “Bảng 3.1: chú thích không canh giữa”
-----
**5. Cơ chế kế thừa giữa các profile**

Để hệ thống dùng được cho nhiều trường, nhiều khoa, nhiều năm, bạn nên cho phép:

- 1 profile gốc dùng chung
- Profile trường kế thừa profile gốc
- Profile khoa kế thừa profile trường
- Profile chương trình (đồ án, luận văn) kế thừa profile khoa
- Profile người dùng có thể override một ít nữa nếu được phép

Cách làm:

- Trong JSON có thêm:

"extends": "base\_vn\_academic\_13pt"

- Khi load profile, engine sẽ:
  - Đọc profile cha
  - Trộn với profile con:
    - styles của con ghi đè các khóa trùng
    - numbering của con ghi đè từng khóa trùng
    - mapping của con ghi đè phần con định nghĩa lại
    - Phần không ghi đè thì kế thừa

Như vậy:

- Ta có thể định nghĩa:
  - Một profile gốc cho “chuẩn Việt Times 13, giãn dòng 1.5”
  - Trường nào hơi khác chỉ cần override vài chỗ
  - Khoa nào khác nữa lại override thêm
-----
**6. Check lại mục tiêu: đã giải quyết được vấn đề ban đầu chưa?**

**6.1. “Al có thể tạo nội dung, xuất file 50% chuẩn, còn 50% format vẫn phải chỉnh tay”**

→ Với kiến trúc này:

- AI chỉ lo phần **nội dung** trên cây doc\_nodes
- Toàn bộ format do:
  - styles
  - numbering
  - page
  - mapping\
    quyết định.

Bạn có thể:

- Thiết lập 1 profile chuẩn theo tài liệu hướng dẫn của trường
- Đảm bảo mọi tài liệu dùng profile này khi xuất Word đều:
  - Lề đúng
  - Font đúng
  - Cỡ chữ đúng
  - Giãn dòng đúng
  - Đánh số chương, mục, hình, bảng đúng
  - Mục lục, danh mục hình/bảng đúng

**6.2. “Làm sao trực quan hóa và cho người dùng tự setting format từng thành phần”**

Với cấu trúc trên, cực dễ để làm UI:

- Lấy styles, numbering, mapping ra
- Hiển thị:
  - Danh sách “thành phần” (chương, mục, đoạn, hình, bảng, tham khảo…)
  - Cho user chỉnh: font, size, giãn dòng, mẫu đánh số…
- Khi user lưu, ta chỉ việc cập nhật JSON profile, engine auto đổi cách xuất file.
-----
**Tiếp theo nên làm gì?**

Bước 2 coi như đã “đóng khung”:

- Mình đã có:
  - Hình dạng profile format
  - Các phần chính: page, styles, numbering, generated, mapping
  - Cách nó kết nối với mô hình doc\_nodes
  - Cơ chế kế thừa

Bước tiếp theo hợp lý là:

👉 Thiết kế chi tiết **luồng xử lý xuất Word**:

- Đi qua cây doc\_nodes + profile → tạo file Word từng phần một
- Quy tắc xử lý từng node cụ thể: cover\_page, front, chapter, section, paragraph, figure, table, reference…

Hoặc nếu bạn muốn ưu tiên phía người dùng:

👉 Thiết kế **UI “phòng lab format”** dựa trên JSON profile này:

- Màn hình chỉnh style từng thành phần + preview
- Màn hình chỉnh luật đánh số chương, mục, hình, bảng…

Bạn muốn đi tiếp hướng “engine xuất Word” hay hướng “UI chỉnh format” trước, nói 1 câu, mình đào sâu tiếp cho.

