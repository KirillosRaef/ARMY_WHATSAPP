import { Elysia, t } from "elysia";

// Global WebSocket endpoint for real-time conversation sidebar updates.
// Each user subscribes with their userId. When a message is sent in any
// conversation, a notification is published so all members can update
// their sidebar (unread badge, last message preview, sort order).

export const conversationNotifyRoute = new Elysia();

conversationNotifyRoute.ws('/ws/conversations-notify', {
  query: t.Object({
    userId: t.String(),
  }),
  open(ws) {
    const { userId } = ws.data.query;
    // Subscribe to a user-specific channel so we can target notifications
    ws.subscribe(`user-conversations/${userId}`);
    // Also subscribe to a global channel for broadcast
    ws.subscribe('conversations-updates');
    console.log(`[Notify] User ${userId} subscribed to conversation updates`);
  },
  message(_ws, _msg) {
    // Clients don't send messages on this channel — it's server-push only
  },
  close(ws) {
    const { userId } = ws.data.query;
    console.log(`[Notify] User ${userId} unsubscribed from conversation updates`);
  },
});
