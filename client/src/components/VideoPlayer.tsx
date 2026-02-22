import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  url: string;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export function VideoPlayer({ 
  url, 
  className = "", 
  autoplay = false, 
  loop = false, 
  muted = false,
  controls = true 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect video type
  const getVideoType = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('.m3u8')) return 'hls';
    if (url.includes('.mp4') || url.includes('.webm')) return 'direct';
    return 'unknown';
  };

  const type = getVideoType(url);

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  // Extract Vimeo video ID
  const getVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    if (type === 'hls' && videoRef.current) {
      // Load HLS.js for M3U8 streams
      import('hls.js').then((Hls) => {
        if (Hls.default.isSupported() && videoRef.current) {
          const hls = new Hls.default();
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);
        } else if (videoRef.current && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          videoRef.current.src = url;
        }
      });
    }
  }, [url, type]);

  // YouTube embed
  if (type === 'youtube') {
    const videoId = getYouTubeId(url);
    return (
      <iframe
        className={className || "w-full aspect-video"}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Vimeo embed
  if (type === 'vimeo') {
    const videoId = getVimeoId(url);
    return (
      <iframe
        className={className || "w-full aspect-video"}
        src={`https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Direct video or HLS
  return (
    <video
      ref={videoRef}
      className={className || "w-full aspect-video"}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline
    >
      {type === 'direct' && <source src={url} type="video/mp4" />}
      Seu navegador não suporta vídeos.
    </video>
  );
}
