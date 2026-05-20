import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversationMembers } from "../../schema";
import { inArray } from "drizzle-orm";
export const deleteConversationMembersRoute = new Elysia()

deleteConversationMembersRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).delete('/api/conversation-members', async ({ body: { conversationMemberIds } }) => {
  const data = await db.delete(conversationMembers)
    .where(inArray(conversationMembers.id, conversationMemberIds));
  return { success: true, data };
}, {
  body: t.Object({
    conversationMemberIds: t.Array(t.String()),
  }),
});