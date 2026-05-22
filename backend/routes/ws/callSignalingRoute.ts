import { Elysia, t } from 'elysia';

// Map userId → WebSocket for direct signaling
const callSockets = new Map<string, any>();

export const callSignalingRoute = new Elysia()
  .ws('/ws/call', {
    query: t.Object({
      userId: t.String(),
      conversationId: t.String(),
    }),
    open(ws) {
      const { userId, conversationId } = ws.data.query;
      callSockets.set(userId, ws);
      // Also subscribe to the conversation call channel (for future broadcast use)
      ws.subscribe(`call/${conversationId}`);
      console.log(`[Call] User ${userId} connected for conversation ${conversationId}`);
    },
    message(ws, msg: any) {
      // Forward signaling message directly to the target user
      const { to } = msg;
      if (to) {
        const targetWs = callSockets.get(to);
        if (targetWs) {
          targetWs.send(JSON.stringify(msg));
        }
      }
    },
    close(ws) {
      const { userId, conversationId } = ws.data.query;
      callSockets.delete(userId);
      console.log(`[Call] User ${userId} disconnected from call channel`);
    },
  });
