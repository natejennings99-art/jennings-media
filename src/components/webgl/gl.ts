/** Minimal WebGL helpers (no dependencies). */
export function createProgram(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile failed: ${log}`);
    }
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`);
  return program;
}

/** Runs `onVisible(true|false)` as the element enters/leaves the viewport or the tab is hidden. */
export function watchVisibility(el: Element, onVisible: (visible: boolean) => void) {
  let inView = false;
  const update = () => onVisible(inView && document.visibilityState === "visible");
  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    update();
  });
  io.observe(el);
  document.addEventListener("visibilitychange", update);
  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", update);
  };
}

export const ACCENT_RGB: [number, number, number] = [1.0, 0.357, 0.141];
