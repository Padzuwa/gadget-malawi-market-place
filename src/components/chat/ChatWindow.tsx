'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faArrowLeft,
  faCheck,
  faCheckDouble,
  faCommentDots,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/client';
import { sendMessage } from '@/app/messages/actions';

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
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

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDay(iso: string): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dayKey(iso) === dayKey(today.toISOString())) return 'Today';
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Yesterday';

  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
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

  // Realtime: new messages + read status updates
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
            read_at: string | null;
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
                readAt: row.read_at,
              },
            ];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; read_at: string | null };
          setMessages((prev) =>
            prev.map((m) =>
              m.id === row.id ? { ...m, readAt: row.read_at } : m
            )
          );
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

  // Group messages by day for separators
  const grouped = useMemo(() => {
    const groups: { day: string; dayLabel: string; messages: Message[] }[] = [];
    for (const m of messages) {
      const key = dayKey(m.createdAt);
      const last = groups[groups.length - 1];
      if (!last || last.day !== key) {
        groups.push({
          day: key,
          dayLabel: formatDay(m.createdAt),
          messages: [m],
        });
      } else {
        last.messages.push(m);
      }
    }
    return groups;
  }, [messages]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || pending) return;

    setError(null);
    setBody('');

    startTransition(async () => {
      const result = await sendMessage(conversationId, trimmed);
      if (!result.ok) {
        setError(result.error);
        setBody(trimmed);
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === result.message.id)) return prev;
        return [...prev, { ...result.message, readAt: null }];
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
          ) : (
            <span className="gm-chat-header-product gm-muted">
              Conversation
            </span>
          )}
        </div>
      </div>

      <div className="gm-chat-messages" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="gm-chat-empty-thread">
            <FontAwesomeIcon icon={faCommentDots} />
            <p className="gm-muted" style={{ margin: 0 }}>
              Say hi to start the conversation
            </p>
            <p className="gm-small gm-subtle" style={{ margin: 0 }}>
              Ask about the item, price, or delivery.
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.day} className="gm-chat-day-group">
              <div className="gm-chat-day">
                <span>{group.dayLabel}</span>
              </div>

              {group.messages.map((m, idx) => {
                const isMine = m.senderId === currentUserId;
                const prev = group.messages[idx - 1];
                const showAvatar =
                  !isMine && (!prev || prev.senderId !== m.senderId);

                return (
                  <div
                    key={m.id}
                    className={`gm-message-row${isMine ? ' is-mine' : ' is-theirs'}`}
                  >
                    {!isMine ? (
                      <span
                        className={`gm-message-avatar${
                          showAvatar ? '' : ' is-hidden'
                        }`}
                        aria-hidden={!showAvatar}
                      >
                        {otherPartyName.charAt(0).toUpperCase()}
                      </span>
                    ) : null}

                    <div
                      className={`gm-message ${isMine ? 'is-mine' : 'is-theirs'}`}
                    >
                      <span className="gm-message-body">{m.body}</span>
                      <span className="gm-message-meta">
                        {formatTime(m.createdAt)}
                        {isMine ? (
                          <FontAwesomeIcon
                            icon={m.readAt ? faCheckDouble : faCheck}
                            className={`gm-message-tick${
                              m.readAt ? ' is-read' : ''
                            }`}
                          />
                        ) : null}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {error ? (
        <p className="gm-chat-error" role="alert">
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
          autoComplete="off"
        />
        <button
          type="submit"
          className="gm-btn gm-btn-primary gm-chat-send"
          disabled={pending || body.trim().length === 0}
          aria-label="Send message"
        >
          <FontAwesomeIcon
            icon={pending ? faSpinner : faPaperPlane}
            spin={pending}
          />
        </button>
      </form>
    </div>
  );
}