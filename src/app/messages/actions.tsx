'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getOrCreateConversation,
  getOrCreateUserConversation,
} from '@/lib/data/chat';

export type SendMessageResult =
  | {
      ok: true;
      message: {
        id: string;
        senderId: string;
        body: string;
        createdAt: string;
      };
    }
  | { ok: false; error: string };

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<SendMessageResult> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: 'Message cannot be empty.' };
  if (trimmed.length > 4000)
    return { ok: false, error: 'Message is too long.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: trimmed,
    })
    .select('id, sender_id, body, created_at')
    .single();

  if (error || !data) {
    console.error('sendMessage error:', error?.message);
    return { ok: false, error: 'Could not send message.' };
  }

  revalidatePath('/messages');
  revalidatePath(`/messages/${conversationId}`);

  return {
    ok: true,
    message: {
      id: data.id as string,
      senderId: data.sender_id as string,
      body: data.body as string,
      createdAt: data.created_at as string,
    },
  };
}

export async function markConversationRead(
  conversationId: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .is('read_at', null)
    .neq('sender_id', user.id);

  revalidatePath('/messages');
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function startConversation(formData: FormData): Promise<void> {
  const productId = String(formData.get('productId') || '').trim();
  const slug = String(formData.get('slug') || '').trim();

  const backHref = slug ? `/product/${slug}` : '/browse';

  if (!UUID_RE.test(productId)) redirect('/browse');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(backHref)}`);
  }

  const result = await getOrCreateConversation(productId);

  if ('error' in result) {
    redirect(backHref);
  }

  redirect(`/messages/${result.id}`);
}

export async function startUserConversation(
  formData: FormData
): Promise<void> {
  const otherUserId = String(formData.get('userId') || '').trim();
  const username = String(formData.get('username') || '').trim();

  const backHref = username ? `/profile/${username}` : '/browse';

  if (!UUID_RE.test(otherUserId)) redirect('/browse');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(backHref)}`);
  }

  const result = await getOrCreateUserConversation(otherUserId);

  if ('error' in result) {
    redirect(backHref);
  }

  redirect(`/messages/${result.id}`);
}