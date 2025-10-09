import React, { useState } from 'react';
import { Button, Drawer, Form, Input, Space, Table } from 'antd';

interface ServiceRow {
  key: string;
  name: string;
  price: number;
}

const initialData: ServiceRow[] = [
  { key: '1', name: 'Cắt tóc nam', price: 120000 },
  { key: '2', name: 'Gội đầu', price: 60000 },
  { key: '3', name: 'Nhuộm tóc', price: 350000 },
];

export const Services: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ServiceRow[]>(initialData);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>Quản lý dịch vụ</h2>
        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          Thêm dịch vụ
        </Button>
      </div>
      <Table
        rowKey="key"
        dataSource={data}
        columns={[
          { 
            title: 'Tên dịch vụ', 
            dataIndex: 'name',
            width: '60%'
          },
          { 
            title: 'Giá (₫)', 
            dataIndex: 'price',
            width: '30%',
            align: 'right',
            render: (price: number) => price.toLocaleString('vi-VN')
          },
          {
            title: 'Thao tác',
            width: '10%',
            render: () => (
              <Space>
                <Button size="small" type="link">Sửa</Button>
                <Button size="small" type="link" danger>Xóa</Button>
              </Space>
            )
          }
        ]}
        pagination={false}
        bordered
        size="middle"
        style={{ width: '90%' }}
      />
      <Drawer
        title="Thêm dịch vụ"
        placement="right"
        width={420}
        onClose={() => setOpen(false)}
        open={open}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={(values: { name: string; price: number }) => {
            setData(prev => ([...prev, { key: String(prev.length + 1), name: values.name, price: Number(values.price) }]));
            setOpen(false);
          }}
        >
          <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: 'Nhập tên dịch vụ' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Nhập giá' }]}>
            <Input type="number" min={0} />
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

export default Services;


