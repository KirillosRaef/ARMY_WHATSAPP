import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import VoiceCallOverlay, { type CallState } from './voice_call_overlay';
import VideoCallOverlay, { type VideoCallState } from './video_call_overlay';

const getCurrentUser = async () => {
  const user = await fetch('/api/current-user');
  if (!user.ok) throw new Error('Failed to fetch user');
  return user.json();
};

export default function GlobalCallManager() {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: Infinity, // Keep user stable
  });

  const [callState, setCallState] = useState<CallState>({ phase: 'idle' });
  const [videoCallState, setVideoCallState] = useState<VideoCallState>({ phase: 'idle' });
  const [activeCallRoomId, setActiveCallRoomId] = useState<string>('');

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('call-state-change', { detail: callState }));
  }, [callState]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('video-call-state-change', { detail: videoCallState }));
  }, [videoCallState]);

  const callWsRef = useRef<WebSocket | null>(null);

  // Connect call signaling WS globally when user is loaded
  useEffect(() => {
    if (!currentUser?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws/call?userId=${currentUser.id}&conversationId=global`;
    const ws = new WebSocket(url);

    ws.onmessage = (e) => {
      try {
        const signal = JSON.parse(e.data) as any;
        console.log('[Global Call WS] Signal received:', signal.type, signal);

        // Update activeCallRoomId on incoming signals
        if (signal.type === 'call-offer' || signal.type === 'video-call-offer') {
          setActiveCallRoomId(signal.conversationId || '');
        } else if (signal.type === 'group-call-invite' || signal.type === 'group-video-call-invite') {
          setActiveCallRoomId(signal.roomId || '');
        }

        if (signal.type && (signal.type.startsWith('video-') || signal.type.includes('video'))) {
          window.dispatchEvent(new CustomEvent('video-call-signal', { detail: signal }));
        } else {
          window.dispatchEvent(new CustomEvent('voice-call-signal', { detail: signal }));
        }
      } catch (err) {
        console.error('[Global Call WS] Message parse error:', err);
      }
    };

    ws.onerror = (e) => console.error('[Global Call WS] error', e);
    ws.onopen = () => console.log('[Global Call WS] connected, userId:', currentUser.id);

    callWsRef.current = ws;

    return () => {
      ws.close();
      callWsRef.current = null;
    };
  }, [currentUser?.id]);

  const sendSignal = useCallback((msg: any) => {
    const ws = callWsRef.current;
    if (!ws) return;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else if (ws.readyState === WebSocket.CONNECTING) {
      const onOpen = () => {
        ws.send(JSON.stringify(msg));
        ws.removeEventListener('open', onOpen);
      };
      ws.addEventListener('open', onOpen);
    }
  }, []);

  // Listen to call start events triggered by ChatWindow header buttons
  useEffect(() => {
    const handleStartVoice = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setActiveCallRoomId(detail.conversationId || '');
    };
    const handleStartVideo = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setActiveCallRoomId(detail.conversationId || '');
    };

    window.addEventListener('start-voice-call', handleStartVoice);
    window.addEventListener('start-video-call', handleStartVideo);

    return () => {
      window.removeEventListener('start-voice-call', handleStartVoice);
      window.removeEventListener('start-video-call', handleStartVideo);
    };
  }, []);

  // Auto-navigate to conversation when call goes active
  useEffect(() => {
    if ((callState.phase === 'active' || videoCallState.phase === 'active') && activeCallRoomId) {
      console.log('[Global Call Manager] Navigating to active call room:', activeCallRoomId);
      navigate({ to: '/user/$selectedConversationId', params: { selectedConversationId: activeCallRoomId } });
    }
  }, [callState.phase, videoCallState.phase, activeCallRoomId, navigate]);

  if (!currentUser?.id) return null;

  return (
    <>
      <VoiceCallOverlay
        currentUserId={currentUser.id}
        currentUserName={currentUser.name || 'User'}
        conversationId={activeCallRoomId}
        callState={callState}
        onCallStateChange={setCallState}
        sendSignal={sendSignal}
        isOtherCallActive={videoCallState.phase !== 'idle'}
        conversationType="Group"
        members={[]}
      />
      <VideoCallOverlay
        currentUserId={currentUser.id}
        currentUserName={currentUser.name || 'User'}
        conversationId={activeCallRoomId}
        callState={videoCallState}
        onCallStateChange={setVideoCallState}
        sendSignal={sendSignal}
        isOtherCallActive={callState.phase !== 'idle'}
        conversationType="Group"
        members={[]}
      />
    </>
  );
}
