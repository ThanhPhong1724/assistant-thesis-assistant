1. Thiết kế cơ sở dữ liệu chi tiết
1. Đặc tả chức năng: từng màn hình, từng API, từng trường chính
1. Kế hoạch triển khai dự án: tạo project, coding, test, lộ trình bước-bước

Mục tiêu: bạn có thể bê gần như nguyên xi tài liệu này cho team dev đọc và triển khai.

-----
**1. Thiết kế cơ sở dữ liệu chi tiết**

Giả sử dùng hệ quản trị quan hệ như PostgreSQL hoặc MySQL.\
Mình chia các nhóm bảng:

- Nhóm hệ thống, tổ chức: users, schools, faculties, program\_types
- Nhóm cấu hình format: format\_profiles
- Nhóm tài liệu: documents, doc\_nodes
- Nhóm tệp đính kèm: uploaded\_files
- Nhóm trí tuệ nhân tạo, kiểm tra: ai\_requests, validation\_reports

Bạn có thể bổ sung bảng phụ sau nếu cần, nhưng bộ này là đủ để chạy V1.

-----
**1.1. Bảng users – người dùng**

Dùng cho sinh viên, có thể thêm admin sau.

**Cấu trúc**

- id – int, khóa chính, tự tăng
- email – varchar(255), duy nhất
- password\_hash – varchar(255)
- full\_name – varchar(255)
- role – varchar(50), giá trị: "student", "admin"…
- created\_at – datetime
- updated\_at – datetime

Chỉ mục:

- unique trên email
- index trên role nếu sau này lọc.
-----
**1.2. Bảng schools – trường đại học**

**Cấu trúc**

- id – int, khóa chính
- code – varchar(50), mã viết tắt, duy nhất
- name – varchar(255)
- description – text, mô tả thêm (có thể null)
- created\_at – datetime
- updated\_at – datetime
-----
**1.3. Bảng faculties – khoa**

**Cấu trúc**

- id – int, khóa chính
- school\_id – int, khóa ngoại tới schools.id
- code – varchar(50)
- name – varchar(255)
- description – text, mô tả (có thể null)
- created\_at – datetime
- updated\_at – datetime

Chỉ mục:

- index school\_id
- có thể đặt unique trên cặp school\_id, code.
-----
**1.4. Bảng program\_types – loại tài liệu**

Ví dụ: đồ án môn, đồ án tốt nghiệp, khóa luận, luận văn…

**Cấu trúc**

- id – int, khóa chính
- code – varchar(50), ví dụ "do\_an\_mon", "do\_an\_tot\_nghiep"…
- name – varchar(255)
- description – text, mô tả thêm
- created\_at – datetime
- updated\_at – datetime
-----
**1.5. Bảng format\_profiles – hồ sơ định dạng**

Đây là nơi lưu JSON profile format mà mình đã thiết kế ở bước 2.

**Cấu trúc**

- id – int, khóa chính
- code – varchar(100), mã nội bộ duy nhất, ví dụ: "dhnn\_cntt\_doan\_2025"
- name – varchar(255)
- description – text
- school\_id – int, khóa ngoại, có thể null (profile chung)
- faculty\_id – int, khóa ngoại, có thể null
- program\_type\_id – int, khóa ngoại, có thể null
- base\_profile\_id – int, khóa ngoại tới format\_profiles.id, cho phép kế thừa, có thể null
- config\_json – json, lưu toàn bộ profile:
  - page, styles, numbering, generated, mapping
- is\_default – bool, đánh dấu profile mặc định cho cặp trường – khoa – loại
- created\_by – int, khóa ngoại tới users.id
- created\_at – datetime
- updated\_at – datetime

Chỉ mục:

- index trên school\_id, faculty\_id, program\_type\_id
- unique trên code.
-----
**1.6. Bảng documents – tài liệu đồ án/luận văn**

Đại diện cho một đồ án/luận văn của sinh viên.

**Cấu trúc**

- id – int, khóa chính
- user\_id – int, khóa ngoại tới users.id
- school\_id – int
- faculty\_id – int
- program\_type\_id – int
- format\_profile\_id – int, khóa ngoại tới format\_profiles.id
- title – varchar(500), tên đề tài
- topic\_description – text, mô tả tóm tắt đề tài
- year – int, năm làm đồ án
- status – varchar(50), ví dụ: "draft", "outline\_locked", "in\_progress", "completed"
- outline\_locked – bool, đã khóa đề cương hay chưa
- created\_at – datetime
- updated\_at – datetime

Có thể thêm:

- deleted\_at – datetime, nếu muốn hỗ trợ xóa mềm.

Chỉ mục:

- index user\_id, school\_id, faculty\_id, program\_type\_id.
-----
**1.7. Bảng doc\_nodes – cây nội dung tài liệu**

Đây là bảng quan trọng nhất, lưu toàn bộ cấu trúc và nội dung từng khối.

**Cấu trúc**

- id – int, khóa chính
- document\_id – int, khóa ngoại tới documents.id
- parent\_id – int, khóa ngoại tới doc\_nodes.id, có thể null nếu là root
- position – int, thứ tự hiển thị trong danh sách con của parent\_id
- node\_type – varchar(50), giá trị:
  - "document\_root"
  - "section\_group"
  - "chapter"
  - "section"
  - "paragraph"
  - "list"
  - "list\_item"
  - "table"
  - "figure"
  - "equation"
  - "reference\_list"
  - "reference\_item"
  - "generated\_block"
  - "cover\_page"
- section\_group\_type – varchar(20), dùng khi node\_type = "section\_group":
  - "front", "main", "back"
- level – int, dùng khi node\_type = "section":
  - 1: mục 1.1
  - 2: mục 1.1.1
  - 3: sâu hơn…
- semantic\_role – varchar(100), ví dụ:
  - "front\_acknowledgement"
  - "front\_declaration"
  - "front\_abstract\_vi"
  - "main\_body\_paragraph"
  - "back\_reference\_item"
  - "cover\_title"
  - "cover\_student\_info"…
- style\_key\_override – varchar(100), cho phép override style mặc định từ profile nếu cần, có thể null
- numbering\_key\_override – varchar(100), tương tự cho rule đánh số, có thể null
- content\_plain – text, nội dung chữ thuần (đoạn văn, tiêu đề, mục list…)
- inline\_json – json, mô tả chi tiết inline (in đậm, nghiêng, citation…), có thể null
- data\_json – json, tùy loại:
  - Nếu table: chứa số cột, hàng, dữ liệu ô
  - Nếu figure: chứa đường dẫn ảnh, chú thích riêng, kích thước
  - Nếu equation: chứa biểu thức LaTeX hoặc dạng khác
  - Nếu cover\_page: chứa các trường của bìa
  - Nếu generated\_block: chứa loại mục tự sinh như "toc", "figure\_list"
- is\_generated – bool, true nếu node do hệ thống tự sinh (mục lục, danh mục hình…)
- origin – varchar(20), "user", "ai", "import"
- created\_at – datetime
- updated\_at – datetime

Chỉ mục:

- index document\_id
- index trên cặp document\_id, parent\_id, position
- index trên node\_type.
-----
**1.8. Bảng uploaded\_files – tệp đính kèm**

Dùng cho hình ảnh, tài liệu người dùng upload để chèn vào báo cáo.

**Cấu trúc**

- id – int, khóa chính
- user\_id – int, khóa ngoại tới users.id
- document\_id – int, khóa ngoại tới documents.id
- node\_id – int, khóa ngoại tới doc\_nodes.id, có thể null nếu file chưa gắn vào node
- file\_type – varchar(50), ví dụ "image", "docx\_source", "pdf\_source"…
- file\_path – varchar(500), đường dẫn lưu trên server hoặc dịch vụ lưu trữ
- file\_name – varchar(255), tên gốc
- mime\_type – varchar(100)
- size\_bytes – bigint
- created\_at – datetime

Chỉ mục:

- index document\_id, node\_id.
-----
**1.9. Bảng ai\_requests – log yêu cầu trí tuệ nhân tạo**

Không bắt buộc nhưng rất tốt để debug, thống kê.

**Cấu trúc**

- id – int, khóa chính
- document\_id – int, khóa ngoại
- node\_id – int, khóa ngoại, có thể null nếu yêu cầu gợi ý đề cương tổng quan
- request\_type – varchar(50), ví dụ:
  - "outline\_suggestion"
  - "content\_suggestion"
  - "rewrite\_academic"
  - "caption\_suggestion"…
- prompt – text, nội dung yêu cầu gửi lên mô hình
- response – text, nội dung trả về
- status – varchar(20), "success", "error"
- error\_message – text, nếu có lỗi
- tokens\_input – int, nếu bạn muốn lưu thống kê
- tokens\_output – int
- created\_at – datetime
-----
**1.10. Bảng validation\_reports – kết quả kiểm tra format**

Dùng cho chức năng “tải file Word lên, kiểm tra độ chuẩn format”.

**Cấu trúc**

- id – int, khóa chính
- document\_id – int, có thể null nếu chỉ kiểm tra file đơn lẻ
- format\_profile\_id – int, khóa ngoại tới format\_profiles.id
- status – varchar(20), "passed", "failed"
- score\_percent – decimal(5,2), ví dụ 98.50
- result\_json – json, chi tiết:
  - danh sách lỗi
  - từng lỗi có: trang, đoạn, loại, giá trị thực tế, giá trị đúng
- created\_at – datetime
-----
**2. Đặc tả chức năng: màn hình + API**

Giờ mình mô tả ở mức “tài liệu chức năng” cho dev đọc:

- Mỗi màn hình: mục tiêu, luồng, dữ liệu hiển thị, sự kiện chính
- Mỗi nhóm API: đường dẫn, tham số chính, dữ liệu trả về
-----
**2.1. Màn hình cho người dùng**

**2.1.1. Đăng ký – đăng nhập**

**Mục tiêu**

- Cho người dùng tạo tài khoản, đăng nhập để quản lý tài liệu.

**Chức năng**

- Đăng ký:
  - Nhập: họ tên, email, mật khẩu
  - Gọi API tạo user
  - Sau khi đăng ký, tự đăng nhập hoặc chuyển sang trang đăng nhập
- Đăng nhập:
  - Nhập: email, mật khẩu
  - Gọi API, nhận về mã phiên (ví dụ token)
- Nhớ trạng thái đăng nhập:
  - Lưu mã phiên trên trình duyệt
- Đăng xuất:
  - Xóa mã phiên, chuyển về trang đăng nhập

**API liên quan**

- POST /auth/register
- POST /auth/login
- GET /auth/me
-----
**2.1.2. Trang danh sách tài liệu**

**Mục tiêu**

- Hiển thị danh sách đồ án/luận văn của người dùng
- Cho phép tạo mới, sửa, xóa, mở.

**Dữ liệu hiển thị**

- Bảng liệt kê:
  - Tên đề tài
  - Trường, khoa, loại
  - Năm
  - Trạng thái
  - Ngày cập nhật gần nhất

**Thao tác**

- Nút “Tạo tài liệu mới” → sang màn tạo mới
- Nhấn vào một hàng → mở màn chỉnh sửa (đề cương hoặc nội dung tùy trạng thái)
- Nút xóa tài liệu
- Có thanh tìm kiếm, lọc theo trường, khoa, loại, trạng thái.

**API**

- GET /documents – trả về danh sách tài liệu thuộc user hiện tại
- DELETE /documents/{id} – xóa.
-----
**2.1.3. Màn “Tạo tài liệu mới”**

**Mục tiêu**

- Thiết lập thông tin cơ bản: trường, khoa, loại, format, tên đề tài.

**Thành phần giao diện**

- Chọn trường (dropdown lấy từ schools)
- Chọn khoa (lọc theo trường)
- Chọn loại tài liệu (đồ án môn, đồ án tốt nghiệp…)
- Chọn hồ sơ format (dropdown gợi ý theo trường, khoa, loại, hoặc cho người dùng chọn profile khác)
- Ô nhập tên đề tài
- Ô mô tả đề tài ngắn
- Năm làm đồ án (tự điền năm hiện tại, cho phép sửa)

**Thao tác**

- Bấm “Tạo” → gọi API tạo documents + node gốc document\_root và các section\_group front/main/back.

**API**

- GET /schools
- GET /faculties?school\_id=
- GET /program-types
- GET /format-profiles?school\_id=&faculty\_id=&program\_type\_id=
- POST /documents
-----
**2.1.4. Màn “Đề cương” (outline)**

**Mục tiêu**

- Xây dựng cây chương – mục cho tài liệu.
- Có thể dùng trí tuệ nhân tạo gợi ý, rồi chỉnh sửa.

**Thành phần giao diện**

- Bên trái: cây chương – mục:
  - Chương
  - Mục cấp 1, cấp 2…
  - Có nút thêm chương, thêm mục con, kéo thả đổi vị trí
- Bên phải:
  - Form chỉnh sửa tên chương, mục
  - Nút “Gợi ý mục chi tiết bằng trí tuệ nhân tạo”

**Luồng chính**

1. Khi mở:
   1. Gọi API lấy cây doc\_nodes hiện tại
   1. Nếu chưa có chương nào, có thể hiển thị gợi ý mặc định theo loại tài liệu
1. Người dùng chỉnh:
   1. Thêm chương: tạo node chapter, parent là section\_group main
   1. Thêm mục cấp 1: tạo node section level 1, parent là chapter
   1. Thêm mục cấp 2: level 2, parent là section level 1
   1. Kéo thả: cập nhật parent\_id, position
   1. Đổi tên: cập nhật content\_plain của node
1. Gợi ý đề cương:
   1. Gửi tên đề tài, loại tài liệu, mô tả đề tài cho API trí tuệ nhân tạo
   1. Nhận về cây cấu trúc chương – mục gợi ý
   1. Hiển thị cho người dùng xem, có nút “chấp nhận” → ghi vào doc\_nodes
1. Khóa đề cương:
   1. Khi người dùng hài lòng, nút “Khóa đề cương” → cập nhật outline\_locked = true trong bảng documents
   1. Sau đó hạn chế thay đổi cấu trúc lớn (chỉ cho thêm mục nhỏ nếu cần, hoặc phải “mở khóa” lại)

**API**

- GET /documents/{id}/nodes?scope=outline – trả về các node kiểu chapter, section
- POST /documents/{id}/outline/ai-suggest – gợi ý đề cương
- POST /documents/{id}/nodes/bulk-update-outline – gửi danh sách thay đổi: thêm, xóa, cập nhật, đổi vị trí
- POST /documents/{id}/lock-outline
-----
**2.1.5. Màn “Soạn nội dung”**

**Mục tiêu**

- Soạn nội dung chi tiết theo đề cương: văn bản, hình, bảng…

**Giao diện**

- Bên trái: cây chương – mục:
  - Mỗi mục có trạng thái: chưa viết, đang viết, đã xong
  - Click vào mục → bên phải hiển thị nội dung của mục đó
- Bên phải:
  - Tiêu đề chương/mục
  - Trình soạn thảo văn bản:
    - Ô nhập đoạn
    - Nút thêm đoạn, thêm danh sách, thêm hình, thêm bảng
  - Nút:
    - “Gợi ý đoạn văn”
    - “Viết lại học thuật hơn”
    - “Thêm hình từ tệp”
    - “Thêm bảng”

**Luồng**

- Khi mở một mục, gọi API:
  - GET /documents/{id}/nodes?scope=section&node\_id= – trả về các node con: paragraph, list, figure, table…
- Thêm đoạn:
  - Gửi POST tạo node mới paragraph với parent là mục
- Chỉnh sửa đoạn:
  - Gửi PUT cập nhật content\_plain
- Gợi ý đoạn:
  - Gửi đoạn gạch đầu dòng → API trí tuệ nhân tạo → trả về đoạn văn → gán vào node
- Thêm hình:
  - Upload file → tạo bản ghi uploaded\_files → tạo node figure với data\_json trỏ tới file
- Thêm bảng:
  - Mở pop-up nhập dữ liệu → lưu vào data\_json của node table

**API chính**

- GET /documents/{id}/nodes?parent\_id=
- POST /documents/{id}/nodes – tạo node mới
- PUT /documents/{id}/nodes/{node\_id} – cập nhật nội dung, dữ liệu
- DELETE /documents/{id}/nodes/{node\_id} – xóa
- POST /documents/{id}/nodes/{node\_id}/ai-suggest-content
- POST /documents/{id}/nodes/{node\_id}/ai-rewrite
- POST /upload – upload tệp, trả về file\_id, file\_path
-----
**2.1.6. Màn “Xem trước và xuất file”**

**Mục tiêu**

- Cho người dùng xem bản xem trước “gần giống Word”
- Xuất PDF, Word.

**Thành phần**

- Khung xem trước nhiều trang:
  - Trang bìa
  - Phần đầu
  - Nội dung
  - Tài liệu tham khảo
- Nút:
  - “Cập nhật mục lục, danh mục hình, danh mục bảng”
  - “Xuất PDF”
  - “Xuất Word”

**Luồng**

- Khi mở:
  - Gọi API trả về bản dựng HTML của tài liệu hoặc gọi API render PDF tạm để xem
- Khi bấm “Xuất Word”:
  - Gọi API xuất Word, lưu file trên server, trả về đường dẫn để tải

**API**

- GET /documents/{id}/preview-html – trả về HTML dựng sẵn
- POST /documents/{id}/export-word – trả về file tải
- POST /documents/{id}/export-pdf – trả về file tải
-----
**2.1.7. Màn “Phòng lab format”**

**Mục tiêu**

- Cho phép admin hoặc người dùng nâng cao chỉnh hồ sơ format.

**Thành phần**

- Danh sách hồ sơ: lấy từ format\_profiles
- Form chỉnh:
  - Tab “Trang”: margin, khổ giấy, số trang…
  - Tab “Style”: chọn style, chỉnh font, size, spacing, preview
  - Tab “Đánh số”: chỉnh mẫu “CHƯƠNG {n}: {title}”, “{chapter}.{n}”,…
  - Tab “Ánh xạ”: map node\_type + semantic\_role → style, numbering

**API**

- GET /format-profiles
- GET /format-profiles/{id}
- POST /format-profiles – tạo mới
- PUT /format-profiles/{id} – cập nhật
- Có thể thêm:
  - POST /format-profiles/{id}/clone – sao chép
-----
**2.1.8. Màn “Kiểm tra file Word”**

**Mục tiêu**

- Người dùng tải file Word lên → hệ thống kiểm tra theo profile.

**Thành phần**

- Upload file docx
- Chọn:
  - Trường, khoa, loại
  - Hồ sơ format muốn kiểm tra theo
- Nút “Kiểm tra”

**Kết quả hiển thị**

- Điểm phần trăm chuẩn
- Danh sách lỗi:
  - Mô tả lỗi
  - Trang số, vị trí tương đối
  - Giá trị hiện tại, giá trị đúng

**API**

- POST /validation/check-word:
  - Dữ liệu: file docx, format\_profile\_id
  - Trả về: id báo cáo, score\_percent, danh sách lỗi
- GET /validation/reports/{id} – lấy lại báo cáo nếu cần
-----
**2.2. Đặc tả API (tổng quan)**

Mình không liệt kê hết mọi trường input output chi li tới từng byte, nhưng đủ để dev backend hiểu cấu trúc.

**2.2.1. Xác thực**

**POST /auth/register**

- Input body:
  - email – string
  - password – string
  - full\_name – string
- Output:
  - thông tin user
  - mã phiên nếu bạn chọn login luôn

**POST /auth/login**

- Input:
  - email
  - password
- Output:
  - token
  - thông tin user cơ bản

**GET /auth/me**

- Input:
  - dùng mã phiên trong tiêu đề
- Output:
  - thông tin user
-----
**2.2.2. Danh mục tổ chức**

**GET /schools**

- Output:
  - danh sách trường

**GET /faculties**

- Tham số truy vấn:
  - school\_id tùy chọn
- Output:
  - danh sách khoa, có thể lọc theo trường

**GET /program-types**

- Output:
  - danh sách loại tài liệu
-----
**2.2.3. Hồ sơ format**

**GET /format-profiles**

- Tham số truy vấn:
  - school\_id, faculty\_id, program\_type\_id, is\_default
- Output:
  - danh sách profile: id, name, scope, mô tả

**GET /format-profiles/{id}**

- Output:
  - toàn bộ thông tin profile, bao gồm config\_json

**POST /format-profiles**

- Input:
  - name
  - description
  - school\_id, faculty\_id, program\_type\_id
  - base\_profile\_id nếu có
  - config\_json – chứa page, styles, numbering, generated, mapping

**PUT /format-profiles/{id}**

- Input:
  - các trường tương tự, cho phép sửa.
-----
**2.2.4. Tài liệu**

**GET /documents**

- Tham số:
  - lọc theo trạng thái, trường, khoa, loại nếu cần
- Output:
  - danh sách tài liệu thuộc người dùng

**POST /documents**

- Input:
  - title
  - topic\_description
  - school\_id
  - faculty\_id
  - program\_type\_id
  - format\_profile\_id
  - year
- Xử lý:
  - tạo bản ghi documents
  - tạo node gốc document\_root, các section\_group front/main/back

**GET /documents/{id}**

- Output:
  - thông tin tài liệu

**PUT /documents/{id}**

- Sửa tên đề tài, mô tả, năm, profile nếu cho phép.
-----
**2.2.5. Cây nội dung doc\_nodes**

**GET /documents/{id}/nodes**

- Tham số:
  - parent\_id để lấy node con
  - hoặc scope:
    - "outline": chỉ lấy chapter và section
    - "full": lấy toàn bộ cây
- Output:
  - danh sách node: id, parent\_id, position, node\_type, level, semantic\_role, content\_plain, data\_json…

**POST /documents/{id}/nodes**

- Input:
  - parent\_id
  - position
  - node\_type
  - level, semantic\_role nếu cần
  - content\_plain hoặc data\_json
- Output:
  - node mới tạo

**PUT /documents/{id}/nodes/{node\_id}**

- Cho phép sửa:
  - content\_plain
  - inline\_json
  - data\_json
  - semantic\_role

**DELETE /documents/{id}/nodes/{node\_id}**

- Xóa node, có thể kèm xóa con.

**POST /documents/{id}/nodes/bulk-update-outline**

- Input:
  - danh sách node outline (chapter, section) với: id, parent\_id, position, level, content\_plain
- Dùng khi cập nhật đề cương hàng loạt (kéo thả).
-----
**2.2.6. Trí tuệ nhân tạo**

**POST /documents/{id}/outline/ai-suggest**

- Input:
  - title
  - topic\_description
  - program\_type\_id
- Output:
  - cấu trúc đề cương gợi ý:
    - danh sách chương, mỗi chương có danh sách mục con

**POST /documents/{id}/nodes/{node\_id}/ai-suggest-content**

- Input:
  - hints – các ý chính
- Output:
  - đoạn văn gợi ý

**POST /documents/{id}/nodes/{node\_id}/ai-rewrite**

- Input:
  - content – đoạn văn cần viết lại
  - tone – có thể "academic"
- Output:
  - đoạn văn đã chỉnh sửa
-----
**2.2.7. Xuất tài liệu, xem trước**

**GET /documents/{id}/preview-html**

- Output:
  - HTML hoàn chỉnh để hiển thị bản xem trước

**POST /documents/{id}/export-word**

- Xử lý:
  - chạy động cơ xuất Word với cây doc\_nodes và profile format
- Output:
  - đường dẫn tải file docx

**POST /documents/{id}/export-pdf**

- Tương tự, xuất PDF.
-----
**2.2.8. Upload tệp**

**POST /upload**

- Input:
  - tệp đính kèm
  - tùy chọn: document\_id, node\_id, file\_type
- Output:
  - thông tin tệp: id, file\_path, file\_name, mime\_type, size\_bytes
-----
**2.2.9. Kiểm tra file Word**

**POST /validation/check-word**

- Input:
  - tệp docx
  - format\_profile\_id
- Xử lý:
  - đọc docx, đối chiếu profile
  - lưu kết quả vào validation\_reports
- Output:
  - report\_id
  - status
  - score\_percent
  - result\_json (có thể rút gọn để hiển thị)
-----
**3. Kế hoạch triển khai: tạo project, coding, test**

Giờ coi như bạn là tech lead, mình gợi ý lộ trình thực hiện bài bản.

-----
**3.1. Chọn cấu trúc dự án**

Đề xuất:

- Một kho mã Git chứa hai thư mục:
  - backend – xây dựng API, xử lý dữ liệu, xuất Word
  - frontend – giao diện web cho người dùng

Bạn chọn ngăn xếp phù hợp với bạn nhất, ví dụ:

- Backend: Node với Nest hoặc Express, hoặc Laravel nếu bạn quen PHP
- Frontend: React với TypeScript, hoặc Vue

Dù dùng gì, kiến trúc logic vẫn giữ như tài liệu này.

-----
**3.2. Bước 1 – Dựng nền backend và cơ sở dữ liệu**

1. Tạo cơ sở dữ liệu, chạy script tạo các bảng:
   1. users, schools, faculties, program\_types
   1. format\_profiles
   1. documents, doc\_nodes
   1. uploaded\_files
   1. ai\_requests, validation\_reports
1. Dựng backend:
   1. Cấu hình kết nối cơ sở dữ liệu
   1. Tạo lớp tương ứng cho từng bảng:
      1. Model, repository hoặc tương đương
   1. Tạo module xác thực đơn giản:
      1. Đăng ký, đăng nhập
      1. Mã hóa mật khẩu
      1. Bảo vệ API bằng mã phiên
1. Viết API cơ bản:
   1. /auth/\*
   1. /schools, /faculties, /program-types
   1. /documents CRUD đơn giản

Test bước này bằng công cụ gọi API thủ công.

-----
**3.3. Bước 2 – Cài frontend cơ bản**

1. Khởi tạo dự án frontend:
   1. Thiết lập định tuyến: trang đăng nhập, trang danh sách tài liệu, trang chi tiết
1. Tích hợp:
   1. Gọi API đăng nhập, lưu mã phiên
   1. Gọi API /documents để hiển thị danh sách
1. Tạo layout tổng thể:
   1. Thanh menu trên
   1. Khu vực nội dung
   1. Xử lý trạng thái tải dữ liệu, lỗi
-----
**3.4. Bước 3 – Xây dựng mô hình doc\_nodes và màn đề cương**

1. Backend:
   1. Viết API GET /documents/{id}/nodes
   1. Viết API tạo, sửa, xóa node
   1. Viết API bulk-update-outline
1. Frontend:
   1. Màn “Tạo tài liệu mới”: chọn trường, khoa, hồ sơ format, nhập đề tài
   1. Màn “Đề cương”:
      1. Hiển thị cây chương – mục
      1. Cho phép thêm chương, mục
      1. Kéo thả, đổi tên
   1. Gọi API backend để đồng bộ.
1. Sơn test:
   1. Tạo tài liệu mới, thêm vài chương mục, reload trang xem dữ liệu còn đúng.
-----
**3.5. Bước 4 – Giao diện soạn nội dung**

1. Backend:
   1. API để lấy node con của một mục
   1. API để tạo đoạn, list, hình, bảng
   1. API cập nhật nội dung content\_plain, data\_json
1. Frontend:
   1. Màn soạn nội dung:
      1. Cây chương – mục bên trái
      1. Editor bên phải
   1. Cơ chế auto lưu: khi người dùng dừng gõ vài giây → gọi API PUT lưu nội dung
1. Kiểm thử:
   1. Tạo nội dung cho vài mục, reload xem có lưu đúng không.
-----
**3.6. Bước 5 – Hồ sơ format và phòng lab**

1. Backend:
   1. Lưu cấu trúc config\_json cho profile
   1. API để lấy, sửa profile theo id
   1. Có thể seed sẵn một vài profile mẫu
1. Frontend:
   1. Danh sách hồ sơ
   1. Màn chỉnh sửa:
      1. Tab trang: sửa lề, số trang
      1. Tab style: chọn style, form chỉnh font, cỡ, spacing, preview
      1. Tab đánh số: sửa mẫu chương, mục, hình, bảng
      1. Tab ánh xạ: chọn style cho từng loại node
1. Kết nối profile với tài liệu:
   1. Khi tạo tài liệu, chọn profile
   1. Lưu format\_profile\_id vào documents
-----
**3.7. Bước 6 – Động cơ xuất Word**

Đây là phần quan trọng, bạn nên code tách riêng:

1. Tạo module “DocumentRenderer” trong backend:
   1. Hàm nhận vào:
      1. document\_id
      1. format\_profile\_id
   1. Bên trong:
      1. Nạp cây doc\_nodes đầy đủ
      1. Nạp config\_json của profile
      1. Chuẩn bị bộ đếm đánh số
      1. Dùng thư viện xử lý docx:
         1. Khởi tạo tài liệu
         1. Tạo style theo styles
         1. Đặt trang theo page
         1. Duyệt cây node và tạo đoạn, hình, bảng…
1. Viết API /documents/{id}/export-word sử dụng module này:
   1. Tạo file trên máy chủ
   1. Trả về đường dẫn để tải
1. Test:
   1. Dùng tài liệu mẫu, xuất file Word
   1. Đối chiếu với quy định của một trường cụ thể, chỉnh sửa profile tới khi khớp 100%.
-----
**3.8. Bước 7 – Tích hợp trí tuệ nhân tạo**

1. Tạo module “AiService” trong backend:
   1. Hàm gợi ý đề cương
   1. Hàm gợi ý nội dung
   1. Hàm viết lại học thuật
   1. Hàm gợi ý caption hình, bảng
1. Viết API:
   1. /documents/{id}/outline/ai-suggest
   1. /documents/{id}/nodes/{node\_id}/ai-suggest-content
   1. /documents/{id}/nodes/{node\_id}/ai-rewrite
1. Frontend:
   1. Gắn nút “Gợi ý đề cương”, “Gợi ý đoạn”, “Viết lại học thuật hơn”
   1. Hiển thị nội dung gợi ý, cho phép người dùng “chấp nhận” hoặc “từ chối”
1. Lưu log vào ai\_requests để sau này phân tích.
-----
**3.9. Bước 8 – Kiểm tra file Word**

1. Backend:
   1. Tạo module “WordValidator”:
      1. Đọc file docx
      1. Lấy thông tin trang, style đoạn, nội dung
      1. Xác định vai trò từng đoạn
      1. So sánh với profile
      1. Sinh validation\_reports
1. API:
   1. /validation/check-word
   1. /validation/reports/{id}
1. Frontend:
   1. Màn upload file Word
   1. Hiển thị điểm, danh sách lỗi.
-----
**3.10. Kiểm thử tổng thể**

1. Viết kiểm thử đơn vị cho backend:
   1. Hàm luận chương số
   1. Hàm sinh tiêu đề chương, mục, hình, bảng theo mẫu
   1. Hàm ghép cây node thành cấu trúc nội bộ trước khi render
1. Kiểm thử tích hợp:
   1. Tạo tài liệu → tạo đề cương → soạn nội dung → xuất Word
   1. So format với kỳ vọng
1. Kiểm thử giao diện:
   1. Luồng người dùng từ đăng nhập → tạo tài liệu → đề cương → soạn nội dung → xuất file → kiểm tra file.
-----
Nếu bạn muốn, bước tiếp theo mình có thể:

- Viết mẫu chi tiết một JSON config\_json cho một trường cụ thể
- Hoặc phác ra cấu trúc code của module xuất Word (giả sử bạn dùng Node) để bạn nắm khung dự án.

Nhưng với tài liệu tới đây, bạn đã có:

- Thiết kế cơ sở dữ liệu gần như hoàn chỉnh
- Đặc tả chức năng cho các màn chính
- Đặc tả API khung
- Lộ trình triển khai rõ ràng từ bước 1 đến khi có sản phẩm chạy được.

