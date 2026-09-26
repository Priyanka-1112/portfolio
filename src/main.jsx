import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Portfolio from './pages/Portfolio.jsx';

const Admin = lazy(() => import('./pages/admin/Admin.jsx'));

const isAdminPath = /^\/admin\/?$/.test(window.location.pathname);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminPath ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <Portfolio />
    )}
  </StrictMode>,
);
