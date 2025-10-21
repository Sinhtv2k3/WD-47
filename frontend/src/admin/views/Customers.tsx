import React from "react";
import {
  Button,
  Input,
  Space,
  Table,
  Drawer,
  Form,
  Row,
  Col,
  Select,
} from "antd";
import { AdminController } from "../controllers/AdminController";
import type { CustomerDto } from "../models/AdminModel";
import { Link } from "react-router-dom";
import "./Customers.css";

// Remote data handled by AdminController

export const Customers: React.FC = () => {
  const [form] = Form.useForm();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [rows, setRows] = React.useState<CustomerDto[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  // Filter state
  const [searchId, setSearchId] = React.useState("");
  const [searchName, setSearchName] = React.useState("");
  const [searchEmail, setSearchEmail] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const customers = await AdminController.getCustomers();
        if (mounted) setRows(customers ?? []);
      } catch (err) {
        console.error("Failed to load customers", err);
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

  const filteredRows = React.useMemo(() => {
    return rows.filter(row => {
      if (searchId && !String(row.id).includes(searchId.trim())) return false;
      if (searchName && !(row.user?.name?.toLowerCase().includes(searchName.trim().toLowerCase()))) return false;
      if (searchEmail && !(row.user?.email?.toLowerCase().includes(searchEmail.trim().toLowerCase()))) return false;
      return true;
    });
  }, [rows, searchId, searchName, searchEmail]);

  const handleAddClick = () => {
    setMode("create");
    form.resetFields();
    setEditingId(null);
    setOpen(true);
  };

  const handleEditClick = (record: CustomerDto) => {
    setMode("edit");
    form.setFieldsValue({ ...record });
    setEditingId(record.id);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (mode === "create") {
        const created = await AdminController.createCustomer(values as Omit<CustomerDto, "id">);
        setRows(prev => [created, ...prev]);
      } else if (mode === "edit" && editingId) {
        const updated = await AdminController.updateCustomer(String(editingId), values as Partial<Omit<CustomerDto, "id">>);
        setRows(prev => prev.map(r => (r.id === editingId ? updated : r)));
      }
      setOpen(false);
    } catch {
      // antd Form sẽ hiển thị lỗi
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, whiteSpace: "nowrap" }}>Quản lý khách hàng</h2>
        <Button type="primary" size="large" onClick={handleAddClick}>Thêm khách</Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 16, width: "100%" }}>
        <Col xs={24} sm={12} md={6} lg={4} xl={3}>
          <Input placeholder="ID" value={searchId} onChange={e => setSearchId(e.target.value)} allowClear />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={5}>
          <Input placeholder="Tên khách hàng" value={searchName} onChange={e => setSearchName(e.target.value)} allowClear />
        </Col>
        <Col xs={24} sm={12} md={6} lg={7} xl={6}>
          <Input placeholder="Email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} allowClear />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={2} style={{ minWidth: 110 }}>
          <Button style={{ width: "100%" }} onClick={() => {
            setSearchId(""); setSearchName(""); setSearchEmail("");
          }}>Xóa bộ lọc</Button>
        </Col>
      </Row>
      <Table
        rowKey="id"
        dataSource={filteredRows}
        columns={[
          {
            title: "ID",
            dataIndex: "id",
            width: 80,
            render: (id: number) => (
              <Link
                to={`/admin/customers/${id}`}
                style={{
                  color: "#1677ff",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "color 0.2s"
                }}
                className="customer-id-link"
              >
                {id}
              </Link>
            ),
          },
          { title: "Tên khách hàng", dataIndex: "name", width: 180 },
          { title: "Email", dataIndex: "email", width: 200 },
          { title: "SĐT", dataIndex: "phone", width: 140 },
          { title: "Xác minh Email", dataIndex: "email_verified_at", width: 150,
            render: (v: string | null) => v ? v : <span style={{color:"#aaa"}}>Chưa xác minh</span> },
          { title: "Điểm", dataIndex: "point", width: 100 },
          { title: "Hạng", dataIndex: "rank", width: 110 },
          {
            title: "Thao tác", width: 120, render: (_, record: CustomerDto) => (
              <Space>
                <Button size="small" type="link" onClick={() => handleEditClick(record)}>Sửa</Button>
              </Space>
            )
          },
        ]}
        pagination={{ pageSize: 10, position: ["bottomCenter"] }}
        bordered
        size="middle"
        loading={loading}
        scroll={{ x: 900 }}
      />
      <Drawer
        title={mode === "create" ? "Thêm khách hàng" : "Chỉnh sửa khách hàng"}
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
        <Form layout="vertical" form={form} initialValues={{ name: "", email: "", phone: "", email_verified_at: null, point: 0, rank: "Silver" }}>
          <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: "email", required: true, message: "Vui lòng nhập email hợp lệ" }]}>
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}>
            <Input placeholder="090x-xxx-xxx" />
          </Form.Item>
          <Form.Item name="point" label="Điểm" rules={[{ required: true, message: "Nhập điểm tích luỹ" }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="rank" label="Hạng" rules={[{ required: true, message: "Chọn hạng" }]}> 
            <Select>
              <Select.Option value="Silver">Silver</Select.Option>
              <Select.Option value="Gold">Gold</Select.Option>
              <Select.Option value="Diamond">Diamond</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Customers;
