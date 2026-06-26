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
    // 1. Get all memberships of the current user
    const myMemberships = await db
      .select({
        conversationId: conversationMembers.conversationId,
        unreadCount: conversationMembers.unreadCount,
      })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, currentUserId));

    if (myMemberships.length === 0) {
      return [];
    }

    const conversationIds = myMemberships.map(m => m.conversationId);

    // 2. Fetch the conversation metadata
    const conversationsData = await db
      .select({
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        lastMessageAt: conversation.lastMessageAt,
        lastMessagePreview: conversation.lastMessagePreview,
      })
      .from(conversation)
      .where(inArray(conversation.id, conversationIds))
      .orderBy(desc(conversation.lastMessageAt));

    const privateConvoIds = conversationsData
      .filter(c => c.type === 'Private')
      .map(c => c.id);

    // 3. Fetch the other members' user details for Private conversations
    let otherMembers: any[] = [];
    if (privateConvoIds.length > 0) {
      otherMembers = await db
        .select({
          conversationId: conversationMembers.conversationId,
          userId: user.id,
          name: user.name,
          email: user.email,
          number: user.number,
        })
        .from(conversationMembers)
        .innerJoin(user, eq(conversationMembers.userId, user.id))
        .where(
          and(
            inArray(conversationMembers.conversationId, privateConvoIds),
            ne(conversationMembers.userId, currentUserId)
          )
        );
    }

    const otherMemberMap = new Map(otherMembers.map(m => [m.conversationId, m]));
    const unreadMap = new Map(myMemberships.map(m => [m.conversationId, m.unreadCount]));

    const result = conversationsData.map(c => {
      if (c.type === 'Group') {
        return {
          conversationId: c.id,
          conversationMemberId: '',
          userId: '',
          name: c.name ?? 'Group',
          email: '',
          number: 'Group',
          type: 'Group',
          lastMessageAt: c.lastMessageAt,
          lastMessagePreview: c.lastMessagePreview,
          unreadCount: unreadMap.get(c.id) ?? 0,
        };
      } else {
        const other = otherMemberMap.get(c.id);
        return {
          conversationId: c.id,
          conversationMemberId: '',
          userId: other?.userId ?? '',
          name: other?.name ?? 'Unknown User',
          email: other?.email ?? '',
          number: other?.number ?? '',
          type: 'Private',
          lastMessageAt: c.lastMessageAt,
          lastMessagePreview: c.lastMessagePreview,
          unreadCount: unreadMap.get(c.id) ?? 0,
        };
      }
    });

    return result;
  }, {
  params: t.Object({
    currentUserId: t.String(),
  }),
});