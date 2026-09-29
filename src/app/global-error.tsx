"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#07080a", color: "#f7f4ee", fontFamily: "system-ui", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 32, fontWeight: 500 }}>Something went wrong</h1>
          <button onClick={reset} style={{ marginTop: 24, padding: "12px 24px", borderRadius: 999, border: 0, background: "#ff5b24", color: "#07080a", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
