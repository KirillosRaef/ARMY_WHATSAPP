import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation, conversationMembers, user } from "../../schema";
import { eq, and, inArray, countDistinct } from "drizzle-orm";
export const addConversationByNumberRoute = new Elysia()

addConversationByNumberRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).post(
  '/api/add-conversation-by-number/:currentUserId',
  async ({ body: { number }, params: { currentUserId } }) => {
    const fetchedUser = await db.select({ id: user.id, role: user.role }).from(user)
      .where(eq(user.number, number)).limit(1);
    
    if (!fetchedUser[0]) {
      return { message: 'User not found', status: 404 };
    }

    if (fetchedUser[0]!.id === currentUserId) {
      return { message: 'You cannot add yourself', status: 400 };
    }

    if (fetchedUser[0]!.role === 'Admin') {
      return { message: 'You cannot add an admin', status: 400 };
    }
    

    const existingConversation = await db
      .select({
        id: conversation.id,
      })
      .from(conversation)
      .innerJoin(
        conversationMembers,
        eq(conversation.id, conversationMembers.conversationId)
      )
      .where(
        inArray(
          conversationMembers.userId,
          [currentUserId, fetchedUser[0]!.id]
        )
      )
      .groupBy(conversation.id)
      .having(eq(countDistinct(conversationMembers.userId), 2));
    
    if (existingConversation.length > 0) {
      return { message: 'Conversation already exists', status: 400 };
    }

    const newConversation = await db
      .insert(conversation)
      .values({
        type: 'Private',
        name: 'Private',
        createdById: currentUserId,
      })
      .returning();

    // return newConversation[0]!.id;

    const member1 = await db.insert(conversationMembers).values({
      conversationId: newConversation[0]!.id,
      userId: fetchedUser[0]!.id,
    });

    const member2 = await db.insert(conversationMembers).values({
      conversationId: newConversation[0]!.id,
      userId: currentUserId,
    });

    return { message: 'Conversation created successfully', status: 200 };
  },
  {
    body: t.Object({
      number: t.String(),
    }),
  },
);
