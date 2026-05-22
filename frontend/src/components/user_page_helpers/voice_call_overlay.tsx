import { useEffect, useRef, useState, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// STUN servers for NAT traversal (public Google STUN)
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: any = null;

  startDialTone() {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      const playTone = () => {
        if (!this.ctx) return;
        
        this.osc1 = this.ctx.createOscillator();
        this.osc2 = this.ctx.createOscillator();
        this.gainNode = this.ctx.createGain();
        
        this.osc1.frequency.value = 440;
        this.osc2.frequency.value = 480;
        
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.1);
        this.gainNode.gain.setValueAtTime(0.06, this.ctx.currentTime + 1.4);
        this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
        
        this.osc1.connect(this.gainNode);
        this.osc2.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
        
        this.osc1.start();
        this.osc2.start();
        
        const o1 = this.osc1;
        const o2 = this.osc2;
        const g = this.gainNode;
        setTimeout(() => {
          try { o1.stop(); o1.disconnect(); } catch {}
          try { o2.stop(); o2.disconnect(); } catch {}
          try { g.disconnect(); } catch {}
        }, 1600);
      };
      
      playTone();
      this.intervalId = setInterval(playTone, 4000);
    } catch (e) {
      console.error('Failed to play dialing sound:', e);
    }
  }

  startIncomingRing() {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      const playTone = () => {
        if (!this.ctx) return;
        
        this.osc1 = this.ctx.createOscillator();
        this.gainNode = this.ctx.createGain();
        
        this.osc1.type = 'sine';
        this.osc1.frequency.setValueAtTime(880, this.ctx.currentTime);
        this.osc1.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.3);
        
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        
        this.osc1.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
        
        this.osc1.start();
        
        const o1 = this.osc1;
        const g = this.gainNode;
        setTimeout(() => {
          try { o1.stop(); o1.disconnect(); } catch {}
          try { g.disconnect(); } catch {}
        }, 500);
      };
      
      const playPattern = () => {
        playTone();
        setTimeout(playTone, 200);
        setTimeout(playTone, 400);
      };
      
      playPattern();
      this.intervalId = setInterval(playPattern, 2500);
    } catch (e) {
      console.error('Failed to play ringtone:', e);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
    this.osc1 = null;
    this.osc2 = null;
    this.gainNode = null;
  }
}

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
  | { phase: 'active';   otherUserId: string };

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

// ── Animated sound wave bars ───────────────────────────────────────────────
function SoundWave({ active }: { active: boolean }) {
  const bars = [3, 5, 8, 12, 9, 6, 10, 7, 11, 5, 8, 4, 9, 6, 3];
  return (
    <div className="flex items-center gap-[3px] h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          className={cn(
            'w-[3px] rounded-full transition-all',
            active ? 'bg-emerald-400' : 'bg-white/25',
          )}
          style={{
            height: active ? `${h * 2}px` : '4px',
            animation: active ? `soundBar 1s ease-in-out ${i * 0.07}s infinite alternate` : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ── Avatar with concentric orbit rings ────────────────────────────────────
function CallAvatar({
  name,
  color,
  pulse,
}: {
  name: string;
  color: 'indigo' | 'emerald';
  pulse: boolean;
}) {
  const gradients = {
    indigo: 'from-indigo-400 via-violet-500 to-purple-600',
    emerald: 'from-emerald-400 via-teal-500 to-cyan-500',
  };
  const glows = {
    indigo: 'shadow-indigo-500/40',
    emerald: 'shadow-emerald-500/40',
  };
  const ringColors = {
    indigo: 'border-indigo-400/30',
    emerald: 'border-emerald-400/30',
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings */}
      {pulse && (
        <>
          <div className={cn('absolute rounded-full border-2 animate-ping', ringColors[color])} style={{ width: 140, height: 140, animationDuration: '2s' }} />
          <div className={cn('absolute rounded-full border-2 animate-ping', ringColors[color])} style={{ width: 110, height: 110, animationDuration: '2s', animationDelay: '0.5s' }} />
        </>
      )}
      {/* Avatar circle */}
      <div className={cn(
        'relative h-24 w-24 rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl',
        gradients[color], glows[color],
        'shadow-[0_0_40px_rgba(0,0,0,0.4)]',
      )}>
        {/* Sheen overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
        <span className="relative text-white text-4xl font-bold tracking-tight select-none">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ── Action button ──────────────────────────────────────────────────────────
function ActionButton({
  onClick,
  icon,
  label,
  variant,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: 'red' | 'green' | 'gray';
}) {
  const styles = {
    red:   'bg-red-500 hover:bg-red-400 shadow-red-500/40 active:scale-90',
    green: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/40 active:scale-90',
    gray:  'bg-white/15 hover:bg-white/25 shadow-black/20 active:scale-90',
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={cn(
          'h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg',
          styles[variant],
        )}
      >
        {icon}
      </button>
      <span className="text-xs text-white/60 font-medium tracking-wide">{label}</span>
    </div>
  );
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
  const callingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringerRef = useRef<SoundSynthesizer | null>(null);

  // Initialize Sound Ringer once
  useEffect(() => {
    ringerRef.current = new SoundSynthesizer();
    return () => {
      ringerRef.current?.stop();
    };
  }, []);

  // Manage dialing and ringing sounds based on call phase
  useEffect(() => {
    const ringer = ringerRef.current;
    if (!ringer) return;

    if (callState.phase === 'calling') {
      ringer.startDialTone();
    } else if (callState.phase === 'incoming') {
      ringer.startIncomingRing();
    } else {
      ringer.stop();
    }
  }, [callState.phase]);

  // ── Create / reset PeerConnection ────────────────────────────────────
  const createPeer = useCallback((targetUserId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ type: 'ice-candidate', candidate: e.candidate.toJSON(), from: currentUserId, to: targetUserId });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
    };

    pc.ontrack = (e) => {
      console.log('[WebRTC] Received remote track:', e.track.kind, 'streams:', e.streams.length);
      const stream = e.streams[0];
      if (remoteAudioRef.current && stream) {
        remoteAudioRef.current.srcObject = stream;
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
    onCallStateChange({ phase: 'active', otherUserId: callerUserId });
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

  // ── Auto-shutdown (hangup) call if no response within 20 seconds ───────────
  useEffect(() => {
    if (callingTimeoutRef.current) {
      clearTimeout(callingTimeoutRef.current);
      callingTimeoutRef.current = null;
    }

    if (callState.phase === 'calling') {
      const targetId = callState.contactUserId;
      console.log('[Voice Call] Placing 20 seconds timeout for outgoing call...');
      callingTimeoutRef.current = setTimeout(() => {
        console.log('[Voice Call] Outgoing call timed out after 20 seconds. Shutting down.');
        hangUp(targetId);
      }, 20000);
    } else if (callState.phase === 'incoming') {
      const targetId = callState.callerUserId;
      console.log('[Voice Call] Placing 20 seconds timeout for incoming call...');
      callingTimeoutRef.current = setTimeout(() => {
        console.log('[Voice Call] Incoming call timed out after 20 seconds. Rejecting.');
        rejectCall(targetId);
      }, 20000);
    }

    return () => {
      if (callingTimeoutRef.current) {
        clearTimeout(callingTimeoutRef.current);
      }
    };
  }, [callState, hangUp, rejectCall]);

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

            onCallStateChange({ phase: 'active', otherUserId: incomingSignal.from });
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

  // ── Shared backdrop ─────────────────────────────────────────────────────────
  const Backdrop = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{
      background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, rgba(0,0,0,0.75) 60%)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />
      {children}
    </div>
  );

  // ── Card container ─────────────────────────────────────────────────────────
  const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div
      className={cn('relative flex flex-col items-center gap-8 rounded-[2rem] pt-16 pb-10 px-10 w-[340px] animate-in fade-in zoom-in-95', className)}
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
      {children}
    </div>
  );

  // ── Incoming call UI ───────────────────────────────────────────────────────
  if (callState.phase === 'incoming') {
    const { callerName, callerUserId } = callState;
    return (
      <>
        {audioEl}
        <Backdrop>
          <Card>
            {/* Incoming badge */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase text-emerald-400 leading-none" style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Incoming call
              </div>
            </div>

            {/* Avatar */}
            <CallAvatar name={callerName} color="emerald" pulse />

            {/* Name & status */}
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-white tracking-tight">{callerName}</p>
              <p className="text-sm text-white/50">Voice call</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-10">
              <ActionButton
                onClick={() => rejectCall(callerUserId)}
                icon={<PhoneOff className="h-7 w-7 text-white" />}
                label="Decline"
                variant="red"
              />
              <ActionButton
                onClick={() => {
                  const offer = (window as any).__pendingCallOffer;
                  const callerId = (window as any).__pendingCallerUserId;
                  if (offer && callerId) acceptCall(callerId, offer);
                }}
                icon={<Phone className="h-7 w-7 text-white" />}
                label="Accept"
                variant="green"
              />
            </div>
          </Card>
        </Backdrop>
      </>
    );
  }

  // ── Outgoing (calling) UI ──────────────────────────────────────────────────
  if (callState.phase === 'calling') {
    const { contactName, contactUserId } = callState;
    return (
      <>
        {audioEl}
        <Backdrop>
          <Card>
            {/* Calling badge */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase text-indigo-300 leading-none" style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
              }}>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" style={{ animation: 'pulse 1s ease-in-out infinite' }} />
                Calling
              </div>
            </div>

            {/* Avatar */}
            <CallAvatar name={contactName} color="indigo" pulse />

            {/* Name & animated status */}
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-white tracking-tight">{contactName}</p>
              <p className="text-sm text-white/50 animate-pulse">Connecting…</p>
            </div>

            {/* Cancel button */}
            <ActionButton
              onClick={() => hangUp(contactUserId)}
              icon={<PhoneOff className="h-7 w-7 text-white" />}
              label="Cancel"
              variant="red"
            />
          </Card>
        </Backdrop>
      </>
    );
  }

  // ── Active call — floating pill at top ─────────────────────────────────────
  if (callState.phase === 'active') {
    const { otherUserId } = callState;

    return (
      <>
        {audioEl}
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4"
          style={{ minWidth: 280 }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.1) 100%)',
              border: '1px solid rgba(16,185,129,0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Live indicator dot */}
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400 block" />
            </div>

            {/* Wave + timer */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white/90">Voice call</span>
                <SoundWave active={!isMuted} />
              </div>
              <span className="text-xs font-mono text-emerald-400 tabular-nums">{formatDuration(callDuration)}</span>
            </div>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0',
                isMuted
                  ? 'bg-red-500/80 text-white shadow-red-500/30 shadow-md'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
              )}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            </button>

            {/* Hang up */}
            <button
              onClick={() => hangUp(otherUserId)}
              className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all duration-200 shadow-md shadow-red-500/30 flex-shrink-0 active:scale-90"
              title="End call"
            >
              <PhoneOff className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </>
    );
  }

  return <>{audioEl}</>;
}
