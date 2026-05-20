import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation } from "../../schema";
import { inArray } from "drizzle-orm";
export const deleteConversationsRoute = new Elysia()

deleteConversationsRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).delete('/api/conversations', async ({ body: { conversationIds } }) => {
  const data = await db.delete(conversation)
    .where(inArray(conversation.id, conversationIds));
  return { success: true, data };
}, {
  body: t.Object({
    conversationIds: t.Array(t.String()),
  }),
});