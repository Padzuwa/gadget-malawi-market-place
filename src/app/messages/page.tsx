import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyConversations } from '@/lib/data/chat';
import { ConversationList } from '@/components/chat/ConversationList';

export const metadata: Metadata = {
  title: 'Messages',
  description: 'Chat with buyers and sellers on Gadget Malawi.',
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/messages');

  const conversations = await getMyConversations();

  return (
    <div className="gm-stack" style={{ gap: 20 }}>
      <div className="gm-between" style={{ flexWrap: 'wrap' }}>
        <div>
          <span className="gm-eyebrow">Inbox</span>
          <h1 className="gm-title" style={{ marginTop: 6 }}>
            Messages
          </h1>
        </div>
        <Link href="/browse" className="gm-btn gm-btn-ghost gm-btn-sm">
          Browse gadgets
        </Link>
      </div>

      <div className="gm-card" style={{ overflow: 'hidden' }}>
        <div className="gm-chat-layout" style={{ minHeight: 500 }}>
          <ConversationList conversations={conversations} />
          <div className="gm-chat-window gm-chat-window-empty">
            <div className="gm-chat-empty-window">
              <p className="gm-muted" style={{ margin: 0 }}>
                Pick a conversation to start chatting
              </p>
              <p className="gm-small gm-subtle" style={{ margin: 0 }}>
                Or message a seller from any product page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}