import React from 'react';
import './policies.scss';

// Chính sách Nhận hàng - Thanh toán
export const DeliveryPaymentPolicy = () => {
    return (
        <>
            <div className="policy-page">
                <div className="container">
                    <div className="policy-header">
                        <h1>Chính Sách Nhận Hàng - Thanh Toán</h1>
                        <p className="last-updated">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div className="policy-content">
                        <section className="policy-section">
                            <h2>1. Phương Thức Thanh Toán</h2>
                            <div className="policy-text">
                                <h3>1.1 Thanh toán trực tiếp (COD)</h3>
                                <p>Khách hàng có thể thanh toán khi nhận hàng. Chúng tôi sẽ giao hàng đến địa chỉ của bạn và bạn thanh toán trực tiếp cho nhân viên giao hàng.</p>

                                <h3>1.2 Chuyển khoản ngân hàng</h3>
                                <p>Khách hàng có thể chuyển khoản trực tiếp vào tài khoản ngân hàng của Kim Bảo.</p>
                                <ul>
                                    <li><strong>Ngân hàng:</strong> Agribank / Techcombank / Vietcombank</li>
                                    <li><strong>Chủ tài khoản:</strong> Kim Bảo Jewelry</li>
                                    <li><strong>Nội dung:</strong> Nhập mã đơn hàng hoặc số điện thoại</li>
                                </ul>

                                <h3>1.3 Ví điện tử & Thanh toán online</h3>
                                <p>Chúng tôi hỗ trợ thanh toán qua Momo, Zalopay, và các cổng thanh toán online khác.</p>

                                <h3>1.4 Trả góp 0% lãi</h3>
                                <p>Đối với các sản phẩm trang sức có giá trị cao, khách hàng có thể lựa chọn hình thức trả góp 0% lãi.</p>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>2. Quy Trình Giao Hàng</h2>
                            <div className="policy-text">
                                <h3>2.1 Phạm vi giao hàng</h3>
                                <ul>
                                    <li>Toàn bộ các tỉnh, thành phố trên cả nước</li>
                                    <li>Giao hàng tới các địa điểm lẻ phí thêm 50.000đ</li>
                                    <li>Giao hàng tới các huyện, xã xa có phí vận chuyển tăng thêm</li>
                                </ul>

                                <h3>2.2 Thời gian giao hàng</h3>
                                <ul>
                                    <li><strong>Hà Nội, TP.HCM:</strong> 1-2 ngày làm việc</li>
                                    <li><strong>Các tỉnh khác:</strong> 2-5 ngày làm việc</li>
                                </ul>

                                <h3>2.3 Phí giao hàng</h3>
                                <ul>
                                    <li>Miễn phí giao hàng cho đơn hàng từ 5.000.000đ trở lên</li>
                                    <li>Phí giao hàng sẽ được thông báo trước khi thanh toán</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>3. Kiểm Tra Hàng & Hoàn Trả</h2>
                            <div className="policy-text">
                                <h3>3.1 Quyền kiểm tra hàng</h3>
                                <p>Khách hàng có quyền kiểm tra tình trạng gói hàng trước khi thanh toán. Nếu hư hỏng, có thể từ chối nhận.</p>

                                <h3>3.2 Yêu cầu hoàn trả</h3>
                                <ul>
                                    <li>Hàng phải được yêu cầu hoàn trả trong vòng 7 ngày</li>
                                    <li>Sản phẩm phải còn nguyên vẹn, chưa sử dụng</li>
                                    <li>Khách hàng chịu phí vận chuyển khi hoàn trả</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>4. Liên Hệ Hỗ Trợ</h2>
                            <div className="policy-text">
                                <ul>
                                    <li><strong>Hotline:</strong> 0333 586 204</li>
                                    <li><strong>Email:</strong> contact@kb.com.vn</li>
                                    <li><strong>Thời gian hỗ trợ:</strong> 8:00 - 20:00 hàng ngày</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

// Chính sách Bảo hành
export const WarrantyPolicy = () => {
    return (
        <>
            <div className="policy-page">
                <div className="container">
                    <div className="policy-header">
                        <h1>Chính Sách Bảo Hành</h1>
                        <p className="last-updated">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div className="policy-content">
                        <section className="policy-section">
                            <h2>1. Thời Hạn Bảo Hành</h2>
                            <div className="policy-text">
                                <p>Tất cả sản phẩm trang sức của Kim Bảo được bảo hành miễn phí trong:</p>
                                <ul>
                                    <li><strong>Vàng 14k, 18k, 24k:</strong> 24 tháng kể từ ngày mua hàng</li>
                                    <li><strong>Bạc 925:</strong> 12 tháng kể từ ngày mua hàng</li>
                                    <li><strong>Đá quý, kim cương:</strong> Kiểm tra miễn phí + 12 tháng bảo hành</li>
                                    <li><strong>Nhẫn cưới & Trang sức cao cấp:</strong> 24-36 tháng tùy sản phẩm</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>2. Phạm Vi Bảo Hành</h2>
                            <div className="policy-text">
                                <h3>Được bảo hành:</h3>
                                <ul>
                                    <li>Mộng chìa kim loại bị lỏng, không bám chắc đá</li>
                                    <li>Gioăng, móc treo bị gẫy do lỗi sản phẩm</li>
                                    <li>Khóa nhẫn bị hỏng hoặc lỏng lẻo</li>
                                    <li>Kim loại bị mất độ sáng hoặc bị gỉ (không phải do tiếp xúc hóa chất)</li>
                                    <li>Đá quý bị mất, gẫy do khuyết tật sản xuất</li>
                                </ul>

                                <h3>Không được bảo hành:</h3>
                                <ul>
                                    <li>Sản phẩm đã qua sửa chữa bởi bên thứ 3</li>
                                    <li>Hao mòn tự nhiên do sử dụng lâu dài</li>
                                    <li>Sản phẩm bị hư hỏng do tai nạn, va đập mạnh</li>
                                    <li>Tiếp xúc với hóa chất, chất tẩy rửa mạnh</li>
                                    <li>Không có chứng chỉ, hóa đơn mua hàng</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>3. Quy Trình Bảo Hành</h2>
                            <div className="policy-text">
                                <ol>
                                    <li>Liên hệ hotline hoặc tới trực tiếp cửa hàng</li>
                                    <li>Đội ngũ chuyên gia kiểm tra sản phẩm</li>
                                    <li>Sửa chữa miễn phí hoặc thay thế sản phẩm</li>
                                    <li>Sản phẩm được bàn giao trong vòng 7-15 ngày</li>
                                </ol>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>4. Liên Hệ Bảo Hành</h2>
                            <div className="policy-text">
                                <ul>
                                    <li><strong>Hotline:</strong> 0333 586 204</li>
                                    <li><strong>Email:</strong> baohanh@kb.com.vn</li>
                                    <li><strong>Địa chỉ:</strong> Khương Đình - Thanh Xuân - Hà Nội</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

// Chính sách Bảo mật
export const PrivacyPolicy = () => {
    return (
        <>
            <div className="policy-page">
                <div className="container">
                    <div className="policy-header">
                        <h1>Chính Sách Bảo Mật</h1>
                        <p className="last-updated">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div className="policy-content">
                        <section className="policy-section">
                            <h2>1. Thông Tin Chúng Tôi Thu Thập</h2>
                            <div className="policy-text">
                                <h3>Thông tin cá nhân:</h3>
                                <ul>
                                    <li>Tên, địa chỉ email, số điện thoại</li>
                                    <li>Địa chỉ giao hàng, địa chỉ hóa đơn</li>
                                    <li>Thông tin thanh toán (số thẻ, tài khoản ngân hàng)</li>
                                    <li>Lịch sử mua hàng, sở thích sản phẩm</li>
                                </ul>

                                <h3>Thông tin không cá nhân:</h3>
                                <ul>
                                    <li>Loại trình duyệt, hệ điều hành</li>
                                    <li>Địa chỉ IP, cookie, dữ liệu phân tích</li>
                                    <li>Trang web được truy cập, thời gian truy cập</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>2. Cách Sử Dụng Thông Tin</h2>
                            <div className="policy-text">
                                <p>Kim Bảo sử dụng thông tin của bạn để:</p>
                                <ul>
                                    <li>Xử lý đơn hàng và giao hàng sản phẩm</li>
                                    <li>Cung cấp dịch vụ khách hàng và hỗ trợ</li>
                                    <li>Gửi thông báo về đơn hàng</li>
                                    <li>Phân tích dữ liệu để cải thiện dịch vụ</li>
                                    <li>Tuân thủ các yêu cầu pháp luật</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>3. Bảo Mật Dữ Liệu</h2>
                            <div className="policy-text">
                                <p>Kim Bảo cam kết bảo vệ dữ liệu cá nhân của bạn bằng:</p>
                                <ul>
                                    <li>Mã hóa SSL (HTTPS) cho tất cả các giao dịch</li>
                                    <li>Mật khẩu được mã hóa và lưu trữ an toàn</li>
                                    <li>Tường lửa và hệ thống phát hiện xâm nhập</li>
                                    <li>Chỉ nhân viên ủy quyền mới có quyền truy cập</li>
                                    <li>Audit bảo mật định kỳ</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>4. Chia Sẻ Thông Tin</h2>
                            <div className="policy-text">
                                <h3>Chúng tôi có thể chia sẻ thông tin với:</h3>
                                <ul>
                                    <li>Đối tác vận chuyển để giao hàng</li>
                                    <li>Cổng thanh toán để xử lý thanh toán</li>
                                    <li>Nhà cung cấp dịch vụ (email, phân tích)</li>
                                    <li>Cơ quan thực thi pháp luật khi yêu cầu hợp pháp</li>
                                </ul>
                                <p><strong>Chúng tôi không bao giờ bán dữ liệu cá nhân cho bên thứ 3.</strong></p>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>5. Quyền Của Bạn</h2>
                            <div className="policy-text">
                                <p>Bạn có quyền:</p>
                                <ul>
                                    <li>Truy cập dữ liệu cá nhân của mình</li>
                                    <li>Yêu cầu chỉnh sửa hoặc xóa dữ liệu</li>
                                    <li>Rút lại sự đồng ý tiếp thị bất kỳ lúc nào</li>
                                    <li>Khiếu nại với cơ quan bảo vệ dữ liệu</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>6. Liên Hệ</h2>
                            <div className="policy-text">
                                <ul>
                                    <li><strong>Email:</strong> privacy@kb.com.vn</li>
                                    <li><strong>Hotline:</strong> 0333 586 204</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

// Điều khoản dịch vụ
export const TermsOfService = () => {
    return (
        <>
            <div className="policy-page">
                <div className="container">
                    <div className="policy-header">
                        <h1>Điều Khoản Dịch Vụ</h1>
                        <p className="last-updated">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div className="policy-content">
                        <section className="policy-section">
                            <h2>1. Điều Khoản Chung</h2>
                            <div className="policy-text">
                                <p>Bằng cách truy cập website Kim Bảo, bạn đồng ý tuân thủ các điều khoản này. Kim Bảo có quyền sửa đổi các điều khoản bất kỳ lúc nào.</p>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>2. Giấy Phép Sử Dụng</h2>
                            <div className="policy-text">
                                <p>Kim Bảo cấp giấy phép không độc quyền để sử dụng website cho mục đích cá nhân. Bạn không được:</p>
                                <ul>
                                    <li>Sao chép hoặc tái bản nội dung</li>
                                    <li>Sửa đổi hoặc tạo các tác phẩm phái sinh</li>
                                    <li>Sử dụng tự động hóa hoặc bot để thu thập dữ liệu</li>
                                    <li>Thực hiện các hoạt động có hại đến website</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>3. Hình Ảnh & Nội Dung Sản Phẩm</h2>
                            <div className="policy-text">
                                <p>Tất cả hình ảnh, mô tả, giá cả trên website là bản quyền của Kim Bảo. Hình ảnh có thể không chính xác 100% so với sản phẩm thực tế do độ phân giải màn hình.</p>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>4. Giá Cả & Sự Có Sẵn</h2>
                            <div className="policy-text">
                                <ul>
                                    <li>Giá trên website được cập nhật thường xuyên nhưng có thể có sai sót</li>
                                    <li>Kim Bảo có quyền từ chối đơn hàng nếu sản phẩm không còn</li>
                                    <li>Kim Bảo có quyền từ chối đơn hàng nếu có lỗi về giá</li>
                                    <li>Phí giao hàng có thể khác nhau tùy vào địa điểm</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>5. Tài Khoản Người Dùng</h2>
                            <div className="policy-text">
                                <p>Khi tạo tài khoản, bạn chịu trách nhiệm:</p>
                                <ul>
                                    <li>Cung cấp thông tin chính xác, đầy đủ</li>
                                    <li>Bảo vệ mật khẩu và không chia sẻ tài khoản</li>
                                    <li>Chịu trách nhiệm tất cả hoạt động dưới tài khoản</li>
                                    <li>Thông báo ngay nếu tài khoản bị truy cập trái phép</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>6. Bản Quyền & Sở Hữu Trí Tuệ</h2>
                            <div className="policy-text">
                                <p>Tất cả nội dung trên website (văn bản, hình ảnh, logo) là bản quyền của Kim Bảo. Việc sao chép, tái bản không được phép là vi phạm bản quyền.</p>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>7. Giới Hạn Trách Nhiệm</h2>
                            <div className="policy-text">
                                <p>Kim Bảo không chịu trách nhiệm cho:</p>
                                <ul>
                                    <li>Bất kỳ tổn thất, thiệt hại, hoặc chi phí gián tiếp</li>
                                    <li>Mất dữ liệu, gián đoạn dịch vụ, hoặc lỗi hệ thống</li>
                                    <li>Việc sử dụng website sai cách của người dùng</li>
                                    <li>Độ chính xác hoặc đầy đủ của nội dung website</li>
                                </ul>
                            </div>
                        </section>

                        <section className="policy-section">
                            <h2>8. Liên Hệ</h2>
                            <div className="policy-text">
                                <ul>
                                    <li><strong>Email:</strong> legal@kb.com.vn</li>
                                    <li><strong>Hotline:</strong> 0333 586 204</li>
                                    <li><strong>Địa chỉ:</strong> Khương Đình - Thanh Xuân - Hà Nội</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};
