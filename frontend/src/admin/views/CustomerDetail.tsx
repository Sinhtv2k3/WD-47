import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Button, Tag, Descriptions, Space } from 'antd';
import { AdminController } from '../controllers/AdminController';
import type { CustomerDto } from '../models/AdminModel';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [customer, setCustomer] = React.useState<CustomerDto | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Nếu có AdminController.getCustomer, dùng - nếu không thì lấy toàn bộ và filter
        const customers = await AdminController.getCustomers();
        const found = customers.find(c => String(c.id) === String(id));
        if (mounted) setCustomer(found ?? null);
      } catch (e) {
        if (mounted) setCustomer(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <Spin style={{marginTop: 32}} />;
  if (!customer) return <Card style={{marginTop: 32}}>Không tìm thấy khách hàng này.</Card>;

  return (
    <Card
      title={<>
        <Button type="link" onClick={() => navigate(-1)} style={{paddingLeft: 0}}>← Quay lại</Button>
        <span style={{marginLeft: 8, fontWeight: 600}}>Chi tiết khách hàng #{customer.id}</span>
      </>}
      style={{ maxWidth: 640, margin: '32px auto' }}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="ID">{customer.id}</Descriptions.Item>
        <Descriptions.Item label="Họ tên">{customer.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
        <Descriptions.Item label="SĐT">{customer.phone}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">{customer.address}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{customer.dob ? new Date(customer.dob).toLocaleDateString('vi-VN') : ''}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">{customer.gender === 'male' ? 'Nam' : 'Nữ'}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={customer.status === 1 ? 'green' : 'red'}>
            {customer.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{new Date(customer.created_at).toLocaleDateString('vi-VN')}</Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">{new Date(customer.updated_at).toLocaleDateString('vi-VN')}</Descriptions.Item>
        <Descriptions.Item label="Vai trò">
          <Space>
            {customer.roles?.map(role => (
              <Tag key={role.id} color="blue">{role.name}</Tag>
            )) || 'Không'}
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CustomerDetail;
