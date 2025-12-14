import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ChildDashboard from './pages/ChildDashboard';
import ParentDashboard from './pages/ParentDashboard';

// 路由保护组件
const PrivateRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // 角色不匹配，跳转到对应的首页
    return <Navigate to={userRole === 'PARENT' ? '/parent' : '/child'} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/child" 
          element={
            <PrivateRoute allowedRole="CHILD">
              <ChildDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/parent" 
          element={
            <PrivateRoute allowedRole="PARENT">
              <ParentDashboard />
            </PrivateRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
