import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'antd/dist/reset.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AdminLayout, DashboardHome, Appointments, Services, Stylists, Customers } from './admin';
import { UserHome } from './user';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/user" replace /> },
      { path: 'user', element: <UserHome /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'appointments', element: <Appointments /> },
      { path: 'services', element: <Services /> },
      { path: 'stylists', element: <Stylists /> },
      { path: 'customers', element: <Customers /> },
    ],
  },
  { path: '*', element: <Navigate to="/user" replace /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
