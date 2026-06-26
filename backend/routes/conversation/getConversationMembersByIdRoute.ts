import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversationMembers, user } from "../../schema";
import { eq } from "drizzle-orm";

export const getConversationMembersByIdRoute = new Elysia()
  .onError(({ error }) => {
    console.log(error);
    return error;
  })
  .get(
    '/api/conversations/:conversationId/members',
    async ({ params: { conversationId } }) => {
      const members = await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
        number: user.number,
      })
      .from(conversationMembers)
      .innerJoin(user, eq(conversationMembers.userId, user.id))
      .where(eq(conversationMembers.conversationId, conversationId));

      return members;
    },
    {
      params: t.Object({
        conversationId: t.String(),
      }),
    }
  );
