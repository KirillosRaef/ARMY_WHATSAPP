import { Elysia, t } from "elysia";
import { db } from "../../database";
import { message } from "../../schema";
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

      ws.publish(`conversation/${conversationId}`, data[0]);

    },

    close(ws) {
      const { conversationId, senderId } = ws.data.query;

      console.log(
        `User ${senderId} left conversation ${conversationId}`
      );
    },
  }
);