import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { MobileNav } from './MobileNav';
import { getUnreadMessageCount } from '@/lib/data/chat';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessageCount();

  return (
    <div className="gm-app">
      <AppSidebar unreadCount={unreadCount} />
      <div className="gm-main">
        <AppHeader unreadCount={unreadCount} />
        <main className="gm-content">{children}</main>
        <AppFooter />
      </div>
      <MobileNav unreadCount={unreadCount} />
    </div>
  );
}