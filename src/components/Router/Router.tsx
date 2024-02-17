import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { publicRoutes } from '../Routes';
import PublicRoute from './PublicRoute';
import { Button } from '../Button';

const NotFound = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
    <h2>Page Not Found</h2>
    <p>This page is not available</p>
    <Button onClick={() => (window.location.href = '/')} theme={'secondary'} fullWidth={false}>
      Go to HomePage
    </Button>
  </div>
);

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes?.length &&
          publicRoutes.map(({ path, cmp }) => (
            <Route key={path} path={path} element={<PublicRoute component={cmp} />} />
          ))}
        <Route path="*" element={<Navigate to="/not-found" />} />
        <Route path="/not-found" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
