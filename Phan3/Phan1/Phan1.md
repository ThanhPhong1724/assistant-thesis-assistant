Mình sẽ chia như này:

1. Mục tiêu của mô hình tài liệu
1. Tư duy tổng quát: 3 tầng dữ liệu
1. Định nghĩa các loại khối cần có trong đồ án/luận văn Việt
1. Thiết kế cấu trúc dữ liệu chi tiết (bảng / trường / enum)
1. Ví dụ minh hoạ một luận văn dưới dạng cây
-----
**1. Mục tiêu mô hình tài liệu**

Mô hình này phải giúp mình:

- Tách **nội dung** ra khỏi **format** hoàn toàn
- Biết chính xác **mỗi đoạn đang là cái gì**:
  - Tiêu đề chương, mục
  - Đoạn văn thường
  - Chú thích hình
  - Bảng, hình, công thức
  - Tài liệu tham khảo, phụ lục…
- Đủ thông tin để sau này:
  - Áp profile format → sinh Word đúng 100%
  - Kiểm tra ngược Word → báo lỗi format
- Dễ cho AI “bơm nội dung” vào:
  - AI chỉ điền nội dung vào **đúng node** (mục 1.1, 2.3…),
  - Không sờ vào font, cỡ chữ, lề.
-----
**2. Tư duy tổng quát: tài liệu = cây 3 tầng**

Mình chia mô hình thành 3 tầng:

1. **Tài liệu**
   1. Thông tin chung: đề tài, trường, khoa, loại, năm…
   1. Nối với cây nội dung.
1. **Khối (block)** – tầng quan trọng nhất
   1. Mỗi khối là một node trong cây: chương, mục, đoạn văn, bảng, hình,…
   1. Các khối có quan hệ cha – con, thứ tự.
1. **Nội dung trong khối (inline)**
   1. Text + in đậm, nghiêng, trích dẫn, chèn citation, công thức…
   1. Tầng này có thể làm đơn giản trước (chỉ text), sau nâng cấp sau.

Ở bước 1, mình focus mạnh vào **tầng 2 – block** (vì đây là thứ quyết định format), nhưng vẫn phác qua tầng 1 và 3 để không bị hở.

-----
**3. Các loại khối bắt buộc phải support cho đồ án/luận văn Việt**

**3.1. Cấu trúc lớn của tài liệu**

Một đồ án/luận văn chuẩn Việt thường có:

1. **Phần đầu (front)**
   1. Trang bìa
   1. Trang phụ bìa (nếu có)
   1. Lời cảm ơn
   1. Lời cam đoan
   1. Tóm tắt
   1. Mục lục
   1. Danh mục hình
   1. Danh mục bảng
   1. Danh mục từ viết tắt (nếu có)
1. **Phần nội dung chính (main)**
   1. Chương 1, 2, 3,…
   1. Trong mỗi chương: mục, tiểu mục, đoạn văn, hình, bảng, công thức,…
1. **Phần cuối (back)**
   1. Tài liệu tham khảo
   1. Phụ lục

=> Mình cần mô hình hoá được **3 khối lớn**: front, main, back.

-----
**3.2. Các loại node chính (block-level)**

Mình đề xuất bộ node sau (mỗi node là một loại khối):

1. DocumentRoot
1. SectionGroup
   1. Đại diện cho “front”, “main”, “back”.
1. Chapter
   1. Chương 1, 2, 3…
1. Section
   1. Mục 1.1, 1.2… (level 1)
   1. Mục 1.1.1… (level 2)
   1. Có field level để phân biệt.
1. Paragraph
   1. Đoạn văn thường.
   1. Có semantic\_role để biết nó là:
      1. Đoạn thân bài
      1. Lời cảm ơn
      1. Tóm tắt
      1. Lời cam đoan
      1. Đoạn trong phụ lục…
1. List + ListItem
   1. Danh sách gạch đầu dòng / đánh số.
1. TableBlock
   1. Bảng.
   1. Chứa: số cột, dữ liệu ô, có header không…
1. FigureBlock
   1. Hình.
   1. Chứa: đường dẫn ảnh, chú thích.
1. EquationBlock
   1. Công thức (nếu bạn support sau).
   1. Chứa: biểu thức dạng LaTeX hoặc gì đó.
1. ReferenceList
   1. Phần “Tài liệu tham khảo”.
1. ReferenceItem
   1. Từng tài liệu tham khảo.
1. GeneratedBlock
   1. Mục lục
   1. Danh mục hình
   1. Danh mục bảng
   1. Danh mục từ viết tắt
   1. Kiểu này là “node tự sinh”, không cho sửa nội dung trực tiếp, chỉ chỉnh qua rule.
1. CoverPageBlock
   1. Trang bìa: trường, khoa, đề tài, tên SV, GVHD, năm…
   1. Cấu trúc riêng, không chỉ là một đoạn text.

Tuỳ phiên bản, mình có thể gom một số loại lại, nhưng set này là đủ để “chơi” đồ án/luận văn ngon lành.

-----
**4. Thiết kế cấu trúc dữ liệu chi tiết**

Đây là phần hardcore. Mình sẽ thiết kế theo kiểu:

- Bảng documents – đại diện cho mỗi đồ án/luận văn
- Bảng doc\_nodes – lưu toàn bộ cây block
- Trường node\_type, semantic\_role, data\_json để linh hoạt
- Sau này style sẽ map qua style\_key (tới bước 2)

**4.1. Bảng documents**

documents

\---------

id                  PK

user\_id             FK (nếu có đăng nhập)

title               tiêu đề đề tài

school\_id           trường

faculty\_id          khoa

program\_type        loại: do\_an\_mon, do\_an\_tot\_nghiep, khoa\_luan, luan\_van

year                năm thực hiện

status              trạng thái: draft, in\_progress, done

created\_at

updated\_at

-----
**4.2. Bảng doc\_nodes – cây khối nội dung**

Đây là chỗ quan trọng nhất.

doc\_nodes

\---------

id                  PK

document\_id         FK -> documents.id

parent\_id           FK -> doc\_nodes.id (null nếu là root)

position            thứ tự trong danh sách con của parent (0,1,2,...)

node\_type           loại khối (enum):

`                    `- document\_root

`                    `- section\_group

`                    `- chapter

`                    `- section

`                    `- paragraph

`                    `- list

`                    `- list\_item

`                    `- table

`                    `- figure

`                    `- equation

`                    `- reference\_list

`                    `- reference\_item

`                    `- generated\_block

`                    `- cover\_page

section\_group\_type  dùng khi node\_type = section\_group:

`                    `- front

`                    `- main

`                    `- back

level               nếu node\_type = section:

`                    `1 = mục 1.x

`                    `2 = mục 1.x.y

`                    `3 = sâu hơn (nếu cần)

`                    `nếu là chapter: có thể là 0 hoặc 1

`                    `node khác = null

semantic\_role       vai trò ngữ nghĩa chi tiết hơn, ví dụ:

`                    `- front\_acknowledgement

`                    `- front\_declaration

`                    `- front\_abstract

`                    `- main\_body\_paragraph

`                    `- main\_quote

`                    `- main\_list\_paragraph

`                    `- back\_reference\_item

`                    `- cover\_title

`                    `- cover\_student\_info

`                    `- cover\_teacher\_info

...

`                    `(cho phép null nếu không cần phân biệt)



style\_key           khoá để map sang profile format về sau

numbering\_key       khoá để áp quy tắc đánh số:

`                    `- chapter

`                    `- section\_level\_1

`                    `- section\_level\_2

`                    `- figure

`                    `- table

`                    `- equation

`                    `- reference\_item

...



content\_plain       text thô (đoạn văn, tiêu đề, mục list, reference)

inline\_json         JSON mô tả inline (in đậm, nghiêng, citation...) – có thể để null ở V1

data\_json           JSON tùy loại node:

`                    `- table: {columns: [...], rows: [...]}

`                    `- figure: {image\_url: "...", alt\_text: "..."}

`                    `- equation: {latex: "..."}

`                    `- cover\_page: {fields: {...}}

`                    `- generated\_block: {generated\_type: "toc" | "figure\_list" | ...}



is\_generated        bool: true nếu node này sinh tự động (mục lục, danh mục hình...)

origin              nguồn tạo:

`                    `- user

`                    `- ai

`                    `- import

**Giải thích thêm một chút:**

- node\_type cho mình biết đây là gì ở cấp “thô”: đoạn, chương, bảng, hình…
- semantic\_role cho mình biết nó là loại đoạn nào, để gán style đúng hơn.
  - Ví dụ: 2 đoạn cùng là paragraph, nhưng:
    - cái là “lời cảm ơn”
    - cái là “đoạn thân bài chương 1”\
      → Có thể dùng 2 style khác nhau.
- style\_key: chính là “nhãn” để sau này map sang profile format (bước 2).
- data\_json: giúp doc\_nodes không bị nát thành quá nhiều bảng.
  - Bảng/hình/phương trình phức tạp → nhét cấu trúc riêng vào đây.
-----
**4.3. Inline text – inline\_json (chỉ phác, sau làm sâu dần)**

Bạn có thể để V1 chỉ dùng content\_plain là text thường.\
Sau nâng cấp, dùng inline\_json kiểu:

[

`  `{ "type": "text", "text": "Trong " },

`  `{ "type": "emphasis", "text": "Chương 1", "bold": true },

`  `{ "type": "text", "text": " tác giả trình bày tổng quan về vấn đề nghiên cứu." },

`  `{ "type": "citation", "ref\_id": "ref\_12" }

]

Tầng inline này phục vụ:

- In đậm, nghiêng, gạch chân
- Chèn ký hiệu tham chiếu [1]…
- Hỗ trợ công thức inline nếu cần

Nhưng đúng bước 1, mình chỉ cần **định nghĩa chỗ để lưu**, chưa cần implement.

-----
**4.4. Một số enum nên chuẩn hoá**

Để code sạch, bạn nên bóc ra mấy enum:

**node\_type**

- document\_root
- section\_group
- chapter
- section
- paragraph
- list
- list\_item
- table
- figure
- equation
- reference\_list
- reference\_item
- generated\_block
- cover\_page

**section\_group\_type**

- front
- main
- back

**generated\_type** (trong data\_json nếu node\_type = generated\_block)

- toc
- figure\_list
- table\_list
- abbreviation\_list

**semantic\_role** (tuỳ template trường, bạn sẽ mapping):

Ví dụ:

- front\_acknowledgement
- front\_declaration
- front\_abstract\_vi
- front\_abstract\_en
- main\_body\_paragraph
- main\_quote
- main\_list\_paragraph
- back\_reference\_item
- appendix\_paragraph
- cover\_title
- cover\_school\_name
- cover\_faculty\_name
- cover\_student\_info
- cover\_teacher\_info
- cover\_year

Đám này chính là cầu nối giữa:

- “Nó là cái gì trong logic luận văn”
- Với “áp style nào trong profile format”.
-----
**5. Ví dụ minh hoạ một luận văn dưới dạng cây**

Cho dễ tưởng tượng, thử mô phỏng:

- Một luận văn có:
  - Lời cảm ơn
  - Tóm tắt
  - Mục lục
  - Chương 1, 2
  - Tài liệu tham khảo

Cây sẽ kiểu:

doc\_nodes:

\- document\_root (id=1)

`  `- section\_group front (id=2)

`    `- cover\_page (id=3)

`    `- paragraph (id=4, semantic\_role=front\_acknowledgement)

`    `- paragraph (id=5, semantic\_role=front\_abstract\_vi)

`    `- generated\_block (id=6, data\_json.generated\_type="toc")

`  `- section\_group main (id=7)

`    `- chapter (id=8, "CHƯƠNG 1. TỔNG QUAN")

`      `- section (id=9, level=1, "1.1. Lý do chọn đề tài")

`        `- paragraph (id=10, semantic\_role=main\_body\_paragraph)

`        `- paragraph (id=11, semantic\_role=main\_body\_paragraph)

`      `- section (id=12, level=1, "1.2. Mục tiêu nghiên cứu")

`        `- list (id=13)

`          `- list\_item (id=14)

`          `- list\_item (id=15)

`    `- chapter (id=16, "CHƯƠNG 2. CƠ SỞ LÝ THUYẾT")

`      `- section (id=17, level=1, "2.1. Khái niệm cơ bản")

`        `- paragraph (id=18)

`        `- figure (id=19, data\_json.image\_url="...", numbering\_key="figure")

`        `- paragraph (id=20, semantic\_role="main\_caption\_paragraph")

`  `- section\_group back (id=21)

`    `- reference\_list (id=22)

`      `- reference\_item (id=23)

`      `- reference\_item (id=24)

Sau này:

- Engine format sẽ nhìn:
  - node\_type, semantic\_role, style\_key, numbering\_key
  - → Áp đúng style trong profile của trường.
- AI khi sinh nội dung:
  - Chỉ “fill content\_plain / inline\_json” ở các node paragraph/list\_item/…
  - Không đụng vào style\_key hay data\_json về format.
-----
**Kết đoạn này**

Ở bước 1, mình đã:

- Xác định rõ **các loại khối** cần support cho đồ án/luận văn Việt.
- Thiết kế **bảng doc\_nodes** đủ tổng quát để chứa toàn bộ cây tài liệu, phân biệt được:
  - Phần đầu / phần chính / phần cuối
  - Chương, mục, đoạn, bảng, hình, tài liệu tham khảo, trang bìa, mục lục…
- Chừa sẵn:
  - style\_key và numbering\_key để bước 2 map sang profile format
  - data\_json để linh hoạt với bảng/hình/công thức
  - inline\_json để sau này nâng cấp văn bản rich text.

Bước tiếp theo hợp lý nhất:

👉 Thiết kế **cấu trúc profile format** (bộ rule định dạng) sao cho:

- Mỗi node\_type + semantic\_role → 1 style\_key cụ thể
- Mỗi numbering\_key → rule đánh số chương, mục, hình, bảng…
- Có UI cho user “vọc” những rule này.

