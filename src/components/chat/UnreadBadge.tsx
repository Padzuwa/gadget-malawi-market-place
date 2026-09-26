'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  /** Server-rendered initial count so first paint shows the right number. */
  initialCount: number;
};

/**
 * Displays the unread message count next to a nav item.
 * Subscribes to Supabase Realtime so the badge updates live.
 * Returns null when the count is zero.
 *
 * Note: this component is rendered in multiple places (header bell,
 * sidebar, mobile nav). Each instance needs a UNIQUE realtime channel
 * name — otherwise Supabase throws "cannot add postgres_changes callbacks
 * after subscribe()" when the second instance mounts.
 */
export function UnreadBadge({ initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const supabaseRef = useRef(createClient());
  const instanceId = useId();

  // Keep in sync with the server-rendered value (e.g. after navigation)
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const supabase = supabaseRef.current;

    async function refresh() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCount(0);
        return;
      }

      const { count: fresh } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null)
        .neq('sender_id', user.id);

      setCount(fresh ?? 0);
    }

    // Unique channel per component instance — avoids channel name collision
    const channelName = `unread-badge-${instanceId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        refresh
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [instanceId]);

  if (count <= 0) return null;

  return (
    <span className="gm-nav-badge" aria-label={`${count} unread`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}