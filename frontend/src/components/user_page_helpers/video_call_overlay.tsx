import { useEffect, useRef, useState, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
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

export type VideoCallSignal =
  | { type: 'video-call-offer';    offer: RTCSessionDescriptionInit; from: string; fromName: string; to: string; conversationId: string }
  | { type: 'video-call-answer';   answer: RTCSessionDescriptionInit; from: string; to: string }
  | { type: 'video-ice-candidate'; candidate: RTCIceCandidateInit;    from: string; to: string }
  | { type: 'video-call-end';      from: string; to: string }
  | { type: 'video-call-reject';   from: string; to: string }
  | { type: 'video-call-busy';     from: string; to: string };

export type VideoCallState =
  | { phase: 'idle' }
  | { phase: 'calling';  contactName: string; contactUserId: string }
  | { phase: 'incoming'; callerName: string;  callerUserId: string }
  | { phase: 'active';   otherUserId: string };

interface VideoCallOverlayProps {
  currentUserId: string;
  conversationId: string;
  callState: VideoCallState;
  onCallStateChange: (s: VideoCallState) => void;
  sendSignal: (msg: VideoCallSignal) => void;
  isOtherCallActive?: boolean;
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
      {pulse && (
        <>
          <div className={cn('absolute rounded-full border-2 animate-ping', ringColors[color])} style={{ width: 140, height: 140, animationDuration: '2s' }} />
          <div className={cn('absolute rounded-full border-2 animate-ping', ringColors[color])} style={{ width: 110, height: 110, animationDuration: '2s', animationDelay: '0.5s' }} />
        </>
      )}
      <div className={cn(
        'relative h-24 w-24 rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl',
        gradients[color], glows[color],
        'shadow-[0_0_40px_rgba(0,0,0,0.4)]',
      )}>
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

export default function VideoCallOverlay({
  currentUserId,
  conversationId,
  callState,
  onCallStateChange,
  sendSignal,
  isOtherCallActive = false,
}: VideoCallOverlayProps) {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringerRef = useRef<SoundSynthesizer | null>(null);
  const hangUpRef = useRef<((targetUserId?: string) => void) | null>(null);

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
        sendSignal({ type: 'video-ice-candidate', candidate: e.candidate.toJSON(), from: currentUserId, to: targetUserId });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC Video] ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        console.warn('[WebRTC Video] ICE connection failed/disconnected, hanging up');
        hangUpRef.current?.(targetUserId);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC Video] Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed') {
        console.warn('[WebRTC Video] Connection failed, hanging up');
        hangUpRef.current?.(targetUserId);
      }
    };

    pc.ontrack = (e) => {
      console.log('[WebRTC Video] Received remote track:', e.track.kind);
      const stream = e.streams[0];
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(err => {
          console.error('[WebRTC Video] Error auto-playing remote video:', err);
        });
      }
    };

    peerRef.current = pc;
    return pc;
  }, [currentUserId, sendSignal]);

  // ── Process Queued ICE Candidates ──────────────────────────────────────────
  const processPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    if (pendingIceCandidatesRef.current.length === 0) return;
    console.log(`[WebRTC Video] Processing ${pendingIceCandidatesRef.current.length} queued ICE candidates`);
    for (const candidate of pendingIceCandidatesRef.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[WebRTC Video] Error adding queued ICE candidate:', err);
      }
    }
    pendingIceCandidatesRef.current = [];
  }, []);

  // ── Get local media stream (video + audio) ─────────────────────────────────
  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('[WebRTC Video] Camera/microphone access denied:', err);
      throw err;
    }
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
    remoteStreamRef.current = null;
    pendingIceCandidatesRef.current = [];
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setIsMuted(false);
    setIsVideoMuted(false);
    stopTimer();
  }, []);

  // ── Initiate a call ────────────────────────────────────────────────────────
  const initiateCall = useCallback(async (targetUserId: string, targetName: string, myName: string) => {
    try {
      const stream = await getLocalStream();
      const pc = createPeer(targetUserId);
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: 'video-call-offer', offer, from: currentUserId, fromName: myName, to: targetUserId, conversationId });
      onCallStateChange({ phase: 'calling', contactName: targetName, contactUserId: targetUserId });
    } catch (e) {
      console.error('Failed to initiate video call:', e);
      cleanup();
    }
  }, [createPeer, currentUserId, conversationId, sendSignal, onCallStateChange, cleanup]);

  // ── Listen for video call start triggered from header button ───────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { contactUserId, contactName, myName } = (e as CustomEvent).detail;
      if (callState.phase === 'idle') {
        initiateCall(contactUserId, contactName, myName);
      }
    };
    window.addEventListener('start-video-call', handler);
    return () => window.removeEventListener('start-video-call', handler);
  }, [callState.phase, initiateCall]);

  // ── Accept incoming call ───────────────────────────────────────────────────
  const acceptCall = useCallback(async (callerUserId: string, offer: RTCSessionDescriptionInit) => {
    try {
      const stream = await getLocalStream();
      const pc = createPeer(callerUserId);
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      await processPendingIceCandidates(pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({ type: 'video-call-answer', answer, from: currentUserId, to: callerUserId });
      onCallStateChange({ phase: 'active', otherUserId: callerUserId });
      startTimer();
      
      // Delay binding local source so video renders correctly
      setTimeout(() => {
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }, 300);
    } catch (e) {
      console.error('Failed to accept video call:', e);
      cleanup();
    }
  }, [createPeer, currentUserId, sendSignal, onCallStateChange, processPendingIceCandidates, cleanup]);

  // ── Hang up ────────────────────────────────────────────────────────────────
  const hangUp = useCallback((targetUserId?: string) => {
    if (targetUserId) {
      sendSignal({ type: 'video-call-end', from: currentUserId, to: targetUserId });
    }
    cleanup();
    onCallStateChange({ phase: 'idle' });
  }, [cleanup, currentUserId, sendSignal, onCallStateChange]);

  // Keep hangUpRef in sync so createPeer callbacks can call it
  useEffect(() => {
    hangUpRef.current = hangUp;
  }, [hangUp]);

  const rejectCall = useCallback((callerUserId: string) => {
    sendSignal({ type: 'video-call-reject', from: currentUserId, to: callerUserId });
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
      callingTimeoutRef.current = setTimeout(() => {
        hangUp(targetId);
      }, 20000);
    } else if (callState.phase === 'incoming') {
      const targetId = callState.callerUserId;
      callingTimeoutRef.current = setTimeout(() => {
        rejectCall(targetId);
      }, 20000);
    }

    return () => {
      if (callingTimeoutRef.current) {
        clearTimeout(callingTimeoutRef.current);
      }
    };
  }, [callState, hangUp, rejectCall]);

  // ── Bind streams when active ───────────────────────────────────────────────
  useEffect(() => {
    if (callState.phase === 'active') {
      const interval = setInterval(() => {
        let boundBoth = true;
        if (localVideoRef.current && localStreamRef.current && !localVideoRef.current.srcObject) {
          localVideoRef.current.srcObject = localStreamRef.current;
        } else if (!localVideoRef.current) {
          boundBoth = false;
        }
        if (remoteVideoRef.current && remoteStreamRef.current && !remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          remoteVideoRef.current.play().catch(err => {
            console.error('[WebRTC Video] Error auto-playing remote video in effect:', err);
          });
        } else if (!remoteVideoRef.current || !remoteStreamRef.current) {
          boundBoth = false;
        }
        if (boundBoth) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [callState.phase]);

  // ── Handle incoming signals ────────────────────────────────────────────────
  useEffect(() => {
    const handleSignal = async (incomingSignal: VideoCallSignal) => {
      switch (incomingSignal.type) {
        case 'video-call-offer': {
          if (callState.phase !== 'idle' || isOtherCallActive) {
            console.log('[WebRTC Video] Received video call offer while busy, sending busy signal to:', incomingSignal.from);
            sendSignal({ type: 'video-call-busy', from: currentUserId, to: incomingSignal.from });
            break;
          }
          onCallStateChange({ phase: 'incoming', callerName: incomingSignal.fromName, callerUserId: incomingSignal.from });
          (window as any).__pendingVideoCallOffer = incomingSignal.offer;
          (window as any).__pendingVideoCallerUserId = incomingSignal.from;
          break;
        }
        case 'video-call-answer': {
          if (peerRef.current) {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(incomingSignal.answer));
            await processPendingIceCandidates(peerRef.current);
            onCallStateChange({ phase: 'active', otherUserId: incomingSignal.from });
            startTimer();
            // Bind local stream to display local PIP
            setTimeout(() => {
              if (localVideoRef.current && localStreamRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
              }
            }, 300);
          }
          break;
        }
        case 'video-ice-candidate': {
          if (peerRef.current && peerRef.current.remoteDescription) {
            try {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(incomingSignal.candidate));
            } catch (err) {
              console.error('[WebRTC Video] Error adding ICE candidate directly:', err);
            }
          } else {
            pendingIceCandidatesRef.current.push(incomingSignal.candidate);
          }
          break;
        }
        case 'video-call-end':
        case 'video-call-reject': {
          cleanup();
          onCallStateChange({ phase: 'idle' });
          break;
        }
        case 'video-call-busy': {
          cleanup();
          onCallStateChange({ phase: 'idle' });
          alert('This user is currently in another call. Please try again later.');
          break;
        }
      }
    };

    const handler = (e: Event) => {
      const signal = (e as CustomEvent).detail as VideoCallSignal;
      handleSignal(signal);
    };

    window.addEventListener('video-call-signal', handler);
    return () => {
      window.removeEventListener('video-call-signal', handler);
    };
  }, [currentUserId, conversationId, callState.phase, isOtherCallActive, sendSignal, cleanup, onCallStateChange, processPendingIceCandidates]);

  // ── Audio/Video Mutes ──────────────────────────────────────────────────────
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(m => !m);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsVideoMuted(m => !m);
    }
  };

  if (callState.phase === 'idle') return null;

  // ── Shared backdrop ─────────────────────────────────────────────────────────
  const Backdrop = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{
      background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, rgba(0,0,0,0.85) 60%)',
      backdropFilter: 'blur(20px)',
    }}>
      {children}
    </div>
  );

  // ── Card container ─────────────────────────────────────────────────────────
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div
      className="relative flex flex-col items-center gap-8 rounded-[2rem] pt-16 pb-10 px-10 w-[340px] animate-in fade-in zoom-in-95"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
      {children}
    </div>
  );

  // ── Incoming Video Call UI ────────────────────────────────────────────────
  if (callState.phase === 'incoming') {
    const { callerName, callerUserId } = callState;
    return (
      <Backdrop>
        <Card>
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase text-emerald-400 leading-none" style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Incoming Video Call
            </div>
          </div>

          <CallAvatar name={callerName} color="emerald" pulse />

          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-white tracking-tight">{callerName}</p>
            <p className="text-sm text-white/50">Video calling...</p>
          </div>

          <div className="flex items-center gap-10">
            <ActionButton
              onClick={() => rejectCall(callerUserId)}
              icon={<PhoneOff className="h-7 w-7 text-white" />}
              label="Decline"
              variant="red"
            />
            <ActionButton
              onClick={() => {
                const offer = (window as any).__pendingVideoCallOffer;
                const callerId = (window as any).__pendingVideoCallerUserId;
                if (offer && callerId) acceptCall(callerId, offer);
              }}
              icon={<Phone className="h-7 w-7 text-white" />}
              label="Accept"
              variant="green"
            />
          </div>
        </Card>
      </Backdrop>
    );
  }

  // ── Outgoing Video Call UI ────────────────────────────────────────────────
  if (callState.phase === 'calling') {
    const { contactName, contactUserId } = callState;
    return (
      <Backdrop>
        <Card>
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase text-indigo-300 leading-none" style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Video Calling
            </div>
          </div>

          <CallAvatar name={contactName} color="indigo" pulse />

          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-white tracking-tight">{contactName}</p>
            <p className="text-sm text-white/50 animate-pulse">Connecting video…</p>
          </div>

          <ActionButton
            onClick={() => hangUp(contactUserId)}
            icon={<PhoneOff className="h-7 w-7 text-white" />}
            label="Cancel"
            variant="red"
          />
        </Card>
      </Backdrop>
    );
  }

  // ── Active Video Call UI (Full screen viewport call) ───────────────────────
  if (callState.phase === 'active') {
    const { otherUserId } = callState;
    return (
      <div className="fixed inset-0 z-[250] flex flex-col justify-between bg-black">
        {/* Remote Camera Fullscreen Video */}
        <div className="absolute inset-0 z-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          {/* Muted/video off overlays for Remote */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Local Camera Floating PIP */}
        <div className="absolute top-4 right-4 z-10 w-24 h-36 md:w-32 md:h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-900">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn('h-full w-full object-cover transform -scale-x-100', isVideoMuted && 'opacity-0')}
          />
          {isVideoMuted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-white/50" />
            </div>
          )}
        </div>

        {/* Call Top Details (Timer and Status) */}
        <div className="relative z-10 p-6 flex items-start justify-between pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white/90">Video Call</span>
            <span className="text-sm font-mono text-emerald-400 font-medium tracking-wider">{formatDuration(callDuration)}</span>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="relative z-10 p-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-6 bg-black/40 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
            {/* Audio Mute */}
            <button
              onClick={toggleMute}
              className={cn(
                'h-12 w-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md',
                isMuted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              )}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Video Mute */}
            <button
              onClick={toggleCamera}
              className={cn(
                'h-12 w-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md',
                isVideoMuted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              )}
              title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>

            {/* Hangup */}
            <button
              onClick={() => hangUp(otherUserId)}
              className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center transition-all duration-200 shadow-md shadow-red-500/30"
              title="Hang up"
            >
              <PhoneOff className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
