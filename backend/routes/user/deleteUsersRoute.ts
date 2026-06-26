import { Elysia, t } from "elysia";
import { db } from "../../database";
import { user, conversation, conversationMembers, message } from "../../schema";
import { and, inArray, ne } from "drizzle-orm";
import { lower } from "../..";

export const deleteUsersRoute = new Elysia()

deleteUsersRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).delete('/api/users', async ({ body: { userIds } }) => {
  // Only target users that are not 'mnozom'
  const targetUsers = await db.select({ id: user.id })
    .from(user)
    .where(and(inArray(user.id, userIds), ne(lower(user.name), 'mnozom')));
  
  const targetUserIds = targetUsers.map(u => u.id);

  if (targetUserIds.length === 0) {
    return { success: true, data: [] };
  }

  const result = await db.transaction(async (tx) => {
    // 1. Get all conversation memberships of these target users
    const memberships = await tx.select({ conversationId: conversationMembers.conversationId })
      .from(conversationMembers)
      .where(inArray(conversationMembers.userId, targetUserIds));
    
    const conversationIds = [...new Set(memberships.map(m => m.conversationId))];

    if (conversationIds.length > 0) {
      // 2. Query all these conversations to get their types
      const convs = await tx.select({ id: conversation.id, type: conversation.type })
        .from(conversation)
        .where(inArray(conversation.id, conversationIds));

      const privateConvoIds = convs.filter(c => c.type === 'Private').map(c => c.id);
      const groupConvoIds = convs.filter(c => c.type === 'Group').map(c => c.id);

      // 3. For Private conversations: delete conversation, members, and messages
      if (privateConvoIds.length > 0) {
        await tx.delete(conversation).where(inArray(conversation.id, privateConvoIds));
        await tx.delete(conversationMembers).where(inArray(conversationMembers.conversationId, privateConvoIds));
        await tx.delete(message).where(inArray(message.conversationId, privateConvoIds));
      }

      // 4. For Group conversations: only remove the deleted users from conversationMembers
      if (groupConvoIds.length > 0) {
        await tx.delete(conversationMembers)
          .where(and(
            inArray(conversationMembers.conversationId, groupConvoIds),
            inArray(conversationMembers.userId, targetUserIds)
          ));
      }
    }

    // 5. Delete the users themselves from the user table
    const deleteResult = await tx.delete(user)
      .where(inArray(user.id, targetUserIds));

    return deleteResult;
  });

  return { success: true, data: result };
}, {
  body: t.Object({
    userIds: t.Array(t.String()),
  }),
});