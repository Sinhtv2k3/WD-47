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
} from "antd";
import type { ServiceRow } from "../models/AdminModel";
import { AdminController } from "../controllers/AdminController";

export const Services: React.FC = () => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceRowSafe[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceRowSafe[]>([]);
  const [editingService, setEditingService] = useState<ServiceRowSafe | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");

   const parseIdToNumber = (raw: any): number | null => {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === "number" && Number.isFinite(raw)) return Math.trunc(raw);
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      const direct = Number(trimmed);
      if (!Number.isNaN(direct) && Number.isFinite(direct)) return Math.trunc(direct);
      const digits = trimmed.match(/\d+/g)?.join("");
      if (digits) {
        const fromDigits = Number(digits);
        if (!Number.isNaN(fromDigits) && Number.isFinite(fromDigits)) return Math.trunc(fromDigits);
      }
    }
    return null;
  };
   const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await AdminController.getServices();
      const fixed: ServiceRowSafe[] = (data || []).map((item, idx) => ({
        ...item,
        numericId: parseIdToNumber(item.id),
        _tempRowId: idx + 1,
      }));
      setServices(fixed);
      setFilteredServices(fixed);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchServices();
  }, []);
  const showDrawer = (record?: ServiceRowSafe) => {
    if (record) {
      setEditingService(record);
      form.setFieldsValue(record);
    } else {
      setEditingService(null);
      form.resetFields();
    }
    setOpen(true);
  };

   const onFinish = async (values: any) => {
    try {
      if (values.price !== undefined && values.price !== null) values.price = Number(values.price);

      if (editingService) {
        
        const idForApi = editingService.numericId;
        if (idForApi != null) {
          await AdminController.updateService(idForApi, values);
          message.success("Cập nhật dịch vụ thành công");
        }

    
        setServices(prev =>
          prev.map(s =>
            s.numericId === editingService.numericId || s._tempRowId === editingService._tempRowId
              ? { ...s, ...values }
              : s
          )
        );
        setFilteredServices(prev =>
          prev.map(s =>
            s.numericId === editingService.numericId || s._tempRowId === editingService._tempRowId
              ? { ...s, ...values }
              : s
          )
        );
      } else {
       
        const newService = await AdminController.createService(values);
        const numericId = parseIdToNumber(newService.id);
        const tempRowId =
          services.length > 0
            ? Math.max(...services.map(s => s._tempRowId)) + 1
            : 1;

        const fixedService: ServiceRowSafe = {
          ...newService,
          numericId,
          _tempRowId: tempRowId,
        };

        setServices(prev => [...prev, fixedService]);
        setFilteredServices(prev => [...prev, fixedService]);
        message.success("Thêm dịch vụ thành công");
      }

      form.resetFields();
      setOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Lưu dịch vụ thất bại");
    }
  };

   const deleteService = async (service: ServiceRowSafe) => {
    try {
      if (service.numericId != null) {
        await AdminController.updateServiceStatus(service.numericId, "deleted");
      }

      setServices(prev =>
        prev.map(s =>
          s.numericId === service.numericId || s._tempRowId === service._tempRowId
            ? { ...s, status: "deleted" }
            : s
        )
      );
      setFilteredServices(prev =>
        prev.map(s =>
          s.numericId === service.numericId || s._tempRowId === service._tempRowId
            ? { ...s, status: "deleted" }
            : s
        )
      );

      message.success("Đã xóa dịch vụ");
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa dịch vụ");
    }
  };
   const toggleStatus = async (service: ServiceRowSafe) => {
    try {
      const newStatus = service.status === "active" ? "paused" : "active";

      if (service.numericId != null) {
        await AdminController.updateServiceStatus(service.numericId, newStatus);
      }

      setServices(prev =>
        prev.map(s =>
          s.numericId === service.numericId || s._tempRowId === service._tempRowId
            ? { ...s, status: newStatus }
            : s
        )
      );
      setFilteredServices(prev =>
        prev.map(s =>
          s.numericId === service.numericId || s._tempRowId === service._tempRowId
            ? { ...s, status: newStatus }
            : s
        )
      );

      message.success(newStatus === "active" ? "Đã kích hoạt dịch vụ" : "Đã tạm dừng dịch vụ");
    } catch (err) {
      console.error(err);
      message.error("Không thể thay đổi trạng thái dịch vụ");
    }
  };
   const handleSearch = () => {
    let filtered = [...services];
    if (searchName.trim()) {
      filtered = filtered.filter((s) =>
        (s.name || "").toLowerCase().includes(searchName.toLowerCase())
      );
    }
    if (searchId.trim()) {
      const parsed = parseInt(searchId, 10);
      if (!Number.isNaN(parsed)) {
        filtered = filtered.filter((s) => s.numericId === parsed);
      } else {
        filtered = filtered.filter((s) =>
          String(s.id).toLowerCase().includes(searchId.toLowerCase())
        );
      }
    }
    setFilteredServices(filtered);
  };
   const columns = [
    {
      title: "ID",
      dataIndex: "numericId",
      key: "id",
      render: (_: any, row: ServiceRowSafe) => row.numericId ?? row.id ?? "—",
      sorter: (a: ServiceRowSafe, b: ServiceRowSafe) => {
        const aId = a.numericId ?? Number.NaN;
        const bId = b.numericId ?? Number.NaN;
        if (Number.isNaN(aId) && Number.isNaN(bId)) return a._tempRowId - b._tempRowId;
        if (Number.isNaN(aId)) return 1;
        if (Number.isNaN(bId)) return -1;
        return aId - bId;
      },
    },
    { title: "Tên dịch vụ", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (value: number | undefined) => (typeof value === "number" ? value.toLocaleString() : "—"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        switch (status) {
          case "active":
            return <Tag color="blue">Kích hoạt</Tag>;
          case "paused":
            return <Tag color="orange">Tạm dừng</Tag>;
          case "deleted":
            return <Tag color="red">Đã xóa</Tag>;
          default:
            return <Tag>Không xác định</Tag>;
        }
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ServiceRowSafe) => (
        <Space>
          {record.status !== "deleted" && (
            <>
              <Button style={{ color: "green", borderColor: "green" }} onClick={() => showDrawer(record)}>Sửa</Button>
              <Button style={{ color: "#1677ff", borderColor: "#1677ff" }} onClick={() => toggleStatus(record)}>
                {record.status === "active" ? "Tạm dừng" : "Kích hoạt"}
              </Button>
              <Popconfirm title="Bạn chắc chắn muốn xóa dịch vụ này?" onConfirm={() => deleteService(record)}>
                <Button danger>Xóa</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];
  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => showDrawer()}>Thêm dịch vụ</Button>
        <Button onClick={fetchServices}>Tải lại</Button>

        <Input
          placeholder="Tìm kiếm theo tên dịch vụ..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ width: 250 }}
          onPressEnter={handleSearch}
        />
        <Input
          placeholder="Lọc theo ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ width: 150 }}
          onPressEnter={handleSearch}
        />
        <Button onClick={handleSearch}>Tìm kiếm</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredServices}
        loading={loading}
        rowKey={(row: ServiceRowSafe) =>
          row.numericId != null
            ? `id-${row.numericId}`
            : `tmp-${row._tempRowId}`
        }
        pagination={{ pageSize: 8 }}
      />

      <Drawer
        title={editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}
        onClose={() => setOpen(false)}
        open={open}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Tên dịch vụ" name="name" rules={[{ required: true, message: "Nhập tên dịch vụ" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Giá" name="price" rules={[{ required: true, message: "Nhập giá dịch vụ" }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status" initialValue="active" rules={[{ required: true, message: "Chọn trạng thái" }]}>
            <Select>
              <Select.Option value="active">Kích hoạt</Select.Option>
              <Select.Option value="paused">Tạm dừng</Select.Option>
              <Select.Option value="deleted">Đã xóa</Select.Option>
            </Select>
          </Form.Item>

          <Space style={{ display: "flex", justifyContent: "end" }}>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu</Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
}
export default Services