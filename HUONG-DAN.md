# Cập nhật portfolio Evans Dang

Giải nén ZIP, mở thư mục chứa `index.html` trong VS Code, rồi mở trang bằng **Live Server**. Chép video vào thư mục `videos/` ngay cạnh `index.html`. Sau đó tải lại trang.

| Video | Tên file trong `videos/` |
| --- | --- |
| Dọc 9:16 | `doc01.mp4` đến `doc12.mp4` |
| Ngang 16:9 | `ngang01.mp4` đến `ngang09.mp4` |
| Video giới thiệu ở đầu trang | `intro.mp4` |

Giữ đúng tên chữ thường và hai chữ số. Nếu cần xuất lại cho web, chọn MP4 với video H.264 và âm thanh AAC. Các ô sẽ hiện tên file tương ứng trong lúc chờ video.

## Cách xem

- Trên máy tính, rê chuột để xem thử tắt tiếng. Bấm vào video đang chạy để bật tiếng ngay tại vị trí hiện tại. Bấm lần nữa để tắt tiếng.
- Trên điện thoại, chạm vào video để phát có tiếng. Vuốt ngang để chuyển qua các ô khác.
- Nút tạm dừng xuất hiện khi video đang phát. Nút bốn góc ở góc dưới mở toàn màn hình theo yêu cầu. Nếu trình duyệt hạn chế chế độ toàn màn hình, nút này mở khung xem lớn.
- Khi video khác bắt đầu phát, video đang xem sẽ dừng.

## Đổi tên hoặc thêm ảnh đại diện

Các đầu mục có sẵn trong `content.js`. Tên mặc định là “Video dọc 01”, “Video ngang 01”… Để đổi tên, sửa cụm chữ thứ hai trong dòng tương ứng.

```js
clip("doc01", "Quảng cáo sản phẩm"),
```

Web dùng khung hình video khi trình duyệt tải được. Nếu muốn chọn ảnh riêng, chép ảnh vào `videos/` và điền đường dẫn ở vị trí thứ ba.

```js
clip("doc01", "Quảng cáo sản phẩm", "./videos/doc01.jpg"),
```

Xóa dòng tương ứng trong `content.js` nếu muốn ẩn ô chưa dùng. Để thêm một video, chép file vào `videos/` và thêm dòng tương tự với tên file, bỏ phần `.mp4`.

## Các phần khác

`content.js` có thông tin liên hệ, phần giới thiệu bản thân và danh sách thiết kế. `index.html` chứa nội dung các phần trên trang. `styles.css` chứa màu sắc, bố cục và hiệu ứng.

Khi đưa lên GitHub Pages, đặt `index.html`, `content.js`, `app.js`, `styles.css` cùng các thư mục `assets/` và `videos/` ở gốc thư mục được xuất bản. Các đường dẫn video cũng hoạt động khi website nằm trong thư mục con.
