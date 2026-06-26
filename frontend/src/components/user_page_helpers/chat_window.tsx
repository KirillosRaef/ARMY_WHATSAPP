import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send, Smile, Paperclip, Phone, Video, MoreVertical, ArrowLeft,
  CheckCheck, ImageIcon, FileText, Mic, MicOff, FileType2, Download, Square,
  Play, Pause, FileSpreadsheet, Presentation, Film,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import ImageUploadCrop from '../image_upload_crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import VoiceCallOverlay, { type CallSignal, type CallState } from './voice_call_overlay';
import VideoCallOverlay, { type VideoCallSignal, type VideoCallState } from './video_call_overlay';

type MessageType = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  content: string;
  type: string;
  createdAt: string;
};

function encodeFileContent(originalName: string, uniqueName: string) {
  return `${originalName}|||${uniqueName}`;
}
function decodeFileContent(content: string): { originalName: string; uniqueName: string } {
  const sep = content.indexOf('|||');
  if (sep === -1) return { originalName: content, uniqueName: content };
  return { originalName: content.slice(0, sep), uniqueName: content.slice(sep + 3) };
}

interface VoicePlayerProps {
  src: string;
  isMine: boolean;
}

function VoicePlayer({ src, isMine }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((e) => console.error('Play failed', e));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleScrub = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const cycleSpeed = () => {
    if (!audioRef.current) return;
    let nextSpeed: 1 | 1.5 | 2 = 1;
    if (speed === 1) nextSpeed = 1.5;
    else if (speed === 1.5) nextSpeed = 2;
    else nextSpeed = 1;

    audioRef.current.playbackRate = nextSpeed;
    setSpeed(nextSpeed);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalBars = 20;
  const barHeights = [40, 60, 30, 70, 50, 80, 45, 90, 60, 35, 75, 50, 65, 40, 85, 55, 30, 70, 50, 40];

  return (
    <div className={cn(
      'flex items-center gap-3 py-1.5 px-2 rounded-xl min-w-[260px] max-w-[320px]',
      isMine ? 'text-white' : 'text-gray-800'
    )}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      <button
        onClick={togglePlay}
        className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 flex-shrink-0',
          isMine
            ? 'bg-white text-indigo-600 hover:bg-indigo-50'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        )}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-current" />
        ) : (
          <Play className="h-5 w-5 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-end gap-[2px] h-7 w-full relative group cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => handleScrub(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {barHeights.map((h, i) => {
            const barProgress = (i / totalBars) * (duration || 1);
            const isPlayed = currentTime >= barProgress;

            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-colors duration-150"
                style={{
                  height: `${h}%`,
                  backgroundColor: isPlayed
                    ? (isMine ? '#ffffff' : '#4f46e5')
                    : (isMine ? 'rgba(255, 255, 255, 0.4)' : '#e5e7eb')
                }}
              />
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-1">
          <span className={cn('text-[10px] font-medium', isMine ? 'text-indigo-200' : 'text-gray-400')}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      <button
        onClick={cycleSpeed}
        className={cn(
          'text-[10px] font-bold px-2 py-1 rounded-full transition-colors flex-shrink-0',
          isMine
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
      >
        {speed}x
      </button>
    </div>
  );
}

const getMessages = async (conversationId: string) => {
  const res = await fetch(`/api/messages/${conversationId}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json() as Promise<MessageType[]>;
};

const avatarColors = [
  { bg: 'bg-blue-100/80 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-emerald-100/80 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-violet-100/80 dark:bg-violet-950/60', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-amber-100/80 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300' },
  { bg: 'bg-rose-100/80 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-teal-100/80 dark:bg-teal-950/60', text: 'text-teal-700 dark:text-teal-300' },
  { bg: 'bg-indigo-100/80 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-orange-100/80 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300' },
];

function getAvatarColor(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface ChatWindowProps {
  conversationId: string;
  contactName: string;
  contactNumber: string;
  currentUserId: string;
  currentUserName: string;
  contactUserId: string;
  onBack?: () => void;
}

export default function ChatWindow({
  conversationId,
  contactName,
  contactNumber,
  currentUserId,
  currentUserName,
  contactUserId,
  onBack,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Image upload ────────────────────────────────────────────────────────────
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // ── Document upload ─────────────────────────────────────────────────────────
  const [isDocUploadOpen, setIsDocUploadOpen] = useState(false);
  const [docUploadType, setDocUploadType] = useState<'pdf' | 'word' | 'ppt' | 'excel'>('pdf');
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // ── Video upload ────────────────────────────────────────────────────────────
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Voice recording ─────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Voice call ──────────────────────────────────────────────────────────────
  const [callState, setCallState] = useState<CallState>({ phase: 'idle' });

  // ── Video call ──────────────────────────────────────────────────────────────
  const [videoCallState, setVideoCallState] = useState<VideoCallState>({ phase: 'idle' });

  const callWsRef = useRef<WebSocket | null>(null);

  // Connect call signaling WS — depends ONLY on currentUserId so it stays
  // stable across conversation switches and never overwrites the server-side
  // registration while a call is in progress.
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // conversationId is intentionally omitted here — the server only uses it
    // for the pub/sub channel which we don't rely on, and we must not
    // reconnect (and re-register) whenever the user switches chats.
    const url = `${protocol}//${window.location.host}/ws/call?userId=${currentUserId}&conversationId=global`;
    const ws = new WebSocket(url);
    ws.onmessage = (e) => {
      try {
        const signal = JSON.parse(e.data) as any;
        if (signal.type && signal.type.startsWith('video-')) {
          window.dispatchEvent(new CustomEvent('video-call-signal', { detail: signal }));
        } else {
          window.dispatchEvent(new CustomEvent('voice-call-signal', { detail: signal }));
        }
      } catch { /* ignore */ }
    };
    ws.onerror = (e) => console.error('[Call WS] error', e);
    ws.onopen = () => console.log('[Call WS] connected, userId:', currentUserId);
    callWsRef.current = ws;
    return () => ws.close();
  }, [currentUserId]); // ← NOT conversationId

  const sendSignal = useCallback((msg: any) => {
    const ws = callWsRef.current;
    if (!ws) return;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else if (ws.readyState === WebSocket.CONNECTING) {
      // Wait for the connection to open, then send
      const onOpen = () => {
        ws.send(JSON.stringify(msg));
        ws.removeEventListener('open', onOpen);
      };
      ws.addEventListener('open', onOpen);
    }
  }, []);

  // ── Message WS ──────────────────────────────────────────────────────────────
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
  });

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/message?conversationId=${conversationId}&senderId=${currentUserId}`;
    const socket = new WebSocket(wsUrl);
    socket.onopen = () => console.log('WS connected');
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as MessageType;
      queryClient.setQueryData(['messages', message.conversationId], (oldData: MessageType[] = []) => {
        if (oldData.some(msg => msg.id === message.id)) return oldData;
        return [...oldData, message];
      });
    };
    socket.onerror = (e) => console.error('SOCKET ERROR', e);
    socket.onclose = (e) => console.log('CLOSED', e.code, e.reason);
    return () => socket.close();
  }, [conversationId, currentUserId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send helpers ────────────────────────────────────────────────────────────
  const postMessage = async (content: string, type: string) => {
    const res = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, senderId: currentUserId, content, type }),
    });
    if (!res.ok) throw new Error('Failed to send message');
  };

  const handleSendImage = async () => {
    if (!selectedImageFile || isSending) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImageFile);
      const uploadRes = await fetch('/api/attachment/image/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Image upload failed');
      const data = await uploadRes.json();
      if (!data.success) throw new Error(data.error);
      await postMessage(data.fileName, 'Image');
      setIsImageUploadOpen(false);
      setSelectedImageFile(null);
    } catch (err) { console.error(err); }
    finally { setIsSending(false); }
  };

  const handleSendDocument = async () => {
    if (!selectedDocFile || isSending) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedDocFile);
      const uploadRes = await fetch('/api/attachment/document/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Document upload failed');
      const data = await uploadRes.json();
      if (!data.success) throw new Error(data.error);
      await postMessage(encodeFileContent(data.originalName, data.fileName), 'File');
      setIsDocUploadOpen(false);
      setSelectedDocFile(null);
    } catch (err) { console.error(err); }
    finally { setIsSending(false); }
  };

  const handleSendVideo = async () => {
    if (!selectedVideoFile || isSending) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedVideoFile);
      const uploadRes = await fetch('/api/attachment/video/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Video upload failed');
      const data = await uploadRes.json();
      if (!data.success) throw new Error(data.error);
      await postMessage(encodeFileContent(data.originalName, data.fileName), 'Video');
      setIsVideoUploadOpen(false);
      setSelectedVideoFile(null);
    } catch (err) { console.error(err); }
    finally { setIsSending(false); }
  };

  const handleSend = async () => {
    const content = messageText.trim();
    if (!content || isSending) return;
    setIsSending(true);
    setMessageText('');
    try { await postMessage(content, 'Text'); }
    catch (err) { console.error(err); }
    finally { setIsSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Voice recording ─────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      // console.log(navigator);
      // console.log(navigator.mediaDevices);
      // console.log(window.isSecureContext);
      // console.log(window.isSecureContext);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: mimeType });
        await sendVoiceMessage(file);
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch (err) {
      console.error('Microphone access denied', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const sendVoiceMessage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/attachment/audio/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Audio upload failed');
      const data = await uploadRes.json();
      if (!data.success) throw new Error(data.error);
      await postMessage(data.fileName, 'Voice');
    } catch (err) { console.error('Failed to send voice message:', err); }
  };

  const formatRecording = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const openDocDialog = (type: 'pdf' | 'word' | 'ppt' | 'excel') => {
    setDocUploadType(type);
    setSelectedDocFile(null);
    setIsDocUploadOpen(true);
  };

  const getDocAccept = () => {
    switch (docUploadType) {
      case 'pdf': return '.pdf';
      case 'word': return '.doc,.docx';
      case 'ppt': return '.ppt,.pptx';
      case 'excel': return '.xls,.xlsx,.csv';
    }
  };

  const getDocLabel = () => {
    switch (docUploadType) {
      case 'pdf': return 'PDF';
      case 'word': return 'Word Document';
      case 'ppt': return 'PowerPoint';
      case 'excel': return 'Excel Spreadsheet';
    }
  };

  const getDocIcon = (className?: string) => {
    switch (docUploadType) {
      case 'pdf': return <FileText className={cn('h-5 w-5 text-red-500', className)} />;
      case 'word': return <FileType2 className={cn('h-5 w-5 text-blue-500', className)} />;
      case 'ppt': return <Presentation className={cn('h-5 w-5 text-orange-500', className)} />;
      case 'excel': return <FileSpreadsheet className={cn('h-5 w-5 text-emerald-500', className)} />;
    }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return t('chat.today');
    if (date.toDateString() === yesterday.toDateString()) return t('chat.yesterday');
    return date.toLocaleDateString();
  };

  const groupedMessages: { date: string; messages: MessageType[] }[] = [];
  messages?.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && new Date(lastGroup.messages[0].createdAt).toDateString() === dateKey) lastGroup.messages.push(msg);
    else groupedMessages.push({ date: dateKey, messages: [msg] });
  });

  const contactColor = getAvatarColor(contactName);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ── Voice Call Overlay ────────────────────────────────────────────────── */}
      <VoiceCallOverlay
        currentUserId={currentUserId}
        conversationId={conversationId}
        callState={callState}
        onCallStateChange={setCallState}
        sendSignal={sendSignal}
        isOtherCallActive={videoCallState.phase !== 'idle'}
      />

      {/* ── Video Call Overlay ────────────────────────────────────────────────── */}
      <VideoCallOverlay
        currentUserId={currentUserId}
        conversationId={conversationId}
        callState={videoCallState}
        onCallStateChange={setVideoCallState}
        sendSignal={sendSignal}
        isOtherCallActive={callState.phase !== 'idle'}
      />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100" style={{ boxShadow: '0 1px 0 0 #f3f4f6, 0 2px 8px -2px rgba(99,102,241,0.06)' }}>
        {onBack && (
          <Button onClick={onBack} className="p-1.5 -ms-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all lg:hidden">
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </Button>
        )}
        <div className="relative flex-shrink-0">
          <Avatar className={cn('h-10 w-10 transition-all', (callState.phase === 'active' || videoCallState.phase === 'active') && 'ring-2 ring-emerald-400 ring-offset-1')}>
            <AvatarFallback className={cn(contactColor.bg, contactColor.text, 'font-semibold text-sm')}>{contactName.charAt(0)}</AvatarFallback>
          </Avatar>
          {(callState.phase === 'active' || videoCallState.phase === 'active') && (
            <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{contactName}</p>
          {(callState.phase === 'active' || videoCallState.phase === 'active') ? (
            <p className="text-xs text-emerald-500 font-medium animate-pulse">On call</p>
          ) : (
            <p className="text-xs text-emerald-500 font-medium">{t('chat.online')}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Voice call button */}
          <Button
            onClick={() => {
              if (callState.phase === 'idle' && videoCallState.phase === 'idle') {
                const detail = { contactUserId, contactName, myName: currentUserName };
                window.dispatchEvent(new CustomEvent('start-voice-call', { detail }));
              }
            }}
            variant="outline"
            size="icon"
            className={cn(
              'rounded-full transition-all duration-200 flex-shrink-0',
              callState.phase !== 'idle'
                ? 'text-emerald-500 border-emerald-250 bg-emerald-50 shadow-sm shadow-emerald-200'
                : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 border-gray-200'
            )}
          >
            <Phone className={cn('h-5 w-5', callState.phase !== 'idle' && 'animate-pulse')} />
          </Button>

          {/* Video call button */}
          <Button
            onClick={() => {
              if (callState.phase === 'idle' && videoCallState.phase === 'idle') {
                const detail = { contactUserId, contactName, myName: currentUserName };
                window.dispatchEvent(new CustomEvent('start-video-call', { detail }));
              }
            }}
            variant="outline"
            size="icon"
            className={cn(
              'rounded-full transition-all duration-200 flex-shrink-0',
              videoCallState.phase !== 'idle'
                ? 'text-emerald-500 border-emerald-250 bg-emerald-50 shadow-sm shadow-emerald-200'
                : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 border-gray-200'
            )}
          >
            <Video className={cn('h-5 w-5', videoCallState.phase !== 'idle' && 'animate-pulse')} />
          </Button>

          <Button variant="outline" size="icon" className="rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 border-gray-200 transition-all flex-shrink-0">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
              {t('chat.loadingMessages')}
            </div>
          </div>
        )}
        {!isLoading && messages?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Send className="h-7 w-7 text-indigo-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">{t('chat.noMessages')}</p>
            <p className="text-xs text-gray-300 mt-1">{t('chat.sendFirstMessage')}</p>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center my-4">
              <div className="px-4 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
                <span className="text-xs font-medium text-gray-500">{formatDate(group.messages[0].createdAt)}</span>
              </div>
            </div>

            {group.messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUserId;
              const showAvatar = !isMine && (idx === 0 || group.messages[idx - 1].senderId !== msg.senderId);

              return (
                <div key={msg.id} className={cn('flex mb-1', isMine ? 'justify-end' : 'justify-start')}>
                  {!isMine && showAvatar && (
                    <Avatar className="h-7 w-7 mt-1 me-2 flex-shrink-0">
                      <AvatarFallback className={cn(contactColor.bg, contactColor.text, 'text-[10px] font-semibold')}>{contactName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  {!isMine && !showAvatar && <div className="w-9 flex-shrink-0" />}

                  <div className={cn(
                    'max-w-[75%] px-3.5 py-2 rounded-2xl shadow-sm relative group',
                    isMine ? 'bg-indigo-500 text-white rounded-ee-md' : 'bg-white text-gray-800 rounded-es-md border border-gray-100',
                    (msg.type === 'Image' || msg.type === 'Video') ? 'p-1.5' : ''
                  )}>
                    {/* Image */}
                    {msg.type === 'Image' && (
                      <div className="overflow-hidden rounded-xl">
                        <img src={`/api/attachment/image/${msg.content}`} alt="Attachment" className="max-w-full h-auto object-cover max-h-[300px] rounded-xl" />
                      </div>
                    )}

                    {/* Video */}
                    {msg.type === 'Video' && (() => {
                      const { originalName, uniqueName } = decodeFileContent(msg.content);
                      return (
                        <div className="overflow-hidden rounded-xl">
                          <video
                            src={`/api/attachment/video/${uniqueName}`}
                            controls
                            preload="metadata"
                            className="max-w-full h-auto max-h-[300px] rounded-xl"
                            style={{ minWidth: 220 }}
                          />
                          <p className={cn('text-[10px] mt-1 px-1 truncate', isMine ? 'text-indigo-200' : 'text-gray-400')}>{originalName}</p>
                        </div>
                      );
                    })()}

                    {/* File */}
                    {msg.type === 'File' && (() => {
                      const { originalName, uniqueName } = decodeFileContent(msg.content);
                      const ext = uniqueName.split('.').pop()?.toLowerCase() ?? '';
                      const isPdf = ext === 'pdf';
                      const isPpt = ext === 'ppt' || ext === 'pptx';
                      const isExcel = ext === 'xls' || ext === 'xlsx' || ext === 'csv';

                      const getFileIcon = () => {
                        if (isPdf) return <FileText className={cn('h-5 w-5', isMine ? 'text-white' : 'text-red-500')} />;
                        if (isPpt) return <Presentation className={cn('h-5 w-5', isMine ? 'text-white' : 'text-orange-500')} />;
                        if (isExcel) return <FileSpreadsheet className={cn('h-5 w-5', isMine ? 'text-white' : 'text-emerald-500')} />;
                        return <FileType2 className={cn('h-5 w-5', isMine ? 'text-white' : 'text-blue-500')} />;
                      };

                      const getFileLabel = () => {
                        if (isPdf) return 'PDF Document';
                        if (isPpt) return 'PowerPoint';
                        if (isExcel) return 'Excel Spreadsheet';
                        return 'Word Document';
                      };

                      return (
                        <a href={`/api/attachment/document/${uniqueName}`} download={originalName} className={cn('flex items-center gap-3 px-2 py-1 rounded-lg no-underline', isMine ? 'text-white' : 'text-gray-800')}>
                          <div className={cn('flex items-center justify-center h-10 w-10 rounded-lg flex-shrink-0', isMine ? 'bg-white/20' : 'bg-indigo-50')}>
                            {getFileIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate max-w-[160px]">{originalName}</p>
                            <p className={cn('text-[10px]', isMine ? 'text-indigo-200' : 'text-gray-400')}>{getFileLabel()}</p>
                          </div>
                          <Download className={cn('h-4 w-4 flex-shrink-0', isMine ? 'text-indigo-200' : 'text-gray-400')} />
                        </a>
                      );
                    })()}

                    {/* Voice */}
                    {msg.type === 'Voice' && (
                      <VoicePlayer
                        src={`/api/attachment/audio/${msg.content}`}
                        isMine={isMine}
                      />
                    )}

                    {/* Text */}
                    {msg.type === 'Text' && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    )}

                    <div className={cn('flex items-center gap-1 mt-1', isMine ? 'justify-end' : 'justify-start', (msg.type === 'Image' || msg.type === 'Video') ? 'px-1' : '')}>
                      <span className={cn('text-[10px]', isMine ? 'text-indigo-200' : 'text-gray-400')}>{formatTime(msg.createdAt)}</span>
                      {isMine && <CheckCheck className="h-3 w-3 text-indigo-200" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex-shrink-0">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2">
              <EmojiPicker
                emojiStyle={EmojiStyle.NATIVE}
                onEmojiClick={(e) => setMessageText(messageText + e.emoji)}
                searchDisabled={false}
                previewConfig={{ showPreview: false }}
              />
            </PopoverContent>
          </Popover>

          {/* Attachments */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex-shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsImageUploadOpen(true)}>
                <ImageIcon className="h-4 w-4 mr-2" /> Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsVideoUploadOpen(true)}>
                <Film className="h-4 w-4 mr-2 text-purple-500" /> Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDocDialog('pdf')}>
                <FileText className="h-4 w-4 mr-2 text-red-500" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDocDialog('word')}>
                <FileType2 className="h-4 w-4 mr-2 text-blue-500" /> Word Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDocDialog('ppt')}>
                <Presentation className="h-4 w-4 mr-2 text-orange-500" /> PowerPoint
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDocDialog('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-500" /> Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Text input or recording indicator */}
          <div className="flex-1 relative">
            {isRecording ? (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 h-[42px]">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-red-600 font-medium">{formatRecording(recordingSeconds)}</span>
                <span className="text-xs text-red-400 ml-1">Recording…</span>
              </div>
            ) : (
              <textarea
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.typePlaceholder')}
                rows={1}
                className="w-full resize-none rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 border-0 outline-none focus:bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 max-h-28"
                style={{ minHeight: '42px' }}
              />
            )}
          </div>

          {/* Mic button — hold to record (click to start/stop) */}
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant="outline"
            size="icon"
            className={cn(
              'rounded-full transition-all duration-200 flex-shrink-0',
              isRecording
                ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 active:scale-95 shadow-sm shadow-red-500/25'
                : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 border-gray-200'
            )}
          >
            {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            variant="outline"
            size="icon"
            className={cn(
              'rounded-full transition-all duration-200 flex-shrink-0',
              messageText.trim()
                ? 'bg-indigo-500 border-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/25 active:scale-95 cursor-pointer'
                : 'text-gray-300 hover:bg-transparent hover:text-gray-300 border-gray-200 cursor-not-allowed'
            )}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* ── Image dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={isImageUploadOpen} onOpenChange={(open) => { setIsImageUploadOpen(open); if (!open) setSelectedImageFile(null); }}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200">
          <DialogHeader><DialogTitle>Upload Image</DialogTitle></DialogHeader>
          <ImageUploadCrop title="" label="Drag and drop an image here, or click to select one" aspect={1} onImageCropped={(file) => setSelectedImageFile(file)} />
          <DialogFooter className="mt-4">
            <Button disabled={!selectedImageFile || isSending} onClick={handleSendImage} className="bg-indigo-500 hover:bg-indigo-600 text-white">
              {isSending ? 'Sending…' : 'Send Image'}{!isSending && <Send className="w-4 h-4 ml-2" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Document dialog ───────────────────────────────────────────────────── */}
      <Dialog open={isDocUploadOpen} onOpenChange={(open) => { setIsDocUploadOpen(open); if (!open) setSelectedDocFile(null); }}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getDocIcon()} Upload {getDocLabel()}
            </DialogTitle>
          </DialogHeader>
          <input ref={docInputRef} type="file" accept={getDocAccept()} className="hidden" onChange={(e) => setSelectedDocFile(e.target.files?.[0] ?? null)} />
          <div
            onClick={() => docInputRef.current?.click()}
            className={cn('flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10', selectedDocFile ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50')}
          >
            {selectedDocFile ? (
              <>
                {getDocIcon('h-10 w-10')}
                <p className="text-sm font-semibold text-gray-800 text-center px-4 break-all">{selectedDocFile.name}</p>
                <p className="text-xs text-gray-400">{(selectedDocFile.size / 1024).toFixed(1)} KB · Click to change</p>
              </>
            ) : (
              <>
                {getDocIcon('h-10 w-10 !text-gray-300')}
                <p className="text-sm font-medium text-gray-500">Click to select a {getDocLabel()} file</p>
                <p className="text-xs text-gray-400">{getDocAccept()} files only</p>
              </>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button disabled={!selectedDocFile || isSending} onClick={handleSendDocument} className="bg-indigo-500 hover:bg-indigo-600 text-white">
              {isSending ? 'Sending…' : `Send ${getDocLabel()}`}{!isSending && <Send className="w-4 h-4 ml-2" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Video upload dialog ─────────────────────────────────────────────────── */}
      <Dialog open={isVideoUploadOpen} onOpenChange={(open) => { setIsVideoUploadOpen(open); if (!open) setSelectedVideoFile(null); }}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-purple-500" /> Upload Video
            </DialogTitle>
          </DialogHeader>
          <input ref={videoInputRef} type="file" accept=".mp4,.webm,.mov,.avi,.mkv" className="hidden" onChange={(e) => setSelectedVideoFile(e.target.files?.[0] ?? null)} />
          <div
            onClick={() => videoInputRef.current?.click()}
            className={cn('flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10', selectedVideoFile ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50')}
          >
            {selectedVideoFile ? (
              <>
                <Film className="h-10 w-10 text-purple-500" />
                <p className="text-sm font-semibold text-gray-800 text-center px-4 break-all">{selectedVideoFile.name}</p>
                <p className="text-xs text-gray-400">{(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} MB · Click to change</p>
              </>
            ) : (
              <>
                <Film className="h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">Click to select a video file</p>
                <p className="text-xs text-gray-400">.mp4, .webm, .mov, .avi, .mkv</p>
              </>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button disabled={!selectedVideoFile || isSending} onClick={handleSendVideo} className="bg-purple-500 hover:bg-purple-600 text-white">
              {isSending ? 'Sending…' : 'Send Video'}{!isSending && <Send className="w-4 h-4 ml-2" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
