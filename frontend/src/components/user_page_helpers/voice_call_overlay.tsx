import { useEffect, useRef, useState, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// STUN servers for NAT traversal (public Google STUN)
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export type CallSignal =
  | { type: 'call-offer';    offer: RTCSessionDescriptionInit; from: string; fromName: string; to: string; conversationId: string }
  | { type: 'call-answer';   answer: RTCSessionDescriptionInit; from: string; to: string }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit;    from: string; to: string }
  | { type: 'call-end';      from: string; to: string }
  | { type: 'call-reject';   from: string; to: string };

export type CallState =
  | { phase: 'idle' }
  | { phase: 'calling';  contactName: string; contactUserId: string }
  | { phase: 'incoming'; callerName: string;  callerUserId: string }
  | { phase: 'active' };

interface VoiceCallOverlayProps {
  currentUserId: string;
  conversationId: string;
  callState: CallState;
  onCallStateChange: (s: CallState) => void;
  // The signaling WS is managed externally and passed in via callbacks
  sendSignal: (msg: CallSignal) => void;
  incomingSignal: CallSignal | null;
  onIncomingSignalHandled: () => void;
}

export default function VoiceCallOverlay({
  currentUserId,
  conversationId,
  callState,
  onCallStateChange,
  sendSignal,
  incomingSignal,
  onIncomingSignalHandled,
}: VoiceCallOverlayProps) {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Create / reset PeerConnection ──────────────────────────────────────────
  const createPeer = useCallback((targetUserId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ type: 'ice-candidate', candidate: e.candidate.toJSON(), from: currentUserId, to: targetUserId });
      }
    };

    pc.ontrack = (e) => {
      console.log('[WebRTC] Received remote track:', e.track.kind, e.streams);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0];
        remoteAudioRef.current.play().catch(err => {
          console.error('[WebRTC] Error auto-playing remote audio:', err);
        });
      }
    };

    peerRef.current = pc;
    return pc;
  }, [currentUserId, sendSignal]);

  // ── Process Queued ICE Candidates ──────────────────────────────────────────
  const processPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    if (pendingIceCandidatesRef.current.length === 0) return;
    console.log(`[WebRTC] Processing ${pendingIceCandidatesRef.current.length} queued ICE candidates`);
    for (const candidate of pendingIceCandidatesRef.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[WebRTC] Error adding queued ICE candidate:', err);
      }
    }
    pendingIceCandidatesRef.current = [];
  }, []);

  // ── Get local mic stream ───────────────────────────────────────────────────
  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    return stream;
  };

  // ── Start call timer ───────────────────────────────────────────────────────
  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCallDuration(0);
  };

  const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Cleanup ────────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    pendingIceCandidatesRef.current = [];
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    stopTimer();
  }, []);

  // ── Initiate a call ────────────────────────────────────────────────────────
  const initiateCall = useCallback(async (targetUserId: string, targetName: string, myName: string) => {
    const stream = await getLocalStream();
    const pc = createPeer(targetUserId);
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({ type: 'call-offer', offer, from: currentUserId, fromName: myName, to: targetUserId, conversationId });
    onCallStateChange({ phase: 'calling', contactName: targetName, contactUserId: targetUserId });
  }, [createPeer, currentUserId, conversationId, sendSignal, onCallStateChange]);

  // ── Listen for call start triggered from header button ─────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { contactUserId, contactName, myName } = (e as CustomEvent).detail;
      if (callState.phase === 'idle') {
        initiateCall(contactUserId, contactName, myName);
      }
    };
    window.addEventListener('start-voice-call', handler);
    return () => window.removeEventListener('start-voice-call', handler);
  }, [callState.phase, initiateCall]);

  // ── Accept incoming call ───────────────────────────────────────────────────
  const acceptCall = useCallback(async (callerUserId: string, offer: RTCSessionDescriptionInit) => {
    const stream = await getLocalStream();
    const pc = createPeer(callerUserId);
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Process early candidates now that remote description is set
    await processPendingIceCandidates(pc);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendSignal({ type: 'call-answer', answer, from: currentUserId, to: callerUserId });
    onCallStateChange({ phase: 'active' });
    startTimer();
  }, [createPeer, currentUserId, sendSignal, onCallStateChange, processPendingIceCandidates]);

  // ── Hang up ────────────────────────────────────────────────────────────────
  const hangUp = useCallback((targetUserId?: string) => {
    if (targetUserId) {
      sendSignal({ type: 'call-end', from: currentUserId, to: targetUserId });
    }
    cleanup();
    onCallStateChange({ phase: 'idle' });
  }, [cleanup, currentUserId, sendSignal, onCallStateChange]);

  const rejectCall = useCallback((callerUserId: string) => {
    sendSignal({ type: 'call-reject', from: currentUserId, to: callerUserId });
    onCallStateChange({ phase: 'idle' });
  }, [currentUserId, sendSignal, onCallStateChange]);

  // ── Handle incoming signals ────────────────────────────────────────────────
  useEffect(() => {
    if (!incomingSignal) return;
    onIncomingSignalHandled();

    (async () => {
      switch (incomingSignal.type) {
        case 'call-offer': {
          onCallStateChange({ phase: 'incoming', callerName: incomingSignal.fromName, callerUserId: incomingSignal.from });
          // Store the offer so acceptCall can use it
          (window as any).__pendingCallOffer = incomingSignal.offer;
          (window as any).__pendingCallerUserId = incomingSignal.from;
          break;
        }
        case 'call-answer': {
          if (peerRef.current) {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(incomingSignal.answer));
            
            // Process early candidates now that remote description is set
            await processPendingIceCandidates(peerRef.current);

            onCallStateChange({ phase: 'active' });
            startTimer();
          }
          break;
        }
        case 'ice-candidate': {
          if (peerRef.current && peerRef.current.remoteDescription) {
            try {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(incomingSignal.candidate));
            } catch (err) {
              console.error('[WebRTC] Error adding ICE candidate directly:', err);
            }
          } else {
            console.log('[WebRTC] Remote description not ready, queuing ICE candidate');
            pendingIceCandidatesRef.current.push(incomingSignal.candidate);
          }
          break;
        }
        case 'call-end':
        case 'call-reject': {
          cleanup();
          onCallStateChange({ phase: 'idle' });
          break;
        }
      }
    })();
  }, [incomingSignal, onIncomingSignalHandled, cleanup, onCallStateChange, processPendingIceCandidates]);

  // ── Mute toggle ────────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(m => !m);
    }
  };

  // Hidden audio element for remote stream (not display: none to prevent browser playback throttling)
  const audioEl = (
    <audio ref={remoteAudioRef} autoPlay playsInline className="absolute pointer-events-none opacity-0 h-0 w-0" />
  );

  if (callState.phase === 'idle') return <>{audioEl}</>;

  // ── Incoming call UI ───────────────────────────────────────────────────────
  if (callState.phase === 'incoming') {
    const { callerName, callerUserId } = callState;
    return (
      <>
        {audioEl}
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 bg-white rounded-3xl shadow-2xl p-10 w-80 animate-in fade-in zoom-in-95">
            {/* Pulsing ring */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full bg-emerald-400/30 animate-ping" />
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-400/40">
                <span className="text-white text-3xl font-bold">{callerName.charAt(0)}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{callerName}</p>
              <p className="text-sm text-gray-400 mt-1">Incoming voice call…</p>
            </div>
            <div className="flex gap-6">
              {/* Reject */}
              <button
                onClick={() => rejectCall(callerUserId)}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-400/40 transition-colors">
                  <PhoneOff className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-gray-500">Decline</span>
              </button>
              {/* Accept */}
              <button
                onClick={() => {
                  const offer = (window as any).__pendingCallOffer;
                  const callerId = (window as any).__pendingCallerUserId;
                  if (offer && callerId) acceptCall(callerId, offer);
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-400/40 transition-colors">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-gray-500">Accept</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Outgoing (calling) UI ──────────────────────────────────────────────────
  if (callState.phase === 'calling') {
    const { contactName, contactUserId } = callState;
    return (
      <>
        {audioEl}
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 bg-white rounded-3xl shadow-2xl p-10 w-80 animate-in fade-in zoom-in-95">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full bg-indigo-400/30 animate-ping" />
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-400/40">
                <span className="text-white text-3xl font-bold">{contactName.charAt(0)}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{contactName}</p>
              <p className="text-sm text-gray-400 mt-1 animate-pulse">Calling…</p>
            </div>
            <button onClick={() => hangUp(contactUserId)} className="flex flex-col items-center gap-1.5">
              <div className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-400/40 transition-colors">
                <PhoneOff className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">Cancel</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Active call UI ─────────────────────────────────────────────────────────
  if (callState.phase === 'active') {
    const otherUserId =
      (callState as any).contactUserId ??
      (window as any).__pendingCallerUserId ??
      '';

    return (
      <>
        {audioEl}
        {/* Floating active call bar at the top */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 bg-white border border-gray-200 rounded-2xl shadow-xl px-5 py-3 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <Volume2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Voice call active</p>
              <p className="text-xs text-emerald-500 font-mono">{formatDuration(callDuration)}</p>
            </div>
          </div>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className={cn(
              'h-9 w-9 rounded-full flex items-center justify-center transition-colors',
              isMuted ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Hang up */}
          <button
            onClick={() => hangUp(otherUserId)}
            className="h-9 w-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
          >
            <PhoneOff className="h-4 w-4 text-white" />
          </button>
        </div>
      </>
    );
  }

  return <>{audioEl}</>;
}
