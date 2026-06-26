import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation, conversationMembers, user } from "../../schema";
import { eq, and } from "drizzle-orm";

export const addConversationMemberRoute = new Elysia()
  .onError(({ error }) => {
    console.error('[Add Member Error]', error);
    return error;
  })
  .post(
    '/api/conversations/:conversationId/add-member',
    async ({ params: { conversationId }, body: { number }, error }) => {
      // 1. Verify that the conversation is a Group
      const conv = await db
        .select()
        .from(conversation)
        .where(eq(conversation.id, conversationId))
        .limit(1);

      if (conv.length === 0) {
        return error(404, { success: false, message: "Conversation not found" });
      }

      if (conv[0].type !== 'Group') {
        return error(400, { success: false, message: "Cannot add members to a private conversation" });
      }

      // 2. Resolve the phone number to a user ID
      const targetUser = await db
        .select()
        .from(user)
        .where(eq(user.number, number))
        .limit(1);

      if (targetUser.length === 0) {
        return error(404, { success: false, message: "User with this number not found" });
      }

      const targetUserId = targetUser[0].id;

      // 3. Check if the user is already a member
      const existingMember = await db
        .select()
        .from(conversationMembers)
        .where(
          and(
            eq(conversationMembers.conversationId, conversationId),
            eq(conversationMembers.userId, targetUserId)
          )
        )
        .limit(1);

      if (existingMember.length > 0) {
        return error(400, { success: false, message: "User is already a member of this group" });
      }

      // 4. Add the user to the conversation
      await db.insert(conversationMembers).values({
        conversationId,
        userId: targetUserId,
        unreadCount: 0,
      });

      return {
        success: true,
        message: "Member added successfully",
        member: {
          id: targetUser[0].id,
          name: targetUser[0].name,
          email: targetUser[0].email,
          number: targetUser[0].number,
        },
      };
    },
    {
      params: t.Object({
        conversationId: t.String(),
      }),
      body: t.Object({
        number: t.String(),
      }),
    }
  );
