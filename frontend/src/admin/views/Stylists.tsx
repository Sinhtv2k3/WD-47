import React from 'react';
import { Avatar, Button, Space, Table, Tag } from 'antd';

interface StylistRow {
  key: string;
  name: string;
  skills: string[];
}

const data: StylistRow[] = [
  { key: '1', name: 'Thắng', skills: ['Fade', 'Tỉa'] },
  { key: '2', name: 'Hùng', skills: ['Uốn', 'Nhuộm'] },
  { key: '3', name: 'Dũng', skills: ['Undercut', 'Buzz'] },
];

export const Stylists: React.FC = () => {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>Quản lý thợ cắt</h2>
        <Button type="primary" size="large">
          Thêm thợ
        </Button>
      </div>
      <Table
        rowKey="key"
        dataSource={data}
        columns={[
          { 
            title: 'Thợ cắt', 
            dataIndex: 'name', 
            width: '25%',
            render: (name: string) => (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar>{name.charAt(0)}</Avatar>
                <span style={{ fontWeight: 500 }}>{name}</span>
              </span>
            ) 
          },
          { 
            title: 'Kỹ năng', 
            dataIndex: 'skills', 
            width: '60%',
            render: (skills: string[]) => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {skills.map(s => <Tag key={s} color="blue">{s}</Tag>)}
              </div>
            )
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

export default Stylists;


