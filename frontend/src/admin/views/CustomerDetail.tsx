import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Button, Descriptions, Form, Input, message, Space, Drawer } from 'antd';
import { AdminController } from '../controllers/AdminController';
import type { CustomerDto } from '../models/AdminModel';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [customer, setCustomer] = React.useState<CustomerDto | null>(null);
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      if (!id) throw new Error('Thiếu mã khách hàng');
      const data = await AdminController.getCustomer(id);
      setCustomer(data);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleEdit = () => {
    form.setFieldsValue({
      user: {
        name: customer?.user?.name || '',
        email: customer?.user?.email || '',
        phone: customer?.user?.phone || '',
      },
      point: customer?.point?.current_points ?? '',
      rank: customer?.rank?.name ?? '',
      face_shape: customer?.face_shape || '',
      hair_texture: customer?.hair_texture || '',
    });
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // Mapping payload, thay đổi cho đúng backend yêu cầu - ở đây giả định backend nhận đúng field như values
      const payload = {
        face_shape: values.face_shape,
        hair_texture: values.hair_texture,
        user: {
          id: customer!.user.id,
          name: values.user.name,
          email: values.user.email,
          phone: values.user.phone,
          email_verified_at: customer!.user.email_verified_at,
        },
        point: values.point,
        rank: {
          ...customer!.rank,
          name: values.rank,
        },
      };
      await AdminController.updateCustomer(String(customer!.id), payload);
      message.success('Cập nhật thành công!');
      setDrawerOpen(false);
      fetchCustomer();
    } catch (error) {
      // validation error or API error
      console.error('Failed to update customer:', error);
      message.error('Cập nhật thất bại!');
      // validation error
    }
  };

  if (loading) return <Spin style={{marginTop: 32}} />;
  if (!customer) return <Card style={{marginTop: 32}}>Không tìm thấy khách hàng này.</Card>;

  return (
    <Card
      title={
        <>
          <Button type="link" onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
            ← Quay lại
          </Button>
          <span style={{ marginLeft: 8, fontWeight: 600 }}>Chi tiết khách hàng</span>
        </>
      }
      style={{ maxWidth: 640, margin: '32px auto' }}
      extra={<Button onClick={handleEdit}>Sửa</Button>}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Họ tên">{customer.user?.name ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Email">{customer.user?.email ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Email xác thực">{customer.user?.email_verified_at ? customer.user.email_verified_at : <span style={{color:'#aaa'}}>Chưa xác minh</span>}</Descriptions.Item>
        <Descriptions.Item label="Khuôn mặt">{customer.face_shape ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Chất tóc">{customer.hair_texture ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Số điểm hiện tại">{customer.point?.current_points ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Tổng điểm">{customer.point?.total_points ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Điểm đã sử dụng">{customer.point?.used_points ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Hạng thành viên">{customer.rank?.name ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Điểm tối thiểu lên hạng">{customer.rank?.min_total_points ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Giảm giá (%)">{customer.rank?.discount_percent ?? ''}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{customer.created_at ? new Date(customer.created_at).toLocaleDateString('vi-VN') : ''}</Descriptions.Item>
        <Descriptions.Item label="Cập nhật">{customer.updated_at ? new Date(customer.updated_at).toLocaleDateString('vi-VN') : ''}</Descriptions.Item>
      </Descriptions>
      <Drawer
        title="Chỉnh sửa khách hàng"
        placement="right"
        width={420}
        open={drawerOpen}
        onClose={handleDrawerClose}
        extra={
          <Space>
            <Button onClick={handleDrawerClose}>Huỷ</Button>
            <Button type="primary" onClick={handleSave}>Lưu</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Họ tên" name={["user","name"]} rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name={["user","email"]} rules={[{ required: true, type: 'email', message: 'Vui lòng nhập đúng email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="SĐT" name={["user","phone"]} rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Điểm" name="point" rules={[{ required: true, message: 'Vui lòng nhập điểm' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item label="Hạng" name="rank" rules={[{ required: true, message: 'Chọn hạng' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Khuôn mặt" name="face_shape">
            <Input />
          </Form.Item>
          <Form.Item label="Chất tóc" name="hair_texture">
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
    </Card>
  );
};

export default CustomerDetail;
