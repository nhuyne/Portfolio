// Mỗi dòng clip("tên-file", "Tên hiển thị") trỏ tới videos/tên-file.mp4.
// Nếu có thumbnail, thêm tham số thứ ba, ví dụ "./videos/doc01.jpg".
window.EVANS_CONTENT = (() => {
  const clip = (id, title, poster = "") => ({
    id,
    title,
    poster,
    src: `./videos/${id}.mp4`,
  });

  return {
    name: "Evans Dang",
    about:
      "Mình là Evans Dang, Video Editor với 3 năm kinh nghiệm dựng video đa thể loại: từ phóng sự, du lịch, phỏng vấn đến video sản phẩm và nội dung social. Mình làm việc với Premiere Pro, CapCut và After Effects, dựng video cho Facebook, TikTok và quảng cáo (Ads). Mình mong muốn đồng hành lâu dài cùng creator và thương hiệu, từ góp ý ý tưởng, hướng dẫn tự quay đến hoàn thiện video.",
    contact: {
      email: "dangnhuy260119@gmail.com",
      zalo: "https://zalo.me/0971961636",
      facebook: "https://www.facebook.com/Gwenz.3000/",
    },
    intro: clip("intro", "Video giới thiệu"),
    videos: {
      portrait: [
        clip("doc01", "Video Motion"),
        clip("doc02", "Video Không voice"),
        clip("doc09", "Video Recap Sự Kiện"),
        clip("doc12", "Video Voice nam 01"),
        clip("doc03", "Video Voice nữ 01"),
        clip("doc06", "Video Voice nam 02"),
        clip("doc04", "Video Voice nữ 02"),
        clip("doc11", "Video Voice nam 03"),
        clip("doc05", "Video Voice nữ 03"),
        clip("doc07", "Video Không voice"),
        clip("doc08", "Video Voice nữ 04"),
        clip("doc10", "Video Voice nữ"),
      ],
      landscape: [
        clip("ngang02", "Video Lịch"),
        clip("ngang01", "Video Recap Du Lịch"),
        clip("ngang03", "Video Giới Thiệu Sản Phẩm"),
        clip("ngang04", "Video Recap Sự Kiện 01"),
        clip("ngang05", "Video Recap Sự Kiện 02"),
        clip("ngang06", "Video Recap Sự Kiện 03"),
        clip("ngang07", "Video Recap Sự Kiện 04"),
        clip("ngang08", "Video Recap Sự Kiện 05"),
        clip("ngang09", "Video Giới Thiệu Sản Phẩm 02"),
      ],
    },
    // Thêm ảnh để phần Thiết kế tự chuyển thành thư viện, ví dụ:
    // {id:'design-01',category:'Social post',title:'Tên ấn phẩm',image:'./assets/design-01.jpg'}
    designs: [],
  };
})();
