import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';

export const DashboardHome: React.FC = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card><Statistic title="Lịch hẹn hôm nay" value={24} /></Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card><Statistic title="Khách mới" value={7} /></Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card><Statistic title="Doanh thu (ngày)" value={3200000} precision={0} suffix="₫" /></Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card><Statistic title="Thợ đang làm" value={5} /></Card>
      </Col>
    </Row>
  );
};

export default DashboardHome;


