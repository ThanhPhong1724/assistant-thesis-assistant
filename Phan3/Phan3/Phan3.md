**2. Động cơ xuất file Word từ cây tài liệu và profile format**

**2.1. Mục tiêu**

Động cơ xuất phải:

- Đọc được một tài liệu trong cơ sở dữ liệu (cây doc\_nodes)
- Đọc đúng hồ sơ format tương ứng
- Tạo ra file docx mà:
  - Lề, khổ giấy đúng
  - Tiêu đề chương, mục, đoạn văn, chú thích hình, bảng… đúng style
  - Đánh số chương, mục, hình, bảng, công thức đúng luật
  - Sinh mục lục, danh mục hình, danh mục bảng theo đúng quy định

Và quan trọng: kết quả là xác định, không phụ thuộc “hứng” của trí tuệ nhân tạo.

**2.2. Chuẩn bị trước khi xuất**

Khi người dùng bấm “Xuất Word”:

1. Nạp tài liệu:
   1. Lấy bản ghi trong bảng documents
   1. Tải toàn bộ cây doc\_nodes của tài liệu đó, sắp theo parent\_id + position
1. Nạp hồ sơ format:
   1. Xác định profile format theo trường, khoa, loại tài liệu
   1. Nếu có profile cá nhân người dùng, trộn kế thừa
   1. Sau cùng có một cấu hình đầy đủ: page, styles, numbering, generated, mapping
1. Khởi tạo bộ đếm đánh số:
   1. Bộ đếm chương
   1. Bộ đếm mục cấp 1, cấp 2…
   1. Bộ đếm hình, bảng, công thức trong từng phạm vi
1. Khởi tạo tài liệu Word:
   1. Tạo tài liệu trắng
   1. Áp kích thước trang, lề, header, footer, số trang theo profile
   1. Tạo ra các style tương ứng với danh sách styles trong profile

**2.3. Thuật toán tổng quát**

Có thể dùng một vòng duyệt cây dạng tiền tố:

- Hàm xử lý một node:
  - Dựa vào node\_type, semantic\_role, level → tra phần mapping trong profile → lấy style\_key, numbering\_key, các cờ khác
  - Xử lý nội dung node theo loại:
    - Nếu là trang bìa: đổ các trường: tên trường, khoa, đề tài, sinh viên…
    - Nếu là chương: tăng bộ đếm chương, tạo tiêu đề với mẫu trong numbering
    - Nếu là mục: tăng bộ đếm cấp tương ứng, tạo tiêu đề mục
    - Nếu là đoạn văn: tạo đoạn với style phù hợp, đổ nội dung
    - Nếu là hình, bảng, công thức: chèn với chú thích, số thứ tự
    - Nếu là phần tự sinh (mục lục, danh mục hình, bảng): tạm bỏ qua, xử lý sau
  - Gọi đệ quy xử lý danh sách con của node theo thứ tự position

Những phần phụ như mục lục, danh mục hình, danh mục bảng xử lý sau cùng.

**2.4. Xử lý từng loại node**

**a) Trang bìa – cover\_page**

Node cover\_page có data\_json kiểu:

{

`  `"school\_name": "...",

`  `"faculty\_name": "...",

`  `"title\_main": "...",

`  `"student\_name": "...",

`  `"student\_id": "...",

`  `"class\_name": "...",

`  `"supervisor\_name": "...",

`  `"year": "2025"

}

Profile mapping phần cover\_page đã định sẵn:

- school\_name dùng style nào
- faculty\_name dùng style nào
- title\_main dùng style nào
- …

Động cơ xuất:

- Tạo từng đoạn tương ứng, căn giữa, cách dòng theo style
- Chèn thêm khoảng trắng, ngắt dòng theo đúng bố cục mà profile quy định
- Tách trang (ngắt trang) sau khi xong bìa

**b) Cụm phần đầu: lời cảm ơn, lời cam đoan, tóm tắt…**

Các đoạn này trong doc\_nodes có:

- node\_type = paragraph
- semantic\_role = front\_acknowledgement, front\_declaration, front\_abstract\_vi…

Trong mapping:

- front\_acknowledgement dùng style nào
- front\_abstract\_vi dùng style nào
- Có tiêu đề không, nếu có thì style tiêu đề là gì

Động cơ xuất:

- Nếu semantic\_role quy định phải có tiêu đề riêng (ví dụ “LỜI CẢM ƠN”):
  - Tạo một đoạn tiêu đề với style tiêu đề phần
- Sau đó lần lượt tạo các đoạn văn, áp style theo mapping
- Ngắt trang giữa các phần nếu profile yêu cầu

**c) Chương và mục**

Node chương:

- node\_type = chapter
- content\_plain là tiêu đề gốc (ví dụ: “TỔNG QUAN VẤN ĐỀ NGHIÊN CỨU”)

Động cơ:

1. Tăng bộ đếm chương
1. Lấy mẫu trong numbering.chapter, ví dụ:
   1. “CHƯƠNG {n}: {title}” → thay {n} bằng số chương, {title} bằng tiêu đề
1. Tạo đoạn tiêu đề chương với style ChapterHeading
1. Ngắt dòng, có thể chèn khoảng trắng trước/sau theo spacing của style

Node mục:

- node\_type = section
- level = 1, 2…

Động cơ:

1. Tuỳ level, dùng rule:
   1. section\_level\_1
   1. section\_level\_2
1. Cập nhật bộ đếm tương ứng, reset bộ đếm cấp thấp hơn
1. Ghép số vào: “1.1”, “1.2”, “2.1.3”…
1. Tạo đoạn tiêu đề mục với style tương ứng

**d) Đoạn văn thường**

Node:

- node\_type = paragraph
- semantic\_role = main\_body\_paragraph hoặc loại khác

Động cơ:

- Dùng mapping.paragraph để xác định style\_key:
  - Nếu có semantic\_role đặc biệt ghi trong mapping → dùng style riêng
  - Nếu không → dùng BodyText
- Dùng nội dung content\_plain (hoặc inline\_json khi nâng cấp) để tạo đoạn
- Áp các thuộc tính canh lề, giãn dòng, thụt đầu dòng từ style

**e) Danh sách gạch đầu dòng / đánh số**

Node list:

- Chứa nhiều list\_item

Động cơ:

- Tạo một danh sách trong Word
- Với mỗi list\_item, tạo một đoạn, áp style dành cho danh sách hoặc dựa trên BodyText nhưng gắn loại danh sách
- Xử lý lồng danh sách nếu cần (mức độ nâng cấp sau)

**f) Bảng**

Node table:

- data\_json chứa cấu trúc bảng: số cột, dòng, tiêu đề…

Động cơ:

1. Nếu profile yêu cầu bảng có tiêu đề phía trên:
   1. Tính số bảng theo rule numbering.table
   1. Tạo dòng tiêu đề: “Bảng 2.3: Tên bảng…” với style TableCaption
1. Tạo bảng với số cột, hàng tương ứng
   1. Áp định dạng đường viền, căn lề, căn giữa, độ rộng cột theo profile bảng
1. Sau bảng có thể chèn khoảng trắng theo spacing quy định

**g) Hình**

Node figure:

- data\_json có đường dẫn ảnh, chú thích, kích thước mong muốn…

Động cơ:

1. Chèn ảnh vào tài liệu, căn giữa hoặc theo align trong profile
1. Tính số hình theo numbering.figure
1. Tạo chú thích theo mẫu: “Hình 3.2: Sơ đồ hệ thống” với style FigureCaption
1. Chèn khoảng cách trước/sau nếu cần

**h) Công thức**

Node equation:

- data\_json chứa biểu thức LaTeX hoặc dạng khác

Động cơ:

- Tùy thư viện, hoặc chèn dạng ảnh, hoặc chèn dạng đối tượng công thức
- Đánh số theo rule numbering.equation, thường căn phải, có dấu ngoặc
- Khoảng cách trước/sau theo quy định

**i) Tài liệu tham khảo**

Phần này có:

- reference\_list
- nhiều reference\_item, mỗi item là một đoạn

Động cơ:

- Nếu profile quy định tiêu đề “TÀI LIỆU THAM KHẢO”: tạo đoạn tiêu đề
- Với mỗi reference\_item:
  - Áp style ReferenceItem
  - Áp thụt đầu dòng treo, khoảng cách giữa các dòng
  - Nội dung đã được chuẩn hoá sẵn từ trước (AI có thể hỗ trợ sắp xếp, chuẩn hoá)

**j) Phụ lục**

Phụ lục có thể được coi như tập con của phần back hoặc là một loại section\_group riêng.

Xử lý tương tự chương, nhưng numbering và style khác nếu profile quy định.

**2.5. Sinh mục lục, danh mục hình, danh mục bảng**

Có hai hướng:

- Sinh “trường tự động” của Word để khi cập nhật sẽ tự thay
- Hoặc sinh text thường đã tính toán sẵn

Bản đầu tiên có thể:

- Tự tính số trang cho từng chương, từng mục, từng hình, bảng trong bộ nhớ khi xuất
- Sau đó tạo phần mục lục bằng cách:
  - Duyệt lại danh sách node thuộc diện toc.include trong profile
  - Tạo một dòng mỗi node, áp style tương ứng
  - Chèn tên chương/mục, chèn chuỗi chấm chấm dẫn tới số trang, canh phải

Danh mục hình, bảng tương tự:\
lọc các node figure và table, lấy số hiệu, caption, số trang.

-----
**3. Bộ kiểm tra lại file Word theo profile**

Cái này hơi “cao cấp” hơn nhưng rất giá trị.

**3.1. Mục tiêu**

- Người dùng sửa file Word bằng tay xong, tải lên lại hệ thống
- Hệ thống đọc nội dung, so với profile format
- Báo cáo:
  - Đúng bao nhiêu phần trăm
  - Các lỗi chi tiết: font, size, giãn dòng, lề, đánh số, vị trí số trang…

**3.2. Cách tiếp cận**

1. Dùng thư viện đọc file docx thành cấu trúc đoạn, bảng, hình…
1. Xác định “vai trò” của từng đoạn:
   1. Đoạn tiêu đề chương: dựa vào style, chữ “CHƯƠNG”, vị trí, cỡ chữ
   1. Đoạn tiêu đề mục: dựa vào mẫu số “1.1”, “2.3.1”…
   1. Đoạn thân: còn lại
   1. Chú thích hình, bảng: bắt đầu bằng “Hình”, “Bảng” + số
1. Với mỗi đoạn, so sánh:
   1. Font, size, bold, italic, canh lề, giãn dòng, thụt đầu dòng… với style tương ứng trong profile
1. So lề, khổ giấy, số trang với phần page
1. So luật đánh số: kiểm tra chuỗi “CHƯƠNG 2”, “1.1”, “Hình 2.3” có khớp với thứ tự xuất hiện hay không
1. Tổng hợp thành báo cáo:
   1. Danh sách lỗi, mỗi lỗi có:
      1. Trang số, dòng/đoạn số
      1. Giá trị hiện tại
      1. Giá trị đúng theo profile

**3.3. Mức độ triển khai**

- Bản đầu: chỉ cần kiểm tra căn bản:
  - Lề trang
  - Font, size đoạn văn, giãn dòng
  - Đánh số chương, mục, hình, bảng đúng thứ tự
- Bản sau: kiểm tra sâu:
  - Khoảng cách trước/sau
  - Thụt đầu dòng
  - Vị trí số trang, header, footer
-----
**4. Giao diện “phòng lab format”**

Đây là chỗ để người dùng “nhìn thấy và sờ vào” hồ sơ format.

**4.1. Màn danh sách hồ sơ**

- Liệt kê các profile có sẵn:
  - Tên trường, khoa, loại tài liệu
  - Mô tả ngắn
- Nút:
  - Xem chi tiết
  - Sao chép thành bản mới → chỉnh sửa
- Với admin, có thể:
  - Tạo hồ sơ mới từ trắng
  - Khoá không cho người dùng chỉnh

**4.2. Màn chi tiết hồ sơ – chia tab**

Đề xuất chia thành 4 tab:

1. Trang
1. Kiểu đoạn văn
1. Đánh số
1. Ánh xạ thành phần

**Tab “Trang”**

- Khổ giấy
- Lề trên, dưới, trái, phải
- Bật tắt đánh số trang phần đầu, phần nội dung
- Vị trí số trang: giữa, trái, phải
- Giãn dòng mặc định, canh lề mặc định

Có khung xem trước mô phỏng một trang trắng với lề.

**Tab “Kiểu đoạn văn”**

Danh sách các style\_key:

- TitleMain
- ChapterHeading
- SectionLevel1
- SectionLevel2
- BodyText
- FigureCaption
- TableCaption
- ReferenceItem
- …

Khi chọn một style:

- Bên phải hiện form chỉnh:
  - Font, cỡ, đậm, nghiêng, viết hoa
  - Canh lề
  - Giãn dòng
  - Khoảng cách trước/sau
  - Thụt đầu dòng
- Dưới có ô preview hiển thị một câu ví dụ với style đó

**Tab “Đánh số”**

- Quy định mẫu hiển thị chương:
  - Nhập chuỗi mẫu “CHƯƠNG {n}: {title}”
- Quy định mẫu mục:
  - “{chapter}.{n}” cho cấp 1
  - “{chapter}.{section\_1}.{n}” cho cấp 2
- Quy định mẫu hình, bảng, công thức:
  - “Hình {chapter}.{n}”
  - “Bảng {chapter}.{n}”
  - “({chapter}.{n})”

Có thể có ô “thử nghiệm”: nhập số chương, số mục giả → hiển thị kết quả.

**Tab “Ánh xạ”**

Hiển thị dạng bảng:

- Loại node: chương → dùng style nào, dùng rule đánh số nào
- Mục cấp 1 → style gì, rule gì
- Mục cấp 2 → style gì, rule gì
- Đoạn văn:
  - Thường → BodyText
  - Tài liệu tham khảo → ReferenceItem
  - Lời cảm ơn → BodyText…
- Hình → FigureCaption, rule figure
- Bảng → TableCaption, rule table

Người dùng có thể chọn style khác từ danh sách style có sẵn.

-----
**5. Giao diện soạn tài liệu**

**5.1. Màn cấu hình ban đầu**

- Chọn:
  - Trường
  - Khoa
  - Loại tài liệu
- Hệ thống gợi ý hồ sơ format tương ứng
- Nhập:
  - Tên đề tài
  - Thông tin sinh viên, giảng viên
- Bấm “Tạo tài liệu”

**5.2. Màn đề cương**

Bố cục:

- Bên trái: cây chương – mục
- Bên phải: khu vực chỉnh tên chương, mục

Chức năng:

- Tạo chương mới
- Thêm mục cấp 1, cấp 2
- Đổi tên chương, mục
- Kéo thả để đổi thứ tự
- Nút “Trí tuệ nhân tạo gợi ý đề cương”:
  - Gửi tên đề tài + mô tả ngắn
  - Nhận về list chương, mục con → hiển thị, cho người dùng chỉnh lại

Khi người dùng hài lòng → bấm “Khóa đề cương” để cố định cấu trúc lớn.

**5.3. Màn soạn nội dung**

Bố cục:

- Bên trái: cây chương – mục, mỗi mục có trạng thái: chưa viết, đang viết, đã xong
- Bên phải: vùng soạn thảo với tiêu đề mục ở trên, nội dung bên dưới

Chức năng:

- Gõ nội dung thủ công
- Nút “Gợi ý đoạn”:
  - Nhập vài gạch đầu dòng → gọi trí tuệ nhân tạo sinh đoạn văn
- Nút “Viết lại học thuật hơn”:
  - Chọn đoạn → trí tuệ nhân tạo chỉnh câu chữ cho mượt và đúng phong cách học thuật
- Thêm hình, bảng, công thức:
  - Nút “Thêm hình”: upload ảnh, nhập chú thích → tạo node figure
  - Nút “Thêm bảng”: mở trình nhập bảng → lưu vào data\_json của node table
- Tự động lưu sau vài giây

**5.4. Màn xem trước và xuất file**

- Hiển thị bản xem trước giống bố cục Word:
  - Trang bìa
  - Các phần đầu
  - Chương, mục, đoạn văn, hình, bảng
- Nút:
  - “Sinh mục lục, danh mục hình, danh mục bảng”
  - “Xuất PDF”
  - “Xuất Word”
-----
**6. Tích hợp trí tuệ nhân tạo nhưng vẫn giữ format tuyệt đối sạch**

**6.1. Nguyên tắc cốt lõi**

- Trí tuệ nhân tạo **chỉ được đụng vào nội dung**, không được đụng style, không được đụng profile format
- Mọi thứ liên quan:
  - Font, cỡ chữ, giãn dòng
  - Cách đánh số, lề, số trang\
    → Do profile và động cơ xuất quyết định

**6.2. Các điểm tích hợp chính**

1. Gợi ý đề cương:
   1. Input: tên đề tài, mô tả, loại tài liệu
   1. Output: cây chương – mục dạng cấu trúc, không chứa style
   1. Hệ thống chuyển output này thành các node chapter, section, không để trí tuệ nhân tạo đặt style\_key
1. Gợi ý nội dung cho từng mục:
   1. Input: mô tả mục, vài ý chính, toàn bộ đề cương
   1. Output: text thuần
   1. Hệ thống nhận text → gán vào content\_plain của node paragraph
1. Chỉnh sửa văn phong:
   1. Input: đoạn văn người dùng viết
   1. Output: phiên bản viết lại
   1. Thay thế content\_plain, giữ nguyên style\_key, semantic\_role
1. Gợi ý mô tả hình, bảng:
   1. Input: nội dung bảng, hình
   1. Output: gợi ý caption
   1. Lưu caption vào node figure/table, style vẫn do profile điều khiển

**6.3. Cách “bọc” trí tuệ nhân tạo**

Xây một lớp dịch vụ riêng:

- Nhận yêu cầu từ ứng dụng web
- Chuẩn hóa input theo cấu trúc
- Gọi trí tuệ nhân tạo
- Kiểm tra, ràng buộc output:
  - Loại bỏ định dạng không cần
  - Cắt những phần “tự tiện” như thay đổi chiến lược đánh số, thêm phần mới ngoài đề cương nếu không được phép
- Trả về cho ứng dụng chỉ phần dữ liệu nội dung thuần
-----
**7. Gợi ý thứ tự triển khai khi bắt đầu code**

Sau khi lý thuyết đã chốt, lúc bắt tay code bạn có thể đi theo thứ tự:

**Giai đoạn 1: Nền tảng dữ liệu**

- Dựng cơ sở dữ liệu:
  - Bảng documents
  - Bảng doc\_nodes
  - Bảng lưu profile format
- Viết giao diện đơn giản để:
  - Tạo tài liệu
  - Tạo cây doc\_nodes tối thiểu bằng tay (chương, mục, đoạn)
- Chưa cần trí tuệ nhân tạo, chưa cần format phức tạp

**Giai đoạn 2: Hồ sơ format và phòng lab**

- Áp toàn bộ cấu trúc JSON hồ sơ format đã thiết kế
- Viết màn hình:
  - Danh sách hồ sơ
  - Chỉnh sửa hồ sơ (ít nhất phần trang và vài style cơ bản)
- Lưu, nạp, áp dụng profile vào tài liệu

**Giai đoạn 3: Động cơ xuất Word**

- Dùng một thư viện xử lý docx
- Thực hiện:
  - Áp lề, khổ giấy
  - Tạo style theo hồ sơ format
  - Duyệt doc\_nodes, tạo chương, mục, đoạn, hình, bảng cơ bản
  - Đánh số chương, mục, hình, bảng
- Thử với 1–2 mẫu trường cụ thể, đối chiếu với file mẫu của trường

**Giai đoạn 4: Giao diện soạn thảo và trí tuệ nhân tạo**

- Làm màn đề cương, màn soạn nội dung như đã mô tả
- Tích hợp trí tuệ nhân tạo:
  - Gợi ý đề cương
  - Gợi ý nội dung
  - Chỉnh sửa văn phong

**Giai đoạn 5: Kiểm tra Word và nâng cấp**

- Thêm chức năng:
  - Tải file Word đã chỉnh tay lên → kiểm tra format
- Nâng cấp:
  - Mục lục, danh mục hình, bảng sinh tự động
  - Kiểm tra sâu hơn về khoảng cách, thụt đầu dòng, số trang…
-----
Tới đây, về mặt kế hoạch và lý thuyết, tụi mình đã:

- Có mô hình dữ liệu tài liệu
- Có mô hình hồ sơ format
- Có thiết kế động cơ xuất Word
- Có thiết kế bộ kiểm tra format
- Có thiết kế giao diện cấu hình format, giao diện soạn đồ án
- Có chiến lược tích hợp trí tuệ nhân tạo mà vẫn giữ format 100% nằm trong tay hệ thống

Bước tiếp theo, nếu bạn muốn, mình có thể:

- Cùng bạn chi tiết hoá cấu trúc cơ sở dữ liệu cụ thể hơn
- Hoặc viết ra “đặc tả chức năng” dạng tài liệu: mỗi màn hình, mỗi API, mỗi trường dữ liệu dùng để bạn bắt đầu code ngay.

