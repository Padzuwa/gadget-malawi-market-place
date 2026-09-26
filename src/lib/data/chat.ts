import { createClient } from '@/lib/supabase/server';

export type ConversationSummary = {
  id: string;
  otherPartyId: string;
  otherPartyName: string;
  productId: string | null;
  productTitle: string | null;
  productImageUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

/**
 * Fetch every conversation the current user participates in,
 * newest activity first, with unread count.
 */
export async function getMyConversations(): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
        id,
        buyer_id,
        seller_id,
        product_id,
        last_message_at,
        last_message_preview,
        products:products(id, title, primary_image_url),
        buyer:profiles!conversations_buyer_id_fkey(id, display_name, shop_name),
        seller:profiles!conversations_seller_id_fkey(id, display_name, shop_name)
      `
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('getMyConversations error:', error.message);
    return [];
  }

  // Fetch unread counts for all conversations in one query
  const conversationIds = data.map((c: { id: string }) => c.id);

  let unreadByConversation: Record<string, number> = {};
  if (conversationIds.length > 0) {
    const { data: unread } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .is('read_at', null)
      .neq('sender_id', user.id);

    if (unread) {
      unreadByConversation = unread.reduce((acc, row) => {
        const id = row.conversation_id as string;
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  return data.map((row) => {
    const isBuyer = row.buyer_id === user.id;
    const other = isBuyer ? row.seller : row.buyer;
    const otherProfile = Array.isArray(other) ? other[0] : other;
    const product = Array.isArray(row.products) ? row.products[0] : row.products;

    return {
      id: row.id as string,
      otherPartyId: (isBuyer ? row.seller_id : row.buyer_id) as string,
      otherPartyName:
        (otherProfile?.shop_name ||
          otherProfile?.display_name ||
          'User') as string,
      productId: (row.product_id as string | null) ?? null,
      productTitle: (product?.title as string | undefined) ?? null,
      productImageUrl:
        (product?.primary_image_url as string | undefined) ?? null,
      lastMessagePreview: (row.last_message_preview as string | null) ?? null,
      lastMessageAt: row.last_message_at as string,
      unreadCount: unreadByConversation[row.id as string] ?? 0,
    };
  });
}

/**
 * Load one conversation with its messages. Returns null if the caller
 * is not a participant (RLS will simply return no row).
 */
export async function getConversation(
  conversationId: string
): Promise<{
  id: string;
  otherPartyId: string;
  otherPartyName: string;
  otherPartyAvatar: string | null;
  productId: string | null;
  productTitle: string | null;
  productSlug: string | null;
  productImageUrl: string | null;
  currentUserId: string;
  messages: ChatMessage[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select(
      `
        id,
        buyer_id,
        seller_id,
        product_id,
        products:products(id, title, slug, primary_image_url),
        buyer:profiles!conversations_buyer_id_fkey(id, display_name, shop_name, avatar_url),
        seller:profiles!conversations_seller_id_fkey(id, display_name, shop_name, avatar_url)
      `
    )
    .eq('id', conversationId)
    .maybeSingle();

  if (convError || !conv) {
    if (convError) console.error('getConversation error:', convError.message);
    return null;
  }

  const isBuyer = conv.buyer_id === user.id;
  const other = isBuyer ? conv.seller : conv.buyer;
  const otherProfile = Array.isArray(other) ? other[0] : other;
  const product = Array.isArray(conv.products) ? conv.products[0] : conv.products;

  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at, read_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return {
    id: conv.id as string,
    otherPartyId: (isBuyer ? conv.seller_id : conv.buyer_id) as string,
    otherPartyName:
      (otherProfile?.shop_name ||
        otherProfile?.display_name ||
        'User') as string,
    otherPartyAvatar:
      (otherProfile?.avatar_url as string | null | undefined) ?? null,
    productId: (conv.product_id as string | null) ?? null,
    productTitle: (product?.title as string | undefined) ?? null,
    productSlug: (product?.slug as string | undefined) ?? null,
    productImageUrl:
      (product?.primary_image_url as string | undefined) ?? null,
    currentUserId: user.id,
    messages: (messages ?? []).map((m) => ({
      id: m.id as string,
      senderId: m.sender_id as string,
      body: m.body as string,
      createdAt: m.created_at as string,
      readAt: (m.read_at as string | null) ?? null,
    })),
  };
}

/**
 * Get or create the conversation for (buyer, seller, product).
 * Returns the conversation ID.
 */
export async function getOrCreateConversation(
  productId: string
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'You must be signed in.' };

  // Look up the product's seller
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, seller_id')
    .eq('id', productId)
    .maybeSingle();

  if (productError || !product) {
    return { error: 'Product not found.' };
  }

  if (product.seller_id === user.id) {
    return { error: 'You cannot message yourself about your own listing.' };
  }

  // Try to find existing
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('seller_id', product.seller_id)
    .eq('product_id', product.id)
    .maybeSingle();

  if (existing) return { id: existing.id as string };

  // Create new
  const { data: created, error: insertError } = await supabase
    .from('conversations')
    .insert({
      buyer_id: user.id,
      seller_id: product.seller_id,
      product_id: product.id,
    })
    .select('id')
    .single();

  if (insertError || !created) {
    return { error: 'Could not start conversation.' };
  }

  return { id: created.id as string };
}
/**
 * Return the number of unread messages for the current user.
 * RLS already restricts rows to conversations the user is a participant in,
 * so we don't need to join — just filter by "not sent by me, not read".
 */
export async function getUnreadMessageCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
    .neq('sender_id', user.id);

  if (error) {
    console.error('getUnreadMessageCount error:', error.message);
    return 0;
  }

  return count ?? 0;
}