import { Elysia, t } from 'elysia';

// Map userId → WebSocket for direct signaling
const callSockets = new Map<string, any>();

// Track which users are currently in a call
const usersInCall = new Set<string>();
// Track call partnerships for cleanup on disconnect
const callPartners = new Map<string, string>();

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
        const type = msg.type;
        const from = msg.from;

        // ── Busy check: only for call/video-call offers ──────────────────
        if ((type === 'call-offer' || type === 'video-call-offer') && usersInCall.has(to)) {
          const busyType = type === 'call-offer' ? 'call-busy' : 'video-call-busy';
          const callerWs = callSockets.get(from);
          if (callerWs) {
            callerWs.send(JSON.stringify({ type: busyType, from: to, to: from }));
          }
          return; // Don't forward the offer
        }

        // ── Track call state ─────────────────────────────────────────────
        if (type === 'call-offer' || type === 'video-call-offer') {
          if (from) { usersInCall.add(from); callPartners.set(from, to); }
          usersInCall.add(to); callPartners.set(to, from);
        }
        if (type === 'call-end' || type === 'call-reject' || type === 'video-call-end' || type === 'video-call-reject') {
          if (from) { usersInCall.delete(from); callPartners.delete(from); }
          usersInCall.delete(to); callPartners.delete(to);
        }

        // ── Forward (identical to original) ──────────────────────────────
        const targetWs = callSockets.get(to);
        if (targetWs) {
          targetWs.send(JSON.stringify(msg));
        }
      }
    },
    close(ws) {
      const { userId, conversationId } = ws.data.query;
      callSockets.delete(userId);
      // Clean up user and their call partner
      if (usersInCall.has(userId)) {
        const partnerId = callPartners.get(userId);
        usersInCall.delete(userId);
        callPartners.delete(userId);
        if (partnerId) {
          usersInCall.delete(partnerId);
          callPartners.delete(partnerId);
        }
      }
      console.log(`[Call] User ${userId} disconnected from call channel`);
    },
  });
