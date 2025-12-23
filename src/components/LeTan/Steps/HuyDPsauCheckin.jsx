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

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/HuyDatPhong/KiemTraDieuKien/${bookingId}`);
        if (!res.data.success) throw new Error(res.data.message);
        setInfo(res.data.data);
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
      const res = await api.post(`/api/HuyDatPhong/HuySauCheckIn/${bookingId}`);
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
            <SectionTitle icon={<HomeOutlined />} title="Phòng đã nhận" />
            <div className="huydp-room-list">
              {info.phongList?.map((p, i) => (
                <div key={i} className="huydp-room-item">
                  🏨 Phòng <b>{p.soPhong}</b> – {p.tenLoaiPhong}
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
                  <strong>{info.phiGiu?.toLocaleString()} đ</strong>
                </div>
              </Col>
              <Col span={12}>
                <div className="money-box refund">
                  <span>Tiền hoàn</span>
                  <strong>{info.tienHoan?.toLocaleString()} đ</strong>
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
            <Button onClick={onClose}>Đóng</Button>
            <Button
              type="primary"
              danger
              loading={huyLoading}
              disabled={!info.canCancel}
              onClick={handleHuy}
            >
              Xác nhận hủy
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default HuyDPsauCheckin;
