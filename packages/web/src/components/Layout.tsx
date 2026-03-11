import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarLayout } from '@spm/ui';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';

export const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarLayout
      sidebar={<AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />}
      topBar={<AppTopBar onMenuClick={() => setMobileOpen((v) => !v)} />}
    >
      <Outlet />
    </SidebarLayout>
  );
};
