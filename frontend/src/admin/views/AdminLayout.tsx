import React from "react";
import { Layout, Menu, theme } from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  ScissorOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const selectedKey = location.pathname.split("/")[2] || "dashboard";
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0" className="admin-sider">
        <div style={{ height: 48, margin: 16, color: "#fff", fontWeight: 700 }}>
          Barber Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          className="admin-menu"
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined />,
              label: <Link to="/admin">Dashboard</Link>,
            },
            {
              key: "appointments",
              icon: <CalendarOutlined />,
              label: <Link to="/admin/appointments">Lịch hẹn</Link>,
            },
            {
              key: "services",
              icon: <ScissorOutlined />,
              label: <Link to="/admin/services">Dịch vụ</Link>,
            },
            {
              key: "employees",
              icon: <TeamOutlined />,
              label: <Link to="/admin/employees">Nhân viên</Link>,
            },
            {
              key: "customers",
              icon: <UserOutlined />,
              label: <Link to="/admin/customers">Khách hàng</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, padding: "0 16px" }}>
          {/* <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Khu vực quản trị</div>
            <Breadcrumb
              items={[
                { title: <Link to="/admin">Admin</Link> },
                ...(selectedKey !== 'dashboard' ? [{ title: selectedKey }] : []),
              ]}
            />
          </div> */}
        </Header>
        <Content style={{ margin: "16px", padding: 0 }}>
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: "calc(100vh - 32px)",
              width: "100%",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
