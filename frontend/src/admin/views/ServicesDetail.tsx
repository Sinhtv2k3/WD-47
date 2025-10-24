import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Button,
  Descriptions,
  Tag,
  Drawer,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  message,
} from "antd";
import { AdminController } from "../controllers/AdminController";
import type { ServiceDetail, Discount } from "../models/AdminModel";

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [form] = Form.useForm<ServiceDetail>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // === Load dữ liệu dịch vụ + discounts
  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [srv, disc] = await Promise.all([
        AdminController.getService(id),
        AdminController.getDiscounts().catch(() => []),
      ]);
      setService(srv);
      setDiscounts(disc);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // === Mở Drawer chỉnh sửa
  const openDrawer = () => {
    if (!service) return;
    form.setFieldsValue(service);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  // === Lưu chỉnh sửa
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!service) return;
      await AdminController.updateService(service.id, values);
      message.success("Cập nhật dịch vụ thành công!");
      closeDrawer();
      loadData();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại!");
    }
  };

  // === Tính giá sau giảm
  const applyDiscount = (price: number, discountId?: number) => {
    if (!discountId) return price;
    const disc = discounts.find((d) => d.id === discountId);
    if (!disc) return price;
    return disc.type === "percent"
      ? Math.max(0, price - (price * disc.value) / 100)
      : Math.max(0, price - disc.value);
  };

  if (loading) return <Spin style={{ marginTop: 40 }} />;
  if (!service)
    return (
      <Card style={{ marginTop: 40 }}>
        Không tìm thấy dịch vụ này.
        <div>
          <Button type="link" onClick={() => navigate("/services")}>
            ← Quay lại danh sách
          </Button>
        </div>
      </Card>
    );

  const finalPrice = applyDiscount(service.price, service.discount_id);
  const disc = discounts.find((d) => d.id === service.discount_id);

  return (
    <Card
      title={
        <>
          <Button type="link" onClick={() => navigate("/services")}>
            ← Quay lại
          </Button>
          <span style={{ marginLeft: 8, fontWeight: 600 }}>Chi tiết dịch vụ</span>
        </>
      }
      extra={<Button onClick={openDrawer}>Sửa</Button>}
      style={{ maxWidth: 750, margin: "32px auto" }}
    >
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="Tên dịch vụ">{service.name}</Descriptions.Item>
        <Descriptions.Item label="Loại">
          <Tag color={service.type === "combo" ? "purple" : "blue"}>
            {service.type === "combo" ? "Combo" : "Đơn"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Giá gốc">
          {service.price.toLocaleString("vi-VN")}₫
        </Descriptions.Item>
        <Descriptions.Item label="Mã giảm giá">
          {disc
            ? disc.type === "percent"
              ? `${disc.code} - ${disc.value}%`
              : `${disc.code} - Giảm ${disc.value.toLocaleString("vi-VN")}₫`
            : "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Giá sau giảm">
          <strong>{finalPrice.toLocaleString("vi-VN")}₫</strong>
        </Descriptions.Item>
        {service.type === "combo" && (
          <Descriptions.Item label="Bao gồm dịch vụ">
            {service.comboServices?.length
              ? service.comboServices.map((id) => `Dịch vụ #${id}`).join(", ")
              : "Không có"}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Trạng thái">
          <Tag
            color={
              service.status === "active"
                ? "green"
                : service.status === "paused"
                ? "orange"
                : "red"
            }
          >
            {service.status === "active"
              ? "Hoạt động"
              : service.status === "paused"
              ? "Tạm dừng"
              : "Đã xóa"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {service.created_at
            ? new Date(service.created_at).toLocaleString("vi-VN")
            : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật">
          {service.updated_at
            ? new Date(service.updated_at).toLocaleString("vi-VN")
            : "—"}
        </Descriptions.Item>
      </Descriptions>

      {/* Drawer chỉnh sửa */}
      <Drawer
        title="Chỉnh sửa dịch vụ"
        placement="right"
        width={420}
        open={drawerOpen}
        onClose={closeDrawer}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Huỷ</Button>
            <Button type="primary" onClick={handleSave}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Tên dịch vụ" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Loại" name="type" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "single", label: "Dịch vụ đơn" },
                { value: "combo", label: "Dịch vụ combo" },
              ]}
            />
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
                    : `${d.code} - Giảm ${d.value.toLocaleString("vi-VN")}₫`,
              }))}
            />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status">
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
    </Card>
  );
};

export default ServiceDetail;
