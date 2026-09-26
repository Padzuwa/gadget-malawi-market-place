'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import type { ConversationSummary } from '@/lib/data/chat';

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function ConversationList({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="gm-chat-empty">
        <p className="gm-muted" style={{ margin: 0 }}>
          No conversations yet.
        </p>
        <p className="gm-small gm-subtle" style={{ margin: 0 }}>
          Message a seller from any product page to start.
        </p>
      </div>
    );
  }

  return (
    <div className="gm-chat-list">
      {conversations.map((c) => {
        const active = pathname === `/messages/${c.id}`;
        const initial = c.otherPartyName.charAt(0).toUpperCase();

        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className={`gm-chat-item${active ? ' is-active' : ''}`}
          >
            <span className="gm-avatar">{initial}</span>

            <div className="gm-chat-item-body">
              <div className="gm-chat-item-top">
                <strong className="gm-chat-item-name">
                  {c.otherPartyName}
                </strong>
                <span className="gm-chat-item-time">
                  {relativeTime(c.lastMessageAt)}
                </span>
              </div>

              {c.productTitle ? (
                <span className="gm-chat-item-product">
                  <FontAwesomeIcon icon={faImage} />
                  {c.productTitle}
                </span>
              ) : null}

              <div className="gm-chat-item-preview">
                <span className="gm-chat-item-preview-text">
                  {c.lastMessagePreview || 'No messages yet'}
                </span>
                {c.unreadCount > 0 ? (
                  <span className="gm-chat-item-badge">{c.unreadCount}</span>
                ) : null}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}