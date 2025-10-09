import { Button } from 'antd';
import { Link, Outlet } from 'react-router-dom';

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Hello Ant Design + Vite + React 🎨</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/admin">
          <Button type="primary">Đi đến Admin</Button>
        </Link>
        <Link to="/user">
          <Button>User</Button>
        </Link>
      </div>
      <Outlet />
    </div>
  );
}

export default App;