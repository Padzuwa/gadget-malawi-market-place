import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { MobileNav } from './MobileNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="gm-app">
      <AppSidebar />
      <div className="gm-main">
        <AppHeader />
        <main className="gm-content">{children}</main>
        <AppFooter />
      </div>
      <MobileNav />
    </div>
  );
}