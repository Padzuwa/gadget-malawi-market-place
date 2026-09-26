import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getConversation,
  getMyConversations,
} from '@/lib/data/chat';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { markConversationRead } from '@/app/messages/actions';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const conv = await getConversation(id);
  return {
    title: conv ? `Chat with ${conv.otherPartyName}` : 'Conversation',
  };
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/messages/${id}`);

  const [conversation, conversations] = await Promise.all([
    getConversation(id),
    getMyConversations(),
  ]);

  if (!conversation) notFound();

  // Fire and forget — don't block render
  markConversationRead(id).catch(() => {});

  return (
    <div className="gm-stack" style={{ gap: 20 }}>
      <div>
        <span className="gm-eyebrow">Inbox</span>
        <h1 className="gm-title" style={{ marginTop: 6 }}>
          Messages
        </h1>
      </div>

      <div className="gm-card" style={{ overflow: 'hidden' }}>
<div className="gm-chat-layout gm-chat-layout-thread">
              <ConversationList conversations={conversations} />
          <ChatWindow
            conversationId={conversation.id}
            currentUserId={conversation.currentUserId}
            otherPartyName={conversation.otherPartyName}
            productTitle={conversation.productTitle}
            productSlug={conversation.productSlug}
            initialMessages={conversation.messages}
          />
        </div>
      </div>
    </div>
  );
}