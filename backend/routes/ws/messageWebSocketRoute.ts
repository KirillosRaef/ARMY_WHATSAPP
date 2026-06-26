import { Elysia, t } from "elysia";
import { db } from "../../database";
import { message, conversation, conversationMembers } from "../../schema";
import { eq, ne, and, sql } from "drizzle-orm";

export const messageWebSocketRoute = new Elysia()

messageWebSocketRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).ws(
  '/ws/message', {
    query: t.Object({
      conversationId: t.String(),
      senderId: t.String()
    }),
    body: t.Object({
      content: t.String(),
      type: t.Union([
        t.Literal('Text'),
        t.Literal('Image'),
        t.Literal('File'),
        t.Literal('Voice'),
        t.Literal('Video'),
      ]),
    }),
    open(ws) {
      const { conversationId, senderId } = ws.data.query;
      ws.subscribe(`conversation/${conversationId}`);
      console.log(
        `User ${senderId} joined conversation ${conversationId}`
      );
    },

    message: async (ws, msg) => {
      const { conversationId, senderId } = ws.data.query;
      const { content, type } = msg

      const data = await db.insert(message).values({
        conversationId: conversationId,
        senderId: senderId,
        content: content,
        type: type,
      }).returning();

      const sentMessage = data[0];

      // Build a short preview for the sidebar
      let preview = '';
      switch (type) {
        case 'Text':  preview = content.length > 50 ? content.slice(0, 50) + '…' : content; break;
        case 'Image': preview = '📷 Image'; break;
        case 'File':  preview = '📄 File'; break;
        case 'Voice': preview = '🎤 Voice message'; break;
        case 'Video': preview = '🎬 Video'; break;
        default:      preview = content; break;
      }

      // Update the conversation's last message timestamp and preview
      await db
        .update(conversation)
        .set({
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
        })
        .where(eq(conversation.id, conversationId));

      // Increment unread count for all members EXCEPT the sender
      await db
        .update(conversationMembers)
        .set({
          unreadCount: sql`${conversationMembers.unreadCount} + 1`,
        })
        .where(
          and(
            eq(conversationMembers.conversationId, conversationId),
            ne(conversationMembers.userId, senderId),
          )
        );

      // Publish to conversation channel (for the chat window)
      ws.publish(`conversation/${conversationId}`, sentMessage);

      // Publish sidebar notification to all conversation members
      const members = await db
        .select({ userId: conversationMembers.userId })
        .from(conversationMembers)
        .where(eq(conversationMembers.conversationId, conversationId));

      const notification = JSON.stringify({
        type: 'conversation-update',
        conversationId: conversationId,
        lastMessageAt: Date.now(),
        lastMessagePreview: preview,
        senderId: senderId,
      });

      for (const member of members) {
        ws.publish(`user-conversations/${member.userId}`, notification);
      }
    },

    close(ws) {
      const { conversationId, senderId } = ws.data.query;

      console.log(
        `User ${senderId} left conversation ${conversationId}`
      );
    },
  }
);