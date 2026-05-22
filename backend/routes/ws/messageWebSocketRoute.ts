import { Elysia, t } from "elysia";
import { db } from "../../database";
import { message, messageInsertSchema } from "../../schema";
export const messageWebSocketRoute = new Elysia()

messageWebSocketRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).ws(
  '/ws/message/:conversationId', {
    params: t.Object({
      conversationId: t.String()
    }),
    query: t.Object({
      userId: t.String()
    }),
    open(ws) {
      const { conversationId } = ws.data.params
      ws.subscribe(`ws/message/${conversationId}`)
      const userId = ws.data.query.userId
      console.log(`Connection established in room: ${conversationId}`)
      console.log(`User: ${userId}`)
    },
    message(ws, message) {
      const { conversationId } = ws.data.params
      const userId = ws.data.query.userId

      ws.send(`Echo to Room ${conversationId} (User: ${userId}): ${message}`)
    }
  }
);