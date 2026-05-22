import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation, conversationMembers, message } from "../../schema";
export const deleteAllConversationsRoute = new Elysia()

deleteAllConversationsRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).delete('/api/all-conversations', async () => {
  const data = await db.delete(conversation);
  return { success: true, data };
}).delete('/api/all-conversation-members', async () => {
  const data = await db.delete(conversationMembers);
  return { success: true, data };
}).delete('/api/all-messages', async () => {
  const data = await db.delete(message);
  return { success: true, data };
});