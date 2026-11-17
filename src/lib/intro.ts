/**
 * Runs before first paint: plays the intro once per session, only for direct visits to the home
 * page. Search and ad landings (an outside referrer, or utm_/gclid/fbclid in the URL), deep links
 * and reduced-motion users go straight to the content.
 */
export const INTRO_GATE = `try{var d=document.documentElement,l=location,r=document.referrer,ext=false;try{ext=!!r&&new URL(r).host!==l.host}catch(e){}if(sessionStorage.getItem('jm-intro')||l.pathname!=='/'||ext||/[?&](utm_|gclid|gbraid|wbraid|fbclid|msclkid)/.test(l.search)||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-skip')}else{d.classList.add('intro-on')}sessionStorage.setItem('jm-intro','1')}catch(e){}`;
