import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation, conversationMembers, user } from "../../schema";
import { inArray } from "drizzle-orm";

export const addGroupConversationRoute = new Elysia()
  .onError(({ error }) => {
    console.log(error);
    return error;
  })
  .post(
    '/api/add-group-conversation/:currentUserId',
    async ({ body: { name, numbers }, params: { currentUserId } }) => {
      if (numbers.length === 0) {
        return { message: 'Group must have at least one other member', status: 400 };
      }

      // Find all valid users by their phone numbers
      const fetchedUsers = await db.select({ id: user.id })
        .from(user)
        .where(inArray(user.number, numbers));

      if (fetchedUsers.length === 0) {
        return { message: 'No valid phone numbers found', status: 400 };
      }

      // Create a Group conversation
      const newConversation = await db.insert(conversation)
        .values({
          type: 'Group',
          name: name.trim(),
          createdById: currentUserId,
        })
        .returning();

      const groupConvoId = newConversation[0]!.id;

      // Add all resolved users plus the creator to the group
      const userIdsToAdd = [currentUserId, ...fetchedUsers.map(u => u.id)];
      const uniqueUserIds = [...new Set(userIdsToAdd)];

      for (const uid of uniqueUserIds) {
        await db.insert(conversationMembers).values({
          conversationId: groupConvoId,
          userId: uid,
        });
      }

      return { message: 'Group created successfully', status: 200, conversationId: groupConvoId };
    },
    {
      body: t.Object({
        name: t.String(),
        numbers: t.Array(t.String()),
      }),
      params: t.Object({
        currentUserId: t.String(),
      }),
    }
  );
