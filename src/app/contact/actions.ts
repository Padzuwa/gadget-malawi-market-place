'use server';

import { createClient } from '@/lib/supabase/server';

export type ContactSubject =
  | 'general'
  | 'support'
  | 'report'
  | 'seller'
  | 'partnership'
  | 'press'
  | 'other';

export type SubmitContactResult = { ok: true } | { ok: false; error: string };

type Input = {
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
};

const VALID_SUBJECTS: ContactSubject[] = [
  'general',
  'support',
  'report',
  'seller',
  'partnership',
  'press',
  'other',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function submitContact(
  input: Input
): Promise<SubmitContactResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const message = input.message.trim();

  if (name.length < 1) {
    return { ok: false, error: 'Please tell us your name.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!VALID_SUBJECTS.includes(input.subject)) {
    return { ok: false, error: 'Please pick a subject.' };
  }
  if (message.length < 10) {
    return {
      ok: false,
      error: 'Your message is too short — please add more detail.',
    };
  }
  if (message.length > 4000) {
    return { ok: false, error: 'Your message is too long.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // User-Agent for basic abuse detection
  let userAgent: string | null = null;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    userAgent = h.get('user-agent');
  } catch {
    // ignore
  }

  const { error } = await supabase.from('contact_messages').insert({
    name,
    email,
    subject: input.subject,
    message,
    user_id: user?.id ?? null,
    user_agent: userAgent,
  });

  if (error) {
    console.error('submitContact error:', error.message);
    return {
      ok: false,
      error: 'Could not send your message. Please try again.',
    };
  }

  return { ok: true };
}