'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Star, ChevronRight, Check, ExternalLink, Upload, X, Linkedin, Camera, Video, Square, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  logo_url: string | null;
  accent_color: string | null;
  google_review_url: string | null;
  linkedin_url: string | null;
}

interface CollectionForm {
  id: string;
  title: string;
  description: string | null;
  custom_questions: string[] | null;
}

interface CollectFormClientProps {
  form: CollectionForm;
  project: Project;
  showBranding: boolean;
}

// ─── Animation variants ─────────────────────────────────────────────────────

const slideVariants = {
  enterFromRight: {
    x: 48,
    opacity: 0,
  },
  enterFromLeft: {
    x: -48,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exitToLeft: {
    x: -48,
    opacity: 0,
  },
  exitToRight: {
    x: 48,
    opacity: 0,
  },
};

const transition = {
  duration: 0.28,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

// ─── Star component ──────────────────────────────────────────────────────────

function StarButton({
  index,
  filled,
  hovered,
  accentColor,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  index: number;
  filled: boolean;
  hovered: boolean;
  accentColor: string;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const active = filled || hovered;
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.18 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`Rate ${index + 1} out of 5 stars`}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm"
      style={
        {
          '--ring-color': accentColor,
        } as React.CSSProperties
      }
    >
      <Star
        className="transition-all duration-150"
        style={{
          width: 44,
          height: 44,
          fill: active ? accentColor : 'transparent',
          stroke: active ? accentColor : '#cbd5e1',
          filter: active
            ? `drop-shadow(0 0 8px ${accentColor}60)`
            : 'none',
        }}
      />
    </motion.button>
  );
}

// ─── Progress dots ───────────────────────────────────────────────────────────

function ProgressDots({
  currentStep,
  accentColor,
}: {
  currentStep: number;
  accentColor: string;
}) {
  const steps = [1, 2, 3, 4];
  return (
    <div className="flex items-center gap-2 justify-center">
      {steps.map((step) => {
        const isActive = step === currentStep;
        const isComplete = step < currentStep;
        return (
          <div
            key={step}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{
                scale: isActive ? 1 : 0.85,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300"
              style={{
                width: 28,
                height: 28,
                backgroundColor: isActive
                  ? accentColor
                  : isComplete
                    ? `${accentColor}30`
                    : '#e2e8f0',
                color: isActive
                  ? '#ffffff'
                  : isComplete
                    ? accentColor
                    : '#94a3b8',
              }}
            >
              {isComplete ? (
                <Check style={{ width: 12, height: 12 }} />
              ) : (
                step
              )}
            </motion.div>
            {step < 4 && (
              <div
                className="h-px w-6 transition-colors duration-300"
                style={{
                  backgroundColor: isComplete ? `${accentColor}60` : '#e2e8f0',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Business header ─────────────────────────────────────────────────────────

function BusinessHeader({
  project,
  accentColor,
}: {
  project: Project;
  accentColor: string;
}) {
  const initials = project.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-3">
      {project.logo_url ? (
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-border/50">
          <Image
            src={project.logo_url}
            alt={project.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md"
          style={{ backgroundColor: accentColor }}
        >
          {initials}
        </div>
      )}
      <span className="text-sm font-medium text-muted-foreground">{project.name}</span>
    </div>
  );
}

// ─── Share elsewhere nudge ────────────────────────────────────────────────────

function ShareElsewhere({
  accentColor,
  content,
  authorName,
  googleReviewUrl,
  linkedinUrl,
}: {
  accentColor: string;
  content: string;
  authorName: string;
  googleReviewUrl: string | null;
  linkedinUrl: string | null;
}) {
  const [linkedinCopied, setLinkedinCopied] = useState(false);

  function handleLinkedinClick() {
    const shareText = `${content.trim()}\n\n${authorName}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setLinkedinCopied(true);
      setTimeout(() => setLinkedinCopied(false), 2000);
    }).catch(() => {});
    if (linkedinUrl) {
      window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="mt-8"
    >
      <div className="w-full h-px bg-border mb-6" />
      <p className="text-sm font-semibold text-foreground mb-1">
        One more thing. It would mean the world to us!
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Share your experience on another platform too? It takes 30 seconds.
      </p>
      <div className="flex flex-col gap-3">
        {googleReviewUrl && (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-muted-foreground/40 hover:bg-muted/30 transition-colors text-left"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Leave a Google Review</p>
              <p className="text-xs text-muted-foreground">Takes 30 seconds and helps others find us</p>
            </div>
            <ExternalLink className="size-4 text-muted-foreground shrink-0" />
          </a>
        )}
        {linkedinUrl && (
          <button
            type="button"
            onClick={handleLinkedinClick}
            className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-muted-foreground/40 hover:bg-muted/30 transition-colors text-left w-full"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#0A66C215' }}
            >
              <Linkedin className="size-5" style={{ color: '#0A66C2' }} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground">
                {linkedinCopied ? 'Copied! Opening LinkedIn...' : 'Share on LinkedIn'}
              </p>
              <p className="text-xs text-muted-foreground">Your review text is copied to your clipboard</p>
            </div>
            {linkedinCopied ? (
              <Check className="size-4 text-emerald-500 shrink-0" />
            ) : (
              <ExternalLink className="size-4 text-muted-foreground shrink-0" />
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Optional, but deeply appreciated
      </p>
    </motion.div>
  );
}

// ─── Video utilities ──────────────────────────────────────────────────────────

function extractVideoFrames(videoUrl: string, count: number): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) { resolve([]); return; }
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve([]); return; }
      const frames: string[] = [];
      const timestamps = Array.from({ length: count }, (_, i) =>
        duration * (0.1 + (0.8 * i) / Math.max(count - 1, 1))
      );
      let i = 0;
      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.8));
        } catch { frames.push(''); }
        i++;
        if (i < timestamps.length) {
          video.currentTime = timestamps[i];
        } else {
          resolve(frames.filter(Boolean));
        }
      };
      video.onerror = () => resolve(frames);
      video.currentTime = timestamps[0];
    };
    video.onerror = () => resolve([]);
  });
}

function dataURLToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)![1];
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CollectFormClient({
  form,
  project,
  showBranding,
}: CollectFormClientProps) {
  const accentColor = project.accent_color || '#6366F1';

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // Form values
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [authorCompany, setAuthorCompany] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Video state
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [thumbnailFrames, setThumbnailFrames] = useState<string[]>([]);
  const [selectedThumbnailIdx, setSelectedThumbnailIdx] = useState<number>(0);
  const cameraInitRef = useRef(false);
  const currentStreamRef = useRef<MediaStream | null>(null);

  const contentLength = content.trim().length;
  const contentValid = contentLength >= 20;
  const nameValid = authorName.trim().length > 0;

  function goTo(nextStep: 1 | 2 | 3 | 4 | 5, dir: 'forward' | 'back') {
    setDirection(dir);
    setStep(nextStep);
  }

  function handleRatingClick(value: number) {
    setRating(value);
    setTimeout(() => goTo(2, 'forward'), 200);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  function removeAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function leaveVideoStep() {
    const stream = currentStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      currentStreamRef.current = null;
    }
    setMediaStream(null);
    setIsCameraActive(false);
    setIsRecording(false);
    setIsPaused(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }

  function startRecording() {
    const stream = currentStreamRef.current;
    if (!stream) return;
    const chunks: Blob[] = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/mp4';
    const mr = new MediaRecorder(stream, { videoBitsPerSecond: 1_000_000, mimeType });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const objUrl = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoObjectUrl(objUrl);
      stream.getTracks().forEach((t) => t.stop());
      currentStreamRef.current = null;
      setMediaStream(null);
      setIsCameraActive(false);
      setIsRecording(false);
      setIsPaused(false);
      extractVideoFrames(objUrl, 4).then((frames) => {
        setThumbnailFrames(frames);
        setSelectedThumbnailIdx(0);
      });
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function pauseRecording() {
    mediaRecorderRef.current?.pause();
    setIsPaused(true);
  }

  function resumeRecording() {
    mediaRecorderRef.current?.resume();
    setIsPaused(false);
  }

  function handleReRecord() {
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    setVideoBlob(null);
    setVideoObjectUrl(null);
    setThumbnailFrames([]);
    setSelectedThumbnailIdx(0);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    cameraInitRef.current = false;
  }

  // Auto-init camera when entering step 3
  useEffect(() => {
    if (step !== 3 || videoBlob || cameraInitRef.current) return;
    cameraInitRef.current = true;
    setIsCameraInitializing(true);
    setCameraError(false);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        currentStreamRef.current = stream;
        setMediaStream(stream);
        setIsCameraActive(true);
      })
      .catch(() => {
        setCameraError(true);
        cameraInitRef.current = false;
      })
      .finally(() => setIsCameraInitializing(false));
  }, [step, videoBlob]); // eslint-disable-line react-hooks/exhaustive-deps

  // Component unmount: stop any active stream
  useEffect(() => {
    return () => {
      currentStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Recording timer: increment every second while recording and not paused
  useEffect(() => {
    if (!isRecording || isPaused) return;
    const intervalId = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (isRecording && recordingTime >= 120) {
      mediaRecorderRef.current?.stop();
    }
  }, [isRecording, recordingTime]);

  // Attach stream to live preview element (also re-runs when isCameraActive changes so the video element is mounted)
  useEffect(() => {
    if (mediaStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = mediaStream;
    }
    return () => {
      if (videoPreviewRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoPreviewRef.current.srcObject = null;
      }
    };
  }, [mediaStream, isCameraActive, isRecording]);

  async function handleVideoNext() {
    if (!videoBlob) {
      goTo(4, 'forward');
      return;
    }
    setIsUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append('video', videoBlob, 'testimonial.webm');
      fd.append('formId', form.id);
      if (thumbnailFrames.length > 0 && thumbnailFrames[selectedThumbnailIdx]) {
        fd.append('thumbnail', dataURLToBlob(thumbnailFrames[selectedThumbnailIdx]), 'thumbnail.jpg');
      }
      const res = await fetch('/api/testimonials/upload-video', { method: 'POST', body: fd });
      if (res.status === 403) {
        const data = (await res.json()) as { limitReached?: boolean };
        if (data.limitReached) {
          toast.error('Video testimonials are not available for this form right now. You can skip this step.');
        }
      } else if (res.ok) {
        const { url, thumbnailUrl } = (await res.json()) as { url: string; thumbnailUrl: string | null };
        setVideoUrl(url);
        if (thumbnailUrl) setVideoThumbnailUrl(thumbnailUrl);
      } else {
        toast.error('Video upload failed. Continuing without video.');
      }
    } catch {
      toast.error('Video upload failed. Continuing without video.');
    } finally {
      setIsUploadingVideo(false);
      goTo(4, 'forward');
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!nameValid || !contentValid || !agreed) return;

    setIsSubmitting(true);

    try {
      let avatarUrl: string | null = null;

      // Upload avatar if provided, send as base64 in the body
      if (avatarFile) {
        const reader = new FileReader();
        avatarUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
      }

      const res = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          rating,
          content: content.trim(),
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || null,
          authorRole: authorRole.trim() || null,
          authorCompany: authorCompany.trim() || null,
          avatarDataUrl: avatarUrl,
          customAnswers,
          videoUrl: videoUrl || null,
          videoThumbnailUrl: videoThumbnailUrl || null,
        }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const errData = data as { error?: string };
        if (res.status === 429) {
          toast.error("This business has reached its testimonial limit. Please contact them directly.");
        } else {
          toast.error(errData?.error || 'Something went wrong. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      goTo(5, 'forward');
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    nameValid, contentValid, agreed, avatarFile, form.id, rating, content,
    authorName, authorEmail, authorRole, authorCompany, customAnswers, videoUrl, videoThumbnailUrl,
  ]);

  function resetForm() {
    setStep(1);
    setDirection('back');
    setRating(0);
    setHoverRating(0);
    setContent('');
    setCustomAnswers({});
    setAuthorName('');
    setAuthorEmail('');
    setAuthorRole('');
    setAuthorCompany('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setAgreed(false);
    setVideoBlob(null);
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    setVideoObjectUrl(null);
    setVideoUrl(null);
    setIsRecording(false);
    setRecordingTime(0);
    setCameraError(false);
  }

  const firstName = authorName.split(' ')[0] || 'there';

  const enterVariant = direction === 'forward' ? 'enterFromRight' : 'enterFromLeft';
  const exitVariant = direction === 'forward' ? 'exitToLeft' : 'exitToRight';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-md">
        {/* Business header */}
        <div className="mb-6 flex justify-center">
          <BusinessHeader project={project} accentColor={accentColor} />
        </div>

        {/* Progress (steps 1–4 only) */}
        {step !== 5 && (
          <div className="mb-6">
            <ProgressDots currentStep={step} accentColor={accentColor} />
            {step === 1 && (
              <p className="text-center text-xs text-muted-foreground mt-2">Takes about 2 minutes</p>
            )}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-border/40 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {/* ── Step 1: Rating ── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={slideVariants}
                initial={enterVariant}
                animate="center"
                exit={exitVariant}
                transition={transition}
                className="p-7 sm:p-9"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                    {form.title || `${project.name} would love your feedback`}
                  </h1>
                  <p className="mt-3 text-base text-muted-foreground">
                    {form.description || 'How would you rate your experience?'}
                  </p>
                </div>

                <div className="flex justify-center gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <StarButton
                      key={value}
                      index={value - 1}
                      filled={value <= rating}
                      hovered={value <= hoverRating}
                      accentColor={accentColor}
                      onClick={() => handleRatingClick(value)}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Tap a star to continue
                </p>
              </motion.div>
            )}

            {/* ── Step 2: Content ── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                variants={slideVariants}
                initial={enterVariant}
                animate="center"
                exit={exitVariant}
                transition={transition}
                className="p-7 sm:p-9"
              >
                {/* Selected rating display */}
                <div className="flex justify-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      style={{
                        width: 20,
                        height: 20,
                        fill: v <= rating ? accentColor : 'transparent',
                        stroke: v <= rating ? accentColor : '#cbd5e1',
                      }}
                    />
                  ))}
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Tell us more</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    What did you love? What could be better?
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="I really appreciated..."
                      className="min-h-[120px] text-base resize-none focus:ring-2 transition-shadow"
                      style={
                        {
                          '--tw-ring-color': accentColor,
                        } as React.CSSProperties
                      }
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-1.5">
                      <span
                        className="text-xs"
                        style={{
                          color: contentValid ? '#10b981' : '#94a3b8',
                        }}
                      >
                        {contentValid ? 'Looks great!' : `${Math.max(0, 20 - contentLength)} more characters needed`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {contentLength}/500
                      </span>
                    </div>
                  </div>

                  {/* Custom questions */}
                  {form.custom_questions && form.custom_questions.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {form.custom_questions.map((question, idx) => (
                        <div key={idx}>
                          <Label className="text-sm font-medium text-foreground mb-1.5 block">
                            {question}
                          </Label>
                          <Input
                            value={customAnswers[question] || ''}
                            onChange={(e) =>
                              setCustomAnswers((prev) => ({
                                ...prev,
                                [question]: e.target.value,
                              }))
                            }
                            placeholder="Your answer..."
                            className="h-11 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    onClick={() => goTo(3, 'forward')}
                    disabled={!contentValid}
                    className="w-full h-12 text-base font-semibold rounded-xl gap-2"
                    style={{
                      backgroundColor: contentValid ? accentColor : undefined,
                    }}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => goTo(1, 'back')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline mx-auto"
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Video (optional) ── */}
            {step === 3 && (
              <motion.div
                key="step-3"
                variants={slideVariants}
                initial={enterVariant}
                animate="center"
                exit={exitVariant}
                transition={transition}
                className="p-7 sm:p-9"
              >
                <div className="mb-5 text-center">
                  <h2 className="text-2xl font-bold text-foreground">Add a video</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Optional. A short video makes your testimonial 3x more impactful.
                  </p>
                </div>

                {isUploadingVideo ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="size-7 animate-spin" style={{ color: accentColor }} />
                    <p className="text-sm text-muted-foreground">Uploading video...</p>
                  </div>
                ) : videoBlob ? (
                  /* Review state: video player + thumbnail picker */
                  <div className="space-y-4">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video
                      src={videoObjectUrl!}
                      controls
                      poster={thumbnailFrames[selectedThumbnailIdx] || undefined}
                      className="w-full rounded-2xl border border-border bg-black"
                      style={{ maxHeight: 280 }}
                    />

                    {thumbnailFrames.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Choose a thumbnail</p>
                        <div className="grid grid-cols-4 gap-2">
                          {thumbnailFrames.map((frame, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedThumbnailIdx(idx)}
                              className="relative rounded-lg overflow-hidden border-2 transition-all"
                              style={
                                selectedThumbnailIdx === idx
                                  ? { borderColor: accentColor }
                                  : { borderColor: 'transparent' }
                              }
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={frame}
                                alt={`Frame ${idx + 1}`}
                                className="w-full block aspect-video object-cover"
                              />
                              {selectedThumbnailIdx === idx && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                  <Check className="size-3.5 text-white drop-shadow" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReRecord}
                        className="flex-1 h-11 rounded-xl gap-2"
                      >
                        <Video className="size-3.5" />
                        Re-record
                      </Button>
                      <Button
                        onClick={handleVideoNext}
                        className="flex-1 h-11 text-base font-semibold rounded-xl gap-2"
                        style={{ backgroundColor: accentColor }}
                      >
                        Continue
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : cameraError ? (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Camera access denied. You can skip and continue without a video.
                    </p>
                    <Button
                      onClick={() => { leaveVideoStep(); goTo(4, 'forward'); }}
                      className="w-full h-12 text-base font-semibold rounded-xl gap-2"
                      style={{ backgroundColor: accentColor }}
                    >
                      Skip
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                ) : isCameraInitializing ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Opening camera...</p>
                  </div>
                ) : (
                  /* Camera active: preview + controls */
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-black">
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video
                        ref={videoPreviewRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full block"
                        style={{ maxHeight: 260, objectFit: 'cover' }}
                      />
                      {isRecording && (
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1">
                          <span
                            className={`w-2 h-2 rounded-full bg-red-500 ${isPaused ? 'opacity-50' : 'animate-pulse'}`}
                          />
                          <span className="text-white text-xs font-mono">
                            {`${Math.floor(recordingTime / 60)}:${String(recordingTime % 60).padStart(2, '0')} / 2:00`}
                          </span>
                          {isPaused && (
                            <span className="text-white/70 text-xs ml-0.5">Paused</span>
                          )}
                        </div>
                      )}
                    </div>

                    {isRecording ? (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={isPaused ? resumeRecording : pauseRecording}
                          className="flex-1 h-11 rounded-xl gap-2"
                        >
                          {isPaused
                            ? <><Play className="size-3.5 fill-current" /> Resume</>
                            : <><Pause className="size-3.5 fill-current" /> Pause</>
                          }
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={stopRecording}
                          className="flex-1 h-11 rounded-xl gap-2 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Square className="size-3.5 fill-red-500 text-red-500" />
                          Stop
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={startRecording}
                          className="w-full h-12 text-base font-semibold rounded-xl gap-2"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Camera className="size-4" />
                          Start Recording
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => { leaveVideoStep(); goTo(4, 'forward'); }}
                          className="w-full h-11 rounded-xl gap-2"
                        >
                          Skip, continue without video
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!isRecording && !isUploadingVideo && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => { leaveVideoStep(); goTo(2, 'back'); }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                    >
                      Back
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step 4: About you ── */}
            {step === 4 && (
              <motion.div
                key="step-4"
                variants={slideVariants}
                initial={enterVariant}
                animate="center"
                exit={exitVariant}
                transition={transition}
                className="p-7 sm:p-9"
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-foreground">Almost done!</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    A face and title make your review feel real and help others trust it.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Avatar upload: prominent circular zone at the top */}
                  <div className="flex flex-col items-center gap-1.5 pb-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    {avatarPreview ? (
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 shadow-sm" style={{ borderColor: accentColor }}>
                          <Image src={avatarPreview} alt="Preview" fill className="object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <X className="size-3 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors hover:bg-accent/40"
                        style={{ borderColor: `${accentColor}70` }}
                      >
                        <Upload className="size-5" style={{ color: accentColor }} />
                        <span className="text-[10px] font-semibold" style={{ color: accentColor }}>Add photo</span>
                      </button>
                    )}
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>

                  {/* Name (required) */}
                  <div>
                    <Label htmlFor="author-name" className="text-sm font-medium mb-1.5 block">
                      Your name <span className="text-destructive text-xs">required</span>
                    </Label>
                    <Input
                      id="author-name"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Jane Smith"
                      className="h-12 text-base"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Role + Company */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="author-role" className="text-sm font-medium mb-1.5 block">
                        Role <span className="text-xs font-normal text-muted-foreground">optional</span>
                      </Label>
                      <Input
                        id="author-role"
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        placeholder="Marketing Manager"
                        className="h-10 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author-company" className="text-sm font-medium mb-1.5 block">
                        Company <span className="text-xs font-normal text-muted-foreground">optional</span>
                      </Label>
                      <Input
                        id="author-company"
                        value={authorCompany}
                        onChange={(e) => setAuthorCompany(e.target.value)}
                        placeholder="Acme Inc."
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="author-email" className="text-sm font-medium mb-1.5 block">
                      Email <span className="text-xs font-normal text-muted-foreground">optional, not shown publicly</span>
                    </Label>
                    <Input
                      id="author-email"
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="h-10 text-sm"
                    />
                  </div>

                  {/* Agreement */}
                  <label className="flex items-start gap-3 cursor-pointer pt-1">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150"
                        style={{
                          borderColor: agreed ? accentColor : '#cbd5e1',
                          backgroundColor: agreed ? accentColor : 'transparent',
                        }}
                      >
                        {agreed && <Check className="size-3 text-white" />}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      I agree this testimonial may be displayed on{' '}
                      <span className="font-medium text-foreground">{project.name}</span>
                      &apos;s website
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!nameValid || !contentValid || !agreed || isSubmitting}
                    className="w-full h-12 text-base font-semibold rounded-xl gap-2"
                    style={{
                      backgroundColor:
                        nameValid && contentValid && agreed && !isSubmitting
                          ? accentColor
                          : undefined,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      'Submit testimonial'
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => goTo(3, 'back')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline mx-auto"
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 5: Success ── */}
            {step === 5 && (
              <motion.div
                key="step-5"
                variants={slideVariants}
                initial="enterFromRight"
                animate="center"
                exit="exitToLeft"
                transition={transition}
                className="p-7 sm:p-9 text-center"
              >
                {/* Animated checkmark */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      delay: 0.1,
                    }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 18,
                        delay: 0.25,
                      }}
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Check className="size-7 text-white" strokeWidth={3} />
                    </motion.div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Thank you, {firstName}! 🎉
                  </h2>
                  <p className="mt-3 text-base text-muted-foreground">
                    Your testimonial has been submitted. It will appear publicly once approved by the business.
                  </p>
                </motion.div>

                {/* Multi-channel share nudge, only for happy customers */}
                {rating >= 4 && (project.google_review_url || project.linkedin_url) && (
                  <ShareElsewhere
                    accentColor={accentColor}
                    content={content}
                    authorName={authorName}
                    googleReviewUrl={project.google_review_url}
                    linkedinUrl={project.linkedin_url}
                  />
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="mt-7"
                >
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                  >
                    Submit another testimonial
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Powered by Vouch */}
        {showBranding && (
          <div className="mt-5 text-center">
            <span className="text-xs text-muted-foreground/60">
              Powered by{' '}
              <a
                href="/via"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-muted-foreground transition-colors"
              >
                Vouch
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
