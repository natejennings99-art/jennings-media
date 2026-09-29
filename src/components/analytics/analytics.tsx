import Script from "next/script";

/**
 * Google Analytics 4, Google Ads and Meta Pixel. IDs come from environment
 * variables first, then Admin → Settings → Integrations. Nothing loads when unset.
 */
export function Analytics({ gaId, adsId, pixelId }: { gaId?: string; adsId?: string; pixelId?: string }) {
  const gtagId = gaId || adsId;
  return (
    <>
      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${
              gaId ? `gtag('config',${JSON.stringify(gaId)});` : ""
            }${adsId ? `gtag('config',${JSON.stringify(adsId)});` : ""}`}
          </Script>
        </>
      )}
      {pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(
            pixelId
          )});fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
