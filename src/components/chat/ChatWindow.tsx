'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/client';
import { sendMessage } from '@/app/messages/actions';

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

type Props = {
  conversationId: string;
  currentUserId: string;
  otherPartyName: string;
  productTitle: string | null;
  productSlug: string | null;
  initialMessages: Message[];
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherPartyName,
  productTitle,
  productSlug,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  // Subscribe to realtime inserts
  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            sender_id: string;
            body: string;
            created_at: string;
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [
              ...prev,
              {
                id: row.id,
                senderId: row.sender_id,
                body: row.body,
                createdAt: row.created_at,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setError(null);
    setBody('');

    startTransition(async () => {
      const result = await sendMessage(conversationId, trimmed);
      if (!result.ok) {
        setError(result.error);
        setBody(trimmed);
        return;
      }
      // Optimistically append; realtime event will dedupe by id
      setMessages((prev) => {
        if (prev.some((m) => m.id === result.message.id)) return prev;
        return [...prev, result.message];
      });
    });
  }

  return (
    <div className="gm-chat-window">
      <div className="gm-chat-header">
        <Link
          href="/messages"
          className="gm-icon-btn gm-chat-back"
          aria-label="Back to conversations"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>

        <span className="gm-avatar">
          {otherPartyName.charAt(0).toUpperCase()}
        </span>

        <div className="gm-chat-header-info">
          <strong className="gm-chat-header-name">{otherPartyName}</strong>
          {productTitle && productSlug ? (
            <Link
              href={`/product/${productSlug}`}
              className="gm-chat-header-product"
            >
              {productTitle}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="gm-chat-messages" ref={scrollRef}>
        {messages.length === 0 ? (
          <p className="gm-small gm-subtle gm-chat-empty-msg">
            Say hi to start the conversation.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`gm-message ${isMine ? 'is-mine' : 'is-theirs'}`}
              >
                <span className="gm-message-body">{m.body}</span>
                <span className="gm-message-time">{formatTime(m.createdAt)}</span>
              </div>
            );
          })
        )}
      </div>

      {error ? (
        <p
          className="gm-xs"
          style={{
            color: 'var(--gm-danger)',
            margin: 0,
            padding: '0 12px 8px',
          }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="gm-chat-compose">
        <input
          className="gm-input"
          type="text"
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={4000}
          disabled={pending}
          aria-label="Message"
        />
        <button
          type="submit"
          className="gm-btn gm-btn-primary"
          disabled={pending || body.trim().length === 0}
          aria-label="Send message"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </div>
  );
}