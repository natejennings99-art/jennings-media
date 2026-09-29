/** Convert YouTube / Vimeo / Matterport share links into embeddable URLs. */
export function embedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host === "vimeo.com") return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean)[0]}`;
    if (host === "player.vimeo.com" || host === "my.matterport.com" || host === "youtube-nocookie.com") return url;
    if (host.endsWith("matterport.com")) return url;
    return null;
  } catch {
    return null;
  }
}

export function isDirectVideo(url: string | null | undefined) {
  return Boolean(url && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url));
}
