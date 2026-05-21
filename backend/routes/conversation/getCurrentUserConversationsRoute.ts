import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation, conversationMembers, user } from "../../schema";
import { ne, eq, inArray, and } from "drizzle-orm";
export const getCurrentUserConversationsRoute = new Elysia()

getCurrentUserConversationsRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get('api/current-user-conversations/:currentUserId',
  async ({ params: { currentUserId } }) => {

    const currentUserConversations = await db
      .select({
        conversationId: conversation.id,
        conversationMemberId: conversationMembers.id,
        userId: conversationMembers.userId,
        name: user.name,
        email: user.email,
        number: user.number,
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
      );
      
    return currentUserConversations;
  }, {
  params: t.Object({
    currentUserId: t.String(),
  }),
});