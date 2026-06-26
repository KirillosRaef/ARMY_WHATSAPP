import { Elysia, t } from 'elysia';
import { db } from '../../database';
import { conversationMembers } from '../../schema';
import { eq } from 'drizzle-orm';

// Track which users are currently in a call
const usersInCall = new Set<string>();
// Track call partnerships for cleanup on disconnect
const callPartners = new Map<string, string>();
// Track active group calls: conversationId -> { type: 'voice' | 'video', participants: Map<userId, userName> }
export const activeGroupCalls = new Map<string, { type: 'voice' | 'video'; participants: Map<string, string> }>();

export const callSignalingRoute = new Elysia()
  .ws('/ws/call', {
    query: t.Object({
      userId: t.String(),
      conversationId: t.String(),
    }),
    async open(ws) {
      const { userId } = ws.data.query;
      
      // Subscribe to user-specific call channel
      ws.subscribe(`user-call/${userId}`);
      
      console.log(`[Call] User ${userId} connected for calls`);
    },
    message(ws, msg: any) {
      const { to, roomId } = msg;
      const type = msg.type;
      const from = msg.from;

      // ── Busy check: only for 1-to-1 call/video-call offers ──────────────────
      const isGroupOffer = msg.conversationId && activeGroupCalls.has(msg.conversationId);

      if (!isGroupOffer && (type === 'call-offer' || type === 'video-call-offer') && to && usersInCall.has(to)) {
        const busyType = type === 'call-offer' ? 'call-busy' : 'video-call-busy';
        ws.send(JSON.stringify({ type: busyType, from: to, to: from }));
        return; // Don't forward the offer
      }

      // ── Track call state ─────────────────────────────────────────────
      if (!isGroupOffer && (type === 'call-offer' || type === 'video-call-offer')) {
        if (from && to) {
          usersInCall.add(from);
          callPartners.set(from, to);
          usersInCall.add(to);
          callPartners.set(to, from);
        }
      }
      if (!isGroupOffer && (type === 'call-end' || type === 'call-reject' || type === 'video-call-end' || type === 'video-call-reject')) {
        if (from) { usersInCall.delete(from); callPartners.delete(from); }
        if (to) { usersInCall.delete(to); callPartners.delete(to); }
      }

      // ── Track group call state ─────────────────────────────────────────
      if (type === 'group-call-join') {
        if (roomId && from) {
          if (!activeGroupCalls.has(roomId)) {
            activeGroupCalls.set(roomId, { type: 'voice', participants: new Map() });
          }
          const call = activeGroupCalls.get(roomId)!;
          
          // Send list of current participants to the joining user
          const participantsList = Array.from(call.participants.entries()).map(([id, name]) => ({ id, name }));
          ws.send(JSON.stringify({
            type: 'group-call-participants',
            participants: participantsList,
            roomId,
          }));

          call.participants.set(from, msg.fromName || 'User');
        }
      }
      if (type === 'group-video-call-join') {
        if (roomId && from) {
          if (!activeGroupCalls.has(roomId)) {
            activeGroupCalls.set(roomId, { type: 'video', participants: new Map() });
          }
          const call = activeGroupCalls.get(roomId)!;

          // Send list of current participants to the joining user
          const participantsList = Array.from(call.participants.entries()).map(([id, name]) => ({ id, name }));
          ws.send(JSON.stringify({
            type: 'group-video-call-participants',
            participants: participantsList,
            roomId,
          }));

          call.participants.set(from, msg.fromName || 'User');
        }
      }
      if (type === 'group-call-leave' || type === 'group-video-call-leave') {
        if (roomId && from) {
          const call = activeGroupCalls.get(roomId);
          if (call) {
            call.participants.delete(from);
            if (call.participants.size === 0) {
              activeGroupCalls.delete(roomId);
              const endType = call.type === 'video' ? 'group-video-call-ended' : 'group-call-ended';
              db.select({ userId: conversationMembers.userId })
                .from(conversationMembers)
                .where(eq(conversationMembers.conversationId, roomId))
                .then((memberships) => {
                  const payload = JSON.stringify({ type: endType, roomId });
                  for (const m of memberships) {
                    ws.publish(`user-call/${m.userId}`, payload);
                  }
                })
                .catch((err) => {
                  console.error('[Call Signaling] Leave end broadcast failed:', err);
                });
            }
          }
        }
      }

      // ── Forwarding/Broadcasting ──────────────────────────────────────
      if (roomId) {
        // Find all members of the conversation
        db.select({ userId: conversationMembers.userId })
          .from(conversationMembers)
          .where(eq(conversationMembers.conversationId, roomId))
          .then((memberships) => {
            const payload = JSON.stringify(msg);
            for (const m of memberships) {
              if (m.userId !== from) {
                ws.publish(`user-call/${m.userId}`, payload);
              }
            }
          })
          .catch((err) => {
            console.error('[Call Signaling] Failed to fetch room members for broadcasting:', err);
          });
      } else if (to) {
        // Publish to the specific user's private call channel
        ws.publish(`user-call/${to}`, JSON.stringify(msg));
      }
    },
    close(ws) {
      const { userId } = ws.data.query;
      if (usersInCall.has(userId)) {
        const partnerId = callPartners.get(userId);
        usersInCall.delete(userId);
        callPartners.delete(userId);
        if (partnerId) {
          usersInCall.delete(partnerId);
          callPartners.delete(partnerId);
        }
      }

      // Cleanup group calls
      for (const [roomId, call] of activeGroupCalls.entries()) {
        if (call.participants.has(userId)) {
          call.participants.delete(userId);
          console.log(`[Call Signaling] Removed disconnected user ${userId} from group call ${roomId}`);
          
          // Broadcast to other members that this user left
          const leaveType = call.type === 'video' ? 'group-video-call-leave' : 'group-call-leave';
          db.select({ userId: conversationMembers.userId })
            .from(conversationMembers)
            .where(eq(conversationMembers.conversationId, roomId))
            .then((memberships) => {
              const payload = JSON.stringify({ type: leaveType, from: userId, roomId });
              for (const m of memberships) {
                if (m.userId !== userId) {
                  ws.publish(`user-call/${m.userId}`, payload);
                }
              }
            })
            .catch((err) => {
              console.error('[Call Signaling] Disconnect broadcast query failed:', err);
            });

          if (call.participants.size === 0) {
            activeGroupCalls.delete(roomId);
            console.log(`[Call Signaling] Group call ${roomId} ended because all participants left`);
            const endType = call.type === 'video' ? 'group-video-call-ended' : 'group-call-ended';
            db.select({ userId: conversationMembers.userId })
              .from(conversationMembers)
              .where(eq(conversationMembers.conversationId, roomId))
              .then((memberships) => {
                const payload = JSON.stringify({ type: endType, roomId });
                for (const m of memberships) {
                  ws.publish(`user-call/${m.userId}`, payload);
                }
              })
              .catch((err) => {
                console.error('[Call Signaling] Disconnect end broadcast failed:', err);
              });
          }
        }
      }

      console.log(`[Call] User ${userId} disconnected from call channel`);
    },
  });
