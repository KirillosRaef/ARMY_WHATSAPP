import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation, conversationMembers } from "../../schema";
import { eq, inArray } from "drizzle-orm";
export const getConversationsByUserIdRoute = new Elysia()

getConversationsByUserIdRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get('/api/conversations-by-user-id/:userId', async ({params: {userId}}) => {
  const data = await db.select({
    id: conversation.id,
    type: conversation.type,
    name: conversation.name,
    createdById: conversation.createdById,
    image: conversation.image,
  }).from(conversationMembers)
    .leftJoin(conversation, eq(conversationMembers.conversationId, conversation.id))
    .where(eq(conversationMembers.userId, userId));
  
  return data;
});