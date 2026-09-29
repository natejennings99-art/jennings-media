"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { ACCENT_RGB, createProgram, watchVisibility } from "./gl";

const VERT = `
attribute vec2 aPos;
attribute float aEnergy;
uniform vec2 uRes;
uniform float uSize;
varying float vE;
void main(){
  vec2 c = (aPos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
  gl_PointSize = uSize * (1.0 + aEnergy * 0.9);
  vE = aEnergy;
}`;

const FRAG = `
precision mediump float;
varying float vE;
uniform vec3 uAccent;
uniform vec3 uBase;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.15, r);
  vec3 c = mix(uBase, uAccent, clamp(vE * 1.7, 0.0, 1.0));
  gl_FragColor = vec4(c, a * (0.62 + vE * 0.38));
}`;

/**
 * Interactive particle typography. Thousands of points form a word; the cursor
 * (or a tap) pushes them away and they spring back, glowing as they move.
 */
export default function AttentionField({ word = "ATTENTION", className }: { word?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    let program: WebGLProgram;
    try {
      program = createProgram(gl, VERT, FRAG);
    } catch (error) {
      console.warn(error);
      return;
    }
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const posBuf = gl.createBuffer();
    const energyBuf = gl.createBuffer();
    const aPos = gl.getAttribLocation(program, "aPos");
    const aEnergy = gl.getAttribLocation(program, "aEnergy");
    const uRes = gl.getUniformLocation(program, "uRes");
    const uSize = gl.getUniformLocation(program, "uSize");
    gl.uniform3fv(gl.getUniformLocation(program, "uAccent"), ACCENT_RGB);
    gl.uniform3fv(gl.getUniformLocation(program, "uBase"), [0.96, 0.94, 0.9]);

    const reduced = prefersReducedMotion();
    const small = window.matchMedia("(max-width: 767px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let count = 0;
    let pos = new Float32Array(0);
    let vel = new Float32Array(0);
    let tgt = new Float32Array(0);
    let energy = new Float32Array(0);
    const mouse = { x: -9999, y: -9999, active: false };

    const build = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uSize, (small ? 2.2 : 2.6) * dpr);

      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const ctx = off.getContext("2d", { willReadFrequently: true })!;
      const family = getComputedStyle(canvas).fontFamily || "sans-serif";
      let size = Math.min((W * 0.92) / (word.length * 0.66), H * 0.62);
      ctx.font = `800 ${size}px ${family}`;
      const measured = ctx.measureText(word).width;
      if (measured > W * 0.92) size *= (W * 0.92) / measured;
      ctx.font = `800 ${size}px ${family}`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(word, W / 2, H / 2);
      const data = ctx.getImageData(0, 0, W, H).data;
      const step = small ? 6 : Math.max(4, Math.round(W / 320));
      const points: number[] = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 140) points.push(x + (Math.random() - 0.5) * 1.5, y + (Math.random() - 0.5) * 1.5);
        }
      }
      count = points.length / 2;
      const prev = pos;
      tgt = new Float32Array(points);
      pos = new Float32Array(count * 2);
      vel = new Float32Array(count * 2);
      energy = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        if (reduced) {
          pos[i * 2] = tgt[i * 2];
          pos[i * 2 + 1] = tgt[i * 2 + 1];
        } else if (prev.length > i * 2 + 1) {
          pos[i * 2] = prev[i * 2];
          pos[i * 2 + 1] = prev[i * 2 + 1];
        } else {
          pos[i * 2] = Math.random() * W;
          pos[i * 2 + 1] = Math.random() * H;
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, pos.byteLength, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, energyBuf);
      gl.bufferData(gl.ARRAY_BUFFER, energy.byteLength, gl.DYNAMIC_DRAW);
    };

    const radius = () => Math.max(90, Math.min(W, H) * 0.22);
    const step = () => {
      const R = radius();
      const R2 = R * R;
      for (let i = 0; i < count; i++) {
        const ix = i * 2;
        const iy = ix + 1;
        let vx = vel[ix] + (tgt[ix] - pos[ix]) * 0.045;
        let vy = vel[iy] + (tgt[iy] - pos[iy]) * 0.045;
        if (mouse.active) {
          const dx = pos[ix] - mouse.x;
          const dy = pos[iy] - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / R) ** 2 * 7;
            vx += (dx / d) * f;
            vy += (dy / d) * f;
          }
        }
        vx *= 0.86;
        vy *= 0.86;
        pos[ix] += vx;
        pos[iy] += vy;
        vel[ix] = vx;
        vel[iy] = vy;
        const speed = Math.sqrt(vx * vx + vy * vy);
        energy[i] += (Math.min(1, speed / 5) - energy[i]) * 0.2;
      }
    };
    const render = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, energyBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, energy);
      gl.enableVertexAttribArray(aEnergy);
      gl.vertexAttribPointer(aEnergy, 1, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, count);
    };

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    let tapTimer = 0;
    const onDown = (e: PointerEvent) => {
      toLocal(e);
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(onLeave, 450);
    };
    canvas.addEventListener("pointermove", toLocal);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);

    let raf = 0;
    let visible = false;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      step();
      render();
    };
    const init = () => {
      build();
      render();
    };
    if (document.fonts?.ready) document.fonts.ready.then(init);
    else init();
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    });
    ro.observe(canvas);
    const stopWatching = watchVisibility(canvas, (v) => (visible = v));
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(tapTimer);
      stopWatching();
      ro.disconnect();
      canvas.removeEventListener("pointermove", toLocal);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      // Only free the GPU context on a real unmount (dev StrictMode re-runs effects on the same canvas).
      queueMicrotask(() => {
        if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
      });
    };
  }, [word]);

  return <canvas ref={ref} aria-hidden className={className} style={{ touchAction: "pan-y" }} />;
}
