import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  Space,
  Table,
  message,
  Popconfirm,
  Tag,
  Select,
  InputNumber,
} from "antd";
import { AdminController } from "../controllers/AdminController";
import type { ServiceRow, Discount } from "../models/AdminModel";

export const Services: React.FC = () => {
  const [form] = Form.useForm<ServiceRow>();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [type, setType] = useState<"single" | "combo">("single");

  // === Load data ===
  const loadData = async () => {
    try {
      const srv = await AdminController.getServices();
      let disc: Discount[] = [];
      try {
        disc = await AdminController.getDiscounts();
      } catch {
        disc = [
          { id: 1, code: "SALE10", type: "percent", value: 10 },
          { id: 2, code: "GIAM50K", type: "amount", value: 50000 },
        ];
      }
      setServices(srv);
      setDiscounts(disc);
    } catch {
      message.error("Không thể tải dữ liệu dịch vụ");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // === Drawer ===
  const openDrawer = (record?: ServiceRow) => {
    form.resetFields();
    if (record) {
      form.setFieldsValue(record);
      setEditing(record);
      setType(record.type);
    } else {
      setEditing(null);
      setType("single");
      form.setFieldsValue({ type: "single", status: "active" });
    }
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  // === Tính giá sau giảm ===
  const applyDiscount = (price: number, discountId?: number): number => {
    if (!discountId) return price;
    const discount = discounts.find((d) => d.id === discountId);
    if (!discount) return price;

    return discount.type === "percent"
      ? Math.max(0, price - (price * discount.value) / 100)
      : Math.max(0, price - discount.value);
  };

  // === Tính tổng combo ===
  const calcComboPrice = (selectedIds: number[]) => {
    const total = services
      .filter((s) => selectedIds.includes(s.id))
      .reduce((sum, s) => sum + (s.price || 0), 0);
    form.setFieldValue("price", total);
  };

  // === Thêm / Cập nhật ===
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = { ...values };

    try {
      if (editing) {
        await AdminController.updateService(editing.id, payload);
        message.success("Cập nhật dịch vụ thành công");
      } else {
        await AdminController.addService(payload as ServiceRow);
        message.success("Thêm dịch vụ thành công");
      }
      closeDrawer();
      loadData();
    } catch {
      message.error("Lưu dịch vụ thất bại");
    }
  };

  // === Xóa ===
  const handleDelete = async (record: ServiceRow) => {
    try {
      await AdminController.deleteService(record.id);
      message.success(`Đã xóa dịch vụ: ${record.name}`);
      loadData();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  // === Cột bảng ===
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên dịch vụ", dataIndex: "name", key: "name" },
    {
      title: "Loại",
      dataIndex: "type",
      render: (t: string) => (
        <Tag color={t === "combo" ? "purple" : "blue"}>
          {t === "combo" ? "Combo" : "Đơn"}
        </Tag>
      ),
    },
    {
      title: "Giá gốc",
      dataIndex: "price",
      render: (v: number) => v.toLocaleString("vi-VN") + "₫",
    },
    {
      title: "Giảm giá",
      render: (_: any, row: ServiceRow) => {
        const disc = discounts.find((d) => d.id === row.discount_id);
        if (!disc) return "-";
        return disc.type === "percent"
          ? `${disc.value}%`
          : `${disc.value.toLocaleString("vi-VN")}₫`;
      },
    },
    {
      title: "Dịch vụ trong combo",
      render: (_: any, row: ServiceRow) =>
        row.type === "combo" && row.comboServices?.length
          ? row.comboServices
              .map((id) => services.find((s) => s.id === id)?.name || "—")
              .join(", ")
          : "-",
    },
    {
      title: "Giá sau giảm",
      render: (_: any, row: ServiceRow) =>
        applyDiscount(row.price, row.discount_id).toLocaleString("vi-VN") + "₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: string) => (
        <Tag
          color={s === "active" ? "green" : s === "paused" ? "orange" : "red"}
        >
          {s === "active"
            ? "Hoạt động"
            : s === "paused"
            ? "Tạm dừng"
            : "Đã xóa"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_: any, record: ServiceRow) => (
        <Space>
          <Button type="link" onClick={() => openDrawer(record)}>
            Sửa
          </Button>

          <Button
            type="link"
            onClick={async () => {
              try {
                const newStatus =
                  record.status === "active" ? "paused" : "active";
                await AdminController.updateService(record.id, {
                  status: newStatus,
                });
                message.success(
                  newStatus === "active"
                    ? "Đã bật dịch vụ!"
                    : "Đã tạm tắt dịch vụ!"
                );
                loadData();
              } catch {
                message.error("Không thể cập nhật trạng thái");
              }
            }}
          >
            {record.status === "active" ? "Tắt" : "Bật"}
          </Button>

          <Popconfirm
            title="Xóa dịch vụ này?"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger type="link">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => openDrawer()}>
          Thêm dịch vụ
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={services}
        rowKey="id"
        pagination={{ pageSize: 6 }}
      />

      <Drawer
        title={editing ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
        open={open}
        onClose={closeDrawer}
        width={450}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Hủy</Button>
            <Button type="primary" onClick={handleSubmit}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên dịch vụ"
            name="name"
            rules={[{ required: true, message: "Nhập tên dịch vụ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Loại dịch vụ"
            name="type"
            rules={[{ required: true, message: "Chọn loại dịch vụ" }]}
          >
            <Select
              onChange={(val: "single" | "combo") => {
                setType(val);
                if (val === "combo") form.setFieldValue("price", 0);
              }}
              options={[
                { value: "single", label: "Dịch vụ đơn" },
                { value: "combo", label: "Dịch vụ combo" },
              ]}
            />
          </Form.Item>

          {type === "combo" && (
            <Form.Item
              label="Chọn dịch vụ đơn trong combo"
              name="comboServices"
              rules={[{ required: true, message: "Chọn ít nhất 1 dịch vụ đơn" }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn dịch vụ đơn để tạo combo"
                options={services
                  .filter((s) => s.type === "single")
                  .map((s) => ({ label: s.name, value: s.id }))}
                onChange={(values) => calcComboPrice(values)}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Giá (VNĐ)"
            name="price"
            rules={[{ required: true, message: "Nhập giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              disabled={type === "combo"}
            />
          </Form.Item>

          <Form.Item label="Mã giảm giá" name="discount_id">
            <Select
              allowClear
              placeholder="Chọn mã giảm giá"
              options={discounts.map((d) => ({
                value: d.id,
                label:
                  d.type === "percent"
                    ? `${d.code} - Giảm ${d.value}%`
                    : `${d.code} - Giảm ${d.value.toLocaleString("vi-VN")}₫`,
              }))}
            />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status" initialValue="active">
            <Select
              options={[
                { value: "active", label: "Hoạt động" },
                { value: "paused", label: "Tạm dừng" },
                { value: "deleted", label: "Đã xóa" },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default Services;
