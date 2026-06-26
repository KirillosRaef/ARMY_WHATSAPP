import { Elysia, t } from "elysia";
import { db } from "../../database";
import { message, messageInsertSchema, conversation, conversationMembers, user } from "../../schema";
import { eq, ne, and, sql } from "drizzle-orm";

export const messageRoute = new Elysia()

messageRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).post(
  '/api/message',
  async ({ body, server }) => {
    const data = await db.insert(message).values(body).returning();
    const sentMessage = data[0];

    // Build a short preview for the sidebar
    let preview = '';
    switch (body.type) {
      case 'Text':  preview = body.content.length > 50 ? body.content.slice(0, 50) + '…' : body.content; break;
      case 'Image': preview = '📷 Image'; break;
      case 'File':  preview = '📄 File'; break;
      case 'Voice': preview = '🎤 Voice message'; break;
      case 'Video': preview = '🎬 Video'; break;
      default:      preview = body.content; break;
    }

    // Update the conversation's last message timestamp and preview
    await db
      .update(conversation)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
      })
      .where(eq(conversation.id, body.conversationId));

    // Increment unread count for all members EXCEPT the sender
    await db
      .update(conversationMembers)
      .set({
        unreadCount: sql`${conversationMembers.unreadCount} + 1`,
      })
      .where(
        and(
          eq(conversationMembers.conversationId, body.conversationId),
          ne(conversationMembers.userId, body.senderId),
        )
      );

    // Fetch the message with senderName
    const messagesData = await db
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
      .where(eq(message.id, sentMessage.id));
    const messageWithSender = messagesData[0] || sentMessage;

    // Publish the message to conversation subscribers (for the chat window)
    server?.publish(`conversation/${body.conversationId}`, JSON.stringify(messageWithSender));

    // Publish a sidebar notification so all users can update their conversation list
    // Fetch all members of this conversation to notify them individually
    const members = await db
      .select({ userId: conversationMembers.userId })
      .from(conversationMembers)
      .where(eq(conversationMembers.conversationId, body.conversationId));

    const notification = JSON.stringify({
      type: 'conversation-update',
      conversationId: body.conversationId,
      lastMessageAt: Date.now(),
      lastMessagePreview: preview,
      senderId: body.senderId,
    });

    for (const member of members) {
      server?.publish(`user-conversations/${member.userId}`, notification);
    }

    return messageWithSender;
  },
  {
    body: t.Omit(messageInsertSchema, ['id']),
  },
);