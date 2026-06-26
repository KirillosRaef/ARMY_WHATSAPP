import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation, conversationMembers, user } from "../../schema";
import { ne, eq, inArray, and, desc } from "drizzle-orm";

export const getCurrentUserConversationsRoute = new Elysia()

getCurrentUserConversationsRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get('/api/current-user-conversations/:currentUserId',
  async ({ params: { currentUserId } }) => {

    const currentUserConversations = await db
      .select({
        conversationId: conversation.id,
        conversationMemberId: conversationMembers.id,
        userId: conversationMembers.userId,
        name: user.name,
        email: user.email,
        number: user.number,
        lastMessageAt: conversation.lastMessageAt,
        lastMessagePreview: conversation.lastMessagePreview,
        unreadCount: conversationMembers.unreadCount,
      })
      .from(conversation)
      .leftJoin(
        conversationMembers,
        eq(conversation.id, conversationMembers.conversationId)
      )
      .leftJoin(
        user,
        eq(conversationMembers.userId, user.id)
      )
      .where(
        and(inArray(
          conversation.id,
          db.select({ conversationId: conversationMembers.conversationId })
            .from(conversationMembers)
            .where(eq(conversationMembers.userId, currentUserId))
        ), ne(conversationMembers.userId, currentUserId))
      )
      .orderBy(desc(conversation.lastMessageAt));

    // We need the unread count for the CURRENT user, not the other member.
    // The query above joins on the OTHER member's row (ne(userId, currentUserId)).
    // So we need a separate query to get the current user's unread counts.
    const currentUserMemberships = await db
      .select({
        conversationId: conversationMembers.conversationId,
        unreadCount: conversationMembers.unreadCount,
      })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, currentUserId));

    const unreadMap = new Map(
      currentUserMemberships.map(m => [m.conversationId, m.unreadCount])
    );

    const result = currentUserConversations.map(c => ({
      ...c,
      unreadCount: unreadMap.get(c.conversationId) ?? 0,
    }));

    return result;
  }, {
  params: t.Object({
    currentUserId: t.String(),
  }),
});