import React from 'react';
import { Button, DatePicker, Drawer, Form, Input, Select, Space, Table, Tag, TimePicker } from 'antd';

interface AppointmentRow {
  key: string;
  time: string;
  customer: string;
  stylist: string;
  service: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const data: AppointmentRow[] = [
  { key: '1', time: '09:00', customer: 'Nguyễn Văn A', stylist: 'Thắng', service: 'Cắt tóc nam', status: 'scheduled' },
  { key: '2', time: '10:00', customer: 'Trần Thị B', stylist: 'Hùng', service: 'Uốn tóc', status: 'completed' },
  { key: '3', time: '11:00', customer: 'Phạm C', stylist: 'Dũng', service: 'Nhuộm tóc', status: 'cancelled' },
];

export const Appointments: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>Quản lý lịch hẹn</h2>
        <Space>
          <DatePicker size="large" />
          <Button type="primary" size="large" onClick={() => setOpen(true)}>
            Tạo lịch hẹn
          </Button>
        </Space>
      </div>
      <Table
        rowKey="key"
        dataSource={data}
        columns={[
          { 
            title: 'Giờ', 
            dataIndex: 'time',
            width: '15%'
          },
          { 
            title: 'Khách hàng', 
            dataIndex: 'customer',
            width: '25%'
          },
          { 
            title: 'Thợ cắt', 
            dataIndex: 'stylist',
            width: '20%'
          },
          { 
            title: 'Dịch vụ', 
            dataIndex: 'service',
            width: '25%'
          },
          { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            width: '15%',
            render: (v: AppointmentRow['status']) => {
              const color = v === 'scheduled' ? 'blue' : v === 'completed' ? 'green' : 'red';
              const label = v === 'scheduled' ? 'Đã đặt' : v === 'completed' ? 'Hoàn thành' : 'Hủy';
              return <Tag color={color}>{label}</Tag>;
            } 
          },
        ]}
        pagination={false}
        bordered
        size="middle"
        style={{ width: '90%' }}
      />
      <Drawer
        title="Tạo lịch hẹn"
        placement="right"
        width={520}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="Khách hàng" name="customer" rules={[{ required: true, message: 'Nhập tên khách' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item label="Thợ" name="stylist" rules={[{ required: true, message: 'Chọn thợ' }]}>
            <Select options={[{ value: 'Thắng' }, { value: 'Hùng' }, { value: 'Dũng' }]} placeholder="Chọn thợ" />
          </Form.Item>
          <Form.Item label="Dịch vụ" name="service" rules={[{ required: true, message: 'Chọn dịch vụ' }]}>
            <Select options={[{ value: 'Cắt tóc nam' }, { value: 'Uốn tóc' }, { value: 'Nhuộm tóc' }]} placeholder="Chọn dịch vụ" />
          </Form.Item>
          <Form.Item label="Ngày" name="date" rules={[{ required: true, message: 'Chọn ngày' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Giờ" name="time" rules={[{ required: true, message: 'Chọn giờ' }]}>
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
       </Drawer>
     </div>
   );
};

export default Appointments;


