import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  message,
  Typography,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { AdminController } from "../controllers/AdminController";
import type { ServiceRow, Discount } from "../models/AdminModel";

const { Text } = Typography;

export const Services: React.FC = () => {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [form] = Form.useForm<ServiceRow>();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<any[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchType, setSearchType] = useState("");

  // === Load dữ liệu ===
  const loadData = async () => {
    setLoading(true);
    try {
      const [services, disc] = await Promise.all([
        AdminController.getServices(),
        AdminController.getDiscounts().catch(() => []),
      ]);
      setRows(services);
      setDiscounts(disc);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // === Chuyển trạng thái hoạt động / tạm dừng ===
  const handleToggleStatus = async (record: ServiceRow) => {
    try {
      const newStatus = record.status === "active" ? "paused" : "active";
      await AdminController.updateService(record.id, { status: newStatus });
      message.success("Cập nhật trạng thái thành công");
      setRows((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, status: newStatus } : r))
      );
    } catch {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  // === Lọc dữ liệu ===
  const filteredRows = rows.filter((r) => {
    if (searchName && !r.name.toLowerCase().includes(searchName.toLowerCase()))
      return false;
    if (searchType && r.type !== searchType) return false;
    return true;
  });

  // === Áp dụng giảm giá ===
  const applyDiscount = (price: number, discountId?: number) => {
    if (!discountId) return price;
    const disc = discounts.find((d) => d.id === discountId);
    if (!disc) return price;
    return disc.type === "percent"
      ? Math.max(0, price - (price * disc.value) / 100)
      : Math.max(0, price - disc.value);
  };

  // === Mở drawer thêm mới ===
  const handleAdd = () => {
    form.resetFields();
    setFileList([]);
    setMode("create");
    setEditingService(null);
    setOpen(true);
  };

  // === Mở drawer chỉnh sửa ===
  const handleEdit = (record: ServiceRow) => {
    form.setFieldsValue(record);
    setFileList([]);
    setMode("edit");
    setEditingService(record);
    setOpen(true);
  };

  // === Xoá dịch vụ ===
  const handleDelete = async (id: number) => {
    try {
      await AdminController.deleteService(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      message.success("Xóa dịch vụ thành công");
    } catch {
      message.error("Xóa thất bại");
    }
  };

  // === Lưu dịch vụ (thêm / cập nhật) ===
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (mode === "create") {
        await AdminController.addService(values as ServiceRow);
        message.success("Thêm dịch vụ thành công");
      } else if (mode === "edit" && editingService) {
        await AdminController.updateService(
          editingService.id,
          values as Partial<ServiceRow>
        );
        message.success("Cập nhật thành công");
      }
      setOpen(false);
      loadData();
    } catch {
      message.error("Lưu thất bại");
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên dịch vụ"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <Select
          placeholder="Loại"
          allowClear
          style={{ width: 150 }}
          value={searchType}
          onChange={(v) => setSearchType(v)}
        >
          <Select.Option value="single">Đơn</Select.Option>
          <Select.Option value="combo">Combo</Select.Option>
        </Select>
        <Button onClick={() => { setSearchName(""); setSearchType(""); }}>
          Xóa bộ lọc
        </Button>
        <Button type="primary" onClick={handleAdd}>
          Thêm dịch vụ
        </Button>
      </Space>

      <Table
        dataSource={filteredRows}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
        columns={[
          { title: "ID", dataIndex: "id", width: 60 },
          {
            title: "Tên dịch vụ",
            dataIndex: "name",
            render: (text: string, record: ServiceRow) => (
              <Button
                type="link"
                onClick={() => navigate(`/services/${record.id}`)}
              >
                {text}
              </Button>
            ),
          },
          {
            title: "Loại",
            dataIndex: "type",
            render: (v: string) => (
              <Tag color={v === "combo" ? "purple" : "blue"}>
                {v === "combo" ? "Combo" : "Đơn"}
              </Tag>
            ),
          },
          {
            title: "Giá (VNĐ)",
            dataIndex: "price",
            render: (_, record) => {
              const final = applyDiscount(record.price, record.discount_id);
              return (
                <span>
                  {record.price.toLocaleString()}₫ →{" "}
                  <Text strong>{final.toLocaleString()}₫</Text>
                </span>
              );
            },
          },
          {
            title: "Mã giảm giá",
            dataIndex: "discount_id",
            render: (id?: number) => {
              const disc = discounts.find((d) => d.id === id);
              return disc ? disc.code : "Không";
            },
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status: "active" | "paused" | "deleted") => {
              let color = "green";
              let text = "Hoạt động";
              if (status === "paused") {
                color = "orange";
                text = "Tạm dừng";
              } else if (status === "deleted") {
                color = "red";
                text = "Đã xóa";
              }
              return <Tag color={color}>{text}</Tag>;
            },
          },
          {
            title: "Thao tác",
            render: (_: any, record: ServiceRow) => (
              <Space>
                <Button type="link" onClick={() => handleEdit(record)}>
                  Sửa
                </Button>
                <Button type="link" danger onClick={() => handleDelete(record.id)}>
                  Xóa
                </Button>
                <Button type="link" onClick={() => handleToggleStatus(record)}>
                  {record.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                </Button>
              </Space>
            ),
          },
        ]}
        pagination={{ pageSize: 10 }}
      />

      {/* === Drawer Thêm / Sửa === */}
      <Drawer
        title={mode === "create" ? "Thêm dịch vụ" : "Chỉnh sửa dịch vụ"}
        width={400}
        onClose={() => setOpen(false)}
        open={open}
        footer={
          <Space>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="primary" onClick={handleSubmit}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Ảnh dịch vụ">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Tên dịch vụ" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Loại" name="type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="single">Đơn</Select.Option>
              <Select.Option value="combo">Combo</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Giá (VNĐ)" name="price" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item label="Mã giảm giá" name="discount_id">
            <Select
              allowClear
              placeholder="Chọn mã giảm giá"
              options={discounts.map((d) => ({
                value: d.id,
                label:
                  d.type === "percent"
                    ? `${d.code} - ${d.value}%`
                    : `${d.code} - Giảm ${d.value.toLocaleString()}₫`,
              }))}
            />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="paused">Tạm dừng</Select.Option>
              <Select.Option value="deleted">Đã xóa</Select.Option>
            </Select>
          </Form.Item>
          {form.getFieldValue("type") === "combo" && (
            <Form.Item label="Dịch vụ trong combo" name="comboServices">
              <Input placeholder="Nhập ID dịch vụ, cách nhau bằng dấu , " />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default Services;
