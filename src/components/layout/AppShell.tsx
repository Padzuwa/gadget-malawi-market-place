import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { MobileNav } from './MobileNav';
import { CartProvider } from '@/components/cart/CartProvider';
import { getUnreadMessageCount } from '@/lib/data/chat';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessageCount();

  return (
    <CartProvider>
      <div className="gm-app">
        <AppSidebar unreadCount={unreadCount} />
        <div className="gm-main">
          <AppHeader unreadCount={unreadCount} />
          <main className="gm-content">{children}</main>
          <AppFooter />
        </div>
        <MobileNav unreadCount={unreadCount} />
      </div>
    </CartProvider>
  );
}