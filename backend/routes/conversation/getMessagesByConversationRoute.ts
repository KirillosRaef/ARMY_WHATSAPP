import { Elysia, t } from "elysia";
import { db } from "../../database";
import { message, user } from "../../schema";
import { eq } from "drizzle-orm";

export const getMessagesByConversationRoute = new Elysia()

getMessagesByConversationRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get(
  '/api/messages/:conversationId',
  async ({ params: { conversationId } }) => {
    const messages = await db
      .select({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: user.name,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
      })
      .from(message)
      .leftJoin(user, eq(message.senderId, user.id))
      .where(eq(message.conversationId, conversationId))
      .orderBy(message.createdAt);

    return messages;
  },
  {
    params: t.Object({
      conversationId: t.String(),
    }),
  },
);
