import React from 'react';
import { Button, Input, Space, Table, Drawer, Form, Popconfirm, message } from 'antd';
import { AdminController } from '../controllers/AdminController';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Remote data handled by AdminController

export const Customers: React.FC = () => {
  const [form] = Form.useForm<CustomerRow>();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'create' | 'edit'>('create');
  const [rows, setRows] = React.useState<CustomerRow[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const customers = await AdminController.getCustomers();
        if (mounted) setRows(customers ?? []);
      } catch (err) {
        console.error('Failed to load /db.json', err);
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddClick = () => {
    setMode('create');
    form.resetFields();
    setEditingId(null);
    setOpen(true);
  };

  const handleEditClick = (record: CustomerRow) => {
    setMode('edit');
    form.setFieldsValue(record);
    setEditingId(record.id);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (mode === 'create') {
        const { name, email, phone, address } = values as CustomerRow;
        const created = await AdminController.createCustomer({ name, email, phone, address });
        setRows(prev => [created, ...prev]);
        message.success('Đã thêm khách hàng');
      } else if (mode === 'edit' && editingId) {
        const { name, email, phone, address } = values as CustomerRow;
        const updated = await AdminController.updateCustomer(editingId, { name, email, phone, address });
        setRows(prev => prev.map(r => r.id === editingId ? updated : r));
        message.success('Đã cập nhật khách hàng');
      }
      setOpen(false);
    } catch {
      // antd Form sẽ hiển thị lỗi
    }
  };

  const handleDelete = async (record: CustomerRow) => {
    await AdminController.deleteCustomer(record.id);
    setRows(prev => prev.filter(r => r.id !== record.id));
    message.success('Đã xóa khách hàng');
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Tầng 1: Tiêu đề bên trái, nút thêm bên phải */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>Quản lý khách hàng</h2>
        <Button type="primary" size="large" onClick={handleAddClick}>
          Thêm khách
        </Button>
      </div>

      {/* Tầng 2: Thanh tìm kiếm */}
      <div style={{ marginBottom: 16 }}>
        <Input.Search 
          placeholder="Tìm khách theo tên, SĐT, email..." 
          allowClear
          size="large"
        />
      </div>

      {/* Tầng 3: Bảng dữ liệu */}
      <Table
        rowKey="id"
        dataSource={rows}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 100 },
          { title: 'Tên khách hàng', dataIndex: 'name', width: 220 },
          { title: 'Email', dataIndex: 'email', width: 240 },
          { title: 'Số điện thoại', dataIndex: 'phone', width: 180 },
          { title: 'Địa chỉ', dataIndex: 'address' },
          { 
            title: 'Thao tác', 
            width: 140,
            fixed: 'right' as const,
            render: (_, record) => (
              <Space>
                <Button size="small" type="link" onClick={() => handleEditClick(record as CustomerRow)}>Sửa</Button>
                <Popconfirm
                  title="Xóa khách hàng"
                  description={`Bạn chắc chắn muốn xóa "${(record as CustomerRow).name}"?`}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDelete(record as CustomerRow)}
                >
                  <Button size="small" type="link" danger>Xóa</Button>
                </Popconfirm>
              </Space>
            )
          },
        ]}
        pagination={{ pageSize: 10, position: ['bottomCenter'] }}
        bordered
        size="middle"
        loading={loading}
      />

      {/* Tầng 4: Phân trang (dùng pagination của Table) */}

      <Drawer
        title={mode === 'create' ? 'Thêm khách hàng' : 'Chỉnh sửa khách hàng'}
        placement="right"
        width={420}
        open={open}
        onClose={handleClose}
        extra={
          <Space>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="primary" onClick={handleSubmit}>Lưu</Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form} initialValues={{ name: '', email: '', phone: '', address: '' }}>
          <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
            <Input placeholder="090x-xxx-xxx" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={3} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Customers;


