import React from 'react';
import { Button, Input, Space, Table } from 'antd';

interface CustomerRow {
  key: string;
  name: string;
  phone: string;
  visits: number;
}

const data: CustomerRow[] = [
  { key: '1', name: 'Nguyễn Văn A', phone: '0901-234-567', visits: 3 },
  { key: '2', name: 'Trần Thị B', phone: '0908-111-222', visits: 1 },
  { key: '3', name: 'Phạm C', phone: '0909-333-444', visits: 6 },
];

export const Customers: React.FC = () => {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>Quản lý khách hàng</h2>
        <Space>
          <Input.Search 
            placeholder="Tìm khách..." 
            style={{ width: 300 }} 
            size="large"
          />
          <Button type="primary" size="large">
            Thêm khách
          </Button>
        </Space>
      </div>
      <Table
        rowKey="key"
        dataSource={data}
        columns={[
          { 
            title: 'Tên khách hàng', 
            dataIndex: 'name',
            width: '35%'
          },
          { 
            title: 'Số điện thoại', 
            dataIndex: 'phone',
            width: '30%'
          },
          { 
            title: 'Số lần đến', 
            dataIndex: 'visits',
            width: '20%',
            align: 'center'
          },
          { 
            title: 'Thao tác', 
            width: '15%',
            render: () => (
              <Space>
                <Button size="small" type="link">Sửa</Button>
                <Button size="small" type="link" danger>Xóa</Button>
              </Space>
            )
          },
        ]}
        pagination={false}
        bordered
        size="middle"
        style={{ width: '90%' }}
      />
    </div>
  );
};

export default Customers;


