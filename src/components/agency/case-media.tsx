"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Case-study media: plays the hover video when one is set, otherwise cycles the
 * project's gallery like a preview reel. Vertical (9:16) media inside a wide
 * frame is shown whole over a blurred copy instead of being cropped.
 */
export function CaseMedia({
  cover,
  gallery,
  video,
  alt,
  sizes,
  className,
  priority,
}: {
  cover: string | null;
  gallery: string[];
  video: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [index, setIndex] = useState(0);
  const [tallCover, setTallCover] = useState(false);
  const [tallVideo, setTallVideo] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frames = gallery.filter(Boolean).slice(0, 4);

  /** True when media of this size would lose most of itself to object-cover in this frame. */
  const isTall = (w: number, h: number) => {
    const box = root.current;
    return Boolean(box && w && h && h / w > 1.2 && box.clientWidth / box.clientHeight > 1.1);
  };

  useEffect(() => {
    if (!hover || video || frames.length === 0) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % (frames.length + 1)), 900);
    return () => clearInterval(t);
  }, [hover, video, frames.length]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hover) v.play().catch(() => undefined);
    else v.pause();
  }, [hover]);

  return (
    <div
      ref={root}
      className={cn("relative overflow-hidden bg-ink-900", className)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        setIndex(0);
      }}
    >
      <div className="absolute inset-0 transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-[1.06]">
        {cover && tallCover && <Image src={cover} alt="" fill sizes="40vw" className="scale-125 object-cover opacity-60 blur-2xl" aria-hidden />}
        {cover && (
          <Image
            src={cover}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onLoad={(e) => setTallCover(isTall(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight))}
            className={tallCover ? "object-contain" : "object-cover"}
          />
        )}
        {!video &&
          frames.map((src, i) => (
            <Image key={src} src={src} alt="" fill sizes={sizes} className={cn("object-cover transition-opacity duration-300", hover && index === i + 1 ? "opacity-100" : "opacity-0")} />
          ))}
        {video && (
          <div className={cn("absolute inset-0 transition-opacity duration-500", hover ? "opacity-100" : "opacity-0", tallVideo && "bg-ink-950/55 backdrop-blur-xl")}>
            <video
              ref={videoRef}
              src={video}
              muted
              loop
              playsInline
              preload="none"
              onLoadedMetadata={(e) => setTallVideo(isTall(e.currentTarget.videoWidth, e.currentTarget.videoHeight))}
              onLoadedData={(e) => (e.currentTarget.style.opacity = "1")}
              className={cn("absolute inset-0 size-full opacity-0 transition-opacity duration-500", tallVideo ? "object-contain" : "object-cover")}
            />
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent" />
    </div>
  );
}
