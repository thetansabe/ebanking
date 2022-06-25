# ebanking
0) 
- Trước khi thực hiện, thầy nên xem qua folder videos của tụi em (tên file _1_4 nghĩa là use case 1 đến 4),
ĐẶC BIỆT phải coi qua video hướng dẫn import database
- Chức năng gửi email hiện KHÔNG HOẠT ĐỘNG được vì đặt theo setting của thầy
(thầy có thể sửa ở file .env) và LƯU Ý secure: FALSE
- Các file có mailing (trong thư mục source/helpers): changePassword.js, register.js, transfer.js

1) Các link để import database (đã có video hướng dẫn import)
+ Link tải tool: https://www.mongodb.com/try/download/database-tools?tck=docs_databasetools
+ Code import: mongorestore -d <database_name> <directory_backup>
Ví dụ: .\mongorestore.exe -d ebanking C:\Users\MSI GL\OneDrive\Desktop\final\ebanking_db
Lưu ý: 
+) nên dùng terminal để chạy lệnh
+) .\mongorestore.exe -d ebanking giữ nguyên vì database cài đặt cho project tên là ebanking
+) ...\final\ebanking_db phải sửa theo đường dẫn đến file dump database thầy lưu

2) Cách chạy project
+ vào folder source
+ sửa trong file .env để setting email của thầy
+ npm i
+ npm start 
+ trên browser access localhost:3000

3) Các tài khoản dùng để test:
Ngoài việc tạo mới tài khoản mới bằng mail và sđt của thầy, 
chỉ nên dùng những tài khoản dưới đây (mail thật)
+) 4897569876/xinchao123 -> đầy đủ nhất (có lịch sử giao dịch,...)
+) 5809973546/xinchao123 -> tài khoản trống (chưa thực hiện giao dịch nào, ...)
