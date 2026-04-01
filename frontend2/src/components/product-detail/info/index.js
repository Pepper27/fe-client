import React, { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import "./index.scss";

export const InformationDetail = () => {
  const [openSize, setOpenSize] = useState(false);
  const [openDelivery, setOpenDelivery] = useState(false);

  return (
    <div className="info-container">
      {/* SECTION: HƯỚNG DẪN CHỌN SIZE */}
      <div className="info-section border-y">
        <div
          className="info-header"
          onClick={() => setOpenSize(!openSize)}
        >
          <h3 className="info-title">HƯỚNG DẪN CHỌN SIZE</h3>
          {openSize ? <FaMinus /> : <FaPlus />}
        </div>

        {openSize && (
          <div className="info-content">
            <span className="text-bold">Hướng dẫn kích thước vòng tay</span>
            <p className="text-bold pt-10">Để chọn được chiếc vòng tay vừa ý, điều quan trọng nhất là phải biết kích thước cổ tay của bạn!</p>
            <p>Mỗi loại vòng tay thường có bảng kích thước riêng. Bạn hãy tìm bảng kích thước tương ứng với loại vòng bạn đang quan tâm.</p>
            
            <span className="text-bold">Lưu ý:</span>
            <ul className="info-list">
              <li>Nếu bạn thích đeo vòng tay vừa vặn, hãy chọn kích thước bằng với số đo cổ tay của bạn.</li>
              <li>Nếu bạn thích đeo vòng tay hơi rộng, hãy chọn size lớn hơn một chút so với số đo cổ tay.</li>
              <li>Nếu bạn thích ôm sát, hãy chọn size nhỏ hơn một chút.</li>
            </ul>

            <span className="text-bold">Mẹo:</span>
            <p className="text-relaxed">
              Trong trường hợp bạn phân vân giữa hai kích thước, tốt nhất nên chọn size lớn hơn.
              Một số loại vòng tay có thể điều chỉnh kích thước, đây là lựa chọn tuyệt vời nếu bạn không chắc chắn về số đo của mình.
            </p>
            <p className="text-footer-note">Chúc bạn tìm được kích thước hoàn hảo!</p>

            <div className="category-section">
              <h3 className="font-semibold">Các loại vòng:</h3>
              <ul className="info-list">
                <li>Pandora Moments</li>
                <li>Pandora Reflexions</li>
                <li>Pandora ME</li>
                <li>Other</li>
              </ul>
            </div>

            <h3 className="section-subtitle underline">Làm thế nào để lấy được số đo cổ tay chính xác:</h3>

            <h2 className="step-title">1/ Sử dụng thước dây</h2>
            <div className="image-wrapper">
              <img src="/client/image/chonsize1.jpg" alt="Đo bằng thước dây" />
            </div>
            <p>Đo cổ tay bằng thước dây mềm: Quấn quanh cổ tay ngay phía trên xương cổ tay và ghi lại số đo.</p>

            <h2 className="step-title">2/ Sử dụng một loại dây hoặc mảnh giấy dài</h2>
            <div className="image-wrapper">
              <img src="/client/image/chonsize2.jpg" alt="Đo bằng giấy" />
            </div>
            <p>Dùng dây/giấy: Quấn quanh cổ tay, phía trên xương cổ tay. Đánh dấu điểm kết thúc, duỗi dây ra và đo đoạn được đánh dấu.</p>

            <h2 className="brand-title">PANDORA MOMENTS</h2>
            <div className="image-wrapper centered">
              <img src="/client/image/chonsize3.png" alt="Pandora Moments" />
            </div>
            
            <table className="size-table">
              <thead>
                <tr>
                  <th>Kích thước cổ tay</th>
                  <th>Kích thước size vòng</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>13 cm</td><td>Size 15</td></tr>
                <tr><td>14 cm</td><td>Size 16</td></tr>
                <tr><td>15 cm</td><td>Size 17</td></tr>
                <tr><td>16 cm</td><td>Size 18</td></tr>
                <tr><td>17 cm</td><td>Size 19</td></tr>
                <tr><td>18 cm</td><td>Size 20</td></tr>
                <tr><td>19 cm</td><td>Size 21</td></tr>
              </tbody>
            </table>
            
            <p className="description-note">Sản phẩm có thể kết hợp từ 15-20 charm , nhưng nếu bạn kết hợp hơn 5 charm hãy chọn kích cỡ size vòng kế tiếp.</p>
          </div>
        )}
      </div>

      {/* SECTION: CHÍNH SÁCH GIAO HÀNG */}
      <div className="info-section border-b">
        <div
          className="info-header"
          onClick={() => setOpenDelivery(!openDelivery)}
        >
          <h3 className="info-title uppercase">Chính sách giao hàng & đổi trả</h3>
          {openDelivery ? <FaMinus /> : <FaPlus />}
        </div>
        {openDelivery && (
          <div className="info-content">
            <span className="text-bold">Chính Sách Miễn Phí Vận Chuyển</span>
            <p className="pt-10">Pandora áp dụng chính sách miễn phí vận chuyển cho tất cả các đơn hàng trên Website.</p>
            <span className="italic-bold">Ưu đãi miễn phí vận chuyển:</span>
            <ul className="info-list no-bullet">
              <li>• Miễn phí vận chuyển cho tất cả các đơn hàng.</li>
              <li>• Áp dụng cho tất cả các sản phẩm trên Website và Fanpage.</li>
              <li>• Áp dụng trên toàn quốc.</li>
            </ul>
            <p>Xin chân thành cảm ơn bạn đã lựa chọn mua sắm tại chúng tôi!</p>
          </div>
        )}
      </div>
    </div>
  );
};
