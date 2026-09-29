"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { ACCENT_RGB, createProgram, watchVisibility } from "./gl";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntensity;
uniform vec3 uAccent;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.045;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 q = vec2(fbm(p * 1.4 + vec2(0.0, t)), fbm(p * 1.4 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(p * 1.9 + 2.4 * q + vec2(1.7, 9.2) + 0.7 * t), fbm(p * 1.9 + 2.4 * q + vec2(8.3, 2.8) - 0.5 * t));
  float f = fbm(p * 1.6 + 2.0 * r);
  vec2 lightPos = vec2(0.42, 0.14) + m * 0.3;
  float d = length(p - lightPos);
  float light = exp(-d * d * 1.7);
  float smoke = smoothstep(0.25, 1.0, f);
  vec3 col = vec3(0.02, 0.022, 0.028);
  col += vec3(0.1, 0.095, 0.095) * smoke * smoke;
  col += uAccent * pow(smoke, 2.4) * (0.22 + light * 1.3) * uIntensity;
  col += uAccent * light * 0.05 * uIntensity;
  float d2 = length(p - vec2(-0.75, -0.45));
  col += vec3(0.1, 0.14, 0.22) * exp(-d2 * d2 * 2.5) * smoke * 0.35;
  col *= 1.0 - smoothstep(0.25, 1.45, length(p * vec2(0.85, 1.05)));
  col += (hash(gl_FragCoord.xy * 0.37 + fract(uTime * 7.0) * 31.0) - 0.5) * 0.04;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`;

/**
 * Cinematic smoke-and-light field. Rendered at reduced resolution (it's soft by
 * nature), paused off-screen, ~30fps on phones, a single frame for reduced motion.
 */
export default function HeroCanvas({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;
    let program: WebGLProgram;
    try {
      program = createProgram(gl, VERT, FRAG);
    } catch (error) {
      console.warn(error);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {
      res: gl.getUniformLocation(program, "uRes"),
      time: gl.getUniformLocation(program, "uTime"),
      mouse: gl.getUniformLocation(program, "uMouse"),
      intensity: gl.getUniformLocation(program, "uIntensity"),
      accent: gl.getUniformLocation(program, "uAccent"),
    };
    gl.uniform3fv(u.accent, ACCENT_RGB);
    gl.uniform1f(u.intensity, intensity);

    const small = window.matchMedia("(max-width: 767px)").matches;
    const scale = small ? 0.4 : 0.55;
    const resize = () => {
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const target = { x: 0.5, y: 0.5 };
    const mouse = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const reduced = prefersReducedMotion();
    const start = performance.now() - 8000;
    let raf = 0;
    let visible = true;
    let frame = 0;
    const draw = (now: number) => {
      gl.uniform1f(u.time, (now - start) / 1000);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      frame++;
      if (small && frame % 2) return;
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      draw(now);
    };
    if (reduced) draw(performance.now());
    else raf = requestAnimationFrame(loop);
    const stopWatching = watchVisibility(canvas, (v) => (visible = v));

    return () => {
      cancelAnimationFrame(raf);
      stopWatching();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      // Only free the GPU context on a real unmount (dev StrictMode re-runs effects on the same canvas).
      queueMicrotask(() => {
        if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
      });
    };
  }, [intensity]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
