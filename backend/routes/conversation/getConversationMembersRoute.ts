import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversationMembers } from "../../schema";
export const getConversationMembersRoute = new Elysia()

getConversationMembersRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get('/api/conversation-members', () => {
  return db.select({
    id: conversationMembers.id,
    conversationId: conversationMembers.conversationId,
    userId: conversationMembers.userId,
    joinedAt: conversationMembers.joinedAt,
  }).from(conversationMembers);
});