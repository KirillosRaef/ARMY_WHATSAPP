import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversationMembers } from "../../schema";
import { eq, and } from "drizzle-orm";

export const markConversationReadRoute = new Elysia();

markConversationReadRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).post(
  '/api/conversations/:conversationId/mark-read',
  async ({ params: { conversationId }, body: { userId } }) => {
    await db
      .update(conversationMembers)
      .set({ unreadCount: 0 })
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, userId),
        )
      );

    return { success: true };
  },
  {
    params: t.Object({
      conversationId: t.String(),
    }),
    body: t.Object({
      userId: t.String(),
    }),
  },
);
