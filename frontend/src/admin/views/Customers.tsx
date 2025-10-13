import React from "react";
import {
  Button,
  Input,
  Space,
  Table,
  Drawer,
  Form,
  // Popconfirm,
  message,
  Select,
  DatePicker,
  Tag,
} from "antd";
import { AdminController } from "../controllers/AdminController";
import type { CustomerDto } from "../models/AdminModel";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

// Remote data handled by AdminController

export const Customers: React.FC = () => {
  const [form] = Form.useForm();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [rows, setRows] = React.useState<CustomerDto[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const customers = await AdminController.getCustomers();
        if (mounted) setRows(customers ?? []);
      } catch (err) {
        console.error("Failed to load /db.json", err);
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
    setMode("create");
    form.resetFields();
    setEditingId(null);
    setOpen(true);
  };

  const handleEditClick = (record: CustomerDto) => {
    setMode("edit");
    // Nếu record.dob có dữ liệu, chuyển sang dayjs, ngược lại giữ nguyên
    form.setFieldsValue({
      ...record,
      dob: record.dob ? dayjs(record.dob) : undefined,
    });
    setEditingId(record.id);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (mode === "create") {
        const { name, email, phone, address, dob, gender, status } =
          values as CustomerDto;
        const dobStr = dayjs.isDayjs(dob) ? dob.toISOString() : dob;
        // Chắc chắn vai trò mặc định là Customer
        const created = await AdminController.createCustomer({
          name,
          email,
          phone,
          address,
          dob: dobStr,
          gender,
          status: status || 1,
          email_verified_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          roles: [
            {
              id: 1,
              name: "Customer",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              pivot: {
                user_id: Date.now(), // Hoặc sẽ được backend/mock cập nhật lại đúng sau
                role_id: 1,
              },
            },
          ],
        });
        setRows((prev) => [created, ...prev]);
        message.success("Đã thêm khách hàng");
      } else if (mode === "edit" && editingId) {
        const { name, email, phone, address, dob, gender, status } =
          values as CustomerDto;
        // Lấy roles cũ từ state (rows)
        const old = rows.find(r => r.id === editingId);
        const dobStr = dayjs.isDayjs(dob) ? dob.toISOString() : dob;
        const updated = await AdminController.updateCustomer(editingId, {
          name,
          email,
          phone,
          address,
          dob: dobStr,
          gender,
          status: status || 1,
          updated_at: new Date().toISOString(),
          roles: old?.roles || [], // bảo lưu roles cũ
          created_at: old?.created_at, // giữ lại ngày tạo
          email_verified_at: old?.email_verified_at, // giữ luôn trạng thái email nếu cần
          deleted_at: old?.deleted_at ?? null,
        });
        setRows((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
        message.success("Đã cập nhật khách hàng");
      }
      setOpen(false);
    } catch {
      // antd Form sẽ hiển thị lỗi
    }
  };

  // const handleDelete = async (record: CustomerDto) => {
  //   await AdminController.deleteCustomer(record.id);
  //   setRows((prev) => prev.filter((r) => r.id !== record.id));
  //   message.success("Đã xóa khách hàng");
  // };

  // Thêm hàm chuyển trạng thái
  const handleToggleStatus = async (record: CustomerDto) => {
    const newStatus = record.status === 1 ? 0 : 1;
    const updated = await AdminController.updateCustomer(record.id, { status: newStatus, updated_at: new Date().toISOString() });
    setRows(prev => prev.map(r => r.id === record.id ? { ...r, status: newStatus, updated_at: updated.updated_at } : r));
    message.success(newStatus === 1 ? "Khách đã được kích hoạt" : "Đã dừng hoạt động khách hàng");
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Tầng 1: Tiêu đề bên trái, nút thêm bên phải */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Quản lý khách hàng
        </h2>
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
          {
            title: "ID",
            dataIndex: "id",
            width: 80,
            render: (id: number) => (
              <Link
                to={`/admin/customers/${id}`}
                style={{ textDecoration: "none", color: "#1677ff" }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.textDecoration = "none";
                }}
              >
                {id}
              </Link>
            ),
          },
          { title: "Tên khách hàng", dataIndex: "name", width: 180 },
          { title: "Email", dataIndex: "email", width: 200 },
          { title: "SĐT", dataIndex: "phone", width: 140 },
          {
            title: "Giới tính",
            dataIndex: "gender",
            width: 100,
            render: (gender: string) => (
              <Tag color={gender === "male" ? "blue" : "pink"}>
                {gender === "male" ? "Nam" : "Nữ"}
              </Tag>
            ),
          },
          {
            title: "Ngày sinh",
            dataIndex: "dob",
            width: 120,
            render: (dob: string) => new Date(dob).toLocaleDateString("vi-VN"),
          },
          {
            title: "Vai trò",
            dataIndex: "roles",
            width: 150,
            render: (roles: CustomerDto["roles"]) => (
              <Space direction="vertical" size={2}>
                {(roles ?? []).map((role) => (
                  <Tag key={role.id} color="green">
                    {role.name}
                  </Tag>
                ))}
              </Space>
            ),
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            width: 100,
            render: (status: number) => (
              <Tag color={status === 1 ? "green" : "red"}>
                {status === 1 ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            ),
          },
          {
            title: "Ngày tạo",
            dataIndex: "created_at",
            width: 120,
            render: (date: string) => {
              if (!date || isNaN(new Date(date).getTime())) return '';
              return new Date(date).toLocaleDateString("vi-VN");
            },
          },
          {
            title: "Thao tác",
            width: 140,
            fixed: "right" as const,
            render: (_, record: CustomerDto) => (
              <Space>
                <Button size="small" type="link" onClick={() => handleEditClick(record)}>Sửa</Button>
                <Button size="small" type="link" danger={record.status === 1}
                  onClick={() => handleToggleStatus(record)}>
                  {record.status === 1 ? "Chặn" : "Kích hoạt"}
                </Button>
              </Space>
            )
          },
        ]}
        pagination={{ pageSize: 10, position: ["bottomCenter"] }}
        bordered
        size="middle"
        loading={loading}
        scroll={{ x: 1200 }}
      />

      {/* Tầng 4: Phân trang (dùng pagination của Table) */}

      <Drawer
        title={mode === "create" ? "Thêm khách hàng" : "Chỉnh sửa khách hàng"}
        placement="right"
        width={420}
        open={open}
        onClose={handleClose}
        extra={
          <Space>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="primary" onClick={handleSubmit}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            name: "",
            email: "",
            phone: "",
            address: "",
            dob: "",
            gender: "male",
            // status bị ẩn khỏi form, không set ở đây
          }}
        >
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
          >
            <Input placeholder="090x-xxx-xxx" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea
              rows={3}
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
            />
          </Form.Item>
          <Form.Item
            name="dob"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select placeholder="Chọn giới tính">
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
            </Select>
          </Form.Item>
          {/* Ẩn field trạng thái (status) trong form */}
          {/* <Form.Item name="status" label="Trạng thái">
            <Select placeholder="Chọn trạng thái">
              <Select.Option value={1}>Hoạt động</Select.Option>
              <Select.Option value={0}>Không hoạt động</Select.Option>
            </Select>
          </Form.Item> */}
        </Form>
      </Drawer>
    </div>
  );
};

export default Customers;
