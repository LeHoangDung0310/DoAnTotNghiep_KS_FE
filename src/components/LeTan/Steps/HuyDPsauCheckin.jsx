import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Divider,
  Tag,
  Alert,
  Spin,
  Button,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  DollarOutlined,
  ExclamationCircleTwoTone
} from '@ant-design/icons';
import api from '../../../utils/api';
import '../../../styles/HuyDPsauCheckin.css';

const { Title, Text } = Typography;

const SectionTitle = ({ icon, title }) => (
  <div className="huydp-section-header">
    {icon}
    <span>{title}</span>
  </div>
);

const HuyDPsauCheckin = ({ bookingId, onClose, onSuccess, onShowToast }) => {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [huyLoading, setHuyLoading] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]); // List of MaPhong
  const [phiGiu, setPhiGiu] = useState(0);
  const [tienHoan, setTienHoan] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/HuyDatPhong/KiemTraDieuKien/${bookingId}`);
        if (!res.data.success) throw new Error(res.data.message);
        const data = res.data.data;
        setInfo(data);

        // Mặc định chọn tất cả các phòng
        const allMaPhongs = data.phongList?.map(p => p.maPhong) || [];
        setSelectedRooms(allMaPhongs);
        setPhiGiu(data.phiGiu);
        setTienHoan(data.tienHoan);
      } catch (err) {
        setError(err.message || 'Không lấy được thông tin');
      } finally {
        setLoading(false);
      }
    };
    bookingId && fetchAll();
  }, [bookingId]);

  const handleHuy = async () => {
    setHuyLoading(true);
    try {
      const res = await api.post(`/api/HuyDatPhong/HuySauCheckIn/${bookingId}`, selectedRooms);
      if (res.data.success) {
        onShowToast?.('success', res.data.message);
        onSuccess?.();
        onClose?.(); // Close modal and return to Quản lý đặt phòng
      } else throw new Error(res.data.message);
    } catch (err) {
      onShowToast?.('error', err.message);
    } finally {
      setHuyLoading(false);
    }
  };

  // Tính lại tiền khi thay đổi danh sách phòng chọn
  useEffect(() => {
    if (!info || !info.phongList) return;

    // Lấy danh sách các phòng được chọn từ info.phongList
    const selectedList = info.phongList.filter(p => selectedRooms.includes(p.maPhong));

    // Tính số ngày ở
    const ngayNhan = new Date(info.ngayNhanPhong || new Date());
    const ngayTra = new Date(info.ngayTraPhong || new Date());
    const soNgayO = Math.max(1, Math.ceil((ngayTra - ngayNhan) / (1000 * 60 * 60 * 24)));

    const tongGiaMoiDemSelected = selectedList.reduce((sum, p) => sum + (p.giaPhong || 0), 0);
    const newPhiGiu = tongGiaMoiDemSelected; // 1 đêm đầu
    const newTienHoan = Math.max(0, tongGiaMoiDemSelected * soNgayO - newPhiGiu);

    setPhiGiu(newPhiGiu);
    setTienHoan(newTienHoan);
  }, [selectedRooms, info]);

  const toggleRoom = (maPhong) => {
    setSelectedRooms(prev =>
      prev.includes(maPhong)
        ? prev.filter(id => id !== maPhong)
        : [...prev, maPhong]
    );
  };

  return (
    <div className="huydp-wrapper">
      <div className="huydp-header">
        <ExclamationCircleTwoTone twoToneColor="#faad14" />
        <Title level={4}>Hủy đặt phòng sau Check-in</Title>
      </div>

      {loading && <Spin className="huydp-loading" />}
      {error && <Alert type="error" message={error} showIcon />}

      {info && (
        <>
          <Card className="huydp-card" bordered={false}>
            {/* KHÁCH */}
            <SectionTitle icon={<UserOutlined />} title="Khách hàng" />
            <Row gutter={20}>
              <Col span={12}>
                <Text type="secondary">Họ tên</Text>
                <div className="huydp-value">{info.khachHang?.hoTen || '--'}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Số điện thoại</Text>
                <div className="huydp-value">{info.khachHang?.soDienThoai || '--'}</div>
              </Col>
            </Row>

            <Divider />

            {/* PHÒNG */}
            <SectionTitle icon={<HomeOutlined />} title="Chọn phòng muốn hủy" />
            <div className="dp-room-selector" style={{ marginBottom: 20 }}>
              {info.phongList?.map((p) => (
                <div
                  key={p.maPhong}
                  className={`dp-room-option ${selectedRooms.includes(p.maPhong) ? 'active' : ''}`}
                  onClick={() => toggleRoom(p.maPhong)}
                  style={{ minWidth: 200 }}
                >
                  <div className="dp-room-number">Phòng {p.soPhong}</div>
                  <div className="dp-room-type">{p.tenLoaiPhong}</div>
                </div>
              ))}
            </div>

            <Divider />

            {/* TIỀN */}
            <SectionTitle icon={<DollarOutlined />} title="Hoàn tiền & Phí giữ" />
            <Row gutter={16}>
              <Col span={12}>
                <div className="money-box fee">
                  <span>Phí giữ</span>
                  <strong>{phiGiu?.toLocaleString()} đ</strong>
                </div>
              </Col>
              <Col span={12}>
                <div className="money-box refund">
                  <span>Tiền hoàn</span>
                  <strong>{tienHoan?.toLocaleString()} đ</strong>
                </div>
              </Col>
            </Row>
          </Card>

          <Alert
            className="huydp-warning"
            type="warning"
            showIcon
            message="Chỉ được hủy trong ngày đầu tiên sau khi nhận phòng"
          />

          <div className="huydp-actions">
            <Button onClick={onClose} size="large">Đóng</Button>
            <Button
              type="primary"
              danger
              size="large"
              loading={huyLoading}
              disabled={!info.canCancel || selectedRooms.length === 0}
              onClick={handleHuy}
            >
              Xác nhận hủy {selectedRooms.length > 0 && `(${selectedRooms.length} phòng)`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default HuyDPsauCheckin;
