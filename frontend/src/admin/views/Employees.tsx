import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9000/api/admin",
});

const AVATAR_BASE = "http://localhost:9000/storage/";
const buildAvatar = (avatar?: string | null) => {
  if (!avatar) return undefined;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  return AVATAR_BASE + avatar;
};

type Gender = "male" | "female" | "other";

interface RoleDTO { id: number; name?: string; description?: string; }
interface UserDTO {
  id: number;
  name: string;
  email: string;
  phone?: string;
  dob?: string | null;
  avatar?: string | null;
  gender?: Gender | string | null;
  status?: number;
  roles?: RoleDTO[];
}
interface SkillDTO { id: number; name: string; }
interface EmployeeDTO {
  id: number;
  user_id: number;
  level?: string;
  experience?: number;
  bio?: string;
  avatar?: string | null;
  created_at: string;
  updated_at: string;
  user: UserDTO;
  skills: SkillDTO[];
}
interface Paginated<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
}
interface IndexResponse {
  employees: Paginated<EmployeeDTO>;
}
interface EmployeeRow {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleLabel?: string;
  level?: string;
  experience?: number;
  skills: string[];
}

const roleToVN = (name?: string) => {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  if (lower.includes("massage")) return "Nhân viên chăm sóc";
  if (lower.includes("stylist")) return "Thợ cắt";
  if (lower.includes("admin")) return "Quản trị";
  if (lower.includes("employee")) return "Nhân viên";
  return name;
};

const normalize = (e: EmployeeDTO): EmployeeRow => {
  const u = e.user || ({} as UserDTO);
  const firstRoleName =
    (u.roles && u.roles.length && (u.roles[0].description || u.roles[0].name)) || undefined;
  return {
    id: e.id,
    name: u.name ?? "",
    email: u.email ?? "",
    phone: u.phone ?? "",
    avatar: buildAvatar(u.avatar ?? e.avatar ?? undefined),
    roleLabel: roleToVN(firstRoleName),
    level: e.level,
    experience: e.experience,
    skills: (e.skills || []).map((s) => s.name),
  };
};

const Employees: React.FC = () => {
  // Danh sách + phân trang
  const [allRows, setAllRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Drawer/form
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const isUpdate = useMemo(() => editingId !== null, [editingId]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // Options động
  const [roleOptions, setRoleOptions] = useState<{ value: number; label: string }[]>([]);
  const [skillOptions, setSkillOptions] = useState<{ id: number; name: string }[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);

  // Lọc hiển thị
  const [roleFilter, setRoleFilter] = useState<"all" | "stylist" | "massage">("all");
  const applyFilter = (list: EmployeeRow[], filter: typeof roleFilter) => {
    if (filter === "all") return list;
    if (filter === "stylist") return list.filter((r) => r.roleLabel === "Thợ cắt");
    return list.filter((r) => r.roleLabel === "Nhân viên chăm sóc");
  };
  const rows = useMemo(() => applyFilter(allRows, roleFilter), [allRows, roleFilter]);

  // ===== API =====
  const fetchEmployees = async (p = page, ps = pageSize) => {
    setLoading(true);
    try {
      const res = await api.get<IndexResponse>("/employees", { params: { page: p, per_page: ps } });
      const payload = res.data?.employees;
      const list = (payload?.data ?? []).map(normalize);

      setAllRows(list);
      setTotal(payload?.total ?? list.length);
      setPage(payload?.current_page ?? p);
      setPageSize(payload?.per_page ?? ps);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        // Danh sách rỗng
        setAllRows([]);
        setTotal(0);
        setPage(p);
        setPageSize(ps);
      } else {
        console.error(err);
        message.error("Không thể tải danh sách nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };

  // Meta cho "Thêm mới"
  const loadCreateMeta = async () => {
    const res = await api.get("/employees/create"); // { roles, skills }
    const roles = res.data?.roles ?? [];
    const skills = res.data?.skills ?? [];
    setRoleOptions(
      roles.map((r: RoleDTO) => ({ value: r.id, label: (r.description || r.name || "").toString() }))
    );
    setSkillOptions(skills.map((s: SkillDTO) => ({ id: s.id, name: s.name })));
    return { roles, skills };
  };

  // Meta + dữ liệu cho "Sửa"
  const loadEditMeta = async (id: number) => {
    const res = await api.get(`/employees/${id}/edit`); // { employee, roles, skills }
    const { employee, roles, skills } = res.data || {};
    setRoleOptions(
      (roles ?? []).map((r: RoleDTO) => ({
        value: r.id,
        label: (r.description || r.name || "").toString(),
      }))
    );
    setSkillOptions((skills ?? []).map((s: SkillDTO) => ({ id: s.id, name: s.name })));

    // Fill form từ BE
    const firstRoleId = employee?.user?.roles?.[0]?.id;
    const selectedSkillIds = (employee?.skills ?? []).map((s: SkillDTO) => s.id);

    form.setFieldsValue({
      name: employee?.user?.name,
      email: employee?.user?.email,
      phone: employee?.user?.phone,
      status: employee?.user?.status ?? 1,
      level: employee?.level,
      experience: employee?.experience,
      role_id: firstRoleId,
      skill_ids: selectedSkillIds,
      bio: employee?.bio,
    });
  };

  useEffect(() => {
    fetchEmployees(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Drawer handlers =====
  const resetDrawer = () => {
    setOpen(false);
    setEditingId(null);
    setFileList([]);
    form.resetFields();
  };

  // MỞ FORM NGAY, nạp meta nền
  const onAdd = () => {
    setEditingId(null);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      level: "junior",
      gender: "male",
      role_id: undefined, // sẽ điền sau khi có meta
      skill_ids: [],
    });
    setOpen(true);

    setMetaLoading(true);
    loadCreateMeta()
      .then(({ roles }) => {
        // Chọn role 'employee' nếu có, fallback role đầu tiên
        const employeeRoleId =
          (roles || []).find((r: RoleDTO) =>
            ((r.name || r.description || "") + "").toLowerCase().includes("employee")
          )?.id ?? (roles?.[0]?.id);
        if (employeeRoleId) form.setFieldsValue({ role_id: employeeRoleId });
      })
      .catch((e) => {
        console.error(e);
        message.warning("Không tải được vai trò/kỹ năng. Bạn vẫn có thể nhập các trường còn lại.");
      })
      .finally(() => setMetaLoading(false));
  };

  const onEdit = async (row: EmployeeRow) => {
    try {
      setEditingId(row.id);
      setOpen(true); // mở trước để không bị trễ
      setMetaLoading(true);
      await loadEditMeta(row.id);
      setFileList([]);
    } catch (e) {
      console.error(e);
      message.error("Không tải được dữ liệu chỉnh sửa");
    } finally {
      setMetaLoading(false);
    }
  };

  const onDelete = async (id: number) => {
    try {
      await api.delete(`/employees/${id}`);
      message.success("Đã xóa nhân viên");
      setAllRows((prev) => prev.filter((it) => it.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error(err);
      message.error("Xóa thất bại");
    }
  };

  // Build FormData theo BE
  const toFormData = (values: any) => {
    const fd = new FormData();

    fd.append("user[name]", values.name);
    fd.append("user[email]", values.email);
    if (!isUpdate) {
      fd.append("user[password]", values.password);
      fd.append("user[password_confirmation]", values.password_confirmation);
    }
    if (values.phone) fd.append("user[phone]", values.phone);
    if (values.dob) fd.append("user[dob]", values.dob);
    if (values.gender) fd.append("user[gender]", values.gender);
    fd.append("user[status]", String(values.status ?? 1));
    if (values.role_id) fd.append("user[role_id]", String(values.role_id));

    const file = fileList?.[0]?.originFileObj as File | undefined;
    if (file) fd.append("user[avatar]", file);

    if (values.level) fd.append("employee[level]", values.level);
    if (values.experience !== undefined && values.experience !== null)
      fd.append("employee[experience]", String(values.experience));
    if (values.bio) fd.append("employee[bio]", values.bio);

    (values.skill_ids ?? []).forEach((id: number, idx: number) => {
      fd.append(`skills[${idx}]`, String(id));
    });

    return fd;
  };

  const onSubmit = async (values: any) => {
    try {
      const fd = toFormData(values);

      if (isUpdate) {
        fd.append("_method", "PUT");
        const res = await api.post(`/employees/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const beItem = (res as any)?.data?.employee;
        if (beItem) {
          const item = normalize(beItem);
          setAllRows((prev) => prev.map((it) => (it.id === item.id ? item : it)));
          message.success("Cập nhật nhân viên thành công");
        } else {
          await fetchEmployees(page, pageSize);
          message.success("Cập nhật nhân viên thành công");
        }
      } else {
        const res = await api.post("/employees", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const beItem = (res as any)?.data?.employee;
        if (beItem) {
          const item = normalize(beItem);
          setAllRows((prev) => [item, ...prev]);
          setTotal((t) => t + 1);
          message.success("Thêm nhân viên thành công");
        } else {
          await fetchEmployees(page, pageSize);
          message.success("Thêm nhân viên thành công");
        }
      }

      resetDrawer();
    } catch (err: any) {
      console.error(err);
      const res = err?.response?.data;
      const backendMsg =
        res?.message ||
        res?.error ||
        (res?.errors && Object.values(res.errors).flat().join("; ")) ||
        "Có lỗi xảy ra";
      message.error(backendMsg);
    }
  };

  // ===== UI =====
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Quản lý nhân viên</h2>
        <Space>
          <Select
            value={roleFilter}
            onChange={(v) => setRoleFilter(v)}
            options={[
              { value: "all", label: "Tất cả vai trò" },
              { value: "stylist", label: "Thợ cắt" },
              { value: "massage", label: "Nhân viên chăm sóc" },
            ]}
            style={{ width: 200 }}
          />
          <Button type="primary" size="large" onClick={onAdd}>
            Thêm nhân viên
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        dataSource={rows}
        loading={loading}
        columns={[
          {
            title: "Tên nhân viên",
            dataIndex: "name",
            width: "22%",
            render: (name: string, r) => (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar src={r.avatar}>{name?.charAt(0)}</Avatar>
                <span style={{ fontWeight: 500 }}>{name}</span>
              </span>
            ),
          },
          { title: "Email", dataIndex: "email", width: "22%" },
          { title: "Số ĐT", dataIndex: "phone", width: "16%" },
          {
            title: "Vai trò",
            dataIndex: "roleLabel",
            width: "12%",
            render: (v?: string) =>
              v ? <Tag color={v === "Thợ cắt" ? "blue" : "green"}>{v}</Tag> : "-",
          },
          {
            title: "Cấp bậc",
            dataIndex: "level",
            width: "10%",
            render: (v?: string) => (v ? <Tag color="blue">{v}</Tag> : "-"),
          },
          {
            title: "Kỹ năng",
            dataIndex: "skills",
            width: "18%",
            render: (skills: string[]) => (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(skills || []).map((s) => (
                  <Tag key={s} color="geekblue">
                    {s}
                  </Tag>
                ))}
              </div>
            ),
          },
          {
            title: "Thao tác",
            width: "10%",
            render: (r: EmployeeRow) => (
              <Space>
                <Button size="small" type="link" onClick={() => onEdit(r)}>
                  Sửa
                </Button>
                <Button size="small" type="link" danger onClick={() => onDelete(r.id)}>
                  Xóa
                </Button>
              </Space>
            ),
          },
        ]}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
            fetchEmployees(p, ps);
          },
        }}
        bordered
        size="middle"
      />

      <Drawer
        title={isUpdate ? "Sửa nhân viên" : "Thêm nhân viên"}
        placement="right"
        width={560}
        open={open}
        onClose={resetDrawer}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={onSubmit}>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Nhập tên" }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Nhập email" }]}>
            <Input type="email" placeholder="test@gmail.com" />
          </Form.Item>

          {!isUpdate && (
            <>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Nhập mật khẩu" }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="password_confirmation"
                label="Xác nhận mật khẩu"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Nhập xác nhận mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) return Promise.resolve();
                      return Promise.reject(new Error("Mật khẩu không khớp"));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}

          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="0909xxxxxx" />
          </Form.Item>

          <Form.Item name="dob" label="Ngày sinh">
            <Input placeholder="1995-01-01" />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính">
            <Select
              options={[
                { value: "male", label: "Nam" },
                { value: "female", label: "Nữ" },
                { value: "other", label: "Khác" },
              ]}
            />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" initialValue={1}>
            <Select
              options={[
                { value: 1, label: "Hoạt động" },
                { value: 0, label: "Khóa" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="role_id"
            label="Vai trò"
            rules={[{ required: true, message: "Chọn vai trò" }]}
          >
            <Select
              options={roleOptions}
              placeholder="Chọn vai trò"
              loading={metaLoading}
            />
          </Form.Item>

          <Form.Item label="Ảnh đại diện">
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item name="level" label="Cấp bậc">
            <Select
              options={[
                { value: "junior", label: "Junior" },
                { value: "middle", label: "Middle" },
                { value: "senior", label: "Senior" },
              ]}
            />
          </Form.Item>

          <Form.Item name="experience" label="Kinh nghiệm (năm)">
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item name="bio" label="Giới thiệu">
            <Input.TextArea rows={3} placeholder="Barber chuyên nghiệp..." />
          </Form.Item>

          <Form.Item name="skill_ids" label="Kỹ năng">
            <Select
              mode="multiple"
              placeholder="Chọn kỹ năng"
              options={skillOptions.map((s) => ({ value: s.id, label: s.name }))}
              loading={metaLoading}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={resetDrawer}>Hủy</Button>
              <Button type="primary" htmlType="submit" disabled={!isUpdate && metaLoading}>
  Lưu
</Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Employees;
